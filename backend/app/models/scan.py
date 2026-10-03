import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base
import enum

class ScanType(str, enum.Enum):
    seed = "Seed Intelligence"
    disease = "Disease Intelligence"

class ScanStatus(str, enum.Enum):
    healthy = "Healthy"
    moderate = "Moderate"
    high_risk = "High Risk"

class ScanReport(Base):
    __tablename__ = "scan_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(ScanType), nullable=False)
    title = Column(String, nullable=False)
    status = Column(Enum(ScanStatus), nullable=False)
    image_url = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    # Gemini's analysis of the photo (app scans); null for scans saved without analysis.
    analysis = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
