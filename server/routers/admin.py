"""Admin endpoints for prompt moderation."""

from fastapi import APIRouter, Depends, HTTPException, Response, status

from dependencies import get_admin_user
from models.user import USERS_BY_EMAIL
from routers.prompts import find_prompt
from seed import PROMPTS

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def admin_stats(_user: dict = Depends(get_admin_user)):
    categories = {}
    for prompt in PROMPTS:
        category = prompt.get("category", "general")
        categories[category] = categories.get(category, 0) + 1

    return {
        "total_prompts": len(PROMPTS),
        "total_users": len(USERS_BY_EMAIL),
        "featured": sum(bool(p.get("featured")) for p in PROMPTS),
        "by_category": [
            {"category": name, "count": count}
            for name, count in categories.items()
        ],
    }


@router.get("/prompts")
def admin_list_prompts(_user: dict = Depends(get_admin_user)):
    return sorted(
        PROMPTS,
        key=lambda p: str(p.get("created_at", "")),
        reverse=True,
    )


@router.post("/prompts/{prompt_id}/feature")
def toggle_feature(
    prompt_id: str,
    _user: dict = Depends(get_admin_user),
):
    prompt = find_prompt(prompt_id)
    prompt["featured"] = not prompt.get("featured", False)
    return {"featured": prompt["featured"]}


@router.delete("/prompts/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_prompt(
    prompt_id: str,
    _user: dict = Depends(get_admin_user),
):
    prompt = find_prompt(prompt_id)
    PROMPTS.remove(prompt)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
