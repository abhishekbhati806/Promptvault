"""AI endpoints — improve, generate and score prompts (tools land Day 24-26)."""
from fastapi import APIRouter

import config
from services import ai_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.get("/status")
def ai_status():
    """Reports whether a real LLM key is configured."""
    return {
        "ai_enabled": ai_service.ai_enabled(),
        "model": config.OPENAI_MODEL if ai_service.ai_enabled() else None,
        "mode": "openai" if ai_service.ai_enabled() else "mock",
    }
