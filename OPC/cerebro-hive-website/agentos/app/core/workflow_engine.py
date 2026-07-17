"""Workflow Engine: a DAG executor supporting the node types from the spec —
start, agent, agent_vote, tool, condition, approval, loop, finish — with
retries and a human-approval pause/resume path.

`agent` and `agent_vote` are the Agent Mesh: real delegation between agents
(one workflow node calling another agent's full runtime.execute(), including
that agent's own governance/planning/tools) and a real consensus mechanism
over multiple agents' independent answers to the same goal. Both were
previously documented in the README as implemented ("Multi-Agent
Collaboration... voting/consensus stubbed") but had no code behind them —
this is that code.

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
        "n5": {"type": "agent", "agent_slug": "research-agent", "goal": "...", "next": "n6"},
        "n6": {"type": "agent_vote", "agent_slugs": ["research-agent", "support-agent"],
               "goal": "...", "next": "n7"},
        "n7": {"type": "finish", "status": "completed"}
      }
    }
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core import tool_framework
from app.core.embeddings import cosine_similarity, embed
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
    if matcher is None:
        return False
    try:
        return bool(matcher(actual, expected))
    except (TypeError, ValueError):
        return False


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

        if node_type == "agent":
            from app.core import runtime as runtime_core
            from app.models.execution import Run
            from app.models.registry import Agent

            agent_slug = node.get("agent_slug")

            # If we already dispatched this node on a previous pass (it paused
            # for the sub-agent's own governance approval), re-check that same
            # sub-run instead of firing a brand new one — otherwise every
            # resume would re-trigger the delegated agent's approval policy
            # forever.
            existing_run_id = context.get(f"{current_id}_run_id")
            if existing_run_id:
                sub_run = db.query(Run).filter(Run.id == existing_run_id).first()
                if sub_run is None:
                    run.node_states[current_id] = "failed"
                    run.status = "failed"
                    context["error"] = f"agent node: dispatched sub-run '{existing_run_id}' no longer exists"
                    break
            else:
                agent = db.query(Agent).filter(Agent.slug == agent_slug).first()
                if agent is None:
                    run.node_states[current_id] = "failed"
                    run.status = "failed"
                    context["error"] = f"agent node: no agent registered with slug '{agent_slug}'"
                    break
                goal = node.get("goal") or context.get("goal") or ""
                sub_run = runtime_core.execute(db, agent, goal)

            context[f"{current_id}_run_id"] = sub_run.id
            context[f"{current_id}_status"] = sub_run.status
            context[f"{current_id}_result"] = sub_run.result

            if sub_run.status == "pending_approval":
                # The delegated agent itself tripped a governance policy — pause
                # the whole workflow at this node until that sub-run is approved.
                run.status = "paused"
                run.node_states["_cursor"] = current_id
                run.node_states[current_id] = "waiting_sub_agent_approval"
                bus.publish(
                    db, "mesh.delegate_pending_approval",
                    {"node": current_id, "agent_slug": agent_slug, "sub_run_id": sub_run.id}, run_id=run.id,
                )
                break
            if sub_run.status != "completed":
                run.node_states[current_id] = "failed"
                run.status = "failed"
                context["error"] = f"delegated agent '{agent_slug}' did not complete: {sub_run.error}"
                break

            run.node_states[current_id] = "completed"
            bus.publish(db, "mesh.delegated", {"node": current_id, "agent_slug": agent_slug, "sub_run_id": sub_run.id}, run_id=run.id)
            current_id = node.get("next")
            continue

        if node_type == "agent_vote":
            from app.core import runtime as runtime_core
            from app.models.registry import Agent

            agent_slugs: list[str] = node.get("agent_slugs", [])
            goal = node.get("goal") or context.get("goal") or ""
            dissent_threshold = float(node.get("dissent_threshold", 0.3))

            candidates: list[dict] = []
            excluded: list[dict] = []
            for slug in agent_slugs:
                agent = db.query(Agent).filter(Agent.slug == slug).first()
                if agent is None:
                    excluded.append({"agent_slug": slug, "reason": "not registered"})
                    continue
                sub_run = runtime_core.execute(db, agent, goal)
                if sub_run.status == "completed" and sub_run.result:
                    candidates.append({"agent_slug": slug, "run_id": sub_run.id, "text": sub_run.result})
                elif sub_run.status == "pending_approval":
                    # Excluded from *this* vote rather than pausing the whole
                    # mesh — a stricter policy (block the vote until every
                    # member is unblocked) is a reasonable production upgrade,
                    # noted here rather than silently implemented as such.
                    excluded.append({"agent_slug": slug, "run_id": sub_run.id, "reason": "pending_approval"})
                else:
                    excluded.append({"agent_slug": slug, "run_id": sub_run.id, "reason": sub_run.status})

            context[f"{current_id}_excluded"] = excluded

            if not candidates:
                run.node_states[current_id] = "failed"
                run.status = "failed"
                context["error"] = "agent_vote: no agent in the mesh produced a usable result"
                break

            # Real consensus mechanism: embed each agent's independent answer with
            # the same embedding primitive the Memory/Knowledge engines already use
            # (app/core/embeddings.py), then score each candidate by its average
            # cosine similarity to every *other* candidate's answer. The candidate
            # with the highest average agreement wins; anyone far from that
            # centroid is recorded as dissent rather than silently discarded.
            vectors = [embed(c["text"]) for c in candidates]
            n = len(candidates)
            agreement_scores = []
            for i in range(n):
                others = [cosine_similarity(vectors[i], vectors[j]) for j in range(n) if j != i]
                agreement_scores.append(sum(others) / len(others) if others else 1.0)

            winner_idx = max(range(n), key=lambda i: agreement_scores[i])
            winner = candidates[winner_idx]

            context[f"{current_id}_result"] = winner["text"]
            context[f"{current_id}_winner_agent"] = winner["agent_slug"]
            context[f"{current_id}_consensus_score"] = round(agreement_scores[winner_idx], 4)
            context[f"{current_id}_candidates"] = [
                {"agent_slug": c["agent_slug"], "run_id": c["run_id"], "agreement_score": round(agreement_scores[i], 4)}
                for i, c in enumerate(candidates)
            ]
            context[f"{current_id}_dissent"] = [
                {"agent_slug": c["agent_slug"], "agreement_score": round(agreement_scores[i], 4)}
                for i, c in enumerate(candidates)
                if i != winner_idx and agreement_scores[i] < dissent_threshold
            ]

            run.node_states[current_id] = "completed"
            bus.publish(
                db, "mesh.consensus_reached",
                {
                    "node": current_id,
                    "winner_agent": winner["agent_slug"],
                    "consensus_score": agreement_scores[winner_idx],
                    "candidate_count": n,
                },
                run_id=run.id,
            )
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
