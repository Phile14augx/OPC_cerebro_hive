from fastapi.testclient import TestClient


def test_health(client: TestClient):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_auth_requires_bearer_token(client: TestClient):
    resp = client.get("/agents")
    assert resp.status_code == 401


def test_agent_registry_crud(client: TestClient, auth_headers: dict):
    resp = client.post(
        "/agents",
        headers=auth_headers,
        json={"slug": "test-agent", "name": "Test Agent", "description": "A smoke-test agent.", "category": "general"},
    )
    assert resp.status_code == 201
    agent = resp.json()
    assert agent["slug"] == "test-agent"
    assert agent["lifecycle_state"] == "idle"

    resp = client.get("/agents/test-agent", headers=auth_headers)
    assert resp.status_code == 200

    resp = client.get("/agents", headers=auth_headers)
    assert any(a["slug"] == "test-agent" for a in resp.json())


def test_runtime_executes_a_goal_end_to_end(client: TestClient, auth_headers: dict):
    client.post(
        "/agents",
        headers=auth_headers,
        json={"slug": "researcher", "name": "Researcher", "description": "Researches things.", "category": "research", "tools": ["web_search"]},
    )

    resp = client.post(
        "/runtime/execute",
        headers=auth_headers,
        json={"agent_slug": "researcher", "goal": "Summarize the enterprise agent platform landscape"},
    )
    assert resp.status_code == 200
    run = resp.json()
    assert run["status"] == "completed"
    assert run["result"]
    assert len(run["plan"]) >= 4
    assert len(run["steps_completed"]) == len(run["plan"])

    # It should have left a trace behind.
    resp = client.get(f"/observability/traces?run_id={run['id']}", headers=auth_headers)
    assert resp.status_code == 200
    spans = resp.json()
    assert len(spans) > 0
    assert any(s["name"] == "planner" for s in spans)

    # And memory.
    resp = client.get(f"/memory?agent_id={run['agent_id']}&q=agent+platform", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) > 0


def test_governance_blocks_until_approved(client: TestClient, auth_headers: dict):
    client.post(
        "/governance/policies",
        headers=auth_headers,
        json={
            "name": "finance-approval-test",
            "description": "Finance runs need a human sign-off.",
            "rule": {"if": {"field": "category", "op": "==", "value": "finance"}, "then": "require_approval"},
        },
    )
    client.post(
        "/agents",
        headers=auth_headers,
        json={"slug": "finance-bot", "name": "Finance Bot", "description": "Handles money.", "category": "finance"},
    )

    resp = client.post(
        "/runtime/execute",
        headers=auth_headers,
        json={"agent_slug": "finance-bot", "goal": "Reconcile last month's vendor invoices"},
    )
    assert resp.status_code == 200
    run = resp.json()
    assert run["status"] == "pending_approval"

    resp = client.get("/governance/approvals?status=pending", headers=auth_headers)
    approvals = [a for a in resp.json() if a["run_id"] == run["id"]]
    assert len(approvals) == 1
    approval_id = approvals[0]["id"]

    resp = client.post(
        f"/governance/approvals/{approval_id}/decide",
        headers=auth_headers,
        json={"decision": "approve", "decided_by": "phil", "note": "looks fine"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "approved"

    resp = client.get(f"/runtime/runs/{run['id']}", headers=auth_headers)
    assert resp.json()["status"] == "completed"


def test_knowledge_ingest_and_search(client: TestClient, auth_headers: dict):
    resp = client.post(
        "/knowledge/documents",
        headers=auth_headers,
        json={"title": "AgentOS Overview", "content": "AgentOS is an enterprise operating system for AI agents with memory and governance."},
    )
    assert resp.status_code == 201

    resp = client.get("/knowledge/search?q=governance+for+agents", headers=auth_headers)
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) > 0
    assert results[0]["document_title"] == "AgentOS Overview"


def test_tool_invoke(client: TestClient, auth_headers: dict):
    resp = client.post(
        "/tools/python_eval/invoke",
        headers=auth_headers,
        json={"args": {"code": "result = sum([1, 2, 3])\nprint(result)"}},
    )
    assert resp.status_code == 200
    assert "6" in resp.json()["stdout"]


def test_workflow_dag_executes(client: TestClient, auth_headers: dict):
    definition = {
        "start": "n1",
        "nodes": {
            "n1": {"type": "start", "next": "n2"},
            "n2": {"type": "tool", "tool": "python_eval", "args": {"code": "print('hello from workflow')"}, "next": "n3"},
            "n3": {"type": "finish", "status": "completed"},
        },
    }
    resp = client.post("/workflows", headers=auth_headers, json={"name": "smoke-workflow", "definition": definition})
    assert resp.status_code == 201
    assert resp.json()["status"] == "completed"


def test_marketplace_install(client: TestClient, auth_headers: dict):
    client.post(
        "/agents",
        headers=auth_headers,
        json={"slug": "template-source", "name": "Template Source", "description": "x", "category": "general"},
    )
    # Register the template directly against the DB via API isn't exposed for
    # creation (templates are seeded), so this just verifies the endpoint
    # shape when the store is empty.
    resp = client.get("/marketplace/templates", headers=auth_headers)
    assert resp.status_code == 200
