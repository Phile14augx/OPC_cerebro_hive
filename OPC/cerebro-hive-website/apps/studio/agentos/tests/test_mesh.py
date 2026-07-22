"""Tests for the Agent Mesh — the 'agent' (delegation) and 'agent_vote'
(consensus) workflow node types added to app/core/workflow_engine.py.
These were previously documented as implemented but had no code behind
them; these tests exercise the real thing end to end."""


def _make_agent(client, auth_headers, slug: str, category: str = "research") -> None:
    resp = client.post(
        "/agents",
        json={
            "slug": slug,
            "name": slug.replace("-", " ").title(),
            "category": category,
            "tools": [],
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201, resp.text


def test_agent_node_delegates_to_another_agent(client, auth_headers):
    _make_agent(client, auth_headers, "mesh-worker-a")

    resp = client.post(
        "/workflows",
        json={
            "name": "delegation-test",
            "definition": {
                "start": "n1",
                "nodes": {
                    "n1": {"type": "agent", "agent_slug": "mesh-worker-a", "goal": "Summarize onboarding steps", "next": "n2"},
                    "n2": {"type": "finish", "status": "completed"},
                },
            },
            "context": {},
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["status"] == "completed"
    assert body["context"]["n1_status"] == "completed"
    assert body["context"]["n1_result"]  # the delegated agent's real answer landed in context
    assert body["context"]["n1_run_id"]


def test_agent_vote_reaches_consensus_across_multiple_agents(client, auth_headers):
    _make_agent(client, auth_headers, "mesh-voter-a", category="research")
    _make_agent(client, auth_headers, "mesh-voter-b", category="research")
    _make_agent(client, auth_headers, "mesh-voter-c", category="research")

    resp = client.post(
        "/workflows",
        json={
            "name": "consensus-test",
            "definition": {
                "start": "n1",
                "nodes": {
                    "n1": {
                        "type": "agent_vote",
                        "agent_slugs": ["mesh-voter-a", "mesh-voter-b", "mesh-voter-c"],
                        "goal": "Recommend a rollout plan for a new agent platform",
                        "next": "n2",
                    },
                    "n2": {"type": "finish", "status": "completed"},
                },
            },
            "context": {},
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    ctx = body["context"]
    assert body["status"] == "completed"
    assert ctx["n1_winner_agent"] in {"mesh-voter-a", "mesh-voter-b", "mesh-voter-c"}
    assert 0.0 <= ctx["n1_consensus_score"] <= 1.0
    assert len(ctx["n1_candidates"]) == 3
    assert isinstance(ctx["n1_dissent"], list)


def test_agent_node_pauses_for_sub_agent_approval_and_auto_resumes(client, auth_headers):
    """The delegated agent itself can trip governance. The workflow should
    pause at that node (not silently re-dispatch a fresh sub-run every time
    it's re-stepped), and approving the sub-run's approval should resume the
    *parent* workflow automatically, not just the sub-run in isolation."""
    client.post(
        "/governance/policies",
        json={
            "name": "mesh-finance-approval",
            "description": "Finance-category delegated runs require sign-off.",
            "rule": {"if": {"field": "category", "op": "==", "value": "finance"}, "then": "require_approval"},
        },
        headers=auth_headers,
    )
    _make_agent(client, auth_headers, "mesh-finance-worker", category="finance")

    resp = client.post(
        "/workflows",
        json={
            "name": "mesh-approval-test",
            "definition": {
                "start": "n1",
                "nodes": {
                    "n1": {"type": "agent", "agent_slug": "mesh-finance-worker", "goal": "Reconcile Q3 invoices", "next": "n2"},
                    "n2": {"type": "finish", "status": "completed"},
                },
            },
            "context": {},
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["status"] == "paused"
    sub_run_id = body["context"]["n1_run_id"]
    workflow_run_id = body["id"]

    # Re-stepping the paused workflow before approval must not spawn a second
    # sub-run at the same node.
    resp = client.post(f"/workflows/{workflow_run_id}/resume", headers=auth_headers)
    assert resp.json()["context"]["n1_run_id"] == sub_run_id
    assert resp.json()["status"] == "paused"

    resp = client.get("/governance/approvals?status=pending", headers=auth_headers)
    approvals = [a for a in resp.json() if a["run_id"] == sub_run_id]
    assert len(approvals) == 1

    resp = client.post(
        f"/governance/approvals/{approvals[0]['id']}/decide",
        headers=auth_headers,
        json={"decision": "approve", "decided_by": "phil"},
    )
    assert resp.status_code == 200

    # Approving the sub-run should have auto-resumed the parent workflow —
    # no separate /resume call required.
    resp = client.get(f"/workflows/{workflow_run_id}", headers=auth_headers)
    final = resp.json()
    assert final["status"] == "completed"
    assert final["context"]["n1_status"] == "completed"


def test_agent_node_reports_missing_agent(client, auth_headers):
    resp = client.post(
        "/workflows",
        json={
            "name": "missing-agent-test",
            "definition": {
                "start": "n1",
                "nodes": {
                    "n1": {"type": "agent", "agent_slug": "does-not-exist", "goal": "x", "next": "n2"},
                    "n2": {"type": "finish", "status": "completed"},
                },
            },
            "context": {},
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "failed"
    assert "does-not-exist" in body["context"]["error"]
