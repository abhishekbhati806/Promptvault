"""LLM service with a graceful mock fallback.

If OPENAI_API_KEY is configured, prompts go through OpenAI Chat
Completions. Without a key (or on any API error) a deterministic local
heuristic keeps every AI feature usable for development and testing.
"""
import json

import config

try:
    from openai import OpenAI
except ImportError:  # openai is optional at runtime
    OpenAI = None

_client = None


def _get_client():
    global _client
    if OpenAI is not None and config.OPENAI_API_KEY:
        if _client is None:
            _client = OpenAI(api_key=config.OPENAI_API_KEY)
        return _client
    return None


def ai_enabled() -> bool:
    """True when a real LLM will be used."""
    return _get_client() is not None


def _chat(system: str, user: str, max_tokens: int = 800, temperature: float = 0.7) -> str | None:
    """Single-turn chat completion. Returns None in mock mode / on error."""
    client = _get_client()
    if client is None:
        return None
    try:
        response = client.chat.completions.create(
            model=config.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return response.choices[0].message.content
    except Exception:
        return None


def _parse_json(text: str) -> dict | None:
    """Best-effort JSON extraction from an LLM reply."""
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        pass
    if text:
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                return None
    return None
