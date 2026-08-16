import json
from types import SimpleNamespace

import function_app


def make_request(method="GET", headers=None):
    return SimpleNamespace(method=method, headers=headers or {})


def test_health_returns_service_status():
    response = function_app.Health(
        make_request(headers={"x-correlation-id": "test-request-id"})
    )

    body = json.loads(response.get_body())

    assert response.status_code == 200
    assert body["status"] == "healthy"
    assert body["service"] == "portfolio-api"
    assert response.headers["X-Correlation-ID"] == "test-request-id"


def test_visitor_counter_options_returns_success():
    response = function_app.GetVisitorCount(make_request(method="OPTIONS"))

    assert response.status_code == 200


def test_ai_assistant_options_returns_success():
    response = function_app.AiChatAssistant(make_request(method="OPTIONS"))

    assert response.status_code == 200
