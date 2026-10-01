import uuid
from datetime import date

from sqlalchemy import Column, Date, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class AIUsage(Base):
    """AI requests per user per day (UTC), for the daily limit."""

    __tablename__ = "ai_usage"
    __table_args__ = (UniqueConstraint("user_id", "day", name="uq_ai_usage_user_day"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    day = Column(Date, nullable=False, default=date.today)
    count = Column(Integer, nullable=False, default=0)
