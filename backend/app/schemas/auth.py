from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.user import LanguagePreference
from app.schemas.user import UserResponse

class OTPRequest(BaseModel):
    identifier: EmailStr

class OTPVerify(BaseModel):
    identifier: EmailStr
    otp: str

class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    identifier: EmailStr
    password: str = Field(min_length=8)
    farm_location: str | None = None
    language_preference: LanguagePreference = LanguagePreference.english
    timezone: str = "UTC"

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name is required")
        return value

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, value: str) -> str:
        # bcrypt only uses the first 72 bytes; refuse longer ones rather than silently cut them.
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password is too long")
        return value

    @field_validator("timezone")
    @classmethod
    def known_timezone(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except (ZoneInfoNotFoundError, ValueError):
            raise ValueError("Unknown time zone")
        return value

class LoginRequest(BaseModel):
    identifier: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    identifier: str | None = None
