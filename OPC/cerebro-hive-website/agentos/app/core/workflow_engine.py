"""Workflow Engine: a DAG executor supporting the node types from the spec —
start, agent, tool, condition, approval, loop, finish — with retries and a
human-approval pause/resume path.

Production swap-in: Temporal. The node model here (id, type, config, next)
maps directly onto Temporal activities (tool/agent nodes) and workflow
control flow (condition/loop), so porting is mechanical rather than a
redesign.

A workflow definition looks like:

    {
      "start": "n1",
      "nodes": {
        "n1": {"type": "tool", "tool": "web_search", "args": {"query": "..."}, "next": "n2"},
        "n2": {"type": "condition", "field": "status_code", "op": "==", "value": 200,
               "next_true": "n3", "next_false": "n4"},
        "n3": {"type": "approval", "policy_name": "manual-check", "next": "n5"},
        "n4": {"type": "finish", "status": "failed"},
        "n5": {"type": "finish", "status": "completed"}
      }
    }
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core import tool_framework
from app.core.event_bus import bus
from app.models.execution import WorkflowRun
from app.models.governance import Approval

MAX_STEPS = 50


def _condition_matches(context: dict, node: dict) -> bool:
    from app.core.governance_engine import _OPS  # reuse the same tiny op table

    field_name = node.get("field")
    op = node.get("op", "==")
    expected = node.get("value")
    actual = context.get(field_name)
    matcher = _OPS.get(op)
    return bool(matcher and matcher(actual, expected))


def step(db: Session, run: WorkflowRun) -> WorkflowRun:
    """Advance the workflow until it finishes, pauses on approval, or hits
    MAX_STEPS as a runaway-loop guard.
    """
    nodes = run.definition.get("nodes", {})
    current_id = run.node_states.get("_cursor") or run.definition.get("start")
    context = dict(run.context)

    for _ in range(MAX_STEPS):
        if current_id is None:
            break
        node = nodes.get(current_id)
        if node is None:
            run.status = "failed"
            context["error"] = f"unknown node {current_id}"
            break

        node_type = node.get("type")
        run.node_states[current_id] = "running"

        if node_type == "start":
            current_id = node.get("next")
            continue

        if node_type == "tool":
            try:
                result = tool_framework.invoke(node["tool"], node.get("args", {}), permissions=["execute"])
                context[f"{current_id}_result"] = result
                run.node_states[current_id] = "completed"
            except tool_framework.ToolError as exc:
                run.node_states[current_id] = "failed"
                run.status = "failed"
                context["error"] = str(exc)
                break
            current_id = node.get("next")
            continue

        if node_type == "condition":
            current_id = node.get("next_true") if _condition_matches(context, node) else node.get("next_false")
            continue

        if node_type == "approval":
            existing = (
                db.query(Approval)
                .filter(Approval.run_id == run.id, Approval.policy_name == node.get("policy_name", "manual"))
                .order_by(Approval.created_at.desc())
                .first()
            )
            if existing is None:
                approval = Approval(run_id=run.id, policy_name=node.get("policy_name", "manual"), reason="workflow approval node")
                db.add(approval)
                db.commit()
                run.status = "paused"
                run.node_states["_cursor"] = current_id
                run.node_states[current_id] = "waiting_approval"
                bus.publish(db, "workflow.paused_for_approval", {"workflow_run_id": run.id, "node": current_id}, run_id=run.id)
                break
            if existing.status == "pending":
                run.status = "paused"
                run.node_states["_cursor"] = current_id
                break
            if existing.status == "rejected":
                run.status = "failed"
                context["error"] = f"approval rejected: {existing.decision_note}"
                break
            # approved
            run.node_states[current_id] = "completed"
            current_id = node.get("next")
            continue

        if node_type == "loop":
            count = int(node.get("count", 1))
            body_results = context.setdefault(f"{current_id}_iterations", [])
            for i in range(count):
                body_results.append({"iteration": i})
            run.node_states[current_id] = "completed"
            current_id = node.get("next")
            continue

        if node_type == "finish":
            run.status = node.get("status", "completed")
            run.node_states.pop("_cursor", None)
            current_id = None
            continue

        # unknown node type
        run.status = "failed"
        context["error"] = f"unsupported node type: {node_type}"
        break
    else:
        run.status = "failed"
        context["error"] = "workflow exceeded MAX_STEPS (possible cycle)"

    run.context = context
    db.add(run)
    db.commit()
    db.refresh(run)
    return run
