import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base
import enum

class UserRole(str, enum.Enum):
    farmer = "farmer"
    admin = "admin"
    researcher = "researcher"

class LanguagePreference(str, enum.Enum):
    english = "english"
    urdu = "urdu"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    identifier = Column(String, unique=True, index=True, nullable=False)
    # Set by password sign-up (mobile app). Null for accounts that only use email codes (website).
    password_hash = Column(String, nullable=True)
    name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.farmer, nullable=False)
    farm_location = Column(String, nullable=True)
    language_preference = Column(Enum(LanguagePreference), default=LanguagePreference.english, nullable=False)
    timezone = Column(String, default="UTC", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
