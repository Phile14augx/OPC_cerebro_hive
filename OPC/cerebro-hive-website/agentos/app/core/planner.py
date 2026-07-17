"""Planner Engine: Goal -> Task Decomposition -> Dependency Graph -> Execution
Plan -> Scheduling.

`decompose` implements Chain-of-Thought by default (a small, deterministic,
linear breakdown that works with the mock provider and any real LLM). The
`strategy` parameter is a real switch — Tree/Graph-of-Thought and replanning
are named hooks so the runtime and API already speak the full vocabulary from
the spec; only their internal search is a stub pending a production LLM
budget for branching search.
"""

from __future__ import annotations

from dataclasses import dataclass, field

STRATEGIES = (
    "chain_of_thought",
    "tree_of_thought",
    "graph_of_thought",
    "hierarchical_task_network",
)


@dataclass
class PlanStep:
    id: str
    description: str
    kind: str = "reason"  # reason | tool | approval
    tool: str | None = None
    depends_on: list[str] = field(default_factory=list)


def decompose(goal: str, strategy: str = "chain_of_thought", available_tools: list[str] | None = None) -> list[PlanStep]:
    """Break a goal into an ordered plan.

    Chain-of-thought (default): understand -> retrieve context -> reason ->
    (optionally act with a tool) -> synthesize -> self-critique.

    Tree/Graph-of-Thought and HTN strategies currently fall back to the same
    linear decomposition — the step `kind`/`tool` fields and the runtime that
    executes them are strategy-agnostic, so swapping in real branching search
    later doesn't change the execution contract.
    """
    available_tools = available_tools or []
    steps = [
        PlanStep(id="s1", description=f"Understand the goal: {goal}", kind="reason"),
        PlanStep(id="s2", description="Retrieve relevant memory and knowledge", kind="reason", depends_on=["s1"]),
    ]

    if available_tools:
        steps.append(
            PlanStep(
                id="s3",
                description=f"Use tool `{available_tools[0]}` to gather/act on information",
                kind="tool",
                tool=available_tools[0],
                depends_on=["s2"],
            )
        )
        reason_depends = "s3"
    else:
        reason_depends = "s2"

    steps.append(PlanStep(id="s4", description="Reason over gathered context to form an answer", kind="reason", depends_on=[reason_depends]))
    steps.append(PlanStep(id="s5", description="Self-critique and synthesize the final response", kind="reason", depends_on=["s4"]))

    return steps


def plan_to_dicts(steps: list[PlanStep]) -> list[dict]:
    return [
        {"id": s.id, "description": s.description, "kind": s.kind, "tool": s.tool, "depends_on": s.depends_on}
        for s in steps
    ]
