"""Prompt CRUD and likes API with owner-based access control."""

from copy import deepcopy

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from models.prompt import new_prompt_id, now_utc
from models.schemas import PromptCreate
from routers.auth import get_current_user
from seed import PROMPTS
from services.supabase_db import (
    db_create_prompt,
    db_delete_prompt,
    db_get_prompt,
    db_like_prompt,
    db_list_prompts,
    db_list_user_prompts,
    db_update_prompt,
    supabase_enabled,
)

router = APIRouter(prefix="/api/prompts", tags=["prompts"])


class PromptUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=100)
    description: str | None = Field(default=None, min_length=1, max_length=500)
    prompt: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, min_length=1)
    tags: list[str] | None = None
    difficulty: str | None = None


def find_prompt(prompt_id: str):
    if supabase_enabled():
        prompt = db_get_prompt(prompt_id)
        if prompt:
            return prompt
        raise HTTPException(status_code=404, detail="Prompt not found")

    for prompt in PROMPTS:
        if prompt.get("id") == prompt_id:
            return prompt
    raise HTTPException(status_code=404, detail="Prompt not found")


def get_all_prompts() -> list[dict]:
    if supabase_enabled():
        return db_list_prompts()
    return deepcopy(PROMPTS)


def require_prompt_owner(prompt: dict, user: dict):
    if prompt.get("owner_id") != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify your own prompts",
        )


@router.get("")
def list_prompts(
    search: str = "",
    category: str = "all",
    sort: str = "newest",
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    results = get_all_prompts()

    if category and category.lower() != "all":
        results = [
            p for p in results
            if p.get("category", "").lower() == category.lower()
        ]

    if search.strip():
        term = search.strip().lower()
        results = [
            p for p in results
            if term in " ".join([
                p.get("title", ""),
                p.get("description", ""),
                p.get("prompt", ""),
                " ".join(p.get("tags", [])),
            ]).lower()
        ]

    if sort == "likes":
        results.sort(key=lambda p: p.get("likes", 0), reverse=True)
    elif sort == "title":
        results.sort(key=lambda p: p.get("title", "").lower())
    else:
        results.sort(
            key=lambda p: str(p.get("created_at") or ""),
            reverse=True,
        )

    return results[skip:skip + limit]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_prompt(
    payload: PromptCreate,
    user: dict = Depends(get_current_user),
):
    created = now_utc()
    new_prompt = payload.model_dump()
    new_prompt.update({
        "id": new_prompt_id(),
        "author": user["name"],
        "owner_id": user["id"],
        "likes": 0,
        "featured": False,
        "created_at": created.isoformat() if supabase_enabled() else created,
    })

    if supabase_enabled():
        return db_create_prompt(new_prompt)

    PROMPTS.append(new_prompt)
    return deepcopy(new_prompt)


# Keep this route before /{prompt_id} so "mine" isn't treated as an ID.
@router.get("/mine")
def get_my_prompts(user: dict = Depends(get_current_user)):
    """Return only prompts owned by the authenticated user."""
    if supabase_enabled():
        return db_list_user_prompts(user["id"])

    results = [
        deepcopy(prompt)
        for prompt in PROMPTS
        if prompt.get("owner_id") == user["id"]
    ]
    results.sort(
        key=lambda prompt: str(prompt.get("created_at") or ""),
        reverse=True,
    )
    return results


@router.get("/{prompt_id}")
def get_prompt(prompt_id: str):
    return deepcopy(find_prompt(prompt_id))


@router.put("/{prompt_id}")
def update_prompt(
    prompt_id: str,
    payload: PromptUpdate,
    user: dict = Depends(get_current_user),
):
    existing = find_prompt(prompt_id)
    require_prompt_owner(existing, user)

    updates = {
        k: v
        for k, v in payload.model_dump(exclude_unset=True).items()
        if v is not None
    }

    if supabase_enabled():
        if not updates:
            return existing
        updated = db_update_prompt(prompt_id, updates)
        if not updated:
            raise HTTPException(status_code=404, detail="Prompt not found")
        return updated

    for key, value in updates.items():
        existing[key] = value

    return deepcopy(existing)


@router.delete("/{prompt_id}")
def delete_prompt(
    prompt_id: str,
    user: dict = Depends(get_current_user),
):
    existing = find_prompt(prompt_id)
    require_prompt_owner(existing, user)

    if supabase_enabled():
        db_delete_prompt(prompt_id)
    else:
        PROMPTS.remove(existing)

    return {
        "message": "Prompt deleted successfully",
        "id": prompt_id,
    }


@router.post("/{prompt_id}/like")
def like_prompt(prompt_id: str):
    if supabase_enabled():
        result = db_like_prompt(prompt_id)
        if not result:
            raise HTTPException(status_code=404, detail="Prompt not found")
        return result

    existing = find_prompt(prompt_id)
    existing["likes"] = existing.get("likes", 0) + 1
    return {
        "id": prompt_id,
        "likes": existing["likes"],
    }
