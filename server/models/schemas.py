from typing import Literal

from pydantic import BaseModel, Field


class PromptCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=300)
    prompt: str = Field(min_length=10)
    category: str = Field(min_length=2, max_length=40)
    tags: list[str] = Field(default_factory=list, max_length=10)
    author: str = Field(default="Community", max_length=80)
    difficulty: Literal["beginner", "intermediate", "advanced"] = "beginner"
