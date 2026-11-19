"""End-to-end API, security, RBAC, and validation tests for PromptVault."""

from __future__ import annotations

import os
from copy import deepcopy
from datetime import UTC, datetime, timedelta

# Force deterministic in-memory test mode before importing app modules.
os.environ["ENVIRONMENT"] = "development"
os.environ["SUPABASE_URL"] = ""
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = ""
os.environ["OPENAI_API_KEY"] = ""
os.environ["JWT_SECRET"] = "test-only-jwt-secret-key-with-at-least-32-chars"

import jwt
import pytest
from fastapi.testclient import TestClient

from config import JWT_SECRET
from main import app
from middleware.rate_limit import rate_limiter
from models.user import USERS_BY_EMAIL
from routers.favorites import _MEM_FAVORITES
from seed import PROMPTS
from services.supabase_db import _validate_id

_INITIAL_PROMPTS = deepcopy(PROMPTS)


@pytest.fixture(autouse=True)
def reset_state():
    """Isolate every test with fresh seed data, users, favorites, and rate buckets."""
    PROMPTS[:] = deepcopy(_INITIAL_PROMPTS)
    USERS_BY_EMAIL.clear()
    _MEM_FAVORITES.clear()
    rate_limiter.reset()
    yield


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def _register_and_login(
    client: TestClient,
    *,
    name: str = "Alice Tester",
    email: str = "alice@example.com",
    password: str = "StrongPass123!",
) -> tuple[str, dict]:
    reg = client.post(
        "/api/auth/register",
        json={"name": name, "email": email, "password": password},
    )
    assert reg.status_code == 201, reg.text
    log = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert log.status_code == 200, log.text
    body = log.json()
    return body["access_token"], body["user"]


# --- System & HTTP Security Headers ----------------------------------------

def test_health_and_security_headers(client: TestClient):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "database": "in-memory"}
    assert res.headers["x-content-type-options"] == "nosniff"
    assert res.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert "camera=()" in res.headers["permissions-policy"]
    assert "default-src 'self'" in res.headers["content-security-policy"]


def test_disabled_docs_not_served_by_spa(client: TestClient, monkeypatch):
    import main

    if not main.SERVE_SPA:
        pytest.skip("SPA build is not present")
    # Development registers docs routes, so exercise the fallback directly.
    monkeypatch.setattr(main, "ENABLE_API_DOCS", False)
    from fastapi import HTTPException

    for path in ("docs", "redoc", "openapi.json"):
        with pytest.raises(HTTPException) as exc:
            main.serve_spa(path)
        assert exc.value.status_code == 404


def test_private_routes_send_no_store_cache_control(client: TestClient):
    token, _ = _register_and_login(client)
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.headers["cache-control"] == "no-store"


# --- Authentication & JWT Hardening ----------------------------------------

def test_register_login_case_insensitive_and_no_password_leak(client: TestClient):
    reg = client.post(
        "/api/auth/register",
        json={
            "name": "  Abhishek Bhati  ",
            "email": "User@Example.COM",
            "password": "SecurePassword99!",
        },
    )
    assert reg.status_code == 201
    user = reg.json()["user"]
    assert user["name"] == "Abhishek Bhati"
    assert user["email"] == "user@example.com"
    assert user["is_admin"] is False
    assert "password_hash" not in user

    # Duplicate email rejected regardless of casing
    dup = client.post(
        "/api/auth/register",
        json={"name": "Clone", "email": "user@example.com", "password": "SecurePassword99!"},
    )
    assert dup.status_code == 409

    # Login yields minimal PII-free JWT claims
    log = client.post(
        "/api/auth/login",
        json={"email": "USER@example.com", "password": "SecurePassword99!"},
    )
    assert log.status_code == 200
    token = log.json()["access_token"]
    claims = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    assert set(claims.keys()) == {"sub", "iat", "exp"}
    assert "email" not in claims


def test_weak_password_and_mass_assignment_on_register_rejected(client: TestClient):
    short_pw = client.post(
        "/api/auth/register",
        json={"name": "Bob", "email": "bob@example.com", "password": "short"},
    )
    assert short_pw.status_code == 422

    ws_pw = client.post(
        "/api/auth/register",
        json={"name": "Bob", "email": "bob@example.com", "password": "        "},
    )
    assert ws_pw.status_code == 422

    # Attempted privilege escalation via extra `is_admin` field must fail
    escalate = client.post(
        "/api/auth/register",
        json={
            "name": "Mallory",
            "email": "mallory@example.com",
            "password": "StrongPassword1!",
            "is_admin": True,
        },
    )
    assert escalate.status_code == 422


def test_login_rejects_unknown_email_and_bad_password_identically(client: TestClient):
    _register_and_login(client, email="known@example.com", password="CorrectPassword1!")

    unknown = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "CorrectPassword1!"},
    )
    wrong = client.post(
        "/api/auth/login",
        json={"email": "known@example.com", "password": "WrongPassword1!"},
    )
    assert unknown.status_code == wrong.status_code == 401
    assert unknown.json() == wrong.json() == {"detail": "Invalid email or password"}


def test_x_auth_token_fallback_and_tampered_tokens(client: TestClient):
    token, user = _register_and_login(client)

    # Works even when an upstream proxy rewrites Authorization
    res = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer proxy-injected", "X-Auth-Token": token},
    )
    assert res.status_code == 200
    assert res.json()["user"]["id"] == user["id"]

    # Expired token rejected
    expired = jwt.encode(
        {
            "sub": user["id"],
            "iat": datetime.now(UTC) - timedelta(hours=2),
            "exp": datetime.now(UTC) - timedelta(hours=1),
        },
        JWT_SECRET,
        algorithm="HS256",
    )
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired}"}).status_code == 401

    # Wrong signature rejected
    forged = jwt.encode(
        {
            "sub": user["id"],
            "iat": datetime.now(UTC),
            "exp": datetime.now(UTC) + timedelta(hours=1),
        },
        "attacker-different-secret-key-with-32-chars",
        algorithm="HS256",
    )
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {forged}"}).status_code == 401

    # Missing required `iat` claim rejected
    missing_iat = jwt.encode(
        {"sub": user["id"], "exp": datetime.now(UTC) + timedelta(hours=1)},
        JWT_SECRET,
        algorithm="HS256",
    )
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {missing_iat}"}).status_code == 401


# --- Prompts CRUD, Validation & Anti-IDOR ----------------------------------

def test_list_search_filter_sort_and_like_prompts(client: TestClient):
    all_prompts = client.get("/api/prompts").json()
    assert len(all_prompts) == 12

    coding = client.get("/api/prompts", params={"category": "coding"}).json()
    assert coding and all(p["category"] == "coding" for p in coding)

    by_likes = client.get("/api/prompts", params={"sort": "likes"}).json()
    likes = [p["likes"] for p in by_likes]
    assert likes == sorted(likes, reverse=True)

    invalid_sort = client.get("/api/prompts", params={"sort": "drop_table"})
    assert invalid_sort.status_code == 422

    first_id = all_prompts[0]["id"]
    before = all_prompts[0]["likes"]
    liked = client.post(f"/api/prompts/{first_id}/like")
    assert liked.status_code == 200
    assert liked.json() == {"id": first_id, "likes": before + 1}


def test_prompt_lifecycle_idor_and_mass_assignment_protection(client: TestClient):
    alice_token, alice = _register_and_login(client, name="Alice", email="alice@example.com")
    bob_token, _ = _register_and_login(client, name="Bob", email="bob@example.com")

    alice_h = {"Authorization": f"Bearer {alice_token}"}
    bob_h = {"Authorization": f"Bearer {bob_token}"}

    # Unauthenticated creation blocked
    unauth = client.post(
        "/api/prompts",
        json={
            "title": "Test Prompt",
            "description": "Valid description here",
            "prompt": "You are a helpful coding assistant.",
            "category": "coding",
        },
    )
    assert unauth.status_code == 401

    # Alice creates a prompt (tags normalized & deduplicated)
    created = client.post(
        "/api/prompts",
        headers=alice_h,
        json={
            "title": "Security Review Checklist",
            "description": "Thorough application security audit checklist.",
            "prompt": "You are a senior AppSec engineer. Review the supplied code for OWASP Top 10 flaws.",
            "category": "Coding",
            "difficulty": "Advanced",
            "tags": ["#OWASP", "security", "owasp", "  audit  "],
        },
    )
    assert created.status_code == 201, created.text
    prompt = created.json()
    pid = prompt["id"]
    assert prompt["owner_id"] == alice["id"]
    assert prompt["author"] == "Alice"
    assert prompt["category"] == "coding"
    assert prompt["difficulty"] == "advanced"
    assert prompt["tags"] == ["owasp", "security", "audit"]
    assert prompt["featured"] is False

    # Bob cannot update or delete Alice's prompt (IDOR prevention)
    assert client.put(f"/api/prompts/{pid}", headers=bob_h, json={"title": "Hacked"}).status_code == 403
    assert client.delete(f"/api/prompts/{pid}", headers=bob_h).status_code == 403

    # Seed prompts with no owner cannot be hijacked either
    assert client.delete("/api/prompts/p-01", headers=alice_h).status_code == 403

    # Alice cannot mass-assign `featured` or `likes` on update
    mass_assign = client.put(
        f"/api/prompts/{pid}",
        headers=alice_h,
        json={"featured": True},
    )
    assert mass_assign.status_code == 422

    # Invalid category rejected
    bad_cat = client.put(
        f"/api/prompts/{pid}",
        headers=alice_h,
        json={"category": "not-a-category"},
    )
    assert bad_cat.status_code == 422

    # Legitimate owner update & delete succeed
    updated = client.put(
        f"/api/prompts/{pid}",
        headers=alice_h,
        json={"title": "OWASP Top 10 Review Prompt"},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "OWASP Top 10 Review Prompt"

    mine = client.get("/api/prompts/mine", headers=alice_h).json()
    assert [p["id"] for p in mine] == [pid]

    deleted = client.delete(f"/api/prompts/{pid}", headers=alice_h)
    assert deleted.status_code == 200
    assert client.get(f"/api/prompts/{pid}").status_code == 404


# --- Favorites, Dashboard & Admin RBAC -------------------------------------

def test_favorites_and_dashboard_stats(client: TestClient):
    token, _ = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    assert client.post("/api/favorites/p-01", headers=headers).status_code == 201
    assert client.post("/api/favorites/nonexistent", headers=headers).status_code == 404

    favs = client.get("/api/favorites", headers=headers).json()
    assert [f["id"] for f in favs] == ["p-01"]

    stats = client.get("/api/stats/dashboard", headers=headers).json()
    assert stats["total_prompts"] == 12
    assert stats["my_prompts"] == 0
    assert stats["favorites_count"] == 1
    assert len(stats["top_categories"]) <= 5

    assert client.delete("/api/favorites/p-01", headers=headers).status_code == 200
    assert client.get("/api/favorites", headers=headers).json() == []


def test_admin_rbac_enforcement(client: TestClient):
    token, user = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Standard user is blocked from all admin endpoints
    assert client.get("/api/admin/stats", headers=headers).status_code == 403
    assert client.get("/api/admin/prompts", headers=headers).status_code == 403
    assert client.post("/api/admin/prompts/p-01/feature", headers=headers).status_code == 403
    assert client.delete("/api/admin/prompts/p-01", headers=headers).status_code == 403

    # Promote via server-side store and verify moderation controls
    USERS_BY_EMAIL[user["email"]]["is_admin"] = True
    stats = client.get("/api/admin/stats", headers=headers)
    assert stats.status_code == 200
    assert stats.json()["total_users"] == 1

    toggled = client.post("/api/admin/prompts/p-01/feature", headers=headers)
    assert toggled.status_code == 200
    assert isinstance(toggled.json()["featured"], bool)

    removed = client.delete("/api/admin/prompts/p-01", headers=headers)
    assert removed.status_code == 204
    assert client.get("/api/prompts/p-01").status_code == 404


# --- AI Studio -------------------------------------------------------------

def test_ai_studio_endpoints(client: TestClient):
    status_res = client.get("/api/ai/status")
    assert status_res.status_code == 200
    assert status_res.json()["mode"] == "mock"

    improved = client.post(
        "/api/ai/improve",
        json={"prompt": "Write a clean Python function to parse CSV logs", "category": "coding"},
    )
    assert improved.status_code == 200
    assert "improved" in improved.json() and improved.json()["changes"]

    generated = client.post(
        "/api/ai/generate",
        json={"topic": "PostgreSQL query optimization", "category": "coding", "style": "checklist"},
    )
    assert generated.status_code == 200
    gen_body = generated.json()
    assert gen_body["title"] and gen_body["prompt"] and gen_body["tags"]

    scored = client.post(
        "/api/ai/score",
        json={
            "prompt": (
                "You are a senior database architect. Return a bullet list of 5 indexing "
                "recommendations for example OLTP queries. Limit each item to under 40 words."
            )
        },
    )
    assert scored.status_code == 200
    assert scored.json()["score"] >= 8.0
    assert scored.json()["grade"] == "A"


# --- Rate Limiting, Body Size, Query Injection & Path Traversal ------------

def test_auth_rate_limiter_triggers_429_with_retry_after(client: TestClient):
    for _ in range(15):
        res = client.post(
            "/api/auth/login",
            json={"email": "nobody@example.com", "password": "wrongpassword"},
            headers={"X-Real-IP": "198.51.100.42"},
        )
        assert res.status_code == 401

    blocked = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "wrongpassword"},
        headers={"X-Real-IP": "198.51.100.42"},
    )
    assert blocked.status_code == 429
    assert int(blocked.headers["retry-after"]) >= 1


def test_oversized_payload_rejected_with_413(client: TestClient):
    huge = "x" * 70_000
    res = client.post("/api/ai/score", json={"prompt": huge})
    assert res.status_code == 413


def test_postgrest_id_validator_and_path_traversal_defense(client: TestClient):
    assert _validate_id("p-01") == "p-01"
    assert _validate_id("550e8400-e29b-41d4-a716-446655440000") is not None
    assert _validate_id("p-01,id.neq.p-01") is None
    assert _validate_id("../etc/passwd") is None
    assert _validate_id("p-01;DROP TABLE users") is None

    # Encoded traversal attempts must never leak filesystem contents
    traversal = client.get("/%2e%2e/%2e%2e/etc/passwd")
    assert "root:x:" not in traversal.text
    assert client.get("/api/does-not-exist").status_code == 404
