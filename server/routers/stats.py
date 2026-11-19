"""Authenticated workspace dashboard statistics."""

from __future__ import annotations

from collections import Counter

from fastapi import APIRouter, Depends

from dependencies import get_current_user
from routers.favorites import _MEM_FAVORITES
from routers.prompts import get_all_prompts
from services.supabase_db import db_list_favorite_ids, supabase_enabled

router = APIRouter(prefix="/api/stats", tags=["dashboard"])


@router.get("/dashboard")
def dashboard_stats(user: dict = Depends(get_current_user)):
    prompts = get_all_prompts()

    categories = Counter(
        prompt.get("category", "general") for prompt in prompts
    )
    top_categories = [
        {"category": category, "count": count}
        for category, count in categories.most_common(5)
    ]

    my_prompts = [
        prompt for prompt in prompts if prompt.get("owner_id") == user["id"]
    ]
    total_likes = sum(prompt.get("likes", 0) for prompt in prompts)

    if supabase_enabled():
        favorites_count = len(db_list_favorite_ids(user["id"]))
    else:
        prompt_ids = {p.get("id") for p in prompts}
        favorites_count = len(
            _MEM_FAVORITES.get(user["id"], set()) & prompt_ids
        )

    return {
        "total_prompts": len(prompts),
        "my_prompts": len(my_prompts),
        "total_likes": total_likes,
        "favorites_count": favorites_count,
        "top_categories": top_categories,
    }
