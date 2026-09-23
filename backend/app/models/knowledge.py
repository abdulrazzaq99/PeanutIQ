import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class Article(Base):
    __tablename__ = "articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False, index=True)
    excerpt = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String, nullable=False)
    
    # False means it is pending approval by admin
    is_published = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
