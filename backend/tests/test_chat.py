import pytest

import function_app


def test_build_system_prompt_contains_portfolio_facts():
    knowledge_base = {
        "name": "Jerome",
        "role": "Cloud and DevOps Engineer",
    }

    prompt = function_app.build_system_prompt(knowledge_base)

    assert "Jerome" in prompt
    assert "Cloud and DevOps Engineer" in prompt
    assert "portfolio-first" in prompt.lower()
    assert "knowledge base" not in prompt.lower()
    assert "do not use emojis" in prompt.lower()
    assert "plain text only" in prompt.lower()


def test_sanitize_ai_response_removes_markdown_and_emoji():
    response = "**Jerome** is focused on Cloud and DevOps. 🚀\n### Details\nUse `Terraform`."

    cleaned = function_app.sanitize_ai_response(response)

    assert cleaned == "Jerome is focused on Cloud and DevOps.\nDetails\nUse Terraform."
    assert "*" not in cleaned
    assert "`" not in cleaned
    assert "🚀" not in cleaned


def test_sanitize_ai_response_keeps_normal_technical_text():
    response = "CI/CD uses GitHub Actions. Kubernetes runs containers across nodes."

    assert function_app.sanitize_ai_response(response) == response


def test_rate_limit_message_has_no_emoji():
    assert "⏳" not in function_app.RATE_LIMIT_MESSAGE


def test_load_knowledge_base_returns_dictionary():
    knowledge_base = function_app.load_knowledge_base()

    assert isinstance(knowledge_base, dict)
    assert knowledge_base


def test_ai_client_is_lazy_at_module_import():
    assert function_app.ai_client is None


def test_get_ai_client_requires_runtime_key(monkeypatch):
    monkeypatch.delenv("OPENCODE_API_KEY", raising=False)
    monkeypatch.setattr(function_app, "ai_client", None)

    with pytest.raises(RuntimeError, match="OPENCODE_API_KEY"):
        function_app.get_ai_client()
