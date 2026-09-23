from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole, LanguagePreference

class UserBase(BaseModel):
    identifier: EmailStr
    name: str | None = None
    role: UserRole = UserRole.farmer
    farm_location: str | None = None
    language_preference: LanguagePreference = LanguagePreference.english

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: str | None = None
    farm_location: str | None = None
    language_preference: LanguagePreference | None = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
