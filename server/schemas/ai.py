"""Pydantic schemas for the AI tools."""
from pydantic import BaseModel, Field


class ImproveRequest(BaseModel):
    prompt: str = Field(min_length=10, max_length=4000)
    category: str = "general"
    tone: str = Field(default="clear", max_length=30)


class GenerateRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=300)
    category: str = "general"
    style: str = Field(default="step-by-step", max_length=40)


class ScoreRequest(BaseModel):
    prompt: str = Field(min_length=10, max_length=4000)
