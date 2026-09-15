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
    """Keep a small readable subset of model formatting.

    This intentionally preserves paragraph breaks, flat lists, bold labels,
    inline code, technical punctuation such as ``app=*``, paths, flags, URLs,
    and commands while removing noisy/decorative Markdown.
    """
    cleaned = content.replace("\r\n", "\n").replace("\r", "\n")
    cleaned = re.sub(r"```(?:[a-zA-Z0-9_+-]+)?\n?", "", cleaned)
    cleaned = re.sub(
        r"</?(?:a|br|code|div|em|h[1-6]|li|ol|p|script|strong|style|table|tbody|td|th|thead|tr|ul)(?:\s[^>]*)?>",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(r"(?<!\S)\*([^*\n]+)\*(?!\S)", r"\1", cleaned)
    cleaned = re.sub(r"(?m)^\s*#{1,6}\s+", "", cleaned)
    cleaned = re.sub(r"(?m)^\s*[-+*]\s+", "- ", cleaned)
    cleaned = re.sub(r"(?m)^\s*(\d+)[.)]\s+", r"\1. ", cleaned)
    cleaned = re.sub(r"(?m)^\s*[-=_]{3,}\s*$", "", cleaned)
    # Tables are not part of the supported display subset. Flatten their
    # separators without touching ordinary technical lines containing pipes.
    cleaned = re.sub(r"(?m)^\s*\|(.+?)\|\s*$", lambda match: match.group(1).replace("|", " ").strip(), cleaned)
    cleaned = re.sub(r"(?m)^\s*:?[-]{3,}:?(?:\s*\|\s*:?[ -]{3,}:?)+\s*$", "", cleaned)
    cleaned = re.sub(r"(?m)^\s*:?[-]{3,}:?(?:\s+[-:]{3,}:?)+\s*$", "", cleaned)
    cleaned = EMOJI_PATTERN.sub("", cleaned)
    cleaned = re.sub(r"[ \t]+(?=\n)", "", cleaned)
    cleaned = re.sub(r" {2,}", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()
