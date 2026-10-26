"""AI endpoints — improve, generate and score prompts (tools land Day 24-26)."""
from fastapi import APIRouter

import config
from schemas.ai import GenerateRequest, ImproveRequest, ScoreRequest
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


@router.post("/improve")
def improve(payload: ImproveRequest):
    """Rewrite a prompt into a clearer, more reliable version."""
    return ai_service.improve_prompt(payload.prompt, payload.category, payload.tone)


@router.post("/generate")
def generate(payload: GenerateRequest):
    """Generate a new prompt for a topic."""
    return ai_service.generate_prompt(payload.topic, payload.category, payload.style)


@router.post("/score")
def score(payload: ScoreRequest):
    """Score a prompt out of 10 with strengths, weaknesses and tips."""
    return ai_service.score_prompt(payload.prompt)
