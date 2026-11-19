"""Single-source-of-truth Pydantic schemas for prompt CRUD."""

from __future__ import annotations

import re

from pydantic import BaseModel, ConfigDict, Field, field_validator

CATEGORIES = frozenset(
    {
        "writing",
        "coding",
        "business",
        "marketing",
        "education",
        "creative",
        "productivity",
        "general",
    }
)
DIFFICULTIES = frozenset({"beginner", "intermediate", "advanced"})
_CONTROL_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def _clean_category(value: str) -> str:
    normalized = value.strip().lower()
    if normalized not in CATEGORIES:
        allowed = ", ".join(sorted(CATEGORIES))
        raise ValueError(f"Category must be one of: {allowed}")
    return normalized


def _clean_difficulty(value: str) -> str:
    normalized = value.strip().lower()
    if normalized not in DIFFICULTIES:
        allowed = ", ".join(sorted(DIFFICULTIES))
        raise ValueError(f"Difficulty must be one of: {allowed}")
    return normalized


def _clean_tags(raw_tags: list[str]) -> list[str]:
    cleaned: list[str] = []
    seen: set[str] = set()
    for tag in raw_tags:
        item = _CONTROL_RE.sub("", str(tag)).strip().lstrip("#").lower()
        if not item:
            continue
        if len(item) > 30:
            raise ValueError("Each tag must be at most 30 characters.")
        if item not in seen:
            seen.add(item)
            cleaned.append(item)
    if len(cleaned) > 10:
        raise ValueError("A prompt can have at most 10 tags.")
    return cleaned


class PromptCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=500)
    prompt: str = Field(min_length=10, max_length=8000)
    category: str = "general"
    tags: list[str] = Field(default_factory=list, max_length=15)
    difficulty: str = "beginner"

    @field_validator("title", "description", "prompt")
    @classmethod
    def strip_control_chars(cls, value: str) -> str:
        return _CONTROL_RE.sub("", value).strip()

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        return _clean_category(value)

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, value: str) -> str:
        return _clean_difficulty(value)

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, value: list[str]) -> list[str]:
        return _clean_tags(value)


class PromptUpdate(BaseModel):
    """Owner-editable prompt fields (excludes `featured`, `likes`, `owner_id`)."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    title: str | None = Field(default=None, min_length=3, max_length=120)
    description: str | None = Field(default=None, min_length=10, max_length=500)
    prompt: str | None = Field(default=None, min_length=10, max_length=8000)
    category: str | None = None
    tags: list[str] | None = Field(default=None, max_length=15)
    difficulty: str | None = None

    @field_validator("title", "description", "prompt")
    @classmethod
    def strip_control_chars(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _CONTROL_RE.sub("", value).strip()

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str | None) -> str | None:
        return _clean_category(value) if value is not None else None

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, value: str | None) -> str | None:
        return _clean_difficulty(value) if value is not None else None

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, value: list[str] | None) -> list[str] | None:
        return _clean_tags(value) if value is not None else None
