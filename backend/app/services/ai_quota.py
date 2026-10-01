from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.ai_usage import AIUsage
from app.models.user import User


def use_quota(db: Session, user: User) -> None:
    """Counts one AI request for today (UTC), or refuses once the daily limit is reached."""
    today = datetime.now(timezone.utc).date()
    usage = db.query(AIUsage).filter(AIUsage.user_id == user.id, AIUsage.day == today).first()
    if usage is None:
        usage = AIUsage(user_id=user.id, day=today, count=0)
        db.add(usage)
    if usage.count >= settings.AI_DAILY_LIMIT:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, detail="Daily AI limit reached")
    usage.count += 1
    db.commit()
