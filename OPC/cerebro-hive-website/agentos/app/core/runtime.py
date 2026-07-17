"""Agent Runtime: the kernel. Boot agent -> load memory/skills/tools ->
receive task -> plan -> execute -> evaluate -> store results -> notify.

Runtime states walked through here match the spec exactly: idle -> thinking ->
planning -> executing -> waiting -> calling_tool -> reflecting -> completed
(or failed). Governance runs *before* any step executes, so a run that needs
a human approval never calls a tool or an LLM until it's been signed off.
"""

from __future__ import annotations

from app.core import context_engine, evaluation, governance_engine, llm_gateway, memory_engine, observability, planner, tool_framework
from app.core.event_bus import bus
from app.models.execution import Run
from app.models.governance import Approval, AuditLog
from app.models.observability import MetricEvent, TraceSpan
from app.models.registry import Agent


def execute(db, agent: Agent, goal: str) -> Run:
    run = Run(agent_id=agent.id, goal=goal, status="thinking")
    db.add(run)
    db.commit()
    db.refresh(run)

    agent.lifecycle_state = "thinking"
    db.commit()
    bus.publish(db, "run.started", {"agent_id": agent.id, "goal": goal}, run_id=run.id)

    context = {"category": agent.category, "goal": goal, "agent_slug": agent.slug}
    decisions = governance_engine.evaluate(db, context)
    blocking = [d for d in decisions if d.action == "block"]
    approvals_needed = [d for d in decisions if d.action == "require_approval"]

    if blocking:
        run.status = "failed"
        run.error = f"blocked by policy: {blocking[0].policy_name} ({blocking[0].reason})"
        agent.lifecycle_state = "failed"
        db.commit()
        bus.publish(db, "run.blocked", {"policy": blocking[0].policy_name}, run_id=run.id)
        db.add(AuditLog(actor=agent.slug, action="run.blocked", target=run.id, meta={"policy_name": blocking[0].policy_name, "reason": blocking[0].reason}))
        db.commit()
        return run

    if approvals_needed:
        run.status = "pending_approval"
        agent.lifecycle_state = "waiting"
        db.commit()
        for decision in approvals_needed:
            db.add(Approval(run_id=run.id, policy_name=decision.policy_name, reason=decision.reason))
        db.commit()
        bus.publish(
            db,
            "run.pending_approval",
            {"policies": [d.policy_name for d in approvals_needed]},
            run_id=run.id,
        )
        return run

    return _execute_steps(db, agent, run, goal)


def resume_after_approval(db, run: Run) -> Run:
    agent = db.query(Agent).filter(Agent.id == run.agent_id).first()
    if agent is None:
        run.status = "failed"
        run.error = "agent no longer exists"
        db.commit()
        return run
    return _execute_steps(db, agent, run, run.goal)


def _execute_steps(db, agent: Agent, run: Run, goal: str) -> Run:
    run.status = "planning"
    agent.lifecycle_state = "planning"
    db.commit()

    with observability.span(db, run.id, "planner"):
        steps = planner.decompose(goal, strategy=agent.reasoning_profile, available_tools=agent.tools)
    run.plan = planner.plan_to_dicts(steps)
    db.commit()

    run.status = "executing"
    agent.lifecycle_state = "executing"
    db.commit()

    final_text = ""
    completed_ids: list[str] = []

    for pstep in steps:
        if pstep.kind == "tool" and pstep.tool:
            agent.lifecycle_state = "calling_tool"
            db.commit()
            with observability.span(db, run.id, f"tool:{pstep.tool}", {"step": pstep.id}):
                try:
                    result = tool_framework.invoke(pstep.tool, {"query": goal}, permissions=["execute"])
                    memory_engine.remember(
                        db, agent.id, tool_framework.to_json_safe(result), tier="working", run_id=run.id, meta={"step": pstep.id}
                    )
                except tool_framework.ToolError as exc:
                    memory_engine.remember(
                        db, agent.id, f"tool error: {exc}", tier="working", run_id=run.id, meta={"step": pstep.id, "error": True}
                    )
        else:
            agent.lifecycle_state = "thinking"
            db.commit()
            with observability.span(db, run.id, "context_engine", {"step": pstep.id}):
                bundle = context_engine.assemble(db, agent, goal)
            if bundle.applicable_policies:
                observability.record_metric(db, "context_policies_in_scope", len(bundle.applicable_policies), run_id=run.id)
            system_prompt = f"You are {agent.name}, an AgentOS agent. {agent.description}".strip()
            user_prompt = f"Step: {pstep.description}\nGoal: {goal}\nContext so far: {bundle.assembled_text}"

            with observability.span(db, run.id, f"llm:{pstep.id}", {"step": pstep.id}):
                response = llm_gateway.gateway.complete(
                    system=system_prompt, prompt=user_prompt, model=agent.llm_model, temperature=agent.temperature
                )

            memory_engine.remember(db, agent.id, response.text, tier="working", run_id=run.id, meta={"step": pstep.id})
            observability.record_metric(db, "tokens", response.input_tokens + response.output_tokens, run_id=run.id)
            observability.record_metric(db, "cost_usd", response.cost_usd, run_id=run.id)
            final_text = response.text

        completed_ids.append(pstep.id)
        run.steps_completed = completed_ids
        db.commit()

    run.status = "reflecting"
    agent.lifecycle_state = "reflecting"
    db.commit()

    trace_durations = [t.duration_ms for t in db.query(TraceSpan).filter(TraceSpan.run_id == run.id).all()]
    total_cost = sum(
        m.value for m in db.query(MetricEvent).filter(MetricEvent.run_id == run.id, MetricEvent.name == "cost_usd").all()
    )
    eval_result = evaluation.evaluate_run(final_text, trace_durations, total_cost)
    observability.record_metric(db, "reasoning_quality", eval_result.reasoning_quality, run_id=run.id)
    observability.record_metric(db, "groundedness", eval_result.groundedness, run_id=run.id)

    run.result = final_text
    run.status = "completed"
    agent.lifecycle_state = "completed"
    db.commit()
    db.refresh(run)

    bus.publish(db, "run.completed", {"agent_id": agent.id, "result_preview": final_text[:200]}, run_id=run.id)
    return run
