from types import SimpleNamespace

import function_app


def test_hash_ip_is_deterministic_and_does_not_store_raw_ip():
    client_ip = "203.0.113.10"

    first = function_app.hash_ip(client_ip)
    second = function_app.hash_ip(client_ip)

    assert first == second
    assert first != client_ip
    assert len(first) == 64


def test_get_client_ip_trusts_the_last_forwarded_hop():
    # The right-most entry is appended by Azure's own front-end and cannot be
    # forged by the caller; a client can freely set every earlier entry
    # (including a fake "first" address), so it must never be trusted.
    request = SimpleNamespace(
        headers={"x-forwarded-for": "203.0.113.10, 10.0.0.5"}
    )

    assert function_app.get_client_ip(request) == "10.0.0.5"


def test_get_client_ip_ignores_a_spoofed_leading_address():
    request = SimpleNamespace(
        headers={"x-forwarded-for": "1.2.3.4, 198.51.100.7"}
    )

    assert function_app.get_client_ip(request) == "198.51.100.7"


def test_get_client_ip_removes_ipv4_port():
    request = SimpleNamespace(headers={"x-forwarded-for": "203.0.113.10:50422"})

    assert function_app.get_client_ip(request) == "203.0.113.10"


def test_get_client_ip_preserves_ipv6_address():
    request = SimpleNamespace(headers={"x-forwarded-for": "2001:db8::1"})

    assert function_app.get_client_ip(request) == "2001:db8::1"


def test_get_client_ip_defaults_to_loopback():
    request = SimpleNamespace(headers={})

    assert function_app.get_client_ip(request) == "127.0.0.1"
