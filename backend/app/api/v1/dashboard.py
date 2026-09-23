from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models.dashboard import Advisory, ActionItem, ActivityLog, AdvisoryType, CropProfile
from app.schemas.dashboard import (
    AdvisoryResponse, AdvisoryCreate, 
    ActionItemResponse, ActionItemCreate, ActionItemUpdate,
    ActivityLogResponse, ActivityLogCreate,
    CropProfileResponse
)
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

# --- CROP PROFILE ---

@router.get("/crop-profile", response_model=CropProfileResponse)
def get_crop_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(CropProfile).filter(CropProfile.user_id == current_user.id).first()
    if not profile:
        # Create a default profile if it doesn't exist
        profile = CropProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

# --- ADVISORIES ---

@router.get("/advisories", response_model=List[AdvisoryResponse])
def get_advisories(
    type: AdvisoryType = None,
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Advisory)
    if type:
        query = query.filter(Advisory.type == type)
    
    return query.order_by(Advisory.created_at.desc()).limit(limit).all()

@router.post("/advisories", response_model=AdvisoryResponse, status_code=status.HTTP_201_CREATED)
def create_advisory(
    advisory_in: AdvisoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ['admin', 'researcher']:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_advisory = Advisory(**advisory_in.model_dump())
    db.add(db_advisory)
    db.commit()
    db.refresh(db_advisory)
    return db_advisory

# --- ACTION ITEMS (To-Do List) ---

@router.get("/actions", response_model=List[ActionItemResponse])
def get_action_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ActionItem).filter(ActionItem.user_id == current_user.id).order_by(ActionItem.due_date.asc()).all()

@router.post("/actions", response_model=ActionItemResponse, status_code=status.HTTP_201_CREATED)
def create_action_item(
    action_in: ActionItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_action = ActionItem(**action_in.model_dump(), user_id=current_user.id)
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    return db_action

@router.put("/actions/{action_id}", response_model=ActionItemResponse)
def update_action_item(
    action_id: UUID,
    action_in: ActionItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_action = db.query(ActionItem).filter(ActionItem.id == action_id, ActionItem.user_id == current_user.id).first()
    if not db_action:
        raise HTTPException(status_code=404, detail="Action item not found")
        
    db_action.is_completed = action_in.is_completed
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    return db_action

# --- ACTIVITY LOGS ---

@router.get("/activities", response_model=List[ActivityLogResponse])
def get_activity_logs(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id).order_by(ActivityLog.timestamp.desc()).limit(limit).all()

@router.post("/activities", response_model=ActivityLogResponse, status_code=status.HTTP_201_CREATED)
def create_activity_log(
    activity_in: ActivityLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_activity = ActivityLog(**activity_in.model_dump(), user_id=current_user.id)
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity
