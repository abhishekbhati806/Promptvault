from uuid import uuid4
from datetime import datetime, timezone

USERS_BY_EMAIL = {}

def get_user_by_email(email: str):
    return USERS_BY_EMAIL.get(email.strip().lower())

def create_user(name: str, email: str, password_hash: str):
    email = email.strip().lower()
    user = {
        "id": str(uuid4()),
        "name": name.strip(),
        "email": email,
        "password_hash": password_hash,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    USERS_BY_EMAIL[email] = user
    return user

def public_user(user: dict):
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "is_admin": user["is_admin"],
        "created_at": user["created_at"],
    }
