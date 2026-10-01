from fastapi import APIRouter, Depends, Request, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.dashboard import ActivityLog
from app.models.scan import ScanReport
from app.schemas.scan import ScanReportResponse, ScanReportCreate
from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.media_storage import save_scan_image

router = APIRouter()

@router.get("/", response_model=List[ScanReportResponse])
def get_scan_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ScanReport).filter(ScanReport.user_id == current_user.id).order_by(ScanReport.created_at.desc()).all()

@router.post("/", response_model=ScanReportResponse, status_code=status.HTTP_201_CREATED)
async def create_scan_report(
    request: Request,
    type: str = Form(...),
    title: str = Form(...),
    scan_status: str = Form(..., alias="status"),
    confidence_score: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_url = save_scan_image(
        await file.read(), file.filename, file.content_type, str(request.base_url)
    )
    
    db_scan = ScanReport(
        user_id=current_user.id,
        type=type,
        title=title,
        status=scan_status,
        confidence_score=confidence_score,
        image_url=image_url
    )
    db.add(db_scan)
    
    # Log the activity
    # The website and app send "Disease Intelligence" / "Seed Intelligence".
    action_type = "Disease Analysis" if "disease" in type.lower() else "Seed Quality Scan"
    db_activity = ActivityLog(
        user_id=current_user.id,
        action=action_type,
        details=scan_status
    )
    db.add(db_activity)
    
    db.commit()
    db.refresh(db_scan)
    return db_scan
