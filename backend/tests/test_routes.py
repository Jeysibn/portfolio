from types import SimpleNamespace

import function_app


def test_visitor_counter_options_returns_success():
    request = SimpleNamespace(method="OPTIONS")

    response = function_app.GetVisitorCount(request)

    assert response.status_code == 200


def test_ai_assistant_options_returns_success():
    request = SimpleNamespace(method="OPTIONS")

    response = function_app.AiChatAssistant(request)

    assert response.status_code == 200
