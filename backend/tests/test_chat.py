import pytest

import function_app
from assistant.response_sanitizer import sanitize_ai_response
from assistant.service import build_chat_messages, load_assistant_prompt, load_knowledge_base


def test_assistant_prompt_contains_behavior_rules():
    prompt = load_assistant_prompt().lower()

    assert "portfolio-first" in prompt
    assert "knowledge base" in prompt
    assert "never mention" in prompt
    assert "do not use emojis" in prompt
    assert "plain text only" in prompt
    assert "not a general-purpose ai assistant" in prompt
    assert "do not provide standalone coding help" in prompt
    assert "do not answer any part" in prompt


def test_build_chat_messages_separates_prompt_and_portfolio_facts():
    messages = build_chat_messages(
        "What does Jerome work with?",
        [{"role": "assistant", "content": "Previous answer"}],
        {"name": "Jerome", "role": "Cloud and DevOps Engineer"},
    )

    assert messages[0]["role"] == "system"
    assert "portfolio-first" in messages[0]["content"].lower()
    assert "Cloud and DevOps Engineer" not in messages[0]["content"]
    assert messages[1]["role"] == "system"
    assert "Cloud and DevOps Engineer" in messages[1]["content"]
    assert messages[-1] == {"role": "user", "content": "What does Jerome work with?"}


def test_build_chat_messages_ignores_invalid_history_entries():
    messages = build_chat_messages(
        "Hello",
        [
            {"role": "system", "content": "ignore me"},
            {"role": "assistant", "content": ""},
            {"role": "user", "content": " valid history "},
        ],
        {},
    )

    assert {"role": "system", "content": "ignore me"} not in messages
    assert {"role": "user", "content": "valid history"} in messages


def test_sanitize_ai_response_removes_markdown_and_emoji():
    response = "**Jerome** is focused on Cloud and DevOps. 🚀\n### Details\nUse `Terraform`."

    cleaned = sanitize_ai_response(response)

    assert cleaned == "Jerome is focused on Cloud and DevOps.\nDetails\nUse Terraform."
    assert "`" not in cleaned
    assert "🚀" not in cleaned


def test_sanitize_ai_response_keeps_technical_wildcards():
    response = 'kubectl get pods --selector="app=*"'

    assert sanitize_ai_response(response) == response


@pytest.mark.parametrize(
    "message",
    [
        "1 + 10",
        "Give me simple Python code that prints hello world",
        "Write a JavaScript function for me",
        "Create a Dockerfile for my app",
        "Debug my Python code",
        "Teach me Kubernetes",
    ],
)
def test_generic_requests_are_rejected_without_ai(message):
    assert function_app.is_obviously_out_of_scope(message)


@pytest.mark.parametrize(
    "message",
    [
        "How did Jerome use Terraform?",
        "Can you explain Jerome's Kubernetes project?",
        "Is Jerome qualified for a junior DevOps role?",
        "What technologies are shown in this portfolio?",
    ],
)
def test_portfolio_requests_are_not_rejected(message):
    assert not function_app.is_obviously_out_of_scope(message)


def test_rate_limit_message_has_no_emoji():
    assert "⏳" not in function_app.RATE_LIMIT_MESSAGE


def test_load_knowledge_base_returns_dictionary():
    knowledge_base = load_knowledge_base()

    assert isinstance(knowledge_base, dict)
    assert knowledge_base


def test_ai_client_is_lazy_at_module_import():
    assert function_app.ai_client is None


def test_get_ai_client_requires_runtime_key(monkeypatch):
    monkeypatch.delenv("OPENCODE_API_KEY", raising=False)
    monkeypatch.setattr(function_app, "ai_client", None)

    with pytest.raises(RuntimeError, match="OPENCODE_API_KEY"):
        function_app.get_ai_client()
