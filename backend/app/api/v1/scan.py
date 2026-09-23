from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import shutil

from app.db.session import get_db
from app.models.scan import ScanReport
from app.schemas.scan import ScanReportResponse, ScanReportCreate
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[ScanReportResponse])
def get_scan_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ScanReport).filter(ScanReport.user_id == current_user.id).order_by(ScanReport.created_at.desc()).all()

@router.post("/", response_model=ScanReportResponse, status_code=status.HTTP_201_CREATED)
async def create_scan_report(
    type: str = Form(...),
    title: str = Form(...),
    scan_status: str = Form(..., alias="status"),
    confidence_score: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    os.makedirs("uploads", exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = f"uploads/{unique_filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    image_url = f"http://127.0.0.1:8000/uploads/{unique_filename}"
    
    db_scan = ScanReport(
        user_id=current_user.id,
        type=type,
        title=title,
        status=scan_status,
        confidence_score=confidence_score,
        image_url=image_url
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    return db_scan
