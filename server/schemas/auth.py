"""Pydantic schemas for user registration and authentication."""

from __future__ import annotations

import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

_CONTROL_CHARS_RE = re.compile(r"[\x00-\x1f\x7f]")


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=2, max_length=60)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = _CONTROL_CHARS_RE.sub("", value).strip()
        if len(cleaned) < 2:
            raise ValueError("Name must be at least 2 characters.")
        if len(cleaned) > 60:
            raise ValueError("Name must be at most 60 characters.")
        return cleaned

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        normalized = str(value).strip().lower()
        if len(normalized) > 254:
            raise ValueError("Email address is too long.")
        return normalized

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes.")
        if value.strip() == "":
            raise ValueError("Password cannot be only whitespace.")
        return value


class UserLogin(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()
