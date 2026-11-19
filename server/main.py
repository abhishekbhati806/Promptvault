"""PromptVault API — FastAPI entry point."""

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS
from routers import admin, ai, auth, favorites, prompts, stats
from services.supabase_db import supabase_enabled

app = FastAPI(
    title="PromptVault API",
    version="0.3.0",
    description="API for the PromptVault prompt library.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials="*" not in CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register each router once.
app.include_router(prompts.router)
app.include_router(auth.router)
app.include_router(favorites.router)
app.include_router(stats.router)
app.include_router(ai.router)
app.include_router(admin.router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "database": "supabase" if supabase_enabled() else "in-memory",
    }


# Serve the built React SPA when present (Vercel, Render, Docker, local prod).
CLIENT_DIST = (Path(__file__).resolve().parent.parent / "client" / "dist").resolve()
SERVE_SPA = (CLIENT_DIST / "index.html").is_file()

if SERVE_SPA:
    assets_dir = CLIENT_DIST / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        if full_path:
            candidate = (CLIENT_DIST / full_path).resolve()
            if str(candidate).startswith(str(CLIENT_DIST)) and candidate.is_file():
                return FileResponse(str(candidate))
        return FileResponse(str(CLIENT_DIST / "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": "PromptVault API",
            "version": app.version,
            "docs": "/docs",
        }
