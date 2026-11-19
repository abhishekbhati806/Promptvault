from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from models.user import (
    create_user,
    get_user_by_email,
    get_user_by_id,
    public_user,
)
from schemas.login import UserLogin
from schemas.user import UserCreate
from services.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
bearer_scheme = HTTPBearer(auto_error=False)


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

    token = create_access_token(
        user["id"],
        extra={
            "name": user["name"],
            "email": user["email"],
            "is_admin": bool(user.get("is_admin", False)),
            "created_at": user.get("created_at", ""),
        },
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": public_user(user),
    }


def _resolve_user_from_token(raw_token: str) -> dict | None:
    if not raw_token:
        return None
    try:
        payload = decode_access_token(raw_token.strip())
        user_id = payload.get("sub")
        if not user_id:
            return None
    except JWTError:
        return None
    return get_user_by_id(user_id)


def get_current_user(
    x_auth_token: str | None = Header(default=None, alias="X-Auth-Token"),
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Check X-Auth-Token first so reverse proxies that overwrite Authorization never break auth.
    candidates = []
    if x_auth_token:
        candidates.append(x_auth_token)
    if credentials and credentials.credentials:
        candidates.append(credentials.credentials)

    for raw in candidates:
        user = _resolve_user_from_token(raw)
        if user:
            return user

    raise unauthorized


@router.get("/me")
def read_current_user(user: dict = Depends(get_current_user)):
    return {"user": public_user(user)}
