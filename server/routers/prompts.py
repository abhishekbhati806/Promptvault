"""Prompt CRUD and likes API with owner-based access control."""

from copy import deepcopy

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from models.prompt import new_prompt_id, now_utc
from models.schemas import PromptCreate
from routers.auth import get_current_user
from seed import PROMPTS

router = APIRouter(prefix="/api/prompts", tags=["prompts"])


class PromptUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=100)
    description: str | None = Field(default=None, min_length=1, max_length=500)
    prompt: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, min_length=1)
    tags: list[str] | None = None
    difficulty: str | None = None


def find_prompt(prompt_id: str):
    for prompt in PROMPTS:
        if prompt.get("id") == prompt_id:
            return prompt
    raise HTTPException(status_code=404, detail="Prompt not found")


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
    results = deepcopy(PROMPTS)

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
        results.sort(key=lambda p: p.get("created_at"), reverse=True)

    return results[skip:skip + limit]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_prompt(
    payload: PromptCreate,
    user: dict = Depends(get_current_user),
):
    new_prompt = payload.dict()
    new_prompt.update({
        "id": new_prompt_id(),
        "author": user["name"],
        "owner_id": user["id"],
        "likes": 0,
        "featured": False,
        "created_at": now_utc(),
    })

    PROMPTS.append(new_prompt)
    return deepcopy(new_prompt)


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

    updates = payload.dict(exclude_unset=True)

    for key, value in updates.items():
        if value is not None:
            existing[key] = value

    return deepcopy(existing)


@router.delete("/{prompt_id}")
def delete_prompt(
    prompt_id: str,
    user: dict = Depends(get_current_user),
):
    existing = find_prompt(prompt_id)
    require_prompt_owner(existing, user)

    PROMPTS.remove(existing)

    return {
        "message": "Prompt deleted successfully",
        "id": prompt_id,
    }


@router.post("/{prompt_id}/like")
def like_prompt(prompt_id: str):
    existing = find_prompt(prompt_id)
    existing["likes"] = existing.get("likes", 0) + 1

    return {
        "id": prompt_id,
        "likes": existing["likes"],
    }
