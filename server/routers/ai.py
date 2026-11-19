"""AI Studio routes — improve, generate, and score prompts."""

from __future__ import annotations

from fastapi import APIRouter

import config
from schemas.ai import GenerateRequest, ImproveRequest, ScoreRequest
from services import ai_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.get("/status")
def ai_status():
    """Report whether live OpenAI mode or the built-in heuristic engine is active."""
    enabled = ai_service.ai_enabled()
    return {
        "ai_enabled": enabled,
        "model": config.OPENAI_MODEL if enabled else None,
        "mode": "openai" if enabled else "mock",
    }


@router.post("/improve")
def improve(payload: ImproveRequest):
    """Rewrite a prompt into a clearer, more structured version."""
    return ai_service.improve_prompt(payload.prompt, payload.category, payload.tone)


@router.post("/generate")
def generate(payload: GenerateRequest):
    """Generate a ready-to-use prompt from a topic and style."""
    return ai_service.generate_prompt(payload.topic, payload.category, payload.style)


@router.post("/score")
def score(payload: ScoreRequest):
    """Evaluate a prompt out of 10 with strengths, weaknesses, and tips."""
    return ai_service.score_prompt(payload.prompt)
