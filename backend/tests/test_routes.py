import json
from pathlib import Path
from types import SimpleNamespace

import function_app


def make_request(method="GET", headers=None):
    return SimpleNamespace(method=method, headers=headers or {})


def test_health_is_non_mutating_and_returns_safe_release_metadata(monkeypatch):
    secrets = {
        "CosmosDbConnectionString": "AccountKey=must-not-leak",
        "OPENCODE_API_KEY": "must-not-leak-either",
    }
    for name, value in {
        **secrets,
        "APP_VERSION": "2.4.1",
        "APP_REVISION": "abc123def456",
        "APP_ENVIRONMENT": "production",
    }.items():
        monkeypatch.setenv(name, value)

    def fail_if_database_is_touched():
        raise AssertionError("liveness must not access Cosmos DB")

    monkeypatch.setattr(function_app, "get_cosmos_client", fail_if_database_is_touched)
    response = function_app.Health(
        make_request(headers={"x-correlation-id": "test-request-id"})
    )

    body = json.loads(response.get_body())

    assert response.status_code == 200
    assert body["status"] == "healthy"
    assert body["service"] == "portfolio-api"
    assert body["version"] == "2.4.1"
    assert body["revision"] == "abc123def456"
    assert body["environment"] == "production"
    assert all(secret not in response.get_body().decode() for secret in secrets.values())
    assert response.headers["X-Correlation-ID"] == "test-request-id"


def test_health_does_not_reflect_untrusted_app_setting_values(monkeypatch):
    secret_value = "AccountKey=release-metadata-must-not-reflect-this"
    for name in ("APP_VERSION", "APP_REVISION", "APP_ENVIRONMENT"):
        monkeypatch.setenv(name, secret_value)

    response = function_app.Health(make_request())
    body = json.loads(response.get_body())

    assert response.status_code == 200
    assert body["version"] == "unknown"
    assert body["revision"] == "unknown"
    assert body["environment"] == "unknown"
    assert secret_value not in response.get_body().decode()


def test_visitor_counter_options_returns_success():
    response = function_app.GetVisitorCount(make_request(method="OPTIONS"))

    assert response.status_code == 200


def test_ai_assistant_options_returns_success():
    response = function_app.AiChatAssistant(make_request(method="OPTIONS"))

    assert response.status_code == 200


def test_backend_deployment_verifies_health_without_calling_visitor_counter():
    workflow = (
        Path(__file__).resolve().parents[2]
        / ".github"
        / "workflows"
        / "backend-deploy.yml"
    ).read_text(encoding="utf-8")

    assert "/api/health" in workflow
    assert "EXPECTED_REVISION" in workflow
    assert "/api/GetVisitorCount" not in workflow


def test_cosmos_managed_identity_uses_endpoint_and_default_credential(monkeypatch):
    expected_credential = object()

    class FakeCosmosClient:
        def __init__(self, endpoint, credential):
            self.endpoint = endpoint
            self.credential = credential

    monkeypatch.setattr(function_app, "cosmos_client", None)
    monkeypatch.setattr(function_app, "CosmosClient", FakeCosmosClient)
    monkeypatch.setattr(
        function_app,
        "DefaultAzureCredential",
        lambda **kwargs: expected_credential,
    )
    monkeypatch.setenv("COSMOS_DB_AUTH_MODE", "managed_identity")
    monkeypatch.setenv("CosmosDbEndpoint", "https://example.documents.azure.com:443/")

    client = function_app.get_cosmos_client()

    assert client.endpoint == "https://example.documents.azure.com:443/"
    assert client.credential is expected_credential


def test_cosmos_connection_string_fallback_remains_available(monkeypatch):
    expected_client = object()

    class FakeCosmosClient:
        @staticmethod
        def from_connection_string(connection_string):
            assert connection_string == "AccountEndpoint=https://localhost;AccountKey=local;"
            return expected_client

    monkeypatch.setattr(function_app, "cosmos_client", None)
    monkeypatch.setattr(function_app, "CosmosClient", FakeCosmosClient)
    monkeypatch.setenv("COSMOS_DB_AUTH_MODE", "connection_string")
    monkeypatch.setenv(
        "CosmosDbConnectionString",
        "AccountEndpoint=https://localhost;AccountKey=local;",
    )

    assert function_app.get_cosmos_client() is expected_client
