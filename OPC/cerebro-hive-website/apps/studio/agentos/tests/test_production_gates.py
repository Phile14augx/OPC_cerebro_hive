"""Tests for the production-readiness gates added to app/security.py and
app/main.py: the admin-secret gate on key issuance, and CORS allowlisting."""

import os

from app.config import get_settings
from app.db import _normalize_database_url


def test_normalizes_railway_style_postgres_url():
    assert _normalize_database_url("postgres://u:p@host:5432/db") == "postgresql+psycopg2://u:p@host:5432/db"
    assert _normalize_database_url("postgresql+psycopg2://u:p@host:5432/db") == "postgresql+psycopg2://u:p@host:5432/db"
    assert _normalize_database_url("sqlite:///./agentos.db") == "sqlite:///./agentos.db"


def _set_admin_secret(monkeypatch, value: str | None):
    if value is None:
        monkeypatch.delenv("AGENTOS_ADMIN_SECRET", raising=False)
    else:
        monkeypatch.setenv("AGENTOS_ADMIN_SECRET", value)
    get_settings.cache_clear()


def test_api_key_issuance_open_by_default(client, monkeypatch):
    _set_admin_secret(monkeypatch, None)
    resp = client.post("/auth/api-keys", json={"owner": "anyone"})
    assert resp.status_code == 200
    get_settings.cache_clear()


def test_api_key_issuance_requires_secret_once_configured(client, monkeypatch):
    _set_admin_secret(monkeypatch, "s3cret")
    try:
        resp = client.post("/auth/api-keys", json={"owner": "attacker"})
        assert resp.status_code == 403

        resp = client.post("/auth/api-keys", json={"owner": "attacker"}, headers={"X-Admin-Secret": "wrong"})
        assert resp.status_code == 403

        resp = client.post("/auth/api-keys", json={"owner": "phil"}, headers={"X-Admin-Secret": "s3cret"})
        assert resp.status_code == 200
        assert resp.json()["api_key"].startswith("aos_")
    finally:
        _set_admin_secret(monkeypatch, None)


def test_allowed_origins_parses_comma_separated_list(monkeypatch):
    monkeypatch.setenv("AGENTOS_ALLOWED_ORIGINS", "https://cerebrohive.com, https://www.cerebrohive.com")
    get_settings.cache_clear()
    try:
        settings = get_settings()
        assert settings.allowed_origins_list == ["https://cerebrohive.com", "https://www.cerebrohive.com"]
    finally:
        monkeypatch.delenv("AGENTOS_ALLOWED_ORIGINS", raising=False)
        get_settings.cache_clear()


def test_key_issuance_rate_limit_kicks_in_after_10_per_minute(client):
    # app/api/routers/auth.py caps POST /auth/api-keys at 10/minute per
    # caller (slowapi, keyed by client IP) — the 11th request in the same
    # window should be rejected before it ever reaches the handler.
    for _ in range(10):
        resp = client.post("/auth/api-keys", json={"owner": "load-test"})
        assert resp.status_code == 200
    resp = client.post("/auth/api-keys", json={"owner": "load-test"})
    assert resp.status_code == 429


def test_oversized_request_body_is_rejected_with_413(client, auth_headers):
    # RequestGuardMiddleware (app/middleware.py) rejects any request whose
    # Content-Length exceeds AGENTOS_MAX_BODY_BYTES (default 1MB) before the
    # body is parsed or validated.
    huge_content = "x" * (1_100_000)
    resp = client.post(
        "/knowledge/documents",
        json={"title": "big doc", "content": huge_content},
        headers=auth_headers,
    )
    assert resp.status_code == 413


def test_security_headers_present_on_every_response(client):
    resp = client.get("/health")
    assert resp.headers.get("x-content-type-options") == "nosniff"
    assert resp.headers.get("x-frame-options") == "DENY"
    assert resp.headers.get("referrer-policy") == "no-referrer"
    assert "x-request-id" in resp.headers


def test_agent_create_rejects_unknown_fields_and_bad_slug(client, auth_headers):
    # ConfigDict(extra="forbid") on AgentCreate (app/api/routers/agents.py)
    resp = client.post(
        "/agents",
        json={"slug": "ok-slug", "name": "Test", "not_a_real_field": "x"},
        headers=auth_headers,
    )
    assert resp.status_code == 422

    resp = client.post(
        "/agents",
        json={"slug": "Not A Valid Slug!", "name": "Test"},
        headers=auth_headers,
    )
    assert resp.status_code == 422


def test_cortex_optimize_rejects_oversized_knapsack(client, auth_headers):
    # OptimizeRequest caps budget at 20_000 (app/api/routers/cortex.py) so the
    # O(items * budget) DP table can't be forced arbitrarily large.
    resp = client.post(
        "/cortex/optimize",
        json={"budget": 50_000, "items": [{"name": "A", "cost": 1, "value": 1}]},
        headers=auth_headers,
    )
    assert resp.status_code == 422
