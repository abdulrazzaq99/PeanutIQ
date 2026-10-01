from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.session import get_db
from app.schemas.auth import OTPRequest, OTPVerify, Token, RegisterRequest, LoginRequest
from app.schemas.user import UserResponse
from app.models.user import User
from app.models.otp import OTPToken
from app.services.otp_service import generate_otp, send_otp_email
from app.core.security import get_password_hash, verify_password, create_access_token
import uuid

router = APIRouter()

@router.post("/request-otp", status_code=status.HTTP_200_OK)
def request_otp(request: OTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.identifier == request.identifier).first()
    
    # Auto-register user if they don't exist
    if not user:
        user = User(identifier=request.identifier)
        db.add(user)
        db.commit()
        db.refresh(user)

    # Invalidate previous OTPs
    db.query(OTPToken).filter(OTPToken.user_id == user.id).delete()

    otp_code = generate_otp()
    otp_hash = get_password_hash(otp_code)
    
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    otp_record = OTPToken(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=expires_at
    )
    db.add(otp_record)
    db.commit()

    # Send OTP via Resend
    success = send_otp_email(user.identifier, otp_code)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send OTP email")

    return {"message": "OTP sent successfully"}


@router.post("/verify-otp", response_model=Token)
def verify_otp(request: OTPVerify, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.identifier == request.identifier).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    otp_record = db.query(OTPToken).filter(OTPToken.user_id == user.id).first()
    
    if not otp_record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active OTP found")
        
    if datetime.utcnow() > otp_record.expires_at:
        db.delete(otp_record)
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired")

    if not verify_password(request.otp, otp_record.otp_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP")

    # OTP is valid, issue token
    access_token = create_access_token(subject=str(user.id))
    
    # Clean up used OTP
    db.delete(otp_record)
    db.commit()

    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user
    }


def _find_user(db: Session, email: str) -> User | None:
    return db.query(User).filter(func.lower(User.identifier) == email.lower()).first()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Password sign-up (mobile app). Creates a farmer account; it does not sign in."""
    email = str(request.identifier).strip().lower()
    # An existing email (including code-only website accounts) can't be claimed with a password,
    # because nothing here proves the person owns that inbox.
    if _find_user(db, email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        identifier=email,
        name=request.name,
        farm_location=request.farm_location,
        language_preference=request.language_preference,
        timezone=request.timezone,
        password_hash=get_password_hash(request.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Password sign-in (mobile app). Same response as /verify-otp."""
    user = _find_user(db, str(request.identifier).strip())
    # One message for every failure, so the endpoint doesn't reveal which emails have accounts.
    if (
        not user
        or not user.is_active
        or not user.password_hash
        or not verify_password(request.password, user.password_hash)
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    return {
        "access_token": create_access_token(subject=str(user.id)),
        "token_type": "bearer",
        "user": user,
    }
