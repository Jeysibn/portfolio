import json

import pytest
from azure.cosmos import exceptions

import function_app
from assistant.response_sanitizer import sanitize_ai_response
from assistant.service import build_chat_messages, load_assistant_prompt, load_knowledge_base


def test_assistant_prompt_contains_behavior_rules():
    prompt = load_assistant_prompt().lower()

    assert "portfolio-first" in prompt
    assert "approved portfolio facts" in prompt
    assert "never mention" in prompt
    assert "do not use emojis" in prompt
    assert "restrained formatting" in prompt
    assert "not a general-purpose ai assistant" in prompt
    assert "do not provide standalone coding help" in prompt
    assert "do not answer any part" in prompt
    assert "in progress" in prompt
    assert "must never be described as earned" in prompt
    assert "three or more items" in prompt
    assert "state the criterion used" in prompt
    assert "short paragraphs" in prompt


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


def test_sanitize_ai_response_keeps_safe_formatting_and_removes_emoji():
    response = "**Jerome** is focused on Cloud and DevOps. 🚀\n### Details\nUse `Terraform`."

    cleaned = sanitize_ai_response(response)

    assert cleaned == "**Jerome** is focused on Cloud and DevOps.\nDetails\nUse `Terraform`."
    assert "**Jerome**" in cleaned
    assert "`Terraform`" in cleaned
    assert "🚀" not in cleaned


def test_sanitize_ai_response_preserves_flat_lists_and_removes_html_tags():
    response = "- **Cloud Portfolio**\n1. `Terraform`\n<strong>unsafe markup</strong>"

    cleaned = sanitize_ai_response(response)

    assert cleaned == "- **Cloud Portfolio**\n1. `Terraform`\nunsafe markup"
    assert "<strong>" not in cleaned


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
    assert "10 assistant questions per hour" in function_app.RATE_LIMIT_MESSAGE


def test_obvious_scope_rejection_is_throttled_without_charging_ai_quota(monkeypatch):
    created = []

    class RateContainer:
        def read_item(self, **kwargs):
            raise exceptions.CosmosResourceNotFoundError(status_code=404, message="missing")

        def create_item(self, *, body):
            created.append(body)

    class Database:
        def get_container_client(self, name):
            return RateContainer()

    class Cosmos:
        def get_database_client(self, name):
            return Database()

    monkeypatch.setattr(function_app, "get_cosmos_client", lambda: Cosmos())
    response = function_app.AiChatAssistant(Request(json.dumps({"message": "What is 200 + 100?"})))

    assert response.status_code == 200
    payload = json.loads(response.get_body())
    assert payload["sources"] == []
    assert "outside this portfolio assistant's scope" in payload["reply"]
    assert created[0]["count"] == 0
    assert created[0]["api_count"] == 1


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


def test_ai_output_budget_uses_default_and_server_side_bounds(monkeypatch):
    monkeypatch.delenv("AI_MAX_TOKENS", raising=False)
    assert function_app._get_ai_max_tokens() == function_app.AI_MAX_TOKENS_DEFAULT

    monkeypatch.setenv("AI_MAX_TOKENS", "5000")
    assert function_app._get_ai_max_tokens() == function_app.AI_MAX_TOKENS_MAX

    monkeypatch.setenv("AI_MAX_TOKENS", "not-a-number")
    assert function_app._get_ai_max_tokens() == function_app.AI_MAX_TOKENS_DEFAULT


class Request:
    method = "POST"
    headers = {"content-type": "application/json"}

    def __init__(self, body, headers=None):
        self.body = body
        if headers is not None:
            self.headers = {"content-type": "application/json", **headers}

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


def test_ai_request_forwards_browser_session_to_opencode(monkeypatch):
    class RateContainer:
        def read_item(self, **kwargs):
            raise exceptions.CosmosResourceNotFoundError(status_code=404, message="missing")

        def create_item(self, body):
            return body

    class Database:
        def get_container_client(self, name):
            return RateContainer()

    class Cosmos:
        def get_database_client(self, name):
            return Database()

    provider_calls = []

    class Completions:
        def create(self, **kwargs):
            provider_calls.append(kwargs)
            return type(
                "Response",
                (),
                {
                    "choices": [
                        type(
                            "Choice",
                            (),
                            {
                                "finish_reason": "stop",
                                "message": type("Message", (), {"content": "Jerome works with Terraform."})(),
                            },
                        )()
                    ]
                },
            )()

    client = type("Client", (), {"chat": type("Chat", (), {"completions": Completions()})()})()

    monkeypatch.setattr(function_app, "get_cosmos_client", lambda: Cosmos())
    monkeypatch.setattr(function_app, "get_ai_client", lambda: client)

    response = function_app.AiChatAssistant(
        Request(
            json.dumps({"message": "What does Jerome use Terraform for?"}),
            headers={"x-opencode-session": "browser-session-123"},
        )
    )

    assert response.status_code == 200
    assert len(provider_calls) == 1
    assert provider_calls[0]["extra_headers"]["x-opencode-session"] == "browser-session-123"
    payload = json.loads(response.get_body())
    assert payload["reply"] == "Jerome works with Terraform."
    assert payload["sources"][0]["id"] == "project-cloud-portfolio"
    assert payload["usage"]["limit"] == function_app.MAX_MESSAGES


def configure_chat_provider(monkeypatch, responses):
    """Patch the route dependencies for completion-status tests."""
    class RateContainer:
        def read_item(self, **kwargs):
            raise exceptions.CosmosResourceNotFoundError(status_code=404, message="missing")

        def create_item(self, body):
            return body

    class Database:
        def get_container_client(self, name):
            return RateContainer()

    class Cosmos:
        def get_database_client(self, name):
            return Database()

    calls = []

    class Completions:
        def create(self, **kwargs):
            calls.append(kwargs)
            content, finish_reason = responses[len(calls) - 1]
            return type(
                "Response",
                (),
                {
                    "choices": [
                        type(
                            "Choice",
                            (),
                            {
                                "finish_reason": finish_reason,
                                "message": type("Message", (), {"content": content})(),
                            },
                        )()
                    ]
                },
            )()

    client = type("Client", (), {"chat": type("Chat", (), {"completions": Completions()})()})()
    monkeypatch.setattr(function_app, "get_cosmos_client", lambda: Cosmos())
    monkeypatch.setattr(function_app, "get_ai_client", lambda: client)
    return calls


def test_length_limited_completion_is_regenerated_once(monkeypatch):
    calls = configure_chat_provider(
        monkeypatch,
        [
            ("MoniKey demonstrates durable background work, but the answer is cut", "length"),
            ("MoniKey demonstrates PostgreSQL-backed durable background work.", "stop"),
        ],
    )
    events = []
    monkeypatch.setattr(function_app, "log_event", lambda event, request_id, **fields: events.append((event, fields)))

    response = function_app.AiChatAssistant(Request(json.dumps({"message": "Tell me about MoniKey."})))

    assert response.status_code == 200
    assert len(calls) == 2
    assert calls[1]["messages"][-1]["content"].startswith("Rewrite your previous answer more concisely")
    payload = json.loads(response.get_body())
    assert payload["reply"] == "MoniKey demonstrates PostgreSQL-backed durable background work."
    truncation = next(fields for event, fields in events if event == "ai_chat_output_truncated")
    assert truncation["finish_reason"] == "length"
    assert truncation["output_token_limit"] == function_app.AI_MAX_TOKENS
    success = next(fields for event, fields in events if event == "ai_chat_success")
    assert success["regeneration_required"] is True
    assert success["final_completed"] is True


def test_length_limited_retry_returns_controlled_error_when_still_incomplete(monkeypatch):
    calls = configure_chat_provider(
        monkeypatch,
        [("The answer ends abruptly", "length"), ("The rewrite also ends", "length")],
    )

    response = function_app.AiChatAssistant(Request(json.dumps({"message": "Which projects best demonstrate Jerome's skills?"})))

    assert response.status_code == 502
    assert len(calls) == 2
    payload = json.loads(response.get_body())
    assert payload["error"] == function_app.INCOMPLETE_RESPONSE_MESSAGE
    assert "ends abruptly" not in json.dumps(payload)


def test_project_skills_question_can_return_all_projects_completely(monkeypatch):
    complete = (
        "Jerome's projects demonstrate different skill areas.\n\n"
        "- Cloud-Backed Portfolio — Azure delivery and observability.\n"
        "- Homelab GitOps Environment — Kubernetes and GitOps operations.\n"
        "- MoniKey — full-stack application and durable worker design.\n"
        "- NOC Report Builder — evidence-aware operations automation.\n\n"
        "Homelab GitOps is the clearest fit for a Kubernetes-focused role."
    )
    calls = configure_chat_provider(monkeypatch, [(complete, "stop")])

    response = function_app.AiChatAssistant(
        Request(json.dumps({"message": "Which projects best demonstrate Jerome's skills?"}))
    )

    assert response.status_code == 200
    assert len(calls) == 1
    payload = json.loads(response.get_body())
    for project in ("Cloud-Backed Portfolio", "Homelab GitOps Environment", "MoniKey", "NOC Report Builder"):
        assert project in payload["reply"]
    assert payload["reply"].endswith("role.")


def test_ai_cors_allows_opencode_session_header():
    assert "X-OpenCode-Session" in function_app.AI_HEADERS["Access-Control-Allow-Headers"]
