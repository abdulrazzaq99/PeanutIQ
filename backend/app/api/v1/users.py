from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_in.name is not None:
        current_user.name = user_in.name
    if user_in.farm_location is not None:
        current_user.farm_location = user_in.farm_location
    if user_in.language_preference is not None:
        current_user.language_preference = user_in.language_preference

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
