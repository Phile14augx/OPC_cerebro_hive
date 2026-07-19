import json
import re
from dataclasses import dataclass, field

from app.core.cerebro_x import gateway

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


def _fallback_plan(goal: str, available_tools: list[str] | None = None) -> list[PlanStep]:
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


def decompose(goal: str, strategy: str = "chain_of_thought", available_tools: list[str] | None = None) -> list[PlanStep]:
    """Break a goal into an ordered plan using Cerebro X AI Gateway."""
    
    system_prompt = (
        "You are an expert AI planner. Break the user's goal down into a sequence of discrete steps. "
        "Available tools: " + (", ".join(available_tools) if available_tools else "None") + ". "
        "Respond ONLY with a JSON array of steps, where each step is an object with: "
        "'id' (e.g. s1), 'description', 'kind' (reason|tool|approval), 'tool' (tool name if kind=tool, else null), "
        "and 'depends_on' (list of step ids this step depends on)."
    )
    
    try:
        resp = gateway.complete(system=system_prompt, prompt=goal)
        # Try to parse the LLM's JSON response
        text = resp.text
        # Strip markdown code blocks if any
        text = re.sub(r"^```(?:json)?", "", text)
        text = re.sub(r"```$", "", text)
        text = text.strip()
        
        parsed = json.loads(text)
        if not isinstance(parsed, list):
            raise ValueError("Expected a list of steps")
        
        steps = []
        for step in parsed:
            steps.append(PlanStep(
                id=step["id"],
                description=step["description"],
                kind=step.get("kind", "reason"),
                tool=step.get("tool"),
                depends_on=step.get("depends_on", [])
            ))
        return steps
    except Exception:
        # Fall back to deterministic CoT if parsing fails or LLM is a mock
        return _fallback_plan(goal, available_tools)


def plan_to_dicts(steps: list[PlanStep]) -> list[dict]:
    return [
        {"id": s.id, "description": s.description, "kind": s.kind, "tool": s.tool, "depends_on": s.depends_on}
        for s in steps
    ]
