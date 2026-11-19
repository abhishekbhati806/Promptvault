"""PromptVault API — FastAPI application entrypoint."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS, ENABLE_API_DOCS
from middleware.rate_limit import RateLimitMiddleware
from middleware.security_headers import SecurityHeadersMiddleware
from routers import admin, ai, auth, favorites, prompts, stats
from services.supabase_db import SupabaseError, supabase_enabled

app = FastAPI(
    title="PromptVault API",
    version="1.0.0",
    description="API for the PromptVault AI prompt library.",
    docs_url="/docs" if ENABLE_API_DOCS else None,
    redoc_url="/redoc" if ENABLE_API_DOCS else None,
    openapi_url="/openapi.json" if ENABLE_API_DOCS else None,
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=bool(CORS_ORIGINS),
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Auth-Token"],
)


@app.exception_handler(SupabaseError)
async def handle_supabase_error(_request: Request, _exc: SupabaseError) -> JSONResponse:
    """Never expose raw upstream database details to clients."""
    return JSONResponse(
        status_code=503,
        content={"detail": "Database service temporarily unavailable. Please try again."},
    )


app.include_router(prompts.router)
app.include_router(auth.router)
app.include_router(favorites.router)
app.include_router(stats.router)
app.include_router(ai.router)
app.include_router(admin.router)


@app.get("/api/health", tags=["system"])
def health():
    return {
        "status": "ok",
        "database": "supabase" if supabase_enabled() else "in-memory",
    }


# Serve the built React SPA when present (Vercel, Docker, local production).
CLIENT_DIST = (Path(__file__).resolve().parent.parent / "client" / "dist").resolve()
SERVE_SPA = (CLIENT_DIST / "index.html").is_file()

if SERVE_SPA:
    assets_dir = CLIENT_DIST / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        if full_path == "api" or full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        if full_path and "\x00" not in full_path:
            candidate = (CLIENT_DIST / full_path).resolve()
            if candidate.is_relative_to(CLIENT_DIST) and candidate.is_file():
                return FileResponse(str(candidate))
        return FileResponse(str(CLIENT_DIST / "index.html"))
else:
    @app.get("/", include_in_schema=False)
    def root():
        return {
            "app": "PromptVault API",
            "version": app.version,
            "docs": "/docs" if ENABLE_API_DOCS else None,
        }
