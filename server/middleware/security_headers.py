"""HTTP security headers and cache-control policy middleware."""

from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from config import IS_PRODUCTION

_BASE_CSP = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self' 'unsafe-inline'; "
    "img-src 'self' data: https:; "
    "font-src 'self' data:; "
    "connect-src 'self'; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "form-action 'self'"
)

_PRIVATE_API_PREFIXES = (
    "/api/auth/",
    "/api/admin/",
    "/api/favorites",
    "/api/stats/",
    "/api/prompts/mine",
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Attach hardened security and caching headers to every response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        headers = response.headers

        headers.setdefault("X-Content-Type-Options", "nosniff")
        headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        headers.setdefault(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
        )
        headers.setdefault("X-Permitted-Cross-Domain-Policies", "none")

        if IS_PRODUCTION:
            headers.setdefault("Content-Security-Policy", f"{_BASE_CSP}; frame-ancestors 'none'")
            headers.setdefault("X-Frame-Options", "DENY")
            headers.setdefault(
                "Strict-Transport-Security",
                "max-age=63072000; includeSubDomains; preload",
            )
        else:
            headers.setdefault("Content-Security-Policy", _BASE_CSP)

        path = request.url.path
        if any(path.startswith(prefix) for prefix in _PRIVATE_API_PREFIXES):
            headers["Cache-Control"] = "no-store"
        elif path.startswith("/assets/"):
            headers.setdefault("Cache-Control", "public, max-age=31536000, immutable")

        return response
