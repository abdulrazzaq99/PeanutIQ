import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base
import enum

class UploadType(str, enum.Enum):
    SEED = "seed"
    DISEASE = "disease"
    GENERAL = "general"

class UserUpload(Base):
    __tablename__ = "user_uploads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(UploadType), default=UploadType.GENERAL, nullable=False)
    image_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
