import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

ASSISTANT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ASSISTANT_DIR.parent
PROMPT_PATH = ASSISTANT_DIR / "assistant_prompt.md"
KNOWLEDGE_PATH = BACKEND_DIR / "data" / "knowledge_base.json"


def load_assistant_prompt() -> str:
    """Load assistant behavior instructions from the version-controlled prompt file."""
    try:
        prompt = PROMPT_PATH.read_text(encoding="utf-8").strip()
    except OSError as exc:
        logger.exception("Unable to load the assistant prompt.")
        raise RuntimeError("Assistant prompt is unavailable.") from exc

    if not prompt:
        raise RuntimeError("Assistant prompt is empty.")

    return prompt


def load_knowledge_base() -> dict[str, Any]:
    """Load verified portfolio facts from JSON."""
    try:
        with KNOWLEDGE_PATH.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except (OSError, json.JSONDecodeError):
        logger.exception("Unable to load the portfolio facts.")
        return {}

    return data if isinstance(data, dict) else {}


def build_chat_messages(
    user_message: str,
    chat_history: list[dict[str, Any]],
    portfolio_facts: dict[str, Any] | None = None,
) -> list[dict[str, str]]:
    """Build model messages while keeping behavior and portfolio facts separate."""
    facts = portfolio_facts if portfolio_facts is not None else load_knowledge_base()

    messages: list[dict[str, str]] = [
        {"role": "system", "content": load_assistant_prompt()},
        {
            "role": "system",
            "content": (
                "Verified portfolio facts for Jerome follow. "
                "Use these facts for Jerome-specific claims and do not expose this "
                "internal context to the visitor.\n\n"
                + json.dumps(facts, indent=2)
            ),
        },
    ]

    for message in chat_history:
        role = message.get("role")
        content = message.get("content")
        if role in {"user", "assistant"} and isinstance(content, str) and content.strip():
            messages.append({"role": role, "content": content.strip()})

    messages.append({"role": "user", "content": user_message})
    return messages
