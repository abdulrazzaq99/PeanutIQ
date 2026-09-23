import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base
import enum
from sqlalchemy import Integer

class CropStage(str, enum.Enum):
    sowing = "sowing"
    flowering = "flowering"
    pegging = "pegging"
    podFill = "podFill"
    harvesting = "harvesting"

class AdvisoryType(str, enum.Enum):
    tip = "tip"
    weather = "weather"
    alert = "alert"

class AdvisorySeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Advisory(Base):
    __tablename__ = "advisories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(AdvisoryType), nullable=False, default=AdvisoryType.tip)
    severity = Column(Enum(AdvisorySeverity), nullable=False, default=AdvisorySeverity.low)
    target_region = Column(String, nullable=False, default="All", server_default="All")
    created_at = Column(DateTime, default=datetime.utcnow)

class ActionItem(Base):
    __tablename__ = "action_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False) # e.g. "IRRIGATION", "DISEASE CONTROL"
    due_date = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action = Column(String, nullable=False) # e.g. "Disease Analysis"
    details = Column(String, nullable=True) # e.g. "High Risk"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class IssueStatus(str, enum.Enum):
    open = "Open"
    in_progress = "In Progress"
    resolved = "Resolved"

class IssuePriority(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"

class SystemIssue(Base):
    __tablename__ = "system_issues"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    status = Column(Enum(IssueStatus), default=IssueStatus.open)
    priority = Column(Enum(IssuePriority), default=IssuePriority.medium)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class MaintenanceWindow(Base):
    __tablename__ = "maintenance_windows"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class CropProfile(Base):
    __tablename__ = "crop_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    stage = Column(Enum(CropStage), default=CropStage.flowering)
    sowing_date = Column(DateTime, default=datetime.utcnow)
    
    health_good_pct = Column(Integer, default=65)
    health_average_pct = Column(Integer, default=25)
    health_poor_pct = Column(Integer, default=10)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
