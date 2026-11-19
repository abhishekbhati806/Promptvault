"""Role-guarded administrator moderation endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status

from dependencies import get_admin_user
from models.user import count_users
from routers.prompts import find_prompt, get_all_prompts
from seed import PROMPTS
from services.supabase_db import db_delete_prompt, db_update_prompt, supabase_enabled

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def admin_stats(_user: dict = Depends(get_admin_user)):
    prompts = get_all_prompts()
    categories: dict[str, int] = {}
    for prompt in prompts:
        category = prompt.get("category", "general")
        categories[category] = categories.get(category, 0) + 1

    return {
        "total_prompts": len(prompts),
        "total_users": count_users(),
        "featured": sum(bool(p.get("featured")) for p in prompts),
        "by_category": [
            {"category": name, "count": count}
            for name, count in sorted(categories.items())
        ],
    }


@router.get("/prompts")
def admin_list_prompts(_user: dict = Depends(get_admin_user)):
    return sorted(
        get_all_prompts(),
        key=lambda p: str(p.get("created_at", "")),
        reverse=True,
    )


@router.post("/prompts/{prompt_id}/feature")
def toggle_feature(
    prompt_id: str,
    _user: dict = Depends(get_admin_user),
):
    prompt = find_prompt(prompt_id)
    new_featured = not bool(prompt.get("featured", False))
    if supabase_enabled():
        db_update_prompt(prompt_id, {"featured": new_featured})
    else:
        prompt["featured"] = new_featured
    return {"featured": new_featured}


@router.delete("/prompts/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_prompt(
    prompt_id: str,
    _user: dict = Depends(get_admin_user),
):
    prompt = find_prompt(prompt_id)
    if supabase_enabled():
        db_delete_prompt(prompt_id)
    else:
        PROMPTS.remove(prompt)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
