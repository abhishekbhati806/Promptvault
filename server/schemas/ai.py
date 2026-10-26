"""Pydantic schemas for the AI tools."""
from pydantic import BaseModel, Field


class ImproveRequest(BaseModel):
    prompt: str = Field(min_length=10, max_length=4000)
    category: str = "general"
    tone: str = Field(default="clear", max_length=30)
