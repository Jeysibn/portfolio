import hashlib
import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from assistant.retrieval import RetrievalResult, get_relevant_context, load_knowledge_base

logger = logging.getLogger(__name__)

ASSISTANT_DIR = Path(__file__).resolve().parent
PROMPT_PATH = ASSISTANT_DIR / "assistant_prompt.md"

__all__ = ["ChatContext", "build_chat_context", "build_chat_messages", "load_assistant_prompt", "load_knowledge_base"]


@dataclass(frozen=True)
class ChatContext:
    messages: list[dict[str, str]]
    retrieval: RetrievalResult
    prompt_version: str


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


def _prompt_version(prompt: str) -> str:
    return f"prompt-{hashlib.sha256(prompt.encode('utf-8')).hexdigest()[:16]}"


def build_chat_context(
    user_message: str,
    chat_history: list[dict[str, Any]],
    portfolio_facts: dict[str, Any] | None = None,
) -> ChatContext:
    """Build provider messages from behavior plus a small retrieved fact set."""
    prompt = load_assistant_prompt()
    retrieval = get_relevant_context(user_message, chat_history, portfolio_facts)
    messages: list[dict[str, str]] = [
        {"role": "system", "content": prompt},
        {
            "role": "system",
            "content": (
                "Approved portfolio facts relevant to this question follow. "
                "Treat them as the factual source of truth, do not expose this "
                "internal context, and do not infer facts that are absent.\n\n"
                + json.dumps(retrieval.context, indent=2, ensure_ascii=False)
            ),
        },
    ]

    for message in chat_history:
        role = message.get("role")
        content = message.get("content")
        if role in {"user", "assistant"} and isinstance(content, str) and content.strip():
            messages.append({"role": role, "content": content.strip()})

    messages.append({"role": "user", "content": user_message})
    return ChatContext(messages=messages, retrieval=retrieval, prompt_version=_prompt_version(prompt))


def build_chat_messages(
    user_message: str,
    chat_history: list[dict[str, Any]],
    portfolio_facts: dict[str, Any] | None = None,
) -> list[dict[str, str]]:
    """Backward-compatible message-only wrapper around the retrieval context."""
    return build_chat_context(user_message, chat_history, portfolio_facts).messages
