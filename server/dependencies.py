"""Authentication dependencies for protected admin endpoints."""

from fastapi import Depends, HTTPException, status
from routers.auth import get_current_user


def get_admin_user(user: dict = Depends(get_current_user)):
    if not user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user
