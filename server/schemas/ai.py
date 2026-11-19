"""Validated Pydantic schemas for the AI Studio endpoints."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, field_validator

from schemas.prompt import CATEGORIES


class ImproveRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    prompt: str = Field(min_length=10, max_length=4000)
    category: str = Field(default="general", max_length=30)
    tone: str = Field(default="clear", min_length=2, max_length=30)

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        normalized = value.strip().lower()
        return normalized if normalized in CATEGORIES else "general"


class GenerateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    topic: str = Field(min_length=3, max_length=300)
    category: str = Field(default="general", max_length=30)
    style: str = Field(default="step-by-step", min_length=2, max_length=40)

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        normalized = value.strip().lower()
        return normalized if normalized in CATEGORIES else "general"


class ScoreRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    prompt: str = Field(min_length=10, max_length=4000)
