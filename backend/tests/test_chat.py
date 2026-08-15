import pytest

import function_app


def test_build_system_prompt_contains_knowledge_base_content():
    knowledge_base = {
        "name": "Jerome",
        "role": "Cloud and DevOps Engineer",
    }

    prompt = function_app.build_system_prompt(knowledge_base)

    assert "Jerome" in prompt
    assert "Cloud and DevOps Engineer" in prompt
    assert "using ONLY the Knowledge Base" in prompt


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
