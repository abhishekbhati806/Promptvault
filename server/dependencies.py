"""Shared FastAPI authentication and authorization dependencies."""

from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from models.user import get_user_by_id
from services.security import TokenVerificationError, decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def _resolve_user_from_token(raw_token: str) -> dict | None:
    if not raw_token or len(raw_token) > 2048:
        return None
    try:
        payload = decode_access_token(raw_token.strip())
    except TokenVerificationError:
        return None
    user_id = payload.get("sub")
    if not isinstance(user_id, str) or not user_id:
        return None
    return get_user_by_id(user_id)


def get_current_user(
    x_auth_token: str | None = Header(default=None, alias="X-Auth-Token"),
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """Resolve the authenticated user from `X-Auth-Token` or `Authorization: Bearer`."""
    candidates: list[str] = []
    # Check X-Auth-Token first so reverse proxies that rewrite Authorization never break sessions.
    if x_auth_token:
        candidates.append(x_auth_token)
    if credentials and credentials.credentials:
        candidates.append(credentials.credentials)

    for raw in candidates:
        user = _resolve_user_from_token(raw)
        if user is not None:
            return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    """Require an authenticated user with administrator privileges."""
    if not user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user
