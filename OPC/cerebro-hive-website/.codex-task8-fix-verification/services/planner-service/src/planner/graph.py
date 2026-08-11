"""LangGraph decomposition pipeline for goal → TaskDAG.

Graph topology:
  decompose → validate → (fix)? → finalize

State flows through three nodes:
  1. decompose  — LLM produces raw DAG JSON
  2. validate   — structural checks (cycles, orphans, edge refs)
  3. fix        — if validation fails, LLM patches the JSON (max 2 retries)
  4. finalize   — enrich node IDs, compute entry/exit nodes, wrap PlanResponse
"""
from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timezone
from typing import Any

import structlog
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph
from pydantic import BaseModel, Field

from .config import settings
from .models import (
    CapabilityRequirement,
    PlanConstraints,
    PlanResponse,
    TaskBudget,
    TaskDAG,
    TaskEdge,
    TaskNode,
)
from .prompts import DECOMPOSE_HUMAN, DECOMPOSE_SYSTEM, VALIDATE_SYSTEM

log = structlog.get_logger(__name__)

MAX_FIX_RETRIES = 2


# ── LangGraph state ────────────────────────────────────────────────────────────

class PlannerState(BaseModel):
    goal: str
    context: dict[str, Any] = Field(default_factory=dict)
    constraints: PlanConstraints = Field(default_factory=PlanConstraints)
    raw_json: str = ""
    validation_errors: list[str] = Field(default_factory=list)
    fix_attempts: int = 0
    dag: TaskDAG | None = None
    reasoning: str = ""
    confidence: float = 0.0
    warnings: list[str] = Field(default_factory=list)
    llm_tokens_used: int = 0
    tenant_id: str = ""
    user_id: str = ""


# ── LLM factory ───────────────────────────────────────────────────────────────

def _make_llm() -> Any:
    provider = settings.ai_provider
    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=settings.anthropic_model,
            api_key=settings.anthropic_api_key,  # type: ignore[arg-type]
            max_tokens=4096,
            temperature=0,
        )
    elif provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,  # type: ignore[arg-type]
            max_tokens=4096,
            temperature=0,
        )
    else:
        # Mock LLM for testing — returns a minimal valid DAG
        return _MockLLM()


class _MockLLM:
    """Minimal mock returning a single-task DAG for unit tests / offline dev."""

    def invoke(self, messages: list[Any]) -> Any:  # noqa: ARG002
        class _Resp:
            content = json.dumps({
                "nodes": [{
                    "id": "task-research-1",
                    "name": "Research Goal",
                    "description": "Research and summarise information relevant to the goal.",
                    "capability": {"capability": "Research", "min_proficiency": 0.7},
                    "input": {},
                    "priority": "medium",
                    "metadata": {},
                }],
                "edges": [],
                "reasoning": "Single research task sufficient for this goal.",
                "confidence": 0.8,
                "warnings": [],
            })
            usage_metadata = {"input_tokens": 0, "output_tokens": 0}
        return _Resp()


# ── Node helpers ───────────────────────────────────────────────────────────────

def _extract_json(text: str) -> str:
    """Extract JSON from LLM output that may contain markdown fences."""
    fence = re.search(r"```(?:json)?\s*([\s\S]+?)```", text)
    return fence.group(1).strip() if fence else text.strip()


def _validate_raw(data: dict[str, Any]) -> list[str]:
    """Structural validation of raw LLM output (pre-hydration)."""
    errors: list[str] = []
    nodes: list[dict[str, Any]] = data.get("nodes", [])
    edges: list[dict[str, Any]] = data.get("edges", [])
    node_ids = {n.get("id") for n in nodes}

    if not nodes:
        errors.append("DAG has no nodes.")
    for edge in edges:
        src, tgt = edge.get("source"), edge.get("target")
        if src not in node_ids:
            errors.append(f"Edge source '{src}' not in nodes.")
        if tgt not in node_ids:
            errors.append(f"Edge target '{tgt}' not in nodes.")
        if edge.get("type") == "conditional" and not edge.get("condition"):
            errors.append(f"Conditional edge {src}→{tgt} missing 'condition'.")

    # Cycle detection (DFS colouring)
    adj: dict[str, list[str]] = {n.get("id", ""): [] for n in nodes}
    for e in edges:
        adj.get(e.get("source", ""), []).append(e.get("target", ""))  # type: ignore[union-attr]
    colour: dict[str, str] = {}

    def dfs(node: str) -> bool:
        if colour.get(node) == "grey":
            return True
        if colour.get(node) == "black":
            return False
        colour[node] = "grey"
        for nxt in adj.get(node, []):
            if dfs(nxt):
                return True
        colour[node] = "black"
        return False

    for nid in adj:
        if nid not in colour and dfs(nid):
            errors.append("DAG contains a cycle.")
            break

    return errors


def _hydrate_dag(data: dict[str, Any], tenant_id: str) -> TaskDAG:
    """Convert raw LLM dict into a typed TaskDAG."""
    raw_nodes: list[dict[str, Any]] = data.get("nodes", [])
    raw_edges: list[dict[str, Any]] = data.get("edges", [])

    node_ids = {n["id"] for n in raw_nodes}

    # Compute entry nodes (no incoming edges)
    targets = {e["target"] for e in raw_edges}
    entry_nodes = [n["id"] for n in raw_nodes if n["id"] not in targets]

    # Compute exit nodes (no outgoing edges)
    sources = {e["source"] for e in raw_edges}
    exit_nodes = [n["id"] for n in raw_nodes if n["id"] not in sources]

    nodes = [
        TaskNode(
            id=n["id"],
            name=n.get("name", n["id"]),
            description=n.get("description", ""),
            capability=CapabilityRequirement(
                capability=n["capability"]["capability"],  # type: ignore[arg-type]
                min_proficiency=n["capability"].get("min_proficiency"),
            ),
            input=n.get("input", {}),
            budget=TaskBudget(max_cost_usd=n["budget"]["max_cost_usd"]) if n.get("budget") else None,
            priority=n.get("priority", "medium"),  # type: ignore[arg-type]
            metadata=n.get("metadata", {}),
        )
        for n in raw_nodes
    ]

    edges = [
        TaskEdge(
            source=e["source"],
            target=e["target"],
            type=e.get("type", "sequential"),  # type: ignore[arg-type]
            condition=e.get("condition"),
            dynamic_input_template=e.get("dynamic_input_template"),
        )
        for e in raw_edges
        if e.get("source") in node_ids and e.get("target") in node_ids
    ]

    return TaskDAG(
        id=f"dag-{uuid.uuid4().hex[:12]}",
        name="Generated Plan",
        version=1,
        nodes=nodes,
        edges=edges,
        entry_nodes=entry_nodes or [raw_nodes[0]["id"]],
        exit_nodes=exit_nodes or [raw_nodes[-1]["id"]],
        default_priority="medium",
        created_at=datetime.now(timezone.utc).isoformat(),
        metadata={"tenant_id": tenant_id},
    )


# ── Graph nodes ────────────────────────────────────────────────────────────────

def make_decompose_node(llm: Any):  # type: ignore[return]
    def decompose(state: PlannerState) -> dict[str, Any]:
        c = state.constraints
        system_prompt = DECOMPOSE_SYSTEM.format(max_tasks=c.max_tasks)
        human_prompt = DECOMPOSE_HUMAN.format(
            goal=state.goal,
            max_tasks=c.max_tasks,
            max_cost_usd=c.max_cost_usd or "unlimited",
            require_approval=", ".join(c.require_human_approval_for) or "none",
            preferred_capabilities=", ".join(c.preferred_capabilities) or "any",
            deadline=c.deadline_iso or "none",
            context=json.dumps(state.context, indent=2) if state.context else "{}",
        )
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt),
        ])
        tokens = 0
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            tokens = (
                response.usage_metadata.get("input_tokens", 0)
                + response.usage_metadata.get("output_tokens", 0)
            )
        raw = _extract_json(response.content)
        log.debug("planner.decompose", raw_length=len(raw))
        return {"raw_json": raw, "llm_tokens_used": state.llm_tokens_used + tokens}
    return decompose


def validate_node(state: PlannerState) -> dict[str, Any]:
    try:
        data = json.loads(state.raw_json)
    except json.JSONDecodeError as exc:
        return {"validation_errors": [f"Invalid JSON: {exc}"]}
    errors = _validate_raw(data)
    return {"validation_errors": errors}


def make_fix_node(llm: Any):  # type: ignore[return]
    def fix(state: PlannerState) -> dict[str, Any]:
        prompt = (
            f"Original DAG JSON:\n{state.raw_json}\n\n"
            f"Validation errors:\n" + "\n".join(f"- {e}" for e in state.validation_errors)
        )
        response = llm.invoke([
            SystemMessage(content=VALIDATE_SYSTEM),
            HumanMessage(content=prompt),
        ])
        tokens = 0
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            tokens = (
                response.usage_metadata.get("input_tokens", 0)
                + response.usage_metadata.get("output_tokens", 0)
            )
        raw = _extract_json(response.content)
        return {
            "raw_json": raw,
            "fix_attempts": state.fix_attempts + 1,
            "llm_tokens_used": state.llm_tokens_used + tokens,
        }
    return fix


def finalize_node(state: PlannerState) -> dict[str, Any]:
    try:
        data = json.loads(state.raw_json)
    except json.JSONDecodeError:
        data = {"nodes": [], "edges": []}

    dag = _hydrate_dag(data, state.tenant_id)
    reasoning = data.get("reasoning", "")
    confidence = float(data.get("confidence", 0.6))
    warnings = list(data.get("warnings", []))

    if state.validation_errors:
        warnings.append(f"Produced with {len(state.validation_errors)} unresolved warnings.")
        confidence = max(0.1, confidence - 0.2)

    return {
        "dag": dag,
        "reasoning": reasoning,
        "confidence": confidence,
        "warnings": warnings,
    }


# ── Routing conditions ─────────────────────────────────────────────────────────

def should_fix(state: PlannerState) -> str:
    if state.validation_errors and state.fix_attempts < MAX_FIX_RETRIES:
        return "fix"
    return "finalize"


# ── Graph factory & singleton ──────────────────────────────────────────────────

_compiled_graph: Any = None


def build_planner_graph(llm: Any | None = None) -> Any:
    """Build and compile the LangGraph planner. Call once at startup."""
    if llm is None:
        llm = _make_llm()

    graph: StateGraph = StateGraph(PlannerState)

    graph.add_node("decompose", make_decompose_node(llm))
    graph.add_node("validate", validate_node)
    graph.add_node("fix", make_fix_node(llm))
    graph.add_node("finalize", finalize_node)

    graph.set_entry_point("decompose")
    graph.add_edge("decompose", "validate")
    graph.add_conditional_edges("validate", should_fix, {"fix": "fix", "finalize": "finalize"})
    graph.add_edge("fix", "validate")
    graph.add_edge("finalize", END)

    return graph.compile()


def get_compiled_graph() -> Any:
    """Return the module-level singleton, building it on first call."""
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_planner_graph()
    return _compiled_graph


async def run_planner(
    goal: str,
    context: dict[str, Any],
    constraints: PlanConstraints,
    tenant_id: str,
    user_id: str,
    llm: Any | None = None,
) -> PlanResponse:
    """Run the LangGraph planner and return a PlanResponse.

    Re-uses the module-level compiled graph.  Pass `llm` only in tests.
    """
    compiled = get_compiled_graph() if llm is None else build_planner_graph(llm)

    initial_dict = PlannerState(
        goal=goal,
        context=context,
        constraints=constraints,
        tenant_id=tenant_id,
        user_id=user_id,
    ).model_dump()

    # LangGraph returns the final state as a dict (or PlannerState depending on version)
    result = await compiled.ainvoke(initial_dict)
    if isinstance(result, dict):
        final = PlannerState.model_validate(result)
    else:
        final = result  # type: ignore[assignment]

    if final.dag is None:
        raise RuntimeError("Planner produced no DAG.")
    return PlanResponse(
        dag=final.dag,
        confidence=final.confidence,
        reasoning=final.reasoning,
        warnings=final.warnings,
        llm_tokens_used=final.llm_tokens_used,
    )
