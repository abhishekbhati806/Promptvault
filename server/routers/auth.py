from fastapi import APIRouter, HTTPException, status

from models.user import create_user, get_user_by_email, public_user
from schemas.user import UserCreate
from services.security import hash_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate):
    email = str(payload.email).strip().lower()

    if get_user_by_email(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = create_user(
        name=payload.name,
        email=email,
        password_hash=hash_password(payload.password),
    )

    return {
        "message": "Account created",
        "user": public_user(user),
    }
