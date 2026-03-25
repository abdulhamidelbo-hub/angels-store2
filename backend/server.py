from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============================================================
# MODELS
# ============================================================

class Category(BaseModel):
    id: int
    name_ar: str
    name_en: str
    icon_name: Optional[str] = None
    display_order: int
    color_hex: str = "4A8B6F"

class Azkar(BaseModel):
    id: Optional[int] = None
    category_id: int
    arabic_text: str
    transliteration: Optional[str] = None
    repeat_count: int = 1
    virtue_ar: Optional[str] = None
    virtue_en: Optional[str] = None
    reference_ar: Optional[str] = None
    reference_en: Optional[str] = None
    is_favorite: bool = False

class IslamicEvent(BaseModel):
    id: int
    name_ar: str
    name_en: str
    hijri_month: Optional[int] = None
    hijri_day: Optional[int] = None
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    notification_days: int = 3
    is_active: bool = True

class EventAzkar(BaseModel):
    id: Optional[int] = None
    event_id: int
    arabic_text: str
    transliteration: Optional[str] = None
    repeat_count: int = 1
    virtue_ar: Optional[str] = None
    virtue_en: Optional[str] = None
    reference_ar: Optional[str] = None
    reference_en: Optional[str] = None

class TasbeehCount(BaseModel):
    method: str  # touch, voice, ai
    count: int
    zikr_id: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Challenge(BaseModel):
    id: int
    title_ar: str
    title_en: str
    description_ar: str
    description_en: str
    required_count: int
    reward_xp: int
    reward_badge: Optional[str] = None
    is_active: bool = True

class UserProgress(BaseModel):
    azkar_id: int
    date: str
    count: int = 0
    voice_count: int = 0
    touch_count: int = 0

class SubscriptionInfo(BaseModel):
    install_date: str
    subscription_status: str = "trial"
    trial_end_date: str
    subscription_end_date: Optional[str] = None
    is_lifetime: bool = False
    exemption_used: bool = False
    exemption_date: Optional[str] = None

class ExemptionRequest(BaseModel):
    user_id: str
    prayer_text: Optional[str] = None
    request_date: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class AIMessage(BaseModel):
    user_message: str
    ai_response: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PrayerTimesRequest(BaseModel):
    latitude: float
    longitude: float
    city_name: Optional[str] = None

# ============================================================
# DATABASE INITIALIZATION
# ============================================================

async def init_database():
    """Initialize database with all azkar and events"""
    
    # Check if already initialized
    existing_categories = await db.categories.count_documents({})
    if existing_categories > 0:
        logger.info("Database already initialized")
        return
    
    logger.info("Initializing database with azkar data...")
    
    # Initialize Categories
    categories = [
        {"id": 1, "name_ar": "أذكار الصباح", "name_en": "Morning Adhkar", "display_order": 1, "color_hex": "4A8B6F", "icon_name": "sunny"},
        {"id": 2, "name_ar": "أذكار المساء", "name_en": "Evening Adhkar", "display_order": 2, "color_hex": "5A4A8B", "icon_name": "moon"},
        {"id": 3, "name_ar": "أذكار بعد الصلاة", "name_en": "After Prayer Adhkar", "display_order": 3, "color_hex": "8B6A4A", "icon_name": "book"},
        {"id": 4, "name_ar": "أذكار النوم", "name_en": "Sleeping Adhkar", "display_order": 4, "color_hex": "4A6A8B", "icon_name": "bed"},
        {"id": 5, "name_ar": "أذكار الاستيقاظ", "name_en": "Waking Up Adhkar", "display_order": 5, "color_hex": "8B4A6A", "icon_name": "sunrise"},
        {"id": 6, "name_ar": "أذكار الطعام والشراب", "name_en": "Eating and Drinking Adhkar", "display_order": 6, "color_hex": "6A8B4A", "icon_name": "restaurant"},
        {"id": 7, "name_ar": "أذكار المنزل", "name_en": "Home Adhkar", "display_order": 7, "color_hex": "4A8B8B", "icon_name": "home"},
        {"id": 8, "name_ar": "أذكار الخلاء", "name_en": "Restroom Adhkar", "display_order": 8, "color_hex": "8B8B4A", "icon_name": "water"},
        {"id": 9, "name_ar": "أذكار الوضوء", "name_en": "Ablution Adhkar", "display_order": 9, "color_hex": "4A8B5A", "icon_name": "water-outline"},
        {"id": 10, "name_ar": "أذكار الأذان", "name_en": "Adhan Adhkar", "display_order": 10, "color_hex": "5A8B4A", "icon_name": "megaphone"},
        {"id": 11, "name_ar": "أذكار المسجد", "name_en": "Mosque Adhkar", "display_order": 11, "color_hex": "8B5A4A", "icon_name": "business"},
        {"id": 12, "name_ar": "التسبيحات العامة", "name_en": "General Tasbeeh", "display_order": 12, "color_hex": "4A5A8B", "icon_name": "repeat"},
        {"id": 13, "name_ar": "جوامع الدعاء", "name_en": "Comprehensive Duas", "display_order": 13, "color_hex": "6A4A8B", "icon_name": "hand-right"},
        {"id": 14, "name_ar": "سيد الاستغفار", "name_en": "Master of Istighfar", "display_order": 14, "color_hex": "8B4A5A", "icon_name": "heart"},
    ]
    await db.categories.insert_many(categories)
    
    # Initialize some azkar for each category (limited sample for now)
    azkar_data = [
        # Category 1: أذكار الصباح
        {
            "id": 1, "category_id": 1,
            "arabic_text": "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
            "repeat_count": 1,
            "virtue_ar": "من قالها حين يصبح أجير من الجن حتى يمسى",
            "reference_ar": "رواه الحاكم وابن حبان",
            "is_favorite": False
        },
        {
            "id": 2, "category_id": 1,
            "arabic_text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ * قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
            "repeat_count": 3,
            "virtue_ar": "من قالها حين يصبح وحين يمسى كفته من كل شيء",
            "reference_ar": "رواه الترمذي",
            "is_favorite": False
        },
        {
            "id": 3, "category_id": 1,
            "arabic_text": "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
            "repeat_count": 1,
            "virtue_ar": "من قالها حين يصبح فقد أدى شكر يومه",
            "reference_ar": "رواه مسلم",
            "is_favorite": False
        },
        # Category 12: التسبيحات العامة
        {
            "id": 50, "category_id": 12,
            "arabic_text": "سُبْحَانَ اللَّهِ",
            "repeat_count": 33,
            "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه",
            "reference_ar": "رواه مسلم",
            "is_favorite": False
        },
        {
            "id": 51, "category_id": 12,
            "arabic_text": "الْحَمْدُ لِلَّهِ",
            "repeat_count": 33,
            "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه",
            "reference_ar": "رواه مسلم",
            "is_favorite": False
        },
        {
            "id": 52, "category_id": 12,
            "arabic_text": "اللَّهُ أَكْبَرُ",
            "repeat_count": 34,
            "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه",
            "reference_ar": "رواه مسلم",
            "is_favorite": False
        },
    ]
    await db.azkar.insert_many(azkar_data)
    
    # Initialize Islamic Events
    events = [
        {
            "id": 1, "name_ar": "شهر رمضان المبارك", "name_en": "Holy Month of Ramadan",
            "hijri_month": 9, "hijri_day": 1,
            "description_ar": "شهر الصيام والقيام والقرآن",
            "notification_days": 3, "is_active": True
        },
        {
            "id": 2, "name_ar": "عيد الفطر المبارك", "name_en": "Eid al-Fitr",
            "hijri_month": 10, "hijri_day": 1,
            "description_ar": "عيد الفطر السعيد",
            "notification_days": 3, "is_active": True
        },
        {
            "id": 3, "name_ar": "يوم عرفة", "name_en": "Day of Arafah",
            "hijri_month": 12, "hijri_day": 9,
            "description_ar": "يوم عرفة المبارك",
            "notification_days": 3, "is_active": True
        },
    ]
    await db.islamic_events.insert_many(events)
    
    # Initialize Challenges
    challenges = [
        {
            "id": 1, "title_ar": "ذكر الصباح", "title_en": "Morning Adhkar",
            "description_ar": "إكمال جميع أذكار الصباح", "description_en": "Complete all morning adhkar",
            "required_count": 1, "reward_xp": 50, "reward_badge": "المستيقظ بالذكر", "is_active": True
        },
        {
            "id": 2, "title_ar": "مئة تسبيحة", "title_en": "100 Tasbeeh",
            "description_ar": "الوصول إلى 100 تسبيحة في اليوم", "description_en": "Reach 100 tasbeeh per day",
            "required_count": 100, "reward_xp": 30, "reward_badge": "التسبيح اليومي", "is_active": True
        },
    ]
    await db.challenges.insert_many(challenges)
    
    logger.info("Database initialization complete!")

# ============================================================
# API ROUTES
# ============================================================

@api_router.get("/")
async def root():
    return {"message": "Adkar Al Muslim API - v1.0", "status": "active"}

# Categories
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    """Get all categories"""
    categories = await db.categories.find().sort("display_order", 1).to_list(100)
    return [Category(**cat) for cat in categories]

# Azkar
@api_router.get("/azkar/category/{category_id}")
async def get_azkar_by_category(category_id: int):
    """Get all azkar for a specific category"""
    azkar = await db.azkar.find({"category_id": category_id}).to_list(1000)
    # Convert ObjectId to string
    for azkar_item in azkar:
        if '_id' in azkar_item:
            azkar_item['_id'] = str(azkar_item['_id'])
    return azkar

@api_router.get("/azkar/{azkar_id}")
async def get_azkar_detail(azkar_id: int):
    """Get specific azkar details"""
    azkar = await db.azkar.find_one({"id": azkar_id})
    if not azkar:
        raise HTTPException(status_code=404, detail="Azkar not found")
    return azkar

@api_router.post("/azkar/favorite/{azkar_id}")
async def toggle_favorite(azkar_id: int):
    """Toggle favorite status"""
    azkar = await db.azkar.find_one({"id": azkar_id})
    if not azkar:
        raise HTTPException(status_code=404, detail="Azkar not found")
    
    new_status = not azkar.get("is_favorite", False)
    await db.azkar.update_one(
        {"id": azkar_id},
        {"$set": {"is_favorite": new_status}}
    )
    return {"success": True, "is_favorite": new_status}

# Tasbeeh Counting
@api_router.post("/tasbeeh/count")
async def record_tasbeeh(tasbeeh: TasbeehCount):
    """Record tasbeeh count"""
    tasbeeh_dict = tasbeeh.dict()
    await db.tasbeeh_counts.insert_one(tasbeeh_dict)
    
    # Update daily stats
    today = datetime.utcnow().date().isoformat()
    stats = await db.daily_stats.find_one({"date": today})
    
    if not stats:
        stats = {
            "date": today,
            "total_tasbeeh": 0,
            "voice_tasbeeh_count": 0,
            "touch_tasbeeh_count": 0,
            "ai_tasbeeh_count": 0,
            "completed_azkar_count": 0,
            "xp_earned": 0
        }
    
    stats["total_tasbeeh"] = stats.get("total_tasbeeh", 0) + tasbeeh.count
    
    if tasbeeh.method == "voice":
        stats["voice_tasbeeh_count"] = stats.get("voice_tasbeeh_count", 0) + tasbeeh.count
    elif tasbeeh.method == "touch":
        stats["touch_tasbeeh_count"] = stats.get("touch_tasbeeh_count", 0) + tasbeeh.count
    elif tasbeeh.method == "ai":
        stats["ai_tasbeeh_count"] = stats.get("ai_tasbeeh_count", 0) + tasbeeh.count
    
    # Award XP
    xp_earned = tasbeeh.count * 1  # 1 XP per tasbeeh
    stats["xp_earned"] = stats.get("xp_earned", 0) + xp_earned
    
    await db.daily_stats.update_one(
        {"date": today},
        {"$set": stats},
        upsert=True
    )
    
    return {"success": True, "xp_earned": xp_earned, "total_today": stats["total_tasbeeh"]}

@api_router.get("/stats/today")
async def get_today_stats():
    """Get today's statistics"""
    today = datetime.utcnow().date().isoformat()
    stats = await db.daily_stats.find_one({"date": today})
    
    if not stats:
        return {
            "date": today,
            "total_tasbeeh": 0,
            "voice_tasbeeh_count": 0,
            "touch_tasbeeh_count": 0,
            "ai_tasbeeh_count": 0,
            "completed_azkar_count": 0,
            "xp_earned": 0
        }
    
    return stats

@api_router.get("/stats/weekly")
async def get_weekly_stats():
    """Get weekly statistics"""
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)
    
    stats = await db.daily_stats.find({
        "date": {"$gte": week_ago.isoformat(), "$lte": today.isoformat()}
    }).to_list(7)
    
    return stats

# Islamic Events
@api_router.get("/events", response_model=List[IslamicEvent])
async def get_islamic_events():
    """Get all Islamic events"""
    events = await db.islamic_events.find({"is_active": True}).to_list(100)
    return [IslamicEvent(**event) for event in events]

@api_router.get("/events/{event_id}")
async def get_event_details(event_id: int):
    """Get specific event details"""
    event = await db.islamic_events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Get azkar for this event
    event_azkar = await db.event_azkar.find({"event_id": event_id}).to_list(100)
    event["azkar"] = event_azkar
    
    return event

# Challenges
@api_router.get("/challenges", response_model=List[Challenge])
async def get_challenges():
    """Get all active challenges"""
    challenges = await db.challenges.find({"is_active": True}).to_list(100)
    return [Challenge(**challenge) for challenge in challenges]

# Prayer Times (using Aladhan API)
@api_router.post("/prayer-times")
async def get_prayer_times(request: PrayerTimesRequest):
    """Get prayer times for location"""
    try:
        async with httpx.AsyncClient() as client:
            # Get today's date
            today = datetime.utcnow()
            
            # Call Aladhan API
            url = f"http://api.aladhan.com/v1/timings/{today.strftime('%d-%m-%Y')}"
            params = {
                "latitude": request.latitude,
                "longitude": request.longitude,
                "method": 2  # MWL method
            }
            
            response = await client.get(url, params=params)
            data = response.json()
            
            if data.get("code") == 200:
                timings = data["data"]["timings"]
                
                # Store in database
                prayer_data = {
                    "date": today.date().isoformat(),
                    "fajr": timings["Fajr"],
                    "sunrise": timings["Sunrise"],
                    "dhuhr": timings["Dhuhr"],
                    "asr": timings["Asr"],
                    "maghrib": timings["Maghrib"],
                    "isha": timings["Isha"],
                    "calculated_at": datetime.utcnow()
                }
                
                await db.prayer_times.update_one(
                    {"date": today.date().isoformat()},
                    {"$set": prayer_data},
                    upsert=True
                )
                
                return prayer_data
            else:
                raise HTTPException(status_code=500, detail="Failed to fetch prayer times")
                
    except Exception as e:
        logger.error(f"Error fetching prayer times: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Subscription and Exemption
@api_router.get("/subscription/status")
async def get_subscription_status(user_id: str = "default"):
    """Get subscription status"""
    sub = await db.subscription_info.find_one({"user_id": user_id})
    
    if not sub:
        # Create new subscription with 1 year trial
        install_date = datetime.utcnow()
        trial_end = install_date + timedelta(days=365)
        
        sub = {
            "user_id": user_id,
            "install_date": install_date.isoformat(),
            "subscription_status": "trial",
            "trial_end_date": trial_end.isoformat(),
            "subscription_end_date": None,
            "is_lifetime": False,
            "exemption_used": False,
            "exemption_date": None
        }
        
        await db.subscription_info.insert_one(sub)
    
    return sub

@api_router.post("/subscription/exemption")
async def request_exemption(request: ExemptionRequest):
    """Request subscription exemption (free year)"""
    sub = await db.subscription_info.find_one({"user_id": request.user_id})
    
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    if sub.get("exemption_used", False):
        raise HTTPException(status_code=400, detail="Exemption already used")
    
    # Grant 1 year exemption
    exemption_end = datetime.utcnow() + timedelta(days=365)
    
    await db.subscription_info.update_one(
        {"user_id": request.user_id},
        {"$set": {
            "subscription_status": "exemption",
            "exemption_used": True,
            "exemption_date": datetime.utcnow().isoformat(),
            "subscription_end_date": exemption_end.isoformat()
        }}
    )
    
    # Record exemption request
    exemption_record = {
        "user_id": request.user_id,
        "request_date": datetime.utcnow().isoformat(),
        "granted_date": datetime.utcnow().isoformat(),
        "expiry_date": exemption_end.isoformat(),
        "prayer_text": request.prayer_text,
        "is_synced": False
    }
    
    await db.exemption_requests.insert_one(exemption_record)
    
    return {
        "success": True,
        "message": "بارك الله فيك، تقبل الله دعاءك",
        "expiry_date": exemption_end.isoformat()
    }

# AI Chat (placeholder for GPT-4 integration)
@api_router.post("/ai/chat")
async def ai_chat(message: AIMessage):
    """AI Assistant chat endpoint"""
    # Placeholder response - will be integrated with OpenAI GPT-4 later
    response_text = f"شكراً لرسالتك. هذه ميزة المساعد الذكي ستكون جاهزة قريباً بإذن الله. تفضل بالسؤال عن الأذكار والأدعية."
    
    # Store chat history
    chat_record = {
        "user_message": message.user_message,
        "ai_response": response_text,
        "timestamp": datetime.utcnow(),
        "is_synced": False
    }
    
    await db.ai_chat.insert_one(chat_record)
    
    return {"response": response_text, "timestamp": datetime.utcnow().isoformat()}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_database()
    logger.info("Adkar Al Muslim API started successfully!")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
