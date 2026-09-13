import json

import pytest
from azure.cosmos import exceptions

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
    assert "in progress" in prompt
    assert "must never be described as earned" in prompt


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


def test_terraform_associate_is_recorded_as_in_progress_not_earned():
    knowledge_base = load_knowledge_base()
    terraform_name = "HashiCorp Certified: Terraform Associate (004)"

    assert terraform_name not in knowledge_base["certifications"]
    current = knowledge_base["certifications_in_progress"]
    terraform = next(item for item in current if item["name"] == terraform_name)

    assert terraform["earned"] is False
    assert terraform["status"] == "Currently studying"
    assert any(terraform_name in item for item in knowledge_base["current_learning"])
    assert any("do not describe hashicorp certified" in item.lower() for item in knowledge_base["response_guardrails"])


def test_ai_client_is_lazy_at_module_import():
    assert function_app.ai_client is None


def test_get_ai_client_requires_runtime_key(monkeypatch):
    monkeypatch.delenv("OPENCODE_API_KEY", raising=False)
    monkeypatch.setattr(function_app, "ai_client", None)

    with pytest.raises(RuntimeError, match="OPENCODE_API_KEY"):
        function_app.get_ai_client()


class Request:
    method = "POST"
    headers = {"content-type": "application/json"}

    def __init__(self, body):
        self.body = body

    def get_body(self):
        return self.body.encode()

    def get_json(self):
        return json.loads(self.body)


def test_chat_validation_happens_before_quota_and_accepts_maximum_valid_request():
    message = "x" * function_app.MAX_MESSAGE_CHARS
    history = [
        {"role": "user", "content": "x" * function_app.MAX_HISTORY_ITEM_CHARS}
    ] * (function_app.MAX_HISTORY_TOTAL_CHARS // function_app.MAX_HISTORY_ITEM_CHARS)

    parsed, error = function_app.parse_chat_request(
        Request(json.dumps({"message": message, "history": history})), "test"
    )

    assert error is None
    assert parsed[0] == message
    assert len(parsed[1]) == function_app.MAX_HISTORY_TOTAL_CHARS // function_app.MAX_HISTORY_ITEM_CHARS


@pytest.mark.parametrize(
    "body, status",
    [
        ("not json", 400),
        (json.dumps({"message": ""}), 400),
        (json.dumps({"message": "x" * (function_app.MAX_MESSAGE_CHARS + 1)}), 413),
        (json.dumps({"message": "x", "history": "invalid"}), 400),
        (json.dumps({"message": "x", "history": [{"role": "system", "content": "x"}]}), 400),
        (json.dumps({"message": "x", "history": [{"role": "user", "content": "x" * (function_app.MAX_HISTORY_ITEM_CHARS + 1)}]}), 413),
    ],
)
def test_invalid_chat_requests_are_rejected_before_quota(body, status):
    _, error = function_app.parse_chat_request(Request(body), "test")

    assert error is not None
    assert error.status_code == status


def test_rate_limit_concurrency_failure_fails_closed_without_provider_call(monkeypatch):
    class RateContainer:
        def read_item(self, **kwargs):
            return {"id": kwargs["item"], "count": 0, "last_updated": 0, "_etag": "stale"}

        def replace_item(self, **kwargs):
            raise exceptions.CosmosAccessConditionFailedError(
                status_code=412, message="stale etag"
            )

    class Database:
        def get_container_client(self, name):
            return RateContainer()

    class Cosmos:
        def get_database_client(self, name):
            return Database()

    provider_called = False

    def fail_if_called():
        nonlocal provider_called
        provider_called = True
        raise AssertionError("provider must not be called")

    monkeypatch.setattr(function_app, "get_cosmos_client", lambda: Cosmos())
    monkeypatch.setattr(function_app, "get_ai_client", fail_if_called)

    response = function_app.AiChatAssistant(Request(json.dumps({"message": "What does Jerome use Terraform for?"})))

    assert response.status_code == 503
    assert provider_called is False
