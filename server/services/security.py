"""Password hashing (bcrypt) and JWT signing/verification (PyJWT)."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from jwt import InvalidTokenError

from config import JWT_ALGORITHM, JWT_EXPIRE_MINUTES, JWT_SECRET

BCRYPT_ROUNDS = 12
MAX_PASSWORD_BYTES = 72

# Precomputed hash used to equalize login timing when an email is unknown.
_DUMMY_HASH: bytes = bcrypt.hashpw(
    b"promptvault-timing-guard", bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
)


class TokenVerificationError(ValueError):
    """Raised when an access token is malformed, expired, or invalid."""


def hash_password(password: str) -> str:
    raw = password.encode("utf-8")
    if len(raw) > MAX_PASSWORD_BYTES:
        raise ValueError("Password must be at most 72 bytes.")
    return bcrypt.hashpw(raw, bcrypt.gensalt(rounds=BCRYPT_ROUNDS)).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    raw = password.encode("utf-8")
    if len(raw) > MAX_PASSWORD_BYTES:
        return False
    try:
        return bcrypt.checkpw(raw, password_hash.encode("utf-8"))
    except ValueError:
        return False


def dummy_verify_password(password: str) -> None:
    """Perform a constant-cost bcrypt check to prevent user enumeration timing leaks."""
    raw = password.encode("utf-8")[:MAX_PASSWORD_BYTES]
    bcrypt.checkpw(raw, _DUMMY_HASH)


def create_access_token(user_id: str) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(minutes=JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["sub", "exp", "iat"]},
        )
    except InvalidTokenError as exc:
        raise TokenVerificationError("Invalid or expired token") from exc
