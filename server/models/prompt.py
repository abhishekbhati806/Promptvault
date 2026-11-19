"""Identifier and UTC timestamp helpers for prompt records."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime


def now_utc() -> datetime:
    return datetime.now(UTC)


def new_prompt_id() -> str:
    # 64 bits of entropy (16 hex chars) prevents collisions and ID guessing.
    return f"p-{uuid.uuid4().hex[:16]}"
