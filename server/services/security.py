import os
from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

_password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES

JWT_SECRET_KEY = JWT_SECRET
ACCESS_TOKEN_MINUTES = JWT_EXPIRE_MINUTES


def hash_password(password: str) -> str:
    return _password_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return _password_context.verify(password, password_hash)


def create_access_token(user_id: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_MINUTES
    )
    payload = {"sub": user_id, "exp": expires}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(
        token,
        JWT_SECRET_KEY,
        algorithms=[JWT_ALGORITHM],
    )
