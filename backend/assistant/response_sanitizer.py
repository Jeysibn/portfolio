import re

EMOJI_PATTERN = re.compile(
    "["
    "\U0001F1E6-\U0001F1FF"
    "\U0001F300-\U0001FAFF"
    "\u2600-\u26FF"
    "\u2700-\u27BF"
    "\ufe0f"
    "]+",
    flags=re.UNICODE,
)


def sanitize_ai_response(content: str) -> str:
    """Remove display formatting artifacts that should not reach the chat UI."""
    cleaned = re.sub(r"\*\*([^*\n]+)\*\*", r"\1", content)
    cleaned = re.sub(r"__([^_\n]+)__", r"\1", cleaned)
    cleaned = re.sub(r"(?<!\S)\*([^*\n]+)\*(?!\S)", r"\1", cleaned)
    cleaned = cleaned.replace("`", "")
    cleaned = EMOJI_PATTERN.sub("", cleaned)
    cleaned = re.sub(r"(?m)^\s*#{1,6}\s+", "", cleaned)
    cleaned = re.sub(r"(?m)^\s*[-+*]\s+", "", cleaned)
    cleaned = re.sub(r"(?m)^\s*\d+[.)]\s+", "", cleaned)
    cleaned = re.sub(r"[ \t]+(?=\n)", "", cleaned)
    cleaned = re.sub(r" {2,}", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()
