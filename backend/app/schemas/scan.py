from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.scan import ScanType, ScanStatus

class ScanReportBase(BaseModel):
    type: ScanType
    title: str
    status: ScanStatus
    image_url: str
    confidence_score: float

class ScanReportCreate(ScanReportBase):
    pass

class ScanReportResponse(ScanReportBase):
    analysis: Optional[dict] = None
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
