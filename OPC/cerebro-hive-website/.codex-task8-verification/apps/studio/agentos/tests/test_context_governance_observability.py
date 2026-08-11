"""Tests for the Context Engine, the Governance extensions (numeric ops,
audit log), and the Observability aggregation endpoint."""


def test_context_engine_fuses_memory_and_knowledge(client, auth_headers):
    resp = client.post(
        "/agents",
        json={"slug": "context-test-agent", "name": "Context Test Agent", "category": "research"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    agent_id = resp.json()["id"]

    client.post(
        "/memory",
        json={"agent_id": agent_id, "content": "The Q3 roadmap prioritizes agent observability.", "tier": "semantic"},
        headers=auth_headers,
    )
    client.post(
        "/knowledge/documents",
        json={"title": "Roadmap Doc", "content": "Observability and governance are the two biggest Q3 workstreams."},
        headers=auth_headers,
    )

    resp = client.get(
        "/context/assemble",
        params={"agent_slug": "context-test-agent", "q": "What are the Q3 priorities?"},
        headers=auth_headers,
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    origins = {s["origin"] for s in body["sources"]}
    # Real fusion: both engines contributed at least one source between them.
    assert origins & {"memory", "knowledge"}
    assert isinstance(body["assembled_text"], str)


def test_context_engine_unknown_agent_404s(client, auth_headers):
    resp = client.get("/context/assemble", params={"agent_slug": "does-not-exist", "q": "x"}, headers=auth_headers)
    assert resp.status_code == 404


def test_governance_numeric_operator_fires(client, auth_headers):
    resp = client.post(
        "/governance/policies",
        json={
            "name": "high-cost-review",
            "description": "Flag anything over a cost threshold",
            "rule": {"if": {"field": "cost_usd", "op": ">", "value": 5}, "then": "require_approval"},
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201, resp.text

    # Audit log should now have a policy.created entry.
    resp = client.get("/governance/audit-log", params={"action": "policy.created"}, headers=auth_headers)
    assert resp.status_code == 200
    assert any(entry["target"] == "high-cost-review" for entry in resp.json())


def test_governance_rejects_unknown_operator(client, auth_headers):
    resp = client.post(
        "/governance/policies",
        json={
            "name": "bad-op-policy",
            "rule": {"if": {"field": "category", "op": "~=", "value": "x"}, "then": "block"},
        },
        headers=auth_headers,
    )
    assert resp.status_code == 400


def test_agent_crud_writes_audit_log(client, auth_headers):
    client.post("/agents", json={"slug": "audit-test-agent", "name": "Audit Test"}, headers=auth_headers)
    client.delete("/agents/audit-test-agent", headers=auth_headers)

    resp = client.get("/governance/audit-log", headers=auth_headers)
    actions = {(e["action"], e["target"]) for e in resp.json()}
    assert ("agent.created", "audit-test-agent") in actions
    assert ("agent.deleted", "audit-test-agent") in actions


def test_observability_summary_reflects_a_real_run(client, auth_headers):
    resp = client.post("/agents", json={"slug": "obs-test-agent", "name": "Obs Test", "category": "research"}, headers=auth_headers)
    assert resp.status_code == 201

    resp = client.post("/runtime/execute", json={"agent_slug": "obs-test-agent", "goal": "Summarize the market"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"

    resp = client.get("/observability/summary", headers=auth_headers)
    assert resp.status_code == 200
    summary = resp.json()
    assert summary["span_count"] > 0
    assert summary["total_runs"] > 0
    assert "completed" in summary["run_status_counts"]
    assert "obs-test-agent" in summary["per_agent"]
