"""User registration, login, and profile routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import get_current_user
from models.user import create_user, get_user_by_email, public_user
from schemas.auth import UserCreate, UserLogin
from services.security import (
    create_access_token,
    dummy_verify_password,
    hash_password,
    verify_password,
)
from services.supabase_db import SupabaseConflictError

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate):
    email = payload.email

    if get_user_by_email(email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    try:
        user = create_user(
            name=payload.name,
            email=email,
            password_hash=hash_password(payload.password),
        )
    except SupabaseConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        ) from exc

    return {
        "message": "Account created",
        "user": public_user(user),
    }


@router.post("/login")
def login(payload: UserLogin):
    user = get_user_by_email(payload.email)

    if not user:
        dummy_verify_password(payload.password)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(payload.password, user["password_hash"]):
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


@router.get("/me")
def read_current_user(user: dict = Depends(get_current_user)):
    return {"user": public_user(user)}
