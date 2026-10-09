"""MongoDB helpers for prompt documents."""
import uuid
from datetime import datetime, timezone


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def new_prompt_id() -> str:
    return f"p-{uuid.uuid4().hex[:10]}"


def to_public(doc: dict | None) -> dict | None:
    if doc is None:
        return None
    out = dict(doc)
    out.pop("_id", None)
    for key in ("created_at", "updated_at"):
        if isinstance(out.get(key), datetime):
            out[key] = out[key].isoformat()
    return out
