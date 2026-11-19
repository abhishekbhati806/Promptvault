"""In-memory sliding-window rate limiter and request payload size guard."""

from __future__ import annotations

import threading
import time
from collections import deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

import config

_WINDOW_SECONDS = 60.0
_MAX_TRACKED_BUCKETS = 10_000


def _classify_limit(method: str, path: str) -> tuple[str, int] | None:
    """Return `(bucket_name, max_requests_per_minute)` or `None` if unlimited."""
    if not path.startswith("/api/"):
        return None
    if path in ("/api/auth/login", "/api/auth/register") and method == "POST":
        return ("auth", 15)
    if path.startswith("/api/ai/") and method == "POST":
        return ("ai", 30)
    if path.startswith("/api/prompts/") and path.endswith("/like") and method == "POST":
        return ("like", 30)
    if method in ("POST", "PUT", "PATCH", "DELETE"):
        return ("write", 60)
    return None


def _client_ip(request: Request) -> str:
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()[:64]
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()[:64]
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


class SlidingWindowLimiter:
    """Bounded, thread-safe sliding-window counter."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._hits: dict[tuple[str, str], deque[float]] = {}

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()

    def allow(self, key: tuple[str, str], limit: int) -> tuple[bool, int]:
        now = time.monotonic()
        cutoff = now - _WINDOW_SECONDS
        with self._lock:
            if key not in self._hits and len(self._hits) >= _MAX_TRACKED_BUCKETS:
                # Drop expired entries to cap memory usage under spoofed-IP floods.
                stale = [
                    k for k, q in self._hits.items() if not q or q[-1] <= cutoff
                ]
                for k in stale:
                    self._hits.pop(k, None)
                if len(self._hits) >= _MAX_TRACKED_BUCKETS:
                    self._hits.pop(next(iter(self._hits)), None)

            bucket = self._hits.setdefault(key, deque())
            while bucket and bucket[0] <= cutoff:
                bucket.popleft()

            if len(bucket) >= limit:
                retry_after = max(1, int(_WINDOW_SECONDS - (now - bucket[0])) + 1)
                return False, retry_after

            bucket.append(now)
            return True, 0


rate_limiter = SlidingWindowLimiter()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Reject oversized request bodies and enforce per-IP rate limits."""

    async def dispatch(self, request: Request, call_next) -> Response:
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > config.MAX_REQUEST_BODY_BYTES:
                    return JSONResponse(
                        status_code=413,
                        content={"detail": "Request payload is too large."},
                    )
            except ValueError:
                return JSONResponse(
                    status_code=400,
                    content={"detail": "Invalid Content-Length header."},
                )

        if config.RATE_LIMIT_ENABLED:
            rule = _classify_limit(request.method, request.url.path)
            if rule is not None:
                bucket_name, limit = rule
                allowed, retry_after = rate_limiter.allow(
                    (_client_ip(request), bucket_name), limit
                )
                if not allowed:
                    return JSONResponse(
                        status_code=429,
                        content={
                            "detail": "Too many requests. Please wait a moment and try again."
                        },
                        headers={"Retry-After": str(retry_after)},
                    )

        return await call_next(request)
