"""User favorite prompts (bookmarks) routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import get_current_user
from routers.prompts import find_prompt
from services.supabase_db import (
    db_add_favorite,
    db_list_favorites,
    db_remove_favorite,
    supabase_enabled,
)

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

_MEM_FAVORITES: dict[str, set[str]] = {}


@router.get("")
def list_favorites(user: dict = Depends(get_current_user)):
    if supabase_enabled():
        return db_list_favorites(user["id"])
    ids = _MEM_FAVORITES.get(user["id"], set())
    out: list[dict] = []
    for pid in ids:
        try:
            out.append(find_prompt(pid))
        except HTTPException:
            continue
    return out


@router.post("/{prompt_id}", status_code=status.HTTP_201_CREATED)
def add_favorite(prompt_id: str, user: dict = Depends(get_current_user)):
    find_prompt(prompt_id)
    if supabase_enabled():
        db_add_favorite(user["id"], prompt_id)
    else:
        _MEM_FAVORITES.setdefault(user["id"], set()).add(prompt_id)
    return {"prompt_id": prompt_id, "favorited": True}


@router.delete("/{prompt_id}")
def remove_favorite(prompt_id: str, user: dict = Depends(get_current_user)):
    if supabase_enabled():
        db_remove_favorite(user["id"], prompt_id)
    else:
        _MEM_FAVORITES.get(user["id"], set()).discard(prompt_id)
    return {"prompt_id": prompt_id, "favorited": False}
