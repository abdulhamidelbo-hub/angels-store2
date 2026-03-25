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

class PurchaseRecord(BaseModel):
    user_id: str
    product_id: str
    transaction_id: str
    purchase_date: Optional[str] = None
    expiry_date: Optional[str] = None
    price: float = 0.50
    currency: str = "USD"
    store: str = "app_store"  # app_store, play_store

class RevenueCatWebhook(BaseModel):
    event: dict
    api_version: Optional[str] = None

class AIMessage(BaseModel):
    user_message: str
    ai_response: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PrayerTimesRequest(BaseModel):
    latitude: float
    longitude: float
    city_name: Optional[str] = None

# ============================================================
# NEW MODELS FOR i18n AND AUDIO
# ============================================================

class Language(BaseModel):
    code: str
    name_ar: str
    name_en: str
    name_native: str
    flag: str
    is_rtl: bool = False
    is_active: bool = True
    speech_code: str
    display_order: int = 0

class Translation(BaseModel):
    id: Optional[int] = None
    azkar_id: int
    language_code: str
    translation_text: str
    transliteration: Optional[str] = None
    virtue_translated: Optional[str] = None
    reference_translated: Optional[str] = None

class AudioFile(BaseModel):
    id: Optional[int] = None
    azkar_id: int
    language_code: str
    audio_url: Optional[str] = None
    local_path: Optional[str] = None
    file_size: Optional[int] = None
    is_downloaded: bool = False
    voice_type: str = "expo-speech"  # expo-speech, recorded, ai-generated

class AppSettings(BaseModel):
    user_id: str = "default"
    font_size: str = "medium"  # small, medium, large, extraLarge
    auto_play: bool = False
    playback_speed: str = "normal"  # slow, normal, fast
    show_translation: bool = True
    show_transliteration: bool = True
    dark_mode: bool = False

# ============================================================
# DATABASE INITIALIZATION
# ============================================================

async def init_database():
    """Initialize database with all azkar and events"""
    
    # Check if already initialized
    existing_categories = await db.categories.count_documents({})
    if existing_categories > 0:
        logger.info("Database already initialized")
        # Initialize languages if not exist
        await init_languages()
        # Update azkar with transliterations if not present
        await update_azkar_transliterations()
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
    
    # Initialize azkar with transliterations
    azkar_data = [
        # Category 1: أذكار الصباح
        {
            "id": 1, "category_id": 1,
            "arabic_text": "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
            "transliteration": "Allahu la ilaha illa huwal Hayyul Qayyum, la ta'khuzuhu sinatun wa la nawm, lahu ma fis samawati wa ma fil ard",
            "translation_en": "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth.",
            "repeat_count": 1,
            "virtue_ar": "من قالها حين يصبح أجير من الجن حتى يمسى",
            "virtue_en": "Whoever recites it in the morning will be protected from jinn until evening",
            "reference_ar": "رواه الحاكم وابن حبان",
            "reference_en": "Narrated by Al-Hakim and Ibn Hibban",
            "is_favorite": False
        },
        {
            "id": 2, "category_id": 1,
            "arabic_text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ * قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
            "transliteration": "Bismillahir Rahmanir Rahim. Qul huwa Allahu ahad. Allahus samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad",
            "translation_en": "In the name of Allah, the Most Gracious, the Most Merciful. Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.",
            "repeat_count": 3,
            "virtue_ar": "من قالها حين يصبح وحين يمسى كفته من كل شيء",
            "virtue_en": "Whoever recites it morning and evening, it will suffice him against everything",
            "reference_ar": "رواه الترمذي",
            "reference_en": "Narrated by At-Tirmidhi",
            "is_favorite": False
        },
        {
            "id": 3, "category_id": 1,
            "arabic_text": "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
            "transliteration": "Asbahna wa asbahal mulku lillah, wal hamdu lillah, la ilaha illallahu wahdahu la shareeka lah",
            "translation_en": "We have entered the morning and the whole kingdom belongs to Allah. Praise is due to Allah. There is no god but Allah alone, without partner.",
            "repeat_count": 1,
            "virtue_ar": "من قالها حين يصبح فقد أدى شكر يومه",
            "virtue_en": "Whoever says it in the morning has fulfilled his thanks for that day",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim",
            "is_favorite": False
        },
        {
            "id": 4, "category_id": 1,
            "arabic_text": "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
            "transliteration": "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namoot, wa ilaykan nushoor",
            "translation_en": "O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.",
            "repeat_count": 1,
            "virtue_ar": "من الأذكار المشروعة في الصباح",
            "virtue_en": "From the prescribed morning supplications",
            "reference_ar": "رواه الترمذي",
            "reference_en": "Narrated by At-Tirmidhi",
            "is_favorite": False
        },
        {
            "id": 5, "category_id": 1,
            "arabic_text": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
            "transliteration": "Subhan Allahi wa bihamdih",
            "translation_en": "Glory be to Allah and His is the praise",
            "repeat_count": 100,
            "virtue_ar": "من قالها مائة مرة حين يصبح وحين يمسي لم يأت أحد يوم القيامة بأفضل مما جاء به",
            "virtue_en": "Whoever says it 100 times in the morning and evening, no one will come on the Day of Resurrection with anything better",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim",
            "is_favorite": False
        },
        # Category 12: التسبيحات العامة
        {
            "id": 50, "category_id": 12,
            "arabic_text": "سُبْحَانَ اللَّهِ",
            "transliteration": "Subhan Allah",
            "translation_en": "Glory be to Allah",
            "repeat_count": 33,
            "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه",
            "virtue_en": "Whoever says it after every prayer will have his sins forgiven",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim",
            "is_favorite": False
        },
        {
            "id": 51, "category_id": 12,
            "arabic_text": "الْحَمْدُ لِلَّهِ",
            "transliteration": "Alhamdulillah",
            "translation_en": "Praise be to Allah",
            "repeat_count": 33,
            "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه",
            "virtue_en": "Whoever says it after every prayer will have his sins forgiven",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim",
            "is_favorite": False
        },
        {
            "id": 52, "category_id": 12,
            "arabic_text": "اللَّهُ أَكْبَرُ",
            "transliteration": "Allahu Akbar",
            "translation_en": "Allah is the Greatest",
            "repeat_count": 34,
            "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه",
            "virtue_en": "Whoever says it after every prayer will have his sins forgiven",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim",
            "is_favorite": False
        },
        {
            "id": 53, "category_id": 12,
            "arabic_text": "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
            "transliteration": "La ilaha illallahu wahdahu la shareeka lah, lahul mulku wa lahul hamdu wa huwa ala kulli shay'in qadeer",
            "translation_en": "There is no god but Allah alone, without partner. To Him belongs dominion and to Him belongs praise and He is over all things competent.",
            "repeat_count": 10,
            "virtue_ar": "من قالها في يوم عشر مرات كان كمن أعتق أربعة أنفس من ولد إسماعيل",
            "virtue_en": "Whoever says it ten times in a day will be like one who freed four souls from the descendants of Ismail",
            "reference_ar": "رواه البخاري ومسلم",
            "reference_en": "Narrated by Al-Bukhari and Muslim",
            "is_favorite": False
        },
        {
            "id": 54, "category_id": 12,
            "arabic_text": "أَسْتَغْفِرُ اللَّهَ",
            "transliteration": "Astaghfirullah",
            "translation_en": "I seek forgiveness from Allah",
            "repeat_count": 100,
            "virtue_ar": "من لزم الاستغفار جعل الله له من كل ضيق مخرجاً",
            "virtue_en": "Whoever maintains seeking forgiveness, Allah will make for him a way out of every difficulty",
            "reference_ar": "رواه أبو داود",
            "reference_en": "Narrated by Abu Dawud",
            "is_favorite": False
        },
        {
            "id": 55, "category_id": 12,
            "arabic_text": "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
            "transliteration": "La hawla wa la quwwata illa billah",
            "translation_en": "There is no might nor power except with Allah",
            "repeat_count": 10,
            "virtue_ar": "كنز من كنوز الجنة",
            "virtue_en": "A treasure from the treasures of Paradise",
            "reference_ar": "رواه البخاري ومسلم",
            "reference_en": "Narrated by Al-Bukhari and Muslim",
            "is_favorite": False
        },
        {
            "id": 56, "category_id": 12,
            "arabic_text": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
            "transliteration": "Subhan Allahi wa bihamdih, Subhan Allahil Adheem",
            "translation_en": "Glory be to Allah and His is the praise, Glory be to Allah the Magnificent",
            "repeat_count": 10,
            "virtue_ar": "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن",
            "virtue_en": "Two phrases light on the tongue, heavy in the scales, beloved to the Most Merciful",
            "reference_ar": "رواه البخاري ومسلم",
            "reference_en": "Narrated by Al-Bukhari and Muslim",
            "is_favorite": False
        },
        # Category 14: سيد الاستغفار
        {
            "id": 60, "category_id": 14,
            "arabic_text": "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
            "transliteration": "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana abduk, wa ana ala ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bini'matika alayya, wa abu'u bidhunbi faghfir li fa innahu la yaghfirudh dhunuba illa anta",
            "translation_en": "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant. I am faithful to my covenant and promise to You as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge before You all Your blessings upon me, and I confess to You my sins. So forgive me, for none forgives sins but You.",
            "repeat_count": 1,
            "virtue_ar": "من قالها من النهار موقنًا بها فمات من يومه قبل أن يمسي فهو من أهل الجنة",
            "virtue_en": "Whoever says it with conviction during the day and dies before evening will be among the people of Paradise",
            "reference_ar": "رواه البخاري",
            "reference_en": "Narrated by Al-Bukhari",
            "is_favorite": False
        },
    ]
    await db.azkar.insert_many(azkar_data)
    
    # Initialize Islamic Events
    events = [
        {
            "id": 1, "name_ar": "شهر رمضان المبارك", "name_en": "Holy Month of Ramadan",
            "hijri_month": 9, "hijri_day": 1,
            "description_ar": "شهر الصيام والقيام والقرآن، تُفتح فيه أبواب الجنة وتُغلق أبواب النار",
            "description_en": "The month of fasting, prayer, and Quran. The gates of Paradise are opened and the gates of Hell are closed.",
            "notification_days": 3, "is_active": True
        },
        {
            "id": 2, "name_ar": "عيد الفطر المبارك", "name_en": "Eid al-Fitr",
            "hijri_month": 10, "hijri_day": 1,
            "description_ar": "عيد الفطر السعيد، يوم الجائزة للصائمين",
            "description_en": "Blessed Eid al-Fitr, the day of reward for those who fasted",
            "notification_days": 3, "is_active": True
        },
        {
            "id": 3, "name_ar": "يوم عرفة", "name_en": "Day of Arafah",
            "hijri_month": 12, "hijri_day": 9,
            "description_ar": "يوم عرفة المبارك، صيامه يكفر سنتين",
            "description_en": "The blessed Day of Arafah, fasting it expiates sins of two years",
            "notification_days": 3, "is_active": True
        },
        {
            "id": 4, "name_ar": "عيد الأضحى المبارك", "name_en": "Eid al-Adha",
            "hijri_month": 12, "hijri_day": 10,
            "description_ar": "عيد الأضحى المبارك، عيد النحر",
            "description_en": "Blessed Eid al-Adha, the Festival of Sacrifice",
            "notification_days": 3, "is_active": True
        },
        {
            "id": 5, "name_ar": "يوم عاشوراء", "name_en": "Day of Ashura",
            "hijri_month": 1, "hijri_day": 10,
            "description_ar": "يوم عاشوراء، صيامه يكفر سنة",
            "description_en": "Day of Ashura, fasting it expiates sins of one year",
            "notification_days": 3, "is_active": True
        },
        {
            "id": 6, "name_ar": "ليلة القدر", "name_en": "Night of Power",
            "hijri_month": 9, "hijri_day": 27,
            "description_ar": "ليلة خير من ألف شهر",
            "description_en": "A night better than a thousand months",
            "notification_days": 1, "is_active": True
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
    
    # Initialize languages
    await init_languages()
    
    logger.info("Database initialization complete!")


async def init_languages():
    """Initialize supported languages"""
    existing_languages = await db.languages.count_documents({})
    if existing_languages > 0:
        return
    
    logger.info("Initializing languages...")
    
    languages = [
        {"code": "ar", "name_ar": "العربية", "name_en": "Arabic", "name_native": "العربية", "flag": "🇸🇦", "is_rtl": True, "speech_code": "ar-SA", "display_order": 1, "is_active": True},
        {"code": "en", "name_ar": "الإنجليزية", "name_en": "English", "name_native": "English", "flag": "🇺🇸", "is_rtl": False, "speech_code": "en-US", "display_order": 2, "is_active": True},
        {"code": "tr", "name_ar": "التركية", "name_en": "Turkish", "name_native": "Türkçe", "flag": "🇹🇷", "is_rtl": False, "speech_code": "tr-TR", "display_order": 3, "is_active": True},
        {"code": "fr", "name_ar": "الفرنسية", "name_en": "French", "name_native": "Français", "flag": "🇫🇷", "is_rtl": False, "speech_code": "fr-FR", "display_order": 4, "is_active": True},
        {"code": "de", "name_ar": "الألمانية", "name_en": "German", "name_native": "Deutsch", "flag": "🇩🇪", "is_rtl": False, "speech_code": "de-DE", "display_order": 5, "is_active": True},
        {"code": "es", "name_ar": "الإسبانية", "name_en": "Spanish", "name_native": "Español", "flag": "🇪🇸", "is_rtl": False, "speech_code": "es-ES", "display_order": 6, "is_active": True},
        {"code": "it", "name_ar": "الإيطالية", "name_en": "Italian", "name_native": "Italiano", "flag": "🇮🇹", "is_rtl": False, "speech_code": "it-IT", "display_order": 7, "is_active": True},
        {"code": "pt", "name_ar": "البرتغالية", "name_en": "Portuguese", "name_native": "Português", "flag": "🇧🇷", "is_rtl": False, "speech_code": "pt-BR", "display_order": 8, "is_active": True},
        {"code": "ru", "name_ar": "الروسية", "name_en": "Russian", "name_native": "Русский", "flag": "🇷🇺", "is_rtl": False, "speech_code": "ru-RU", "display_order": 9, "is_active": True},
        {"code": "zh", "name_ar": "الصينية", "name_en": "Chinese", "name_native": "中文", "flag": "🇨🇳", "is_rtl": False, "speech_code": "zh-CN", "display_order": 10, "is_active": True},
        {"code": "ja", "name_ar": "اليابانية", "name_en": "Japanese", "name_native": "日本語", "flag": "🇯🇵", "is_rtl": False, "speech_code": "ja-JP", "display_order": 11, "is_active": True},
        {"code": "ko", "name_ar": "الكورية", "name_en": "Korean", "name_native": "한국어", "flag": "🇰🇷", "is_rtl": False, "speech_code": "ko-KR", "display_order": 12, "is_active": True},
        {"code": "hi", "name_ar": "الهندية", "name_en": "Hindi", "name_native": "हिन्दी", "flag": "🇮🇳", "is_rtl": False, "speech_code": "hi-IN", "display_order": 13, "is_active": True},
        {"code": "bn", "name_ar": "البنغالية", "name_en": "Bengali", "name_native": "বাংলা", "flag": "🇧🇩", "is_rtl": False, "speech_code": "bn-BD", "display_order": 14, "is_active": True},
        {"code": "ur", "name_ar": "الأردية", "name_en": "Urdu", "name_native": "اردو", "flag": "🇵🇰", "is_rtl": True, "speech_code": "ur-PK", "display_order": 15, "is_active": True},
        {"code": "fa", "name_ar": "الفارسية", "name_en": "Persian", "name_native": "فارسی", "flag": "🇮🇷", "is_rtl": True, "speech_code": "fa-IR", "display_order": 16, "is_active": True},
        {"code": "id", "name_ar": "الإندونيسية", "name_en": "Indonesian", "name_native": "Indonesia", "flag": "🇮🇩", "is_rtl": False, "speech_code": "id-ID", "display_order": 17, "is_active": True},
        {"code": "ms", "name_ar": "الماليزية", "name_en": "Malay", "name_native": "Melayu", "flag": "🇲🇾", "is_rtl": False, "speech_code": "ms-MY", "display_order": 18, "is_active": True},
        {"code": "sw", "name_ar": "السواحيلية", "name_en": "Swahili", "name_native": "Kiswahili", "flag": "🇰🇪", "is_rtl": False, "speech_code": "sw-KE", "display_order": 19, "is_active": True},
        {"code": "ha", "name_ar": "الهوسا", "name_en": "Hausa", "name_native": "Hausa", "flag": "🇳🇬", "is_rtl": False, "speech_code": "ha-NG", "display_order": 20, "is_active": True},
        {"code": "yo", "name_ar": "اليوروبا", "name_en": "Yoruba", "name_native": "Yorùbá", "flag": "🇳🇬", "is_rtl": False, "speech_code": "yo-NG", "display_order": 21, "is_active": True},
        {"code": "am", "name_ar": "الأمهرية", "name_en": "Amharic", "name_native": "አማርኛ", "flag": "🇪🇹", "is_rtl": False, "speech_code": "am-ET", "display_order": 22, "is_active": True},
        {"code": "si", "name_ar": "السنهالية", "name_en": "Sinhala", "name_native": "සිංහල", "flag": "🇱🇰", "is_rtl": False, "speech_code": "si-LK", "display_order": 23, "is_active": True},
        {"code": "th", "name_ar": "التايلاندية", "name_en": "Thai", "name_native": "ไทย", "flag": "🇹🇭", "is_rtl": False, "speech_code": "th-TH", "display_order": 24, "is_active": True},
        {"code": "vi", "name_ar": "الفيتنامية", "name_en": "Vietnamese", "name_native": "Tiếng Việt", "flag": "🇻🇳", "is_rtl": False, "speech_code": "vi-VN", "display_order": 25, "is_active": True},
        {"code": "pl", "name_ar": "البولندية", "name_en": "Polish", "name_native": "Polski", "flag": "🇵🇱", "is_rtl": False, "speech_code": "pl-PL", "display_order": 26, "is_active": True},
        {"code": "nl", "name_ar": "الهولندية", "name_en": "Dutch", "name_native": "Nederlands", "flag": "🇳🇱", "is_rtl": False, "speech_code": "nl-NL", "display_order": 27, "is_active": True},
        {"code": "sv", "name_ar": "السويدية", "name_en": "Swedish", "name_native": "Svenska", "flag": "🇸🇪", "is_rtl": False, "speech_code": "sv-SE", "display_order": 28, "is_active": True},
        {"code": "el", "name_ar": "اليونانية", "name_en": "Greek", "name_native": "Ελληνικά", "flag": "🇬🇷", "is_rtl": False, "speech_code": "el-GR", "display_order": 29, "is_active": True},
        {"code": "he", "name_ar": "العبرية", "name_en": "Hebrew", "name_native": "עברית", "flag": "🇮🇱", "is_rtl": True, "speech_code": "he-IL", "display_order": 30, "is_active": True},
    ]
    
    await db.languages.insert_many(languages)
    logger.info(f"Initialized {len(languages)} languages")


async def update_azkar_transliterations():
    """Update existing azkar with transliterations if not present"""
    transliteration_map = {
        "سُبْحَانَ اللَّهِ": "Subhan Allah",
        "الْحَمْدُ لِلَّهِ": "Alhamdulillah",
        "اللَّهُ أَكْبَرُ": "Allahu Akbar",
        "أَسْتَغْفِرُ اللَّهَ": "Astaghfirullah",
        "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ": "La hawla wa la quwwata illa billah",
    }
    
    for arabic, transliteration in transliteration_map.items():
        await db.azkar.update_many(
            {"arabic_text": arabic, "transliteration": None},
            {"$set": {"transliteration": transliteration}}
        )

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
    azkar['_id'] = str(azkar['_id'])
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
            "xp_earned": 0,
            "streak_days": 0
        }
    
    # Convert ObjectId to string
    if '_id' in stats:
        stats['_id'] = str(stats['_id'])
    
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
    
    # Remove ObjectId for JSON serialization
    if '_id' in sub:
        sub['_id'] = str(sub['_id'])
    
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
        "status": "approved",
        "is_synced": False
    }
    
    await db.exemption_requests.insert_one(exemption_record)
    
    return {
        "success": True,
        "message": "بارك الله فيك، تقبل الله دعاءك",
        "expiry_date": exemption_end.isoformat()
    }

# ============================================================
# PAYMENT & SUBSCRIPTION ENDPOINTS
# ============================================================

@api_router.post("/subscription/purchase")
async def record_purchase(purchase: PurchaseRecord):
    """Record a purchase from RevenueCat"""
    sub = await db.subscription_info.find_one({"user_id": purchase.user_id})
    
    if not sub:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update subscription status
    expiry = purchase.expiry_date or (datetime.utcnow() + timedelta(days=365)).isoformat()
    
    await db.subscription_info.update_one(
        {"user_id": purchase.user_id},
        {"$set": {
            "subscription_status": "active",
            "subscription_end_date": expiry,
            "last_purchase_date": datetime.utcnow().isoformat(),
        }}
    )
    
    # Record the purchase
    purchase_record = {
        "user_id": purchase.user_id,
        "product_id": purchase.product_id,
        "transaction_id": purchase.transaction_id,
        "purchase_date": purchase.purchase_date or datetime.utcnow().isoformat(),
        "expiry_date": expiry,
        "price": purchase.price,
        "currency": purchase.currency,
        "store": purchase.store,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    
    await db.purchases.insert_one(purchase_record)
    
    return {"success": True, "message": "تم تسجيل الشراء بنجاح", "expiry_date": expiry}

@api_router.post("/subscription/revenuecat-webhook")
async def revenuecat_webhook(webhook: RevenueCatWebhook):
    """Handle RevenueCat server-to-server webhook"""
    event = webhook.event
    event_type = event.get("type", "")
    app_user_id = event.get("app_user_id", "")
    
    logger.info(f"RevenueCat webhook: {event_type} for user {app_user_id}")
    
    # Record webhook event
    webhook_record = {
        "event_type": event_type,
        "app_user_id": app_user_id,
        "event_data": event,
        "received_at": datetime.utcnow().isoformat(),
    }
    await db.webhook_events.insert_one(webhook_record)
    
    # Handle different event types
    if event_type in ["INITIAL_PURCHASE", "RENEWAL", "PRODUCT_CHANGE"]:
        # Activate subscription
        expiry = event.get("expiration_at_ms")
        if expiry:
            expiry_date = datetime.fromtimestamp(expiry / 1000).isoformat()
        else:
            expiry_date = (datetime.utcnow() + timedelta(days=365)).isoformat()
        
        await db.subscription_info.update_one(
            {"user_id": app_user_id},
            {"$set": {
                "subscription_status": "active",
                "subscription_end_date": expiry_date,
                "last_purchase_date": datetime.utcnow().isoformat(),
            }},
            upsert=True
        )
        
        # Record purchase
        purchase_data = {
            "user_id": app_user_id,
            "product_id": event.get("product_id", "yearly_subscription"),
            "transaction_id": event.get("transaction_id", ""),
            "purchase_date": datetime.utcnow().isoformat(),
            "expiry_date": expiry_date,
            "price": event.get("price", 0.50),
            "currency": event.get("currency", "USD"),
            "store": event.get("store", "unknown"),
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
        await db.purchases.insert_one(purchase_data)
        
    elif event_type in ["CANCELLATION", "EXPIRATION"]:
        # Deactivate subscription
        await db.subscription_info.update_one(
            {"user_id": app_user_id},
            {"$set": {"subscription_status": "expired"}}
        )
        # Mark purchase as inactive
        await db.purchases.update_many(
            {"user_id": app_user_id, "is_active": True},
            {"$set": {"is_active": False}}
        )
    
    return {"success": True}

@api_router.get("/subscription/verify")
async def verify_subscription(user_id: str = "default"):
    """Verify current subscription status"""
    sub = await db.subscription_info.find_one({"user_id": user_id})
    
    if not sub:
        return {"is_active": False, "status": "none", "days_remaining": 0}
    
    status = sub.get("subscription_status", "trial")
    end_date_str = sub.get("subscription_end_date") or sub.get("trial_end_date", "")
    
    days_remaining = 0
    is_active = False
    
    if sub.get("is_lifetime"):
        is_active = True
        days_remaining = 999999
    elif end_date_str:
        try:
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00').replace('+00:00', ''))
            diff = end_date - datetime.utcnow()
            days_remaining = max(0, diff.days)
            is_active = days_remaining > 0
        except Exception:
            pass
    
    # Check if subscription expired
    if not is_active and status in ["active", "trial", "exemption"]:
        await db.subscription_info.update_one(
            {"user_id": user_id},
            {"$set": {"subscription_status": "expired"}}
        )
        status = "expired"
    
    return {
        "is_active": is_active or sub.get("is_lifetime", False),
        "status": status,
        "days_remaining": days_remaining,
        "is_lifetime": sub.get("is_lifetime", False),
        "exemption_used": sub.get("exemption_used", False),
    }

@api_router.get("/revenue/stats")
async def get_revenue_stats():
    """Get revenue statistics"""
    # Total purchases
    total_purchases = await db.purchases.count_documents({"is_active": True})
    
    # Total revenue
    pipeline = [
        {"$match": {"is_active": True}},
        {"$group": {"_id": None, "total": {"$sum": "$price"}}}
    ]
    revenue_result = await db.purchases.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # This month's revenue
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
    month_pipeline = [
        {"$match": {"created_at": {"$gte": month_start.isoformat()}}},
        {"$group": {"_id": None, "total": {"$sum": "$price"}}}
    ]
    month_result = await db.purchases.aggregate(month_pipeline).to_list(1)
    monthly_revenue = month_result[0]["total"] if month_result else 0
    
    # Monthly revenue chart (last 12 months)
    monthly_chart = []
    for i in range(12):
        month_date = datetime.utcnow() - timedelta(days=i * 30)
        m_start = month_date.replace(day=1).isoformat()[:7]  # YYYY-MM
        m_pipeline = [
            {"$match": {"created_at": {"$regex": f"^{m_start}"}}},
            {"$group": {"_id": None, "total": {"$sum": "$price"}, "count": {"$sum": 1}}}
        ]
        m_result = await db.purchases.aggregate(m_pipeline).to_list(1)
        monthly_chart.append({
            "month": m_start,
            "revenue": m_result[0]["total"] if m_result else 0,
            "count": m_result[0]["count"] if m_result else 0,
        })
    
    # Recent purchases
    recent = await db.purchases.find().sort("created_at", -1).to_list(20)
    for p in recent:
        p["_id"] = str(p["_id"])
    
    # Paid subscribers count
    paid_count = await db.subscription_info.count_documents({"subscription_status": "active"})
    
    # Exemption count
    exemption_count = await db.subscription_info.count_documents({"exemption_used": True})
    
    return {
        "total_revenue": total_revenue,
        "monthly_revenue": monthly_revenue,
        "total_purchases": total_purchases,
        "paid_subscribers": paid_count,
        "exemption_users": exemption_count,
        "monthly_chart": list(reversed(monthly_chart)),
        "recent_purchases": recent,
    }

@api_router.get("/payment-settings")
async def get_payment_settings():
    """Get payment configuration (for admin)"""
    settings = await db.admin_settings.find_one({"key": "payment_settings"})
    if not settings:
        default = {
            "key": "payment_settings",
            "revenuecat_configured": False,
            "stripe_configured": False,
            "subscription_price": 0.50,
            "is_live_mode": False,
        }
        await db.admin_settings.insert_one(default)
        return default
    settings["_id"] = str(settings["_id"])
    return settings

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

# ============================================================
# LANGUAGE AND TRANSLATION ENDPOINTS
# ============================================================

@api_router.get("/languages")
async def get_languages():
    """Get all supported languages"""
    languages = await db.languages.find({"is_active": True}).sort("display_order", 1).to_list(100)
    for lang in languages:
        lang['_id'] = str(lang['_id'])
    return languages

@api_router.get("/languages/{code}")
async def get_language(code: str):
    """Get language by code"""
    language = await db.languages.find_one({"code": code})
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")
    language['_id'] = str(language['_id'])
    return language

@api_router.get("/translations/{azkar_id}/{language_code}")
async def get_translation(azkar_id: int, language_code: str):
    """Get translation for an azkar in specific language"""
    translation = await db.translations.find_one({
        "azkar_id": azkar_id,
        "language_code": language_code
    })
    if translation:
        translation['_id'] = str(translation['_id'])
    return translation

@api_router.get("/azkar/{azkar_id}/full")
async def get_azkar_full(azkar_id: int, language_code: str = "en"):
    """Get azkar with all translations and audio"""
    azkar = await db.azkar.find_one({"id": azkar_id})
    if not azkar:
        raise HTTPException(status_code=404, detail="Azkar not found")
    
    azkar['_id'] = str(azkar['_id'])
    
    # Get translation if not Arabic
    if language_code != "ar":
        translation = await db.translations.find_one({
            "azkar_id": azkar_id,
            "language_code": language_code
        })
        if translation:
            azkar['translation'] = translation.get('translation_text')
            azkar['virtue_translated'] = translation.get('virtue_translated')
            azkar['reference_translated'] = translation.get('reference_translated')
    
    # Get audio files
    audio_files = await db.audio_files.find({"azkar_id": azkar_id}).to_list(10)
    azkar['audio_files'] = [{**a, '_id': str(a['_id'])} for a in audio_files]
    
    return azkar

# ============================================================
# USER SETTINGS ENDPOINTS
# ============================================================

@api_router.get("/settings/{user_id}")
async def get_user_settings(user_id: str = "default"):
    """Get user settings"""
    settings = await db.user_settings.find_one({"user_id": user_id})
    if not settings:
        # Return default settings
        settings = {
            "user_id": user_id,
            "font_size": "medium",
            "auto_play": False,
            "playback_speed": "normal",
            "show_translation": True,
            "show_transliteration": True,
            "dark_mode": False,
            "language_code": "ar"
        }
        await db.user_settings.insert_one(settings)
    
    settings['_id'] = str(settings['_id'])
    return settings

@api_router.post("/settings/{user_id}")
async def update_user_settings(user_id: str, settings: dict):
    """Update user settings"""
    await db.user_settings.update_one(
        {"user_id": user_id},
        {"$set": settings},
        upsert=True
    )
    return {"success": True, "message": "Settings updated"}

# ============================================================
# ADMIN: TRANSLATION MANAGEMENT
# ============================================================

@api_router.post("/admin/translations")
async def add_translation(translation: Translation):
    """Add or update translation for an azkar"""
    translation_dict = translation.dict(exclude_none=True)
    
    existing = await db.translations.find_one({
        "azkar_id": translation.azkar_id,
        "language_code": translation.language_code
    })
    
    if existing:
        await db.translations.update_one(
            {"_id": existing["_id"]},
            {"$set": translation_dict}
        )
        return {"success": True, "message": "Translation updated", "id": str(existing["_id"])}
    else:
        result = await db.translations.insert_one(translation_dict)
        return {"success": True, "message": "Translation added", "id": str(result.inserted_id)}

@api_router.get("/admin/translations/{azkar_id}")
async def get_all_translations(azkar_id: int):
    """Get all translations for an azkar"""
    translations = await db.translations.find({"azkar_id": azkar_id}).to_list(100)
    for t in translations:
        t['_id'] = str(t['_id'])
    return translations

@api_router.post("/admin/audio")
async def add_audio_file(audio: AudioFile):
    """Add audio file record for an azkar"""
    audio_dict = audio.dict(exclude_none=True)
    result = await db.audio_files.insert_one(audio_dict)
    return {"success": True, "id": str(result.inserted_id)}

@api_router.post("/admin/seed-real-azkar")
async def seed_real_azkar():
    """Seed database with real azkar texts for all categories"""
    
    # أذكار الصباح الحقيقية
    morning_azkar = [
        {
            "id": 1, "category_id": 1,
            "arabic_text": "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
            "transliteration": "Asbahna wa asbahal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul mulku wa lahul hamdu wa huwa ala kulli shay'in qadeer",
            "translation_en": "We have reached the morning and at this very time the whole kingdom belongs to Allah. Praise is to Allah. None has the right to be worshipped except Allah alone without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent.",
            "repeat_count": 1,
            "virtue_ar": "من قالها حين يصبح فقد أدى شكر يومه",
            "virtue_en": "Whoever says this in the morning has fulfilled his thanks for the day",
            "reference_ar": "رواه أبو داود",
            "reference_en": "Narrated by Abu Dawud"
        },
        {
            "id": 2, "category_id": 1,
            "arabic_text": "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
            "transliteration": "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namootu, wa ilaykan nushoor",
            "translation_en": "O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.",
            "repeat_count": 1,
            "virtue_ar": "من الأذكار المشروعة في الصباح",
            "virtue_en": "From the prescribed morning supplications",
            "reference_ar": "رواه الترمذي",
            "reference_en": "Narrated by At-Tirmidhi"
        },
        {
            "id": 3, "category_id": 1,
            "arabic_text": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
            "transliteration": "Subhan Allahi wa bihamdih",
            "translation_en": "Glory be to Allah and His is the praise",
            "repeat_count": 100,
            "virtue_ar": "من قالها حين يصبح وحين يمسي مائة مرة لم يأت أحد يوم القيامة بأفضل مما جاء به",
            "virtue_en": "Whoever says it 100 times morning and evening, no one will come on Judgment Day with anything better",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim"
        },
        {
            "id": 4, "category_id": 1,
            "arabic_text": "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
            "transliteration": "La ilaha illallahu wahdahu la shareeka lah, lahul mulku wa lahul hamdu wa huwa ala kulli shay'in qadeer",
            "translation_en": "None has the right to be worshipped except Allah, alone without partner. To Him belongs all sovereignty and praise and He is over all things omnipotent.",
            "repeat_count": 10,
            "virtue_ar": "من قالها عشر مرات كان كمن أعتق أربعة أنفس من ولد إسماعيل",
            "virtue_en": "Whoever says it ten times will be like one who freed four souls from the descendants of Ismail",
            "reference_ar": "رواه البخاري ومسلم",
            "reference_en": "Narrated by Al-Bukhari and Muslim"
        },
        {
            "id": 5, "category_id": 1,
            "arabic_text": "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
            "transliteration": "Allahumma inni asbahtu ush-hiduka, wa ush-hidu hamalata arshik, wa mala'ikatak, wa jami'a khalqik, annaka antallahu la ilaha illa anta wahdaka la shareeka lak, wa anna Muhammadan abduka wa rasooluk",
            "translation_en": "O Allah, verily I have reached the morning and call on You, the bearers of Your throne, Your angels, and all of Your creation to witness that You are Allah, none has the right to be worshipped except You, alone, without partner and that Muhammad is Your servant and Messenger.",
            "repeat_count": 4,
            "virtue_ar": "من قالها أربع مرات أعتقه الله من النار",
            "virtue_en": "Whoever says it four times, Allah will free him from the Fire",
            "reference_ar": "رواه أبو داود",
            "reference_en": "Narrated by Abu Dawud"
        },
        {
            "id": 6, "category_id": 1,
            "arabic_text": "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ",
            "transliteration": "Allahumma aafini fi badani, Allahumma aafini fi sam'i, Allahumma aafini fi basari, la ilaha illa anta",
            "translation_en": "O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health. None has the right to be worshipped except You.",
            "repeat_count": 3,
            "virtue_ar": "دعاء للعافية",
            "virtue_en": "Supplication for well-being",
            "reference_ar": "رواه أبو داود",
            "reference_en": "Narrated by Abu Dawud"
        },
        {
            "id": 7, "category_id": 1,
            "arabic_text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ",
            "transliteration": "Allahumma inni a'udhu bika minal kufr, wal faqr, wa a'udhu bika min adhabil qabr, la ilaha illa anta",
            "translation_en": "O Allah, I seek refuge in You from disbelief, poverty, and I seek refuge in You from the punishment of the grave. None has the right to be worshipped except You.",
            "repeat_count": 3,
            "virtue_ar": "الاستعاذة من الكفر والفقر وعذاب القبر",
            "virtue_en": "Seeking refuge from disbelief, poverty and grave punishment",
            "reference_ar": "رواه أبو داود",
            "reference_en": "Narrated by Abu Dawud"
        },
        {
            "id": 8, "category_id": 1,
            "arabic_text": "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
            "transliteration": "Hasbiyal lahu la ilaha illa huwa alayhi tawakkaltu wa huwa rabbul arshil adheem",
            "translation_en": "Allah is sufficient for me, none has the right to be worshipped except Him, upon Him I rely and He is Lord of the exalted throne.",
            "repeat_count": 7,
            "virtue_ar": "من قالها حين يصبح وحين يمسي سبع مرات كفاه الله ما أهمه من أمر الدنيا والآخرة",
            "virtue_en": "Whoever says it seven times morning and evening, Allah will suffice him in all matters of this world and the hereafter",
            "reference_ar": "رواه ابن السني",
            "reference_en": "Narrated by Ibn As-Sunni"
        },
        {
            "id": 9, "category_id": 1,
            "arabic_text": "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
            "transliteration": "Bismillahil ladhi la yadurru ma'asmihi shay'un fil ardi wa la fis sama'i wa huwas sami'ul aleem",
            "translation_en": "In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Hearing, The All-Knowing.",
            "repeat_count": 3,
            "virtue_ar": "من قالها ثلاث مرات لم تصبه فجأة بلاء حتى يمسي",
            "virtue_en": "Whoever says it three times will not be afflicted by sudden calamity until evening",
            "reference_ar": "رواه أبو داود والترمذي",
            "reference_en": "Narrated by Abu Dawud and At-Tirmidhi"
        },
        {
            "id": 10, "category_id": 1,
            "arabic_text": "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
            "transliteration": "Raditu billahi rabba, wa bil islami deena, wa bi Muhammadin sallallahu alayhi wa sallama nabiyya",
            "translation_en": "I am pleased with Allah as a Lord, Islam as a religion and Muhammad peace be upon him as a Prophet.",
            "repeat_count": 3,
            "virtue_ar": "من قالها حين يصبح وحين يمسي كان حقاً على الله أن يرضيه يوم القيامة",
            "virtue_en": "Whoever says it morning and evening, it is a right upon Allah to please him on the Day of Resurrection",
            "reference_ar": "رواه أحمد",
            "reference_en": "Narrated by Ahmad"
        },
    ]
    
    # أذكار المساء
    evening_azkar = [
        {
            "id": 21, "category_id": 2,
            "arabic_text": "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
            "transliteration": "Amsayna wa amsal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul mulku wa lahul hamdu wa huwa ala kulli shay'in qadeer",
            "translation_en": "We have reached the evening and at this very time the whole kingdom belongs to Allah. All praise is due to Allah.",
            "repeat_count": 1,
            "virtue_ar": "من قالها حين يمسي فقد أدى شكر ليلته",
            "virtue_en": "Whoever says it in the evening has fulfilled thanks for that night",
            "reference_ar": "رواه أبو داود",
            "reference_en": "Narrated by Abu Dawud"
        },
        {
            "id": 22, "category_id": 2,
            "arabic_text": "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
            "transliteration": "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namootu, wa ilaykal maseer",
            "translation_en": "O Allah, by Your leave we have reached the evening, by Your leave we have reached the morning, by Your leave we live and die and unto You is our return.",
            "repeat_count": 1,
            "virtue_ar": "من الأذكار المشروعة في المساء",
            "virtue_en": "From the prescribed evening supplications",
            "reference_ar": "رواه الترمذي",
            "reference_en": "Narrated by At-Tirmidhi"
        },
        {
            "id": 23, "category_id": 2,
            "arabic_text": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
            "transliteration": "Subhan Allahi wa bihamdih",
            "translation_en": "Glory be to Allah and His is the praise",
            "repeat_count": 100,
            "virtue_ar": "من قالها مائة مرة حطت خطاياه وإن كانت مثل زبد البحر",
            "virtue_en": "Whoever says it 100 times, his sins will be forgiven even if they were like the foam of the sea",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim"
        },
    ]
    
    # التسبيحات العامة (تحديث)
    general_tasbeeh = [
        {
            "id": 100, "category_id": 12,
            "arabic_text": "سُبْحَانَ اللَّهِ",
            "transliteration": "Subhan Allah",
            "translation_en": "Glory be to Allah",
            "repeat_count": 33,
            "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه",
            "virtue_en": "Whoever says it after every prayer will have his sins forgiven",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim"
        },
        {
            "id": 101, "category_id": 12,
            "arabic_text": "الْحَمْدُ لِلَّهِ",
            "transliteration": "Alhamdulillah",
            "translation_en": "Praise be to Allah",
            "repeat_count": 33,
            "virtue_ar": "تملأ الميزان",
            "virtue_en": "It fills the scale",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim"
        },
        {
            "id": 102, "category_id": 12,
            "arabic_text": "اللَّهُ أَكْبَرُ",
            "transliteration": "Allahu Akbar",
            "translation_en": "Allah is the Greatest",
            "repeat_count": 34,
            "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه",
            "virtue_en": "Whoever says it after every prayer will have his sins forgiven",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim"
        },
        {
            "id": 103, "category_id": 12,
            "arabic_text": "لَا إِلَٰهَ إِلَّا اللَّهُ",
            "transliteration": "La ilaha illallah",
            "translation_en": "There is no god but Allah",
            "repeat_count": 100,
            "virtue_ar": "أفضل ما قلت أنا والنبيون من قبلي",
            "virtue_en": "The best that I and the prophets before me have said",
            "reference_ar": "رواه الترمذي",
            "reference_en": "Narrated by At-Tirmidhi"
        },
        {
            "id": 104, "category_id": 12,
            "arabic_text": "أَسْتَغْفِرُ اللَّهَ",
            "transliteration": "Astaghfirullah",
            "translation_en": "I seek forgiveness from Allah",
            "repeat_count": 100,
            "virtue_ar": "من لزم الاستغفار جعل الله له من كل ضيق مخرجاً",
            "virtue_en": "Whoever maintains seeking forgiveness, Allah will make a way out from every difficulty",
            "reference_ar": "رواه أبو داود",
            "reference_en": "Narrated by Abu Dawud"
        },
        {
            "id": 105, "category_id": 12,
            "arabic_text": "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
            "transliteration": "La hawla wa la quwwata illa billah",
            "translation_en": "There is no might nor power except with Allah",
            "repeat_count": 100,
            "virtue_ar": "كنز من كنوز الجنة",
            "virtue_en": "A treasure from the treasures of Paradise",
            "reference_ar": "رواه البخاري ومسلم",
            "reference_en": "Narrated by Al-Bukhari and Muslim"
        },
        {
            "id": 106, "category_id": 12,
            "arabic_text": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
            "transliteration": "Subhan Allahi wa bihamdih, Subhan Allahil Adheem",
            "translation_en": "Glory be to Allah and His is the praise, Glory be to Allah the Magnificent",
            "repeat_count": 100,
            "virtue_ar": "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن",
            "virtue_en": "Two phrases light on the tongue, heavy in the scales, beloved to the Most Merciful",
            "reference_ar": "رواه البخاري ومسلم",
            "reference_en": "Narrated by Al-Bukhari and Muslim"
        },
        {
            "id": 107, "category_id": 12,
            "arabic_text": "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
            "transliteration": "Allahumma salli wa sallim ala nabiyyina Muhammad",
            "translation_en": "O Allah, send prayers and peace upon our Prophet Muhammad",
            "repeat_count": 10,
            "virtue_ar": "من صلى عليّ صلاة صلى الله عليه بها عشراً",
            "virtue_en": "Whoever sends one prayer upon me, Allah will send ten upon him",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim"
        },
    ]
    
    # سيد الاستغفار
    istighfar = [
        {
            "id": 120, "category_id": 14,
            "arabic_text": "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
            "transliteration": "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana abduk, wa ana ala ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bini'matika alayya, wa abu'u bidhunbi faghfir li fa innahu la yaghfirudh dhunuba illa anta",
            "translation_en": "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, I am faithful to my covenant and promise to You as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge before You all Your blessings upon me, and I confess to You my sins. So forgive me, for none forgives sins but You.",
            "repeat_count": 1,
            "virtue_ar": "من قالها من النهار موقنًا بها فمات من يومه قبل أن يمسي فهو من أهل الجنة",
            "virtue_en": "Whoever says it with conviction during the day and dies before evening will be among the people of Paradise",
            "reference_ar": "رواه البخاري",
            "reference_en": "Narrated by Al-Bukhari"
        },
    ]
    
    # حذف الأذكار القديمة وإدراج الجديدة
    all_azkar = morning_azkar + evening_azkar + general_tasbeeh + istighfar
    
    for azkar in all_azkar:
        azkar['is_favorite'] = False
        await db.azkar.update_one(
            {"id": azkar["id"]},
            {"$set": azkar},
            upsert=True
        )
    
    # تحديث عدد الأذكار في التصنيفات
    categories_counts = {1: 10, 2: 3, 12: 8, 14: 1}
    for cat_id, count in categories_counts.items():
        await db.categories.update_one(
            {"id": cat_id},
            {"$set": {"azkar_count": count}}
        )
    
    return {"success": True, "message": f"Added/Updated {len(all_azkar)} real azkar with proper texts"}


@api_router.post("/admin/seed-transliterations")
async def seed_transliterations():
    """Add transliterations to existing azkar"""
    transliterations = [
        {"id": 1, "transliteration": "Dhikr as-Sabah 1", "translation_en": "Morning Remembrance 1"},
        {"id": 2, "transliteration": "Dhikr as-Sabah 2", "translation_en": "Morning Remembrance 2"},
        {"id": 3, "transliteration": "Dhikr as-Sabah 3", "translation_en": "Morning Remembrance 3"},
    ]
    
    # Sample real azkar with full translations
    real_azkar = [
        {
            "category_id": 12,
            "arabic_text": "سُبْحَانَ اللَّهِ",
            "transliteration": "Subhan Allah",
            "translation_en": "Glory be to Allah",
            "repeat_count": 33,
            "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه",
            "virtue_en": "Whoever says it after every prayer will have his sins forgiven",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim",
            "is_favorite": False
        },
        {
            "category_id": 12,
            "arabic_text": "الْحَمْدُ لِلَّهِ",
            "transliteration": "Alhamdulillah",
            "translation_en": "Praise be to Allah",
            "repeat_count": 33,
            "virtue_ar": "تملأ الميزان",
            "virtue_en": "It fills the scale",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim",
            "is_favorite": False
        },
        {
            "category_id": 12,
            "arabic_text": "اللَّهُ أَكْبَرُ",
            "transliteration": "Allahu Akbar",
            "translation_en": "Allah is the Greatest",
            "repeat_count": 34,
            "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه",
            "virtue_en": "Whoever says it after every prayer will have his sins forgiven",
            "reference_ar": "رواه مسلم",
            "reference_en": "Narrated by Muslim",
            "is_favorite": False
        },
        {
            "category_id": 12,
            "arabic_text": "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
            "transliteration": "La ilaha illallahu wahdahu la shareeka lah, lahul mulku wa lahul hamdu wa huwa ala kulli shay'in qadeer",
            "translation_en": "There is no god but Allah alone, without partner. To Him belongs dominion and praise and He is over all things competent.",
            "repeat_count": 10,
            "virtue_ar": "من قالها عشر مرات كان كمن أعتق أربعة أنفس",
            "virtue_en": "Whoever says it ten times will be like one who freed four souls",
            "reference_ar": "رواه البخاري ومسلم",
            "reference_en": "Narrated by Al-Bukhari and Muslim",
            "is_favorite": False
        },
        {
            "category_id": 12,
            "arabic_text": "أَسْتَغْفِرُ اللَّهَ",
            "transliteration": "Astaghfirullah",
            "translation_en": "I seek forgiveness from Allah",
            "repeat_count": 100,
            "virtue_ar": "من لزم الاستغفار جعل الله له من كل ضيق مخرجاً",
            "virtue_en": "Whoever maintains seeking forgiveness, Allah will make for him a way out",
            "reference_ar": "رواه أبو داود",
            "reference_en": "Narrated by Abu Dawud",
            "is_favorite": False
        },
        {
            "category_id": 12,
            "arabic_text": "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
            "transliteration": "La hawla wa la quwwata illa billah",
            "translation_en": "There is no might nor power except with Allah",
            "repeat_count": 10,
            "virtue_ar": "كنز من كنوز الجنة",
            "virtue_en": "A treasure from the treasures of Paradise",
            "reference_ar": "رواه البخاري ومسلم",
            "reference_en": "Narrated by Al-Bukhari and Muslim",
            "is_favorite": False
        },
        {
            "category_id": 12,
            "arabic_text": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
            "transliteration": "Subhan Allahi wa bihamdih, Subhan Allahil Adheem",
            "translation_en": "Glory be to Allah and His is the praise, Glory be to Allah the Magnificent",
            "repeat_count": 10,
            "virtue_ar": "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن",
            "virtue_en": "Two phrases light on the tongue, heavy in the scales, beloved to the Most Merciful",
            "reference_ar": "رواه البخاري ومسلم",
            "reference_en": "Narrated by Al-Bukhari and Muslim",
            "is_favorite": False
        },
        {
            "category_id": 14,
            "arabic_text": "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
            "transliteration": "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana abduk, wa ana ala ahdika wa wa'dika mastata't",
            "translation_en": "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant. I am faithful to my covenant and promise as much as I am able.",
            "repeat_count": 1,
            "virtue_ar": "من قالها موقنًا بها فمات من يومه فهو من أهل الجنة",
            "virtue_en": "Whoever says it with conviction and dies that day will be among the people of Paradise",
            "reference_ar": "رواه البخاري",
            "reference_en": "Narrated by Al-Bukhari",
            "is_favorite": False
        },
    ]
    
    # Insert real azkar for category 12 and 14
    for i, azkar in enumerate(real_azkar, start=100):
        azkar['id'] = i
        await db.azkar.update_one(
            {"id": i},
            {"$set": azkar},
            upsert=True
        )
    
    # Update existing azkar with transliterations
    for item in transliterations:
        await db.azkar.update_one(
            {"id": item["id"]},
            {"$set": {"transliteration": item["transliteration"], "translation_en": item["translation_en"]}}
        )
    
    return {"success": True, "message": f"Added {len(real_azkar)} real azkar with transliterations"}


@api_router.get("/admin/audio/{azkar_id}")
async def get_audio_files(azkar_id: int):
    """Get all audio files for an azkar"""
    audio_files = await db.audio_files.find({"azkar_id": azkar_id}).to_list(100)
    for a in audio_files:
        a['_id'] = str(a['_id'])
    return audio_files

# Include routers
app.include_router(api_router)

# Admin routes
from admin_routes import admin_router, set_db as set_admin_db
set_admin_db(db)
app.include_router(admin_router)

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
