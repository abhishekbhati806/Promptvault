"""PromptVault API — FastAPI entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from database import check_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warn (but do not crash) if MongoDB is unreachable at startup.
    mongo = check_connection()
    if mongo["ok"]:
        print("✓ MongoDB connected")
    else:
        print(f"⚠ MongoDB not reachable: {mongo.get('error')}")
    yield


app = FastAPI(
    title="PromptVault API",
    version="0.2.0",
    description="API for the PromptVault prompt library: prompts, auth, favorites and AI tools.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "app": "PromptVault API",
        "version": app.version,
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    """Health check including a live MongoDB ping."""
    return {"status": "ok", "mongo": check_connection()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
