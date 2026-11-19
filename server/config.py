"""Central, validated configuration for the PromptVault API.

All settings come from environment variables (with optional `.env` loading in
local development) and fail fast on unsafe production misconfiguration.
"""

from __future__ import annotations

import os
import secrets

from dotenv import load_dotenv

load_dotenv()


def _env_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int, *, minimum: int, maximum: int) -> int:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        value = int(raw.strip())
    except ValueError:
        return default
    return max(minimum, min(maximum, value))


# --- Environment -----------------------------------------------------------
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").strip().lower()
IS_PRODUCTION = ENVIRONMENT == "production"
ENABLE_API_DOCS = _env_bool("ENABLE_API_DOCS", default=not IS_PRODUCTION)

# --- Supabase (PostgreSQL via PostgREST) -----------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

if SUPABASE_URL and not SUPABASE_URL.startswith(
    "https://" if IS_PRODUCTION else ("https://", "http://")
):
    raise RuntimeError("SUPABASE_URL must use https:// in production.")

# --- Authentication / JWT --------------------------------------------------
_raw_jwt_secret = (os.getenv("JWT_SECRET") or "").strip()
if not _raw_jwt_secret:
    if IS_PRODUCTION:
        raise RuntimeError("JWT_SECRET must be set in production.")
    # Ephemeral per-process secret in local dev — never a predictable constant.
    _raw_jwt_secret = secrets.token_urlsafe(32)
elif IS_PRODUCTION and len(_raw_jwt_secret) < 32:
    raise RuntimeError("JWT_SECRET must be at least 32 characters in production.")

JWT_SECRET = _raw_jwt_secret
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = _env_int(
    "JWT_EXPIRE_MINUTES", 1440, minimum=5, maximum=10080
)

# --- CORS ------------------------------------------------------------------
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip() and origin.strip() != "*"
]

# --- Request Limits & Rate Limiting ----------------------------------------
MAX_REQUEST_BODY_BYTES = _env_int(
    "MAX_REQUEST_BODY_BYTES", 65_536, minimum=4_096, maximum=1_048_576
)
RATE_LIMIT_ENABLED = _env_bool("RATE_LIMIT_ENABLED", default=True)

# --- AI (OpenAI with built-in heuristic fallback) --------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"
