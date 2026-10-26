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


IMPROVE_SYSTEM = (
    "You are an expert prompt engineer. Rewrite the user's prompt to be clearer, "
    "more specific and more reliable. Respond with JSON only, in the form "
    '{"improved": "...", "changes": ["...", "..."]} with at most 5 changes.'
)


def _mock_improve(prompt_text: str, category: str, tone: str) -> dict:
    text = prompt_text.strip()
    changes = []
    improved = text

    if "you are" not in improved.lower() and "act as" not in improved.lower():
        improved = f"You are an expert {category} assistant.\n" + improved
        changes.append("Added an expert role so the model knows what to be.")
    if not improved.lower().startswith("write") and "format" not in improved.lower() and "return" not in improved.lower() and "list" not in improved.lower():
        improved += "\nReturn your answer in clear, structured sections with short bullet points."
        changes.append("Added an explicit output format instruction.")
    if "?" not in improved and not improved.rstrip().endswith("."):
        improved = improved.rstrip() + "."
        changes.append("Tightened the ending so the task feels complete.")
    if len(improved) < 120:
        improved += f"\nKeep the tone {tone}, use plain language, and avoid jargon unless it helps."
        changes.append(f"Added tone guidance ({tone}).")

    if not changes:
        changes.append("Prompt was already well structured — minor polish only.")

    return {
        "improved": improved,
        "changes": changes,
        "mode": "mock",
    }


def improve_prompt(prompt_text: str, category: str = "general", tone: str = "clear") -> dict:
    """Return an improved version of the prompt plus a list of what changed."""
    raw = _chat(
        IMPROVE_SYSTEM,
        f"Category: {category}\nTone: {tone}\nPrompt to improve:\n{prompt_text}",
        max_tokens=900,
        temperature=0.6,
    )
    if raw:
        data = _parse_json(raw)
        if data and data.get("improved"):
            return {
                "improved": str(data["improved"]).strip(),
                "changes": [str(c) for c in (data.get("changes") or [])][:5],
                "mode": "openai",
            }
    return _mock_improve(prompt_text, category, tone)
