"""Pydantic schemas for prompt validation."""
from pydantic import BaseModel, Field, field_validator

CATEGORIES = {
    "writing", "coding", "business", "marketing",
    "education", "creative", "productivity", "general",
}
DIFFICULTIES = {"beginner", "intermediate", "advanced"}


class PromptBase(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=500)
    prompt: str = Field(min_length=10, max_length=4000)
    category: str = "general"
    tags: list[str] = Field(default_factory=list)
    difficulty: str = "beginner"

    @field_validator("category")
    @classmethod
    def check_category(cls, value: str) -> str:
        if value not in CATEGORIES:
            raise ValueError(f"category must be one of: {', '.join(sorted(CATEGORIES))}")
        return value

    @field_validator("difficulty")
    @classmethod
    def check_difficulty(cls, value: str) -> str:
        if value not in DIFFICULTIES:
            raise ValueError(f"difficulty must be one of: {', '.join(sorted(DIFFICULTIES))}")
        return value

    @field_validator("tags")
    @classmethod
    def check_tags(cls, value: list[str]) -> list[str]:
        if len(value) > 10:
            raise ValueError("A prompt can have at most 10 tags")
        if any(len(tag) > 30 for tag in value):
            raise ValueError("Each tag must be at most 30 characters")
        return [tag.strip().lower() for tag in value if tag.strip()]


class PromptCreate(PromptBase):
    author: str = Field(default="Anonymous", min_length=1, max_length=60)


class PromptUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=120)
    description: str | None = Field(default=None, min_length=10, max_length=500)
    prompt: str | None = Field(default=None, min_length=10, max_length=4000)
    category: str | None = None
    tags: list[str] | None = None
    difficulty: str | None = None
    featured: bool | None = None

    @field_validator("category")
    @classmethod
    def check_update_category(cls, value: str | None) -> str | None:
        if value is not None and value not in CATEGORIES:
            raise ValueError(f"category must be one of: {', '.join(sorted(CATEGORIES))}")
        return value

    @field_validator("difficulty")
    @classmethod
    def check_update_difficulty(cls, value: str | None) -> str | None:
        if value is not None and value not in DIFFICULTIES:
            raise ValueError(f"difficulty must be one of: {', '.join(sorted(DIFFICULTIES))}")
        return value
