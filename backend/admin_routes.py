from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
import json
import logging

logger = logging.getLogger(__name__)

admin_router = APIRouter(prefix="/api/admin")

# Will be set from server.py
db = None

def set_db(database):
    global db
    db = database

# ============================================================
# ADMIN MODELS
# ============================================================

class AdminSettingUpdate(BaseModel):
    key: str
    value: Any

class AzkarCreate(BaseModel):
    category_id: int
    arabic_text: str
    transliteration: Optional[str] = None
    translation_en: Optional[str] = None
    repeat_count: int = 1
    virtue_ar: Optional[str] = None
    virtue_en: Optional[str] = None
    reference_ar: Optional[str] = None
    reference_en: Optional[str] = None

class AzkarUpdate(BaseModel):
    category_id: Optional[int] = None
    arabic_text: Optional[str] = None
    transliteration: Optional[str] = None
    translation_en: Optional[str] = None
    repeat_count: Optional[int] = None
    virtue_ar: Optional[str] = None
    virtue_en: Optional[str] = None
    reference_ar: Optional[str] = None
    reference_en: Optional[str] = None

class EventCreate(BaseModel):
    name_ar: str
    name_en: str
    hijri_month: Optional[int] = None
    hijri_day: Optional[int] = None
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    notification_days: int = 3

class EventUpdate(BaseModel):
    name_ar: Optional[str] = None
    name_en: Optional[str] = None
    hijri_month: Optional[int] = None
    hijri_day: Optional[int] = None
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    notification_days: Optional[int] = None
    is_active: Optional[bool] = None

class EventAzkarCreate(BaseModel):
    arabic_text: str
    transliteration: Optional[str] = None
    repeat_count: int = 1
    virtue_ar: Optional[str] = None
    virtue_en: Optional[str] = None
    reference_ar: Optional[str] = None
    reference_en: Optional[str] = None

class ChallengeCreate(BaseModel):
    title_ar: str
    title_en: str
    description_ar: str
    description_en: str
    required_count: int
    reward_xp: int
    reward_badge: Optional[str] = None
    challenge_type: str = "daily"  # daily, weekly, monthly, event
    event_id: Optional[int] = None

class ChallengeUpdate(BaseModel):
    title_ar: Optional[str] = None
    title_en: Optional[str] = None
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    required_count: Optional[int] = None
    reward_xp: Optional[int] = None
    reward_badge: Optional[str] = None
    challenge_type: Optional[str] = None
    event_id: Optional[int] = None
    is_active: Optional[bool] = None

class NotificationSend(BaseModel):
    title_ar: str
    title_en: Optional[str] = None
    body_ar: str
    body_en: Optional[str] = None
    target: str = "all"  # all, paid, active, exemption
    scheduled_date: Optional[str] = None
    link: Optional[str] = None

class ExemptionAction(BaseModel):
    status: str  # approved, rejected, pending
    reason: Optional[str] = None

class UserSubscriptionUpdate(BaseModel):
    action: str  # grant_lifetime, grant_year, cancel, grant_exemption
    reason: Optional[str] = None

class UserBanAction(BaseModel):
    is_banned: bool
    reason: Optional[str] = None

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

def serialize_docs(docs):
    """Convert list of MongoDB documents"""
    return [serialize_doc(doc) for doc in docs]

async def log_admin_action(action: str, details: str = ""):
    """Log admin actions"""
    log_entry = {
        "action": action,
        "details": details,
        "timestamp": datetime.utcnow().isoformat()
    }
    await db.admin_logs.insert_one(log_entry)

async def get_next_id(collection_name: str) -> int:
    """Get the next available ID for a collection"""
    last_doc = await db[collection_name].find_one(sort=[("id", -1)])
    return (last_doc["id"] + 1) if last_doc and "id" in last_doc else 1

# ============================================================
# 1. DASHBOARD STATS
# ============================================================

@admin_router.get("/stats")
async def get_admin_stats():
    """Get dashboard overview statistics"""
    total_users = await db.subscription_info.count_documents({})
    
    # Active users (last 24 hours)
    yesterday = (datetime.utcnow() - timedelta(days=1)).isoformat()
    active_today = await db.daily_stats.count_documents({"date": datetime.utcnow().date().isoformat()})
    
    # Active users (last 7 days)
    week_ago = (datetime.utcnow() - timedelta(days=7)).date().isoformat()
    active_weekly_stats = await db.daily_stats.find({"date": {"$gte": week_ago}}).to_list(100)
    active_weekly = len(set([s.get("user_id", "default") for s in active_weekly_stats])) if active_weekly_stats else 0
    
    # Total tasbeeh
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_tasbeeh"}}}]
    tasbeeh_result = await db.daily_stats.aggregate(pipeline).to_list(1)
    total_tasbeeh = tasbeeh_result[0]["total"] if tasbeeh_result else 0
    
    # Total XP
    xp_pipeline = [{"$group": {"_id": None, "total": {"$sum": "$xp_earned"}}}]
    xp_result = await db.daily_stats.aggregate(xp_pipeline).to_list(1)
    total_xp = xp_result[0]["total"] if xp_result else 0
    
    # Paid subscribers
    paid_users = await db.subscription_info.count_documents({"subscription_status": "active"})
    
    # Exemption users
    exemption_users = await db.subscription_info.count_documents({"exemption_used": True})
    
    # Total azkar count
    total_azkar = await db.azkar.count_documents({})
    
    # Total events count
    total_events = await db.islamic_events.count_documents({})
    
    # Total challenges count
    total_challenges = await db.challenges.count_documents({})
    
    # Exemption requests pending
    pending_exemptions = await db.exemption_requests.count_documents({"status": "pending"})
    
    return {
        "total_users": max(total_users, 1),
        "active_today": max(active_today, 0),
        "active_weekly": max(active_weekly, 0),
        "total_tasbeeh": total_tasbeeh,
        "total_xp": total_xp,
        "paid_users": paid_users,
        "exemption_users": exemption_users,
        "total_azkar": total_azkar,
        "total_events": total_events,
        "total_challenges": total_challenges,
        "pending_exemptions": pending_exemptions,
        "total_revenue": paid_users * 0.50,
        "monthly_revenue": 0,
    }

@admin_router.get("/stats/charts")
async def get_chart_data():
    """Get chart data for dashboard"""
    # Daily tasbeeh for last 30 days
    thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).date().isoformat()
    daily_stats = await db.daily_stats.find(
        {"date": {"$gte": thirty_days_ago}}
    ).sort("date", 1).to_list(30)
    
    tasbeeh_chart = [{"date": s.get("date", ""), "count": s.get("total_tasbeeh", 0)} for s in daily_stats]
    
    # Monthly user registrations
    all_users = await db.subscription_info.find().to_list(10000)
    monthly_users = {}
    for user in all_users:
        install = user.get("install_date", "")
        if install:
            month_key = install[:7]  # YYYY-MM
            monthly_users[month_key] = monthly_users.get(month_key, 0) + 1
    
    users_chart = [{"month": k, "count": v} for k, v in sorted(monthly_users.items())]
    
    return {
        "tasbeeh_daily": tasbeeh_chart,
        "users_monthly": users_chart,
    }

# ============================================================
# 2. MANAGE AZKAR
# ============================================================

@admin_router.get("/azkar")
async def admin_list_azkar(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """List all azkar with optional filters"""
    query = {}
    if category_id:
        query["category_id"] = category_id
    if search:
        query["arabic_text"] = {"$regex": search, "$options": "i"}
    
    skip = (page - 1) * limit
    total = await db.azkar.count_documents(query)
    azkar = await db.azkar.find(query).skip(skip).limit(limit).to_list(limit)
    
    return {
        "items": serialize_docs(azkar),
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@admin_router.post("/azkar")
async def admin_create_azkar(azkar: AzkarCreate):
    """Create a new azkar"""
    next_id = await get_next_id("azkar")
    azkar_dict = azkar.dict()
    azkar_dict["id"] = next_id
    azkar_dict["is_favorite"] = False
    azkar_dict["created_at"] = datetime.utcnow().isoformat()
    
    await db.azkar.insert_one(azkar_dict)
    await log_admin_action("create_azkar", f"Created azkar #{next_id}")
    
    return {"success": True, "id": next_id, "message": "تم إضافة الذكر بنجاح"}

@admin_router.put("/azkar/{azkar_id}")
async def admin_update_azkar(azkar_id: int, azkar: AzkarUpdate):
    """Update an existing azkar"""
    existing = await db.azkar.find_one({"id": azkar_id})
    if not existing:
        raise HTTPException(status_code=404, detail="الذكر غير موجود")
    
    update_data = {k: v for k, v in azkar.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow().isoformat()
        await db.azkar.update_one({"id": azkar_id}, {"$set": update_data})
    
    await log_admin_action("update_azkar", f"Updated azkar #{azkar_id}")
    return {"success": True, "message": "تم تحديث الذكر بنجاح"}

@admin_router.delete("/azkar/{azkar_id}")
async def admin_delete_azkar(azkar_id: int):
    """Delete an azkar"""
    result = await db.azkar.delete_one({"id": azkar_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="الذكر غير موجود")
    
    await log_admin_action("delete_azkar", f"Deleted azkar #{azkar_id}")
    return {"success": True, "message": "تم حذف الذكر بنجاح"}

@admin_router.post("/azkar/import")
async def admin_import_azkar(data: Dict[str, Any] = Body(...)):
    """Import azkar from JSON data"""
    azkar_list = data.get("azkar", [])
    if not azkar_list:
        raise HTTPException(status_code=400, detail="لا توجد أذكار للاستيراد")
    
    next_id = await get_next_id("azkar")
    imported = 0
    
    for azkar_item in azkar_list:
        azkar_item["id"] = next_id
        azkar_item["is_favorite"] = False
        azkar_item["created_at"] = datetime.utcnow().isoformat()
        await db.azkar.insert_one(azkar_item)
        next_id += 1
        imported += 1
    
    await log_admin_action("import_azkar", f"Imported {imported} azkar")
    return {"success": True, "imported": imported, "message": f"تم استيراد {imported} ذكر بنجاح"}

@admin_router.get("/azkar/export")
async def admin_export_azkar(category_id: Optional[int] = None):
    """Export azkar to JSON"""
    query = {}
    if category_id:
        query["category_id"] = category_id
    
    azkar = await db.azkar.find(query).to_list(10000)
    serialized = serialize_docs(azkar)
    
    await log_admin_action("export_azkar", f"Exported {len(serialized)} azkar")
    return {"azkar": serialized, "count": len(serialized)}

# ============================================================
# 3. MANAGE EVENTS
# ============================================================

@admin_router.get("/events")
async def admin_list_events():
    """List all Islamic events"""
    events = await db.islamic_events.find().sort("hijri_month", 1).to_list(100)
    return {"items": serialize_docs(events), "total": len(events)}

@admin_router.post("/events")
async def admin_create_event(event: EventCreate):
    """Create a new Islamic event"""
    next_id = await get_next_id("islamic_events")
    event_dict = event.dict()
    event_dict["id"] = next_id
    event_dict["is_active"] = True
    event_dict["created_at"] = datetime.utcnow().isoformat()
    
    await db.islamic_events.insert_one(event_dict)
    await log_admin_action("create_event", f"Created event '{event.name_ar}'")
    
    return {"success": True, "id": next_id, "message": "تم إضافة المناسبة بنجاح"}

@admin_router.put("/events/{event_id}")
async def admin_update_event(event_id: int, event: EventUpdate):
    """Update an Islamic event"""
    existing = await db.islamic_events.find_one({"id": event_id})
    if not existing:
        raise HTTPException(status_code=404, detail="المناسبة غير موجودة")
    
    update_data = {k: v for k, v in event.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow().isoformat()
        await db.islamic_events.update_one({"id": event_id}, {"$set": update_data})
    
    await log_admin_action("update_event", f"Updated event #{event_id}")
    return {"success": True, "message": "تم تحديث المناسبة بنجاح"}

@admin_router.delete("/events/{event_id}")
async def admin_delete_event(event_id: int):
    """Delete an Islamic event and its associated azkar"""
    result = await db.islamic_events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="المناسبة غير موجودة")
    
    # Also delete associated event azkar
    await db.event_azkar.delete_many({"event_id": event_id})
    
    await log_admin_action("delete_event", f"Deleted event #{event_id}")
    return {"success": True, "message": "تم حذف المناسبة وأذكارها بنجاح"}

@admin_router.get("/events/{event_id}/azkar")
async def admin_get_event_azkar(event_id: int):
    """Get azkar for a specific event"""
    azkar = await db.event_azkar.find({"event_id": event_id}).to_list(100)
    return {"items": serialize_docs(azkar), "total": len(azkar)}

@admin_router.post("/events/{event_id}/azkar")
async def admin_add_event_azkar(event_id: int, azkar: EventAzkarCreate):
    """Add azkar to an event"""
    event = await db.islamic_events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="المناسبة غير موجودة")
    
    next_id = await get_next_id("event_azkar")
    azkar_dict = azkar.dict()
    azkar_dict["id"] = next_id
    azkar_dict["event_id"] = event_id
    azkar_dict["created_at"] = datetime.utcnow().isoformat()
    
    await db.event_azkar.insert_one(azkar_dict)
    await log_admin_action("add_event_azkar", f"Added azkar to event #{event_id}")
    
    return {"success": True, "id": next_id, "message": "تم إضافة الذكر للمناسبة بنجاح"}

@admin_router.delete("/events/{event_id}/azkar/{azkar_id}")
async def admin_delete_event_azkar(event_id: int, azkar_id: int):
    """Delete azkar from an event"""
    result = await db.event_azkar.delete_one({"id": azkar_id, "event_id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="الذكر غير موجود في هذه المناسبة")
    
    await log_admin_action("delete_event_azkar", f"Deleted azkar #{azkar_id} from event #{event_id}")
    return {"success": True, "message": "تم حذف الذكر من المناسبة بنجاح"}

# ============================================================
# 4. MANAGE CHALLENGES
# ============================================================

@admin_router.get("/challenges")
async def admin_list_challenges():
    """List all challenges"""
    challenges = await db.challenges.find().to_list(100)
    return {"items": serialize_docs(challenges), "total": len(challenges)}

@admin_router.post("/challenges")
async def admin_create_challenge(challenge: ChallengeCreate):
    """Create a new challenge"""
    next_id = await get_next_id("challenges")
    challenge_dict = challenge.dict()
    challenge_dict["id"] = next_id
    challenge_dict["is_active"] = True
    challenge_dict["created_at"] = datetime.utcnow().isoformat()
    
    await db.challenges.insert_one(challenge_dict)
    await log_admin_action("create_challenge", f"Created challenge '{challenge.title_ar}'")
    
    return {"success": True, "id": next_id, "message": "تم إضافة التحدي بنجاح"}

@admin_router.put("/challenges/{challenge_id}")
async def admin_update_challenge(challenge_id: int, challenge: ChallengeUpdate):
    """Update a challenge"""
    existing = await db.challenges.find_one({"id": challenge_id})
    if not existing:
        raise HTTPException(status_code=404, detail="التحدي غير موجود")
    
    update_data = {k: v for k, v in challenge.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow().isoformat()
        await db.challenges.update_one({"id": challenge_id}, {"$set": update_data})
    
    await log_admin_action("update_challenge", f"Updated challenge #{challenge_id}")
    return {"success": True, "message": "تم تحديث التحدي بنجاح"}

@admin_router.delete("/challenges/{challenge_id}")
async def admin_delete_challenge(challenge_id: int):
    """Delete a challenge"""
    result = await db.challenges.delete_one({"id": challenge_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="التحدي غير موجود")
    
    await log_admin_action("delete_challenge", f"Deleted challenge #{challenge_id}")
    return {"success": True, "message": "تم حذف التحدي بنجاح"}

# ============================================================
# 5. MANAGE USERS
# ============================================================

@admin_router.get("/users")
async def admin_list_users(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """List all users"""
    query = {}
    if search:
        query["user_id"] = {"$regex": search, "$options": "i"}
    if status:
        query["subscription_status"] = status
    
    skip = (page - 1) * limit
    total = await db.subscription_info.count_documents(query)
    users = await db.subscription_info.find(query).skip(skip).limit(limit).to_list(limit)
    
    return {
        "items": serialize_docs(users),
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@admin_router.get("/users/{user_id}")
async def admin_get_user(user_id: str):
    """Get user details"""
    user = await db.subscription_info.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    # Get user's tasbeeh stats
    user_stats = await db.daily_stats.find({"user_id": user_id}).to_list(1000)
    total_tasbeeh = sum(s.get("total_tasbeeh", 0) for s in user_stats)
    total_xp = sum(s.get("xp_earned", 0) for s in user_stats)
    
    user_data = serialize_doc(user)
    user_data["total_tasbeeh"] = total_tasbeeh
    user_data["total_xp"] = total_xp
    
    return user_data

@admin_router.put("/users/{user_id}/subscription")
async def admin_update_user_subscription(user_id: str, update: UserSubscriptionUpdate):
    """Manage user subscription"""
    user = await db.subscription_info.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    update_data = {}
    
    if update.action == "grant_lifetime":
        update_data = {
            "subscription_status": "active",
            "is_lifetime": True,
            "subscription_end_date": None
        }
    elif update.action == "grant_year":
        end_date = (datetime.utcnow() + timedelta(days=365)).isoformat()
        update_data = {
            "subscription_status": "active",
            "subscription_end_date": end_date
        }
    elif update.action == "cancel":
        update_data = {
            "subscription_status": "expired",
            "is_lifetime": False
        }
    elif update.action == "grant_exemption":
        end_date = (datetime.utcnow() + timedelta(days=365)).isoformat()
        update_data = {
            "subscription_status": "exemption",
            "exemption_used": True,
            "exemption_date": datetime.utcnow().isoformat(),
            "subscription_end_date": end_date
        }
    
    if update_data:
        await db.subscription_info.update_one({"user_id": user_id}, {"$set": update_data})
    
    await log_admin_action("update_subscription", f"User {user_id}: {update.action}")
    return {"success": True, "message": "تم تحديث اشتراك المستخدم بنجاح"}

@admin_router.put("/users/{user_id}/ban")
async def admin_ban_user(user_id: str, ban: UserBanAction):
    """Ban or unban a user"""
    user = await db.subscription_info.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    await db.subscription_info.update_one(
        {"user_id": user_id},
        {"$set": {
            "is_banned": ban.is_banned,
            "ban_reason": ban.reason,
            "ban_date": datetime.utcnow().isoformat() if ban.is_banned else None
        }}
    )
    
    action = "ban" if ban.is_banned else "unban"
    await log_admin_action(f"{action}_user", f"User {user_id}: {ban.reason or 'N/A'}")
    return {"success": True, "message": f"تم {'حظر' if ban.is_banned else 'إلغاء حظر'} المستخدم بنجاح"}

# ============================================================
# 6. MANAGE EXEMPTION REQUESTS
# ============================================================

@admin_router.get("/exemptions")
async def admin_list_exemptions(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """List all exemption requests"""
    query = {}
    if status:
        query["status"] = status
    
    skip = (page - 1) * limit
    total = await db.exemption_requests.count_documents(query)
    exemptions = await db.exemption_requests.find(query).sort("request_date", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "items": serialize_docs(exemptions),
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@admin_router.put("/exemptions/{exemption_id}")
async def admin_process_exemption(exemption_id: str, action: ExemptionAction):
    """Process an exemption request"""
    try:
        exemption = await db.exemption_requests.find_one({"_id": ObjectId(exemption_id)})
    except Exception:
        exemption = await db.exemption_requests.find_one({"user_id": exemption_id})
    
    if not exemption:
        raise HTTPException(status_code=404, detail="طلب الإعفاء غير موجود")
    
    update_data = {
        "status": action.status,
        "processed_date": datetime.utcnow().isoformat(),
        "rejection_reason": action.reason if action.status == "rejected" else None
    }
    
    await db.exemption_requests.update_one(
        {"_id": exemption["_id"]},
        {"$set": update_data}
    )
    
    # If approved, grant user exemption
    if action.status == "approved":
        user_id = exemption.get("user_id")
        if user_id:
            end_date = (datetime.utcnow() + timedelta(days=365)).isoformat()
            await db.subscription_info.update_one(
                {"user_id": user_id},
                {"$set": {
                    "subscription_status": "exemption",
                    "exemption_used": True,
                    "exemption_date": datetime.utcnow().isoformat(),
                    "subscription_end_date": end_date
                }}
            )
    
    await log_admin_action("process_exemption", f"Exemption {exemption_id}: {action.status}")
    
    status_text = {"approved": "تمت الموافقة", "rejected": "تم الرفض", "pending": "قيد المراجعة"}
    return {"success": True, "message": f"{status_text.get(action.status, '')} على طلب الإعفاء"}

@admin_router.get("/exemptions/stats")
async def admin_exemption_stats():
    """Get exemption statistics"""
    total = await db.exemption_requests.count_documents({})
    approved = await db.exemption_requests.count_documents({"status": "approved"})
    rejected = await db.exemption_requests.count_documents({"status": "rejected"})
    pending = await db.exemption_requests.count_documents({"status": "pending"})
    
    # No status field means old records - count them too
    no_status = await db.exemption_requests.count_documents({"status": {"$exists": False}})
    
    return {
        "total": total,
        "approved": approved,
        "rejected": rejected,
        "pending": pending + no_status,
    }

# ============================================================
# 7. NOTIFICATIONS
# ============================================================

@admin_router.post("/notifications/send")
async def admin_send_notification(notification: NotificationSend):
    """Send a notification (stored for record)"""
    notif_dict = notification.dict()
    notif_dict["sent_at"] = datetime.utcnow().isoformat()
    notif_dict["status"] = "sent" if not notification.scheduled_date else "scheduled"
    
    await db.admin_notifications.insert_one(notif_dict)
    await log_admin_action("send_notification", f"Sent to: {notification.target}")
    
    return {"success": True, "message": "تم إرسال الإشعار بنجاح"}

@admin_router.get("/notifications")
async def admin_list_notifications(page: int = 1, limit: int = 20):
    """List all sent notifications"""
    skip = (page - 1) * limit
    total = await db.admin_notifications.count_documents({})
    notifications = await db.admin_notifications.find().sort("sent_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "items": serialize_docs(notifications),
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@admin_router.get("/notifications/auto-settings")
async def admin_get_notification_settings():
    """Get automatic notification settings"""
    settings = await db.admin_settings.find_one({"key": "notification_settings"})
    if not settings:
        default_settings = {
            "key": "notification_settings",
            "morning_enabled": True,
            "morning_time": "06:00",
            "evening_enabled": True,
            "evening_time": "18:00",
            "events_enabled": True,
        }
        await db.admin_settings.insert_one(default_settings)
        return default_settings
    return serialize_doc(settings)

@admin_router.put("/notifications/auto-settings")
async def admin_update_notification_settings(settings: Dict[str, Any] = Body(...)):
    """Update automatic notification settings"""
    await db.admin_settings.update_one(
        {"key": "notification_settings"},
        {"$set": settings},
        upsert=True
    )
    return {"success": True, "message": "تم تحديث إعدادات الإشعارات بنجاح"}

# ============================================================
# 8. ADMIN SETTINGS
# ============================================================

@admin_router.get("/settings")
async def admin_get_settings():
    """Get all admin settings"""
    settings = await db.admin_settings.find().to_list(100)
    
    # Return as key-value map
    settings_map = {}
    for s in settings:
        if "key" in s:
            # Only use the value field, not the entire document
            settings_map[s["key"]] = s.get("value", None)
    
    # Defaults
    defaults = {
        "subscription_price": 0.50,
        "free_trial_days": 365,
        "free_mode_enabled": False,
        "admin_tap_count": 5,
        "admin_enabled": True,
        "admin_password": None,
    }
    
    for key, value in defaults.items():
        if key not in settings_map:
            settings_map[key] = value
    
    return settings_map

@admin_router.put("/settings")
async def admin_update_settings(settings: Dict[str, Any] = Body(...)):
    """Update admin settings"""
    for key, value in settings.items():
        await db.admin_settings.update_one(
            {"key": key},
            {"$set": {"key": key, "value": value, "updated_at": datetime.utcnow().isoformat()}},
            upsert=True
        )
    
    await log_admin_action("update_settings", f"Updated: {list(settings.keys())}")
    return {"success": True, "message": "تم تحديث الإعدادات بنجاح"}

# ============================================================
# 9. BACKUP & RESTORE
# ============================================================

@admin_router.get("/backup")
async def admin_backup():
    """Export full database backup as JSON"""
    backup = {}
    
    collections = ["categories", "azkar", "islamic_events", "event_azkar", 
                    "challenges", "admin_settings", "admin_notifications"]
    
    for collection_name in collections:
        docs = await db[collection_name].find().to_list(100000)
        backup[collection_name] = serialize_docs(docs)
    
    await log_admin_action("backup", "Full database backup exported")
    
    return {
        "backup": backup,
        "exported_at": datetime.utcnow().isoformat(),
        "collections": list(backup.keys()),
        "total_documents": sum(len(v) for v in backup.values())
    }

@admin_router.post("/backup/restore")
async def admin_restore(data: Dict[str, Any] = Body(...)):
    """Restore database from backup JSON"""
    backup = data.get("backup", {})
    if not backup:
        raise HTTPException(status_code=400, detail="لا توجد بيانات للاستعادة")
    
    restored = {}
    for collection_name, docs in backup.items():
        if collection_name in ["categories", "azkar", "islamic_events", "event_azkar", 
                                "challenges", "admin_settings"]:
            # Clear existing and insert backup
            await db[collection_name].delete_many({})
            if docs:
                # Remove _id fields to avoid conflicts
                for doc in docs:
                    doc.pop("_id", None)
                await db[collection_name].insert_many(docs)
            restored[collection_name] = len(docs)
    
    await log_admin_action("restore", f"Database restored: {restored}")
    return {"success": True, "restored": restored, "message": "تم استعادة البيانات بنجاح"}

# ============================================================
# 10. ADMIN LOGS
# ============================================================

@admin_router.get("/logs")
async def admin_get_logs(page: int = 1, limit: int = 50):
    """Get admin activity logs"""
    skip = (page - 1) * limit
    total = await db.admin_logs.count_documents({})
    logs = await db.admin_logs.find().sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "items": serialize_docs(logs),
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

# ============================================================
# 11. CATEGORIES MANAGEMENT
# ============================================================

@admin_router.get("/categories")
async def admin_list_categories():
    """List all categories with azkar count"""
    categories = await db.categories.find().sort("display_order", 1).to_list(100)
    
    result = []
    for cat in categories:
        cat_data = serialize_doc(cat)
        count = await db.azkar.count_documents({"category_id": cat["id"]})
        cat_data["azkar_count"] = count
        result.append(cat_data)
    
    return {"items": result, "total": len(result)}
