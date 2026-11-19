"""User repository backed by Supabase PostgreSQL (with in-memory dev fallback)."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from services.supabase_db import (
    db_count_users,
    db_create_user,
    db_get_user_by_email,
    db_get_user_by_id,
    supabase_enabled,
)

USERS_BY_EMAIL: dict[str, dict] = {}


def get_user_by_email(email: str) -> dict | None:
    normalized = email.strip().lower()
    if supabase_enabled():
        return db_get_user_by_email(normalized)
    return USERS_BY_EMAIL.get(normalized)


def get_user_by_id(user_id: str) -> dict | None:
    if supabase_enabled():
        return db_get_user_by_id(user_id)
    for user in USERS_BY_EMAIL.values():
        if user["id"] == user_id:
            return user
    return None


def create_user(name: str, email: str, password_hash: str) -> dict:
    normalized = email.strip().lower()
    user = {
        "id": str(uuid4()),
        "name": name.strip(),
        "email": normalized,
        "password_hash": password_hash,
        "is_admin": False,
        "created_at": datetime.now(UTC).isoformat(),
    }
    if supabase_enabled():
        return db_create_user(user)
    USERS_BY_EMAIL[normalized] = user
    return user


def count_users() -> int:
    if supabase_enabled():
        return db_count_users()
    return len(USERS_BY_EMAIL)


def public_user(user: dict) -> dict:
    """Project a user record to safe public fields (never includes password_hash)."""
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "is_admin": bool(user.get("is_admin", False)),
        "created_at": user["created_at"],
    }
