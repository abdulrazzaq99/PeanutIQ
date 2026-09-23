from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.dashboard import AdvisoryType, AdvisorySeverity

class AdvisoryBase(BaseModel):
    title: str
    message: str
    type: AdvisoryType
    severity: AdvisorySeverity

class AdvisoryCreate(AdvisoryBase):
    pass

class AdvisoryResponse(AdvisoryBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ActionItemBase(BaseModel):
    title: str
    category: str
    due_date: Optional[datetime] = None

class ActionItemCreate(ActionItemBase):
    pass

class ActionItemUpdate(BaseModel):
    is_completed: bool

class ActionItemResponse(ActionItemBase):
    id: UUID
    is_completed: bool
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ActivityLogBase(BaseModel):
    action: str
    details: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLogResponse(ActivityLogBase):
    id: UUID
    user_id: UUID
    timestamp: datetime

    class Config:
        from_attributes = True

class CropProfileBase(BaseModel):
    stage: str
    health_good_pct: int
    health_average_pct: int
    health_poor_pct: int

class CropProfileResponse(CropProfileBase):
    id: UUID
    user_id: UUID
    sowing_date: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
