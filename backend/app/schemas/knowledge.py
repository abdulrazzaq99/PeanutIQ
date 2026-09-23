from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ArticleBase(BaseModel):
    title: str
    category: str
    excerpt: str
    content: str
    author: str

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    is_published: Optional[bool] = None

class ArticleResponse(ArticleBase):
    id: UUID
    is_published: bool
    created_at: datetime

    class Config:
        from_attributes = True
