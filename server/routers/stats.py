from collections import Counter

from fastapi import APIRouter, Depends

from routers.auth import get_current_user
from routers.prompts import get_all_prompts
from services.supabase_db import db_list_favorite_ids, supabase_enabled

router = APIRouter(prefix="/api/stats", tags=["dashboard"])


@router.get("/dashboard")
def dashboard_stats(user: dict = Depends(get_current_user)):
    prompts = get_all_prompts()

    categories = Counter(
        prompt.get("category", "general")
        for prompt in prompts
    )

    top_categories = [
        {"category": category, "count": count}
        for category, count in categories.most_common(5)
    ]

    my_prompts = [
        prompt for prompt in prompts
        if prompt.get("owner_id") == user["id"]
    ]

    my_favorites = (
        len(db_list_favorite_ids(user["id"]))
        if supabase_enabled()
        else 0
    )

    recent_prompts = sorted(
        prompts,
        key=lambda prompt: str(prompt.get("created_at", "")),
        reverse=True,
    )[:5]

    return {
        "total_prompts": len(prompts),
        "my_prompts": len(my_prompts),
        "my_favorites": my_favorites,
        "total_likes": sum(
            prompt.get("likes", 0) for prompt in prompts
        ),
        "top_categories": top_categories,
        "recent_prompts": [
            {
                **prompt,
                "created_at": (
                    prompt["created_at"].isoformat()
                    if hasattr(prompt.get("created_at"), "isoformat")
                    else prompt.get("created_at")
                ),
            }
            for prompt in recent_prompts
        ],
    }
