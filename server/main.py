"""PromptVault API — FastAPI entry point."""
from fastapi import FastAPI

app = FastAPI(
    title="PromptVault API",
    version="0.1.0",
    description="API for the PromptVault prompt library: prompts, auth, favorites and AI tools.",
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
    """Lightweight health check."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
