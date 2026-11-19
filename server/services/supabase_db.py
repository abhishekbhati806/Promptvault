"""Hardened Supabase PostgREST client built on Python's standard library.

Activated automatically when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
are configured; otherwise repositories fall back cleanly to in-memory storage
for zero-config local development and unit testing.
"""

from __future__ import annotations

import json
import logging
import re
import urllib.error
import urllib.parse
import urllib.request

from config import SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL

logger = logging.getLogger("promptvault.supabase")

_SAFE_ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
_ALLOWED_ORDERS = frozenset({"created_at.desc", "likes.desc", "title.asc"})


class SupabaseError(RuntimeError):
    """Generic upstream database error (safe to catch at API boundary)."""

    def __init__(self, status: int, code: str = ""):
        super().__init__(f"Database request failed (status={status})")
        self.status = status
        self.code = code


class SupabaseConflictError(SupabaseError):
    """Raised on unique-constraint violations (HTTP 409 / PG 23505)."""


def supabase_enabled() -> bool:
    return bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)


def _validate_id(value: str) -> str | None:
    candidate = value.strip()
    if not _SAFE_ID_RE.fullmatch(candidate):
        return None
    return candidate


def _request(
    method: str,
    path: str,
    params: dict[str, str] | None = None,
    body: dict | list | None = None,
    prefer: str | None = None,
    *,
    return_headers: bool = False,
):
    url = f"{SUPABASE_URL}/rest/v1/{path.lstrip('/')}"
    if params:
        query = urllib.parse.urlencode(params, safe=".,()*")
        url = f"{url}?{query}"

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Accept": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer

    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if return_headers:
                return dict(resp.headers.items())
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as exc:
        raw_err = exc.read().decode("utf-8", errors="replace")
        pg_code = ""
        try:
            parsed = json.loads(raw_err)
            pg_code = str(parsed.get("code") or "")
        except (json.JSONDecodeError, AttributeError):
            pg_code = ""
        if exc.code == 409 or pg_code == "23505":
            raise SupabaseConflictError(exc.code, pg_code) from exc
        logger.warning(
            "Supabase HTTP error on %s %s: status=%s code=%s",
            method,
            path,
            exc.code,
            pg_code,
        )
        raise SupabaseError(exc.code, pg_code) from exc
    except urllib.error.URLError as exc:
        logger.warning("Supabase network error on %s %s: %s", method, path, exc.reason)
        raise SupabaseError(503, "network_error") from exc


# --- Users -----------------------------------------------------------------

def db_get_user_by_email(email: str) -> dict | None:
    normalized = email.strip().lower()
    rows = _request(
        "GET",
        "users",
        params={"email": f"eq.{normalized}", "limit": "1"},
    )
    return rows[0] if rows else None


def db_get_user_by_id(user_id: str) -> dict | None:
    safe_id = _validate_id(user_id)
    if not safe_id:
        return None
    rows = _request(
        "GET",
        "users",
        params={"id": f"eq.{safe_id}", "limit": "1"},
    )
    return rows[0] if rows else None


def db_create_user(user: dict) -> dict:
    rows = _request(
        "POST",
        "users",
        body=user,
        prefer="return=representation",
    )
    return rows[0]


def db_count_users() -> int:
    headers = _request(
        "HEAD",
        "users",
        params={"select": "id"},
        prefer="count=exact",
        return_headers=True,
    )
    content_range = next(
        (v for k, v in headers.items() if k.lower() == "content-range"),
        "",
    )
    if "/" in content_range:
        total = content_range.rsplit("/", 1)[-1]
        if total.isdigit():
            return int(total)
    return 0


# --- Prompts ---------------------------------------------------------------

def db_list_prompts(order: str = "created_at.desc") -> list[dict]:
    safe_order = order if order in _ALLOWED_ORDERS else "created_at.desc"
    return _request("GET", "prompts", params={"select": "*", "order": safe_order}) or []


def db_get_prompt(prompt_id: str) -> dict | None:
    safe_id = _validate_id(prompt_id)
    if not safe_id:
        return None
    rows = _request(
        "GET",
        "prompts",
        params={"id": f"eq.{safe_id}", "limit": "1"},
    )
    return rows[0] if rows else None


def db_list_user_prompts(owner_id: str) -> list[dict]:
    safe_id = _validate_id(owner_id)
    if not safe_id:
        return []
    return (
        _request(
            "GET",
            "prompts",
            params={
                "select": "*",
                "owner_id": f"eq.{safe_id}",
                "order": "created_at.desc",
            },
        )
        or []
    )


def db_create_prompt(prompt: dict) -> dict:
    rows = _request(
        "POST",
        "prompts",
        body=prompt,
        prefer="return=representation",
    )
    return rows[0]


def db_update_prompt(prompt_id: str, updates: dict) -> dict | None:
    safe_id = _validate_id(prompt_id)
    if not safe_id:
        return None
    rows = _request(
        "PATCH",
        "prompts",
        params={"id": f"eq.{safe_id}"},
        body=updates,
        prefer="return=representation",
    )
    return rows[0] if rows else None


def db_delete_prompt(prompt_id: str) -> bool:
    safe_id = _validate_id(prompt_id)
    if not safe_id:
        return False
    rows = _request(
        "DELETE",
        "prompts",
        params={"id": f"eq.{safe_id}"},
        prefer="return=representation",
    )
    return bool(rows)


def db_like_prompt(prompt_id: str) -> dict | None:
    safe_id = _validate_id(prompt_id)
    if not safe_id:
        return None
    rows = _request(
        "POST",
        "rpc/increment_prompt_likes",
        body={"p_id": safe_id},
    )
    return rows[0] if rows else None


# --- Favorites -------------------------------------------------------------

def db_list_favorite_ids(user_id: str) -> list[str]:
    safe_id = _validate_id(user_id)
    if not safe_id:
        return []
    rows = (
        _request(
            "GET",
            "favorites",
            params={
                "select": "prompt_id",
                "user_id": f"eq.{safe_id}",
                "order": "created_at.desc",
            },
        )
        or []
    )
    return [r["prompt_id"] for r in rows]


def db_list_favorites(user_id: str) -> list[dict]:
    safe_id = _validate_id(user_id)
    if not safe_id:
        return []
    rows = (
        _request(
            "GET",
            "favorites",
            params={
                "select": "prompt_id,prompts(*)",
                "user_id": f"eq.{safe_id}",
                "order": "created_at.desc",
            },
        )
        or []
    )
    return [r["prompts"] for r in rows if r.get("prompts")]


def db_add_favorite(user_id: str, prompt_id: str) -> None:
    safe_user = _validate_id(user_id)
    safe_prompt = _validate_id(prompt_id)
    if not safe_user or not safe_prompt:
        return
    _request(
        "POST",
        "favorites",
        params={"on_conflict": "user_id,prompt_id"},
        body={"user_id": safe_user, "prompt_id": safe_prompt},
        prefer="resolution=ignore-duplicates,return=minimal",
    )


def db_remove_favorite(user_id: str, prompt_id: str) -> None:
    safe_user = _validate_id(user_id)
    safe_prompt = _validate_id(prompt_id)
    if not safe_user or not safe_prompt:
        return
    _request(
        "DELETE",
        "favorites",
        params={"user_id": f"eq.{safe_user}", "prompt_id": f"eq.{safe_prompt}"},
        prefer="return=minimal",
    )
