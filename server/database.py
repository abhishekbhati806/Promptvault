"""MongoDB connection helpers (pymongo, sync driver).

FastAPI runs sync endpoint functions in a threadpool, so a synchronous
driver keeps the code simple and readable.
"""
from pymongo import MongoClient

from config import MONGO_URL, MONGO_DB

_client = None
_indexes_ready = False


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=2000)
    return _client


def get_db():
    """Return the app database, making sure indexes exist."""
    db = get_client()[MONGO_DB]
    _ensure_indexes(db)
    return db


def _ensure_indexes(db) -> None:
    global _indexes_ready
    if _indexes_ready:
        return
    db.prompts.create_index("id", unique=True)
    db.prompts.create_index("category")
    db.prompts.create_index("created_at")
    db.users.create_index("email", unique=True)
    _indexes_ready = True


def check_connection() -> dict:
    """Ping MongoDB; used by /api/health and the startup check."""
    try:
        get_client().admin.command("ping")
        return {"ok": True}
    except Exception as exc:  # pragma: no cover - depends on local Mongo
        return {"ok": False, "error": str(exc)[:160]}
