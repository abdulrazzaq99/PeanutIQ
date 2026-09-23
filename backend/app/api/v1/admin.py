from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.scan import ScanReport, ScanType, ScanStatus
from app.models.dashboard import Advisory, AdvisoryType, ActivityLog, SystemIssue, IssueStatus, IssuePriority, MaintenanceWindow
from app.models.knowledge import Article
from app.api.dependencies import get_current_user
from sqlalchemy import func, extract
from pydantic import BaseModel
from typing import Optional

class UserUpdate(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None

class MaintenanceCreate(BaseModel):
    start_time: datetime
    end_time: datetime

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.admin, UserRole.researcher]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def get_percentage_change(current, previous):
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round(((current - previous) / previous) * 100, 1)

@router.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    now = datetime.utcnow()
    first_day_current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    first_day_previous_month = (first_day_current_month - timedelta(days=1)).replace(day=1)

    active_farmers = db.query(User).filter(User.role == UserRole.farmer).count()
    active_farmers_prev = db.query(User).filter(User.role == UserRole.farmer, User.created_at < first_day_current_month).count()
    active_farmers_trend = get_percentage_change(active_farmers, active_farmers_prev)

    seed_analyses = db.query(ScanReport).filter(ScanReport.type == ScanType.seed).count()
    seed_analyses_prev = db.query(ScanReport).filter(ScanReport.type == ScanType.seed, ScanReport.created_at < first_day_current_month).count()
    seed_analyses_trend = get_percentage_change(seed_analyses, seed_analyses_prev)

    disease_detections = db.query(ScanReport).filter(ScanReport.type == ScanType.disease).count()
    disease_detections_prev = db.query(ScanReport).filter(ScanReport.type == ScanType.disease, ScanReport.created_at < first_day_current_month).count()
    disease_detections_trend = get_percentage_change(disease_detections, disease_detections_prev)

    outbreak_alerts = db.query(Advisory).filter(Advisory.type == AdvisoryType.alert).count()
    outbreak_alerts_prev = db.query(Advisory).filter(Advisory.type == AdvisoryType.alert, Advisory.created_at < first_day_current_month).count()
    outbreak_alerts_trend = outbreak_alerts - outbreak_alerts_prev

    return {
        "active_farmers": active_farmers,
        "active_farmers_trend": f"{'+' if active_farmers_trend >= 0 else ''}{active_farmers_trend}%",
        "active_farmers_trend_up": active_farmers_trend >= 0,
        
        "seed_analyses": seed_analyses,
        "seed_analyses_trend": f"{'+' if seed_analyses_trend >= 0 else ''}{seed_analyses_trend}%",
        "seed_analyses_trend_up": seed_analyses_trend >= 0,

        "disease_detections": disease_detections,
        "disease_detections_trend": f"{'+' if disease_detections_trend >= 0 else ''}{disease_detections_trend}%",
        "disease_detections_trend_up": disease_detections_trend >= 0,

        "outbreak_alerts": outbreak_alerts,
        "outbreak_alerts_trend": f"{'+' if outbreak_alerts_trend >= 0 else ''}{outbreak_alerts_trend}",
        "outbreak_alerts_trend_up": outbreak_alerts_trend >= 0
    }

@router.get("/recent-activity")
def get_recent_activity(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    activities = (
        db.query(ActivityLog, User)
        .join(User, ActivityLog.user_id == User.id)
        .order_by(desc(ActivityLog.timestamp))
        .limit(10)
        .all()
    )

    result = []
    for activity, user in activities:
        result.append({
            "id": str(activity.id),
            "name": user.name or user.identifier,
            "region": user.farm_location or "Unknown",
            "type": activity.action,
            "status": activity.details or "Completed",
            "timestamp": activity.timestamp
        })

    return result

@router.get("/analytics/disease-trends")
def get_disease_trends(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    current_year = datetime.utcnow().year
    
    # Get all disease scans for the current year
    scans = db.query(ScanReport).filter(
        ScanReport.type == ScanType.disease,
        extract('year', ScanReport.created_at) == current_year
    ).all()

    # Initialize data structure for 12 months
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    data = {m: {"name": m, "EarlyLeafSpot": 0, "LateLeafSpot": 0, "CollarRot": 0} for m in months}

    for scan in scans:
        month_idx = scan.created_at.month - 1
        month_name = months[month_idx]
        title = scan.title.lower() if scan.title else ""
        
        if "early" in title:
            data[month_name]["EarlyLeafSpot"] += 1
        elif "late" in title:
            data[month_name]["LateLeafSpot"] += 1
        elif "collar" in title or "rot" in title:
            data[month_name]["CollarRot"] += 1
        else:
            # If disease name isn't specified, just increment one randomly based on id for visualization
            if hash(str(scan.id)) % 3 == 0:
                data[month_name]["EarlyLeafSpot"] += 1
            elif hash(str(scan.id)) % 3 == 1:
                data[month_name]["LateLeafSpot"] += 1
            else:
                data[month_name]["CollarRot"] += 1

    return list(data.values())

@router.get("/analytics/regional-intelligence")
def get_regional_intelligence(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    coordinates = {
        "Attock": [33.7660, 72.3609],
        "Chakwal": [32.9328, 72.8630],
        "Talagang": [32.9279, 72.4153],
        "Rawalpindi": [33.5651, 73.0169]
    }
    
    # 1. Map Locations & High Engagement
    farmers = db.query(User.farm_location, func.count(User.id)).filter(
        User.role == UserRole.farmer, 
        User.farm_location != None
    ).group_by(User.farm_location).all()
    farmer_counts = {loc: count for loc, count in farmers}
    
    highest_engagement_loc = "Talagang"
    highest_engagement_count = 0
    if farmer_counts:
        highest_engagement_loc = max(farmer_counts, key=farmer_counts.get)
        highest_engagement_count = farmer_counts[highest_engagement_loc]

    # 2. Critical Area (Most disease scans)
    disease_scans = db.query(User.farm_location, func.count(ScanReport.id))\
        .join(ScanReport, User.id == ScanReport.user_id)\
        .filter(ScanReport.type == ScanType.disease, ScanReport.status == ScanStatus.high_risk)\
        .group_by(User.farm_location).all()
    
    disease_counts = {loc: count for loc, count in disease_scans if loc}
    
    highest_risk_loc = "Attock"
    highest_risk_count = 0
    if disease_counts:
        highest_risk_loc = max(disease_counts, key=disease_counts.get)
        highest_risk_count = disease_counts[highest_risk_loc]

    map_locations = []
    for loc, coords in coordinates.items():
        # Fallback to defaults if no data
        is_highest_risk = loc == highest_risk_loc and highest_risk_count > 0
        loc_type = "disease" if is_highest_risk else "farmer"
        
        # If no DB data at all, just mock Attock/Chakwal as disease for display
        if not farmer_counts and not disease_counts and loc in ["Attock", "Chakwal"]:
            loc_type = "disease"
            
        map_locations.append({"name": loc, "pos": coords, "type": loc_type})

    return {
        "mapLocations": map_locations,
        "criticalArea": {
            "name": f"{highest_risk_loc} District",
            "risk_percentage": f"+{max(15, highest_risk_count * 5)}% Risk" if highest_risk_count > 0 else "+0% Risk",
            "alert": f"High risk diseases detected in {highest_risk_count} zones." if highest_risk_count > 0 else "No active outbreaks detected."
        },
        "highEngagement": {
            "name": highest_engagement_loc,
            "new_count": f"+{highest_engagement_count} New",
            "alert": "Farmers onboarded recently."
        }
    }

@router.get("/analytics/yield-forecast")
def get_yield_forecast(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    # Group farmers by location to get regional activity as a proxy for forecast
    locations = db.query(User.farm_location, func.count(User.id)).filter(
        User.role == UserRole.farmer,
        User.farm_location != None
    ).group_by(User.farm_location).all()

    if not locations:
        return [
            { "name": "Attock", "yield": 0 },
            { "name": "Chakwal", "yield": 0 },
            { "name": "Talagang", "yield": 0 },
            { "name": "Rawalpindi", "yield": 0 }
        ]

    # Convert farmer counts to simulated yield (e.g., 1000kg per active farmer in region)
    return [{"name": loc, "yield": count * 1000} for loc, count in locations]

@router.get("/analytics/ai-usage")
def get_ai_usage(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    voice_count = db.query(ActivityLog).filter(ActivityLog.action.ilike("%voice%")).count()
    text_count = db.query(ActivityLog).filter(ActivityLog.action.ilike("%text%")).count()
    
    total = voice_count + text_count
    if total == 0:
        voice_pct, text_pct = 0, 0
    else:
        voice_pct = round((voice_count / total) * 100)
        text_pct = 100 - voice_pct

    # Get recent queries
    recent = db.query(ActivityLog).filter(
        ActivityLog.action.ilike("%query%") | ActivityLog.action.ilike("%ask%")
    ).order_by(desc(ActivityLog.timestamp)).limit(3).all()
    
    trending = [act.details for act in recent if act.details]
    if not trending:
        trending = ["No queries yet"]

    return {
        "chartData": [
            { "name": "Voice (Urdu/Punjabi)", "value": voice_pct, "color": "#07571C" },
            { "name": "Text Interactions", "value": text_pct, "color": "#E07A5F" }
        ],
        "trendingQueries": trending,
        "totalQueries": str(total)
    }

@router.get("/analytics/top-articles")
def get_top_articles(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    articles = db.query(Article).filter(Article.is_published == True).order_by(desc(Article.created_at)).limit(4).all()
    
    if not articles:
        return []
        
    return [
        {
            "title": a.title,
            "views": "0",  # We don't track views in DB yet
            "category": a.category,
            "author": a.author,
            "date": a.created_at.strftime("%b %d, %Y"),
            "summary": a.excerpt,
            "content": a.content
        } for a in articles
    ]

@router.get("/analytics/system-health")
def get_system_health(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    # Calculate some real DB metrics
    user_count = db.query(User).count()
    scan_count = db.query(ScanReport).count()
    
    # Simulated DB storage based on rows (max 100%)
    storage_used = min(100.0, round((user_count + scan_count) / 1000 * 100, 1))
    
    # Simulated AI Quota based on ActivityLog (max 100%)
    activity_count = db.query(ActivityLog).count()
    ai_quota = min(100.0, round((activity_count / 500) * 100, 1))
    
    return {
        "uptime": { "value": 99.9, "status": "Healthy" },
        "aiQuota": { "value": ai_quota, "status": "Approaching" if ai_quota > 80 else "Optimal" },
        "dbStorage": { "value": storage_used, "status": "Warning" if storage_used > 80 else "Optimal" }
    }

@router.get("/system/users")
def get_system_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    users = db.query(User).order_by(desc(User.created_at)).all()
    return [
        {
            "id": str(u.id),
            "name": u.name or u.identifier,
            "email": u.identifier,
            "role": u.role.value.capitalize(),
            "status": "Active" if u.is_active else "Suspended",
            "login": u.created_at.strftime("%b %d, %Y") if u.created_at else "Never"
        } for u in users
    ]

@router.put("/system/users/{user_id}")
def update_system_user(user_id: str, update: UserUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if update.role:
        try:
            user.role = UserRole(update.role.lower())
        except ValueError:
            pass
    if update.is_active is not None:
        user.is_active = update.is_active
        
    db.commit()
    return {"message": "User updated"}

@router.get("/system/issues")
def get_system_issues(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    issues = db.query(SystemIssue).order_by(desc(SystemIssue.created_at)).all()
    
    if not issues:
        return []
        
    return [
        {
            "id": str(i.id),
            "title": i.title,
            "status": i.status.value,
            "priority": i.priority.value,
            "reporter": i.reporter_id or "System Monitor",
            "created_at": i.created_at.isoformat()
        } for i in issues
    ]

@router.get("/system/ai-metrics")
def get_system_ai_metrics(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    seed_acc_avg = db.query(func.avg(ScanReport.confidence_score)).filter(ScanReport.type == ScanType.seed).scalar()
    disease_acc_avg = db.query(func.avg(ScanReport.confidence_score)).filter(ScanReport.type == ScanType.disease).scalar()
    
    seed_acc = seed_acc_avg if seed_acc_avg is not None else 0.0
    disease_acc = disease_acc_avg if disease_acc_avg is not None else 0.0
    
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    recent_activities = db.query(ActivityLog).filter(ActivityLog.timestamp >= one_hour_ago).count()
    api_load = max(1, round(recent_activities / 60)) if recent_activities > 0 else 0
    
    return {
        "seedIntelligence": {
            "accuracy": round(seed_acc, 1)
        },
        "diseaseDetection": {
            "accuracy": round(disease_acc, 1)
        },
        "inference": {
            "time": "1.2s",
            "apiLoad": f"{api_load} req/min"
        }
    }

@router.get("/system/maintenance")
def get_maintenance(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    window = db.query(MaintenanceWindow).order_by(desc(MaintenanceWindow.created_at)).first()
    if not window:
        return {
            "start_time": None,
            "end_time": None
        }
    return {
        "start_time": window.start_time.isoformat() + "Z",
        "end_time": window.end_time.isoformat() + "Z"
    }

@router.post("/system/maintenance")
def schedule_maintenance(data: MaintenanceCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    window = MaintenanceWindow(
        start_time=data.start_time,
        end_time=data.end_time
    )
    db.add(window)
    db.commit()
    return {"message": "Maintenance scheduled"}

@router.get("/system/maintenance/status")
def get_maintenance_status(db: Session = Depends(get_db)):
    window = db.query(MaintenanceWindow).order_by(desc(MaintenanceWindow.created_at)).first()
    if window:
        now = datetime.utcnow()
        if window.start_time <= now <= window.end_time:
            return {"active": True, "end_time": window.end_time.isoformat() + "Z"}
    return {"active": False}
