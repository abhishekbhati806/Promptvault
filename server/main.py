"""PromptVault API — FastAPI entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from routers import prompts

app = FastAPI(
    title="PromptVault API",
    version="0.3.0",
    description="API for the PromptVault prompt library.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prompts.router)


@app.get("/")
def root():
    return {"app": "PromptVault API", "version": app.version, "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "ok", "database": "not configured"}
