from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.dashboard import ActivityLog
from app.models.scan import ScanReport
from app.schemas.scan import ScanReportResponse, ScanReportCreate
from app.api.dependencies import get_current_user
from app.models.user import User
from app.services import disease_model, gemini, scan_analysis
from app.services.ai_quota import use_quota
from app.services.media_storage import save_scan_image

# Vercel rejects request bodies over 4.5 MB.
MAX_IMAGE_BYTES = 4 * 1024 * 1024

router = APIRouter()

@router.get("/", response_model=List[ScanReportResponse])
def get_scan_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ScanReport).filter(ScanReport.user_id == current_user.id).order_by(ScanReport.created_at.desc()).all()

@router.get("/disease-model")
def get_disease_model_info(current_user: User = Depends(get_current_user)):
    """The trained disease model's classes and measured accuracy."""
    info = disease_model.metrics()
    if info is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="No trained model")
    return info


@router.post("/", response_model=ScanReportResponse, status_code=status.HTTP_201_CREATED)
def create_scan_report(
    request: Request,
    type: str = Form(...),
    title: str = Form("Scan"),
    scan_status: str = Form("Moderate", alias="status"),
    confidence_score: float = Form(0),
    analyze: bool = Form(False),
    language: Literal["en", "ur"] = Form("en"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Saves a scan. With analyze=true (the app), Gemini analyses the photo first and the result
    (title, status, confidence and details) comes from that analysis instead of the form."""
    data = file.file.read(MAX_IMAGE_BYTES + 1)
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File is too large")
    is_disease = "disease" in type.lower()
    analysis = None
    if analyze:
        use_quota(db, current_user)
        try:
            analysis, title, scan_status, confidence_score = scan_analysis.analyze(
                "disease" if is_disease else "seed",
                data,
                _image_type(file),
                language,
                current_user,
            )
        except scan_analysis.NotTheRightPhoto as e:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
        except (gemini.AIUnavailable, ValueError):
            raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail="AI assistant is busy. Please try again.")

    image_url = save_scan_image(data, file.filename, file.content_type, str(request.base_url))

    db_scan = ScanReport(
        user_id=current_user.id,
        type=type,
        title=title,
        status=scan_status,
        confidence_score=confidence_score,
        image_url=image_url,
        analysis=analysis,
    )
    db.add(db_scan)

    # The website and app send "Disease Intelligence" / "Seed Intelligence".
    action_type = "Disease Analysis" if is_disease else "Seed Quality Scan"
    db_activity = ActivityLog(
        user_id=current_user.id,
        action=action_type,
        details=scan_status
    )
    db.add(db_activity)

    db.commit()
    db.refresh(db_scan)
    return db_scan


def _image_type(file: UploadFile) -> str:
    content_type = (file.content_type or "").lower()
    if content_type.startswith("image/"):
        return content_type
    name = (file.filename or "").lower()
    for ext, mime in ((".png", "image/png"), (".webp", "image/webp"), (".heic", "image/heic")):
        if name.endswith(ext):
            return mime
    return "image/jpeg"
