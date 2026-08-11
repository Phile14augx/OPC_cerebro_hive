"""OrchestratorAgent — plans, coordinates, and tracks multi-agent execution."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest

_SYSTEM = """\
You are the Orchestrator agent of HiveSwarm, an enterprise multi-agent operating system.

Your role:
- Receive a high-level objective
- Decompose it into concrete, actionable steps
- Assign each step to the appropriate specialist agent capability
- Define dependencies and parallel execution opportunities
- Track progress and coordinate results

Respond in valid JSON with this structure:
{
  "plan": ["step 1", "step 2", ...],
  "agent_assignments": [{"step": 1, "capability": "Research|Coding|Critique", "rationale": "..."}],
  "parallelizable_steps": [1, 3],
  "coordination_strategy": "...",
  "success_criteria": "...",
  "estimated_waves": 2,
  "confidence": 0.0–1.0
}
"""


class OrchestratorAgent(BaseHiveAgent):
    capability = "Planning"
    name = "HiveSwarm Orchestrator"

    def plan(self, req: ExecuteRequest) -> dict[str, Any]:
        prompt = f"""Objective: {req.objective}

Additional context: {json.dumps(req.input, indent=2) if req.input else 'none'}

Produce a coordination plan for this objective. Be concise and actionable."""

        raw = self._call_llm(_SYSTEM, prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {"plan": [raw], "coordination_strategy": "sequential", "confidence": 0.7}

    def execute(self, req: ExecuteRequest, plan: dict[str, Any]) -> dict[str, Any]:
        # The Orchestrator's primary output IS the plan — it coordinates rather than executes
        steps = plan.get("plan", [])
        assignments = plan.get("agent_assignments", [])
        return {
            "coordination_plan": plan,
            "total_steps": len(steps),
            "total_assignments": len(assignments),
            "execution_order": plan.get("agent_assignments", []),
            "estimated_waves": plan.get("estimated_waves", 1),
            "ready_to_dispatch": True,
        }

    def observe(self, req: ExecuteRequest, result: dict[str, Any]) -> dict[str, Any]:
        plan_data = result.get("coordination_plan", {})
        has_plan = bool(plan_data.get("plan"))
        has_assignments = bool(plan_data.get("agent_assignments"))
        quality = 0.9 if (has_plan and has_assignments) else (0.6 if has_plan else 0.3)
        return {
            "hasOutput": has_plan,
            "hasPlan": has_plan,
            "hasAssignments": has_assignments,
            "qualityScore": quality,
            "notes": f"Plan contains {len(plan_data.get('plan', []))} steps.",
        }

    def reflect(self, req: ExecuteRequest, result: dict[str, Any], observation: dict[str, Any]) -> dict[str, Any]:
        return {
            "objectiveClarity": "clear" if observation.get("hasAssignments") else "ambiguous",
            "executionStrategy": "multi_agent_coordination",
            "qualityScore": observation.get("qualityScore", 0.0),
            "suggestions": ["Ensure all capabilities are available before dispatch"],
        }
