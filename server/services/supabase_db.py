"""Lightweight Supabase PostgREST client using Python's standard library.

Automatically used when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set;
otherwise the app falls back cleanly to in-memory storage for local dev.
"""

import json
import urllib.error
import urllib.parse
import urllib.request

from config import SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL


class SupabaseError(RuntimeError):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status


def supabase_enabled() -> bool:
    return bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)


def _request(
    method: str,
    path: str,
    params: dict[str, str] | None = None,
    body: dict | list | None = None,
    prefer: str | None = None,
):
    url = f"{SUPABASE_URL}/rest/v1/{path.lstrip('/')}"
    if params:
        query = urllib.parse.urlencode(params, safe=".,()*:")
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
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise SupabaseError(exc.code, detail) from exc


# --- Users -------------------------------------------------------------

def db_get_user_by_email(email: str) -> dict | None:
    rows = _request(
        "GET",
        "users",
        params={"email": f"eq.{email.strip().lower()}", "limit": "1"},
    )
    return rows[0] if rows else None


def db_get_user_by_id(user_id: str) -> dict | None:
    rows = _request(
        "GET",
        "users",
        params={"id": f"eq.{user_id}", "limit": "1"},
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
    rows = _request("GET", "users", params={"select": "id"})
    return len(rows or [])


# --- Prompts -----------------------------------------------------------

def db_list_prompts(order: str = "created_at.desc") -> list[dict]:
    return _request("GET", "prompts", params={"select": "*", "order": order}) or []


def db_get_prompt(prompt_id: str) -> dict | None:
    rows = _request(
        "GET",
        "prompts",
        params={"id": f"eq.{prompt_id}", "limit": "1"},
    )
    return rows[0] if rows else None


def db_list_user_prompts(owner_id: str) -> list[dict]:
    return (
        _request(
            "GET",
            "prompts",
            params={
                "select": "*",
                "owner_id": f"eq.{owner_id}",
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
    rows = _request(
        "PATCH",
        "prompts",
        params={"id": f"eq.{prompt_id}"},
        body=updates,
        prefer="return=representation",
    )
    return rows[0] if rows else None


def db_delete_prompt(prompt_id: str) -> bool:
    rows = _request(
        "DELETE",
        "prompts",
        params={"id": f"eq.{prompt_id}"},
        prefer="return=representation",
    )
    return bool(rows)


def db_like_prompt(prompt_id: str) -> dict | None:
    rows = _request(
        "POST",
        "rpc/increment_prompt_likes",
        body={"p_id": prompt_id},
    )
    return rows[0] if rows else None


# --- Favorites ---------------------------------------------------------

def db_list_favorite_ids(user_id: str) -> list[str]:
    rows = (
        _request(
            "GET",
            "favorites",
            params={
                "select": "prompt_id",
                "user_id": f"eq.{user_id}",
                "order": "created_at.desc",
            },
        )
        or []
    )
    return [r["prompt_id"] for r in rows]


def db_list_favorites(user_id: str) -> list[dict]:
    rows = (
        _request(
            "GET",
            "favorites",
            params={
                "select": "prompt_id,prompts(*)",
                "user_id": f"eq.{user_id}",
                "order": "created_at.desc",
            },
        )
        or []
    )
    return [r["prompts"] for r in rows if r.get("prompts")]


def db_add_favorite(user_id: str, prompt_id: str) -> None:
    _request(
        "POST",
        "favorites",
        params={"on_conflict": "user_id,prompt_id"},
        body={"user_id": user_id, "prompt_id": prompt_id},
        prefer="resolution=ignore-duplicates,return=minimal",
    )


def db_remove_favorite(user_id: str, prompt_id: str) -> None:
    _request(
        "DELETE",
        "favorites",
        params={"user_id": f"eq.{user_id}", "prompt_id": f"eq.{prompt_id}"},
        prefer="return=minimal",
    )
