from pydantic import BaseModel, EmailStr
from app.schemas.user import UserResponse

class OTPRequest(BaseModel):
    identifier: EmailStr

class OTPVerify(BaseModel):
    identifier: EmailStr
    otp: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    identifier: str | None = None
