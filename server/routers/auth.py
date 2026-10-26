

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from models.user import (
    create_user,
    get_user_by_email,
    public_user,
    USERS_BY_EMAIL,
)
from schemas.user import UserCreate
from schemas.login import UserLogin
from services.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


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


@router.post("/login")
def login(payload: UserLogin):
    email = str(payload.email).strip().lower()
    user = get_user_by_email(email)

    if not user or not verify_password(
        payload.password, user["password_hash"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user["id"])

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": public_user(user),
    }


def get_current_user(token: str = Depends(oauth2_scheme)):
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise unauthorized
    except JWTError:
        raise unauthorized

    for user in USERS_BY_EMAIL.values():
        if user["id"] == user_id:
            return user

    raise unauthorized


@router.get("/me")
def read_current_user(user: dict = Depends(get_current_user)):
    return {"user": public_user(user)}
