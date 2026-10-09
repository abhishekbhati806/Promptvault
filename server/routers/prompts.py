"""Prompt retrieval endpoints using in-memory sample data."""

from copy import deepcopy

from fastapi import APIRouter, HTTPException, Query
from seed import PROMPTS

router = APIRouter(prefix="/api/prompts", tags=["prompts"])


@router.get("")
def list_prompts(
    search: str = "",
    category: str = "all",
    sort: str = "newest",
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """List prompts with optional search, category filter and sorting."""
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


@router.get("/{prompt_id}")
def get_prompt(prompt_id: str):
    """Fetch a single prompt by its public id."""
    for prompt in PROMPTS:
        if prompt.get("id") == prompt_id:
            return deepcopy(prompt)

    raise HTTPException(status_code=404, detail="Prompt not found")
