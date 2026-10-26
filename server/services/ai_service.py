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
        improved = "You are an expert " + category + " assistant.\n" + improved
        changes.append("Added an expert role so the model knows what to be.")
    if not any(w in improved.lower() for w in ("format", "return", "list", "sections", "bullet")):
        improved += "\nReturn your answer in clear, structured sections with short bullet points."
        changes.append("Added an explicit output format instruction.")
    if "?" not in improved and not improved.rstrip().endswith("."):
        improved = improved.rstrip() + "."
        changes.append("Tightened the ending so the task feels complete.")
    if len(improved) < 120:
        improved += "\nKeep the tone " + tone + ", use plain language, and avoid jargon unless it helps."
        changes.append("Added tone guidance (" + tone + ").")

    if not changes:
        changes.append("Prompt was already well structured - minor polish only.")

    return {
        "improved": improved,
        "changes": changes,
        "mode": "mock",
    }


def improve_prompt(prompt_text: str, category: str = "general", tone: str = "clear") -> dict:
    """Return an improved version of the prompt plus a list of what changed."""
    raw = _chat(
        IMPROVE_SYSTEM,
        "Category: " + category + "\nTone: " + tone + "\nPrompt to improve:\n" + prompt_text,
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


GENERATE_SYSTEM = (
    "You are an expert prompt engineer. Create one high-quality, ready-to-use prompt "
    "for the requested topic. Respond with JSON only, in the form "
    '{"title": "...", "description": "...", "prompt": "...", "tags": ["..."]}'
)


def _mock_generate(topic: str, category: str, style: str) -> dict:
    title = topic + " Prompt"
    description = (
        "A " + style + " prompt that turns the model into a focused " + category +
        " assistant for working on " + topic + "."
    )
    lines = [
        "You are an expert " + category + " consultant. I need help with: " + topic + ".",
        "Work in a " + style + " style. Follow these rules:",
        "1. Restate my goal in one sentence to confirm you understood it.",
        "2. Give a step-by-step plan with 4-6 concrete steps.",
        "3. Include one short example for each step.",
        "4. End with 3 follow-up questions I should think about.",
    ]
    prompt = "\n".join(lines)
    return {
        "title": title,
        "description": description,
        "prompt": prompt,
        "tags": [category, topic.lower().split()[-1], "generated"],
        "mode": "mock",
    }


def generate_prompt(topic: str, category: str = "general", style: str = "step-by-step") -> dict:
    """Generate a brand-new prompt for a topic."""
    raw = _chat(
        GENERATE_SYSTEM,
        "Topic: " + topic + "\nCategory: " + category + "\nStyle: " + style,
        max_tokens=700,
        temperature=0.8,
    )
    if raw:
        data = _parse_json(raw)
        if data and data.get("prompt"):
            return {
                "title": str(data.get("title") or "Generated prompt").strip()[:120],
                "description": str(data.get("description") or "").strip()[:500],
                "prompt": str(data["prompt"]).strip(),
                "tags": [str(t) for t in (data.get("tags") or [])][:10],
                "mode": "openai",
            }
    return _mock_generate(topic, category, style)


SCORE_SYSTEM = (
    "You are a strict prompt-quality evaluator. Score the prompt out of 10 and "
    "explain it. Respond with JSON only, in the form "
    '{"score": 0-10, "grade": "A|B|C|D", "strengths": ["..."], '
    '"weaknesses": ["..."], "tips": ["..."]} with 2-4 items per list.'
)


def _mock_score(text: str) -> dict:
    low = text.lower()
    score = 3.0
    strengths = []
    weaknesses = []
    tips = []

    def check(ok: bool, plus: float, strength: str, weakness: str, tip: str):
        nonlocal score
        if ok:
            score += plus
            strengths.append(strength)
        else:
            weaknesses.append(weakness)
            tips.append(tip)

    check(len(text) >= 80, 2.0,
          "Gives the model enough detail to work with.",
          "Very short prompts leave too much up to the model.",
          "Describe context, inputs and expected output in a few more lines.")
    check("you are" in low or "act as" in low, 1.5,
          "Defines a clear role for the model.",
          "No role is defined, so the model picks its own.",
          "Start with a role, e.g. 'You are a senior ...'.")
    check(any(w in low for w in ("format", "bullet", "json", "table", "list", "steps", "sections")), 1.5,
          "Specifies the output format.",
          "No output format is specified.",
          "Tell the model how to structure the answer (bullets, table, JSON...).")
    check("?" in text or "return" in low or "give" in low or "write" in low, 1.0,
          "The task is stated as a clear action.",
          "The actual task is easy to miss.",
          "Use a direct verb: 'write', 'list', 'return', 'explain'.")
    check("example" in low or "e.g." in low or "for instance" in low, 1.0,
          "Includes examples that anchor the answer.",
          "No examples are given.",
          "Add one small example of the desired answer.")
    check(any(w in low for w in ("do not", "only", "limit", "at most", "maximum", "under", "avoid")), 1.0,
          "Has constraints that keep the model on track.",
          "No constraints or boundaries are set.",
          "Add limits: length, things to avoid, scope.")

    score = max(0.0, min(10.0, score))
    grade = "A" if score >= 8 else "B" if score >= 6 else "C" if score >= 4 else "D"
    return {
        "score": round(score, 1),
        "grade": grade,
        "strengths": strengths or ["Keep it - short prompts can still be great."],
        "weaknesses": weaknesses or ["No major weaknesses detected."],
        "tips": tips or ["Try adding an example to lock in the style you want."],
        "mode": "mock",
    }


def score_prompt(text: str) -> dict:
    """Score a prompt 0-10 with strengths, weaknesses and tips."""
    raw = _chat(SCORE_SYSTEM, "Prompt to evaluate:\n" + text, max_tokens=700, temperature=0.3)
    if raw:
        data = _parse_json(raw)
        if data and isinstance(data.get("score"), (int, float)):
            score = max(0, min(10, float(data["score"])))
            return {
                "score": round(score, 1),
                "grade": str(data.get("grade") or ("A" if score >= 8 else "B" if score >= 6 else "C")),
                "strengths": [str(x) for x in (data.get("strengths") or [])][:4],
                "weaknesses": [str(x) for x in (data.get("weaknesses") or [])][:4],
                "tips": [str(x) for x in (data.get("tips") or [])][:4],
                "mode": "openai",
            }
    return _mock_score(text)
