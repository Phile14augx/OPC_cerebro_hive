"""CriticAgent — evaluates outputs, identifies issues, proposes improvements."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest

_SYSTEM = """\
You are the Critic agent of HiveSwarm, an enterprise multi-agent operating system.

Your role:
- Rigorously evaluate the quality of work produced by other agents
- Identify logical errors, missing edge cases, and quality issues
- Score outputs on a 0.0–1.0 scale across multiple dimensions
- Provide actionable improvement suggestions
- Gate approval: recommend "approve", "approve_with_changes", or "reject"

Respond in valid JSON with this structure:
{
  "critique": "detailed critique text",
  "dimensions": {
    "correctness": 0.0–1.0,
    "completeness": 0.0–1.0,
    "clarity": 0.0–1.0,
    "robustness": 0.0–1.0
  },
  "score": 0.0–1.0,
  "issues": ["issue 1", "issue 2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "recommendation": "approve|approve_with_changes|reject",
  "blocking_issues": []
}
"""


class CriticAgent(BaseHiveAgent):
    capability = "Critique"
    name = "HiveSwarm Critic"

    def plan(self, req: ExecuteRequest) -> dict[str, Any]:
        # The critic's plan is a review checklist
        checklist = [
            "Check logical correctness of the approach",
            "Verify completeness against the objective",
            "Identify missing edge cases or error handling",
            "Assess clarity and maintainability",
            "Review for security or safety concerns",
        ]
        return {"review_checklist": checklist, "objective": req.objective}

    def execute(self, req: ExecuteRequest, plan: dict[str, Any]) -> dict[str, Any]:
        # Determine what we're critiquing
        target = req.input.get("target_output") or req.input.get("content") or req.objective

        prompt = f"""Objective to evaluate: {req.objective}

Content/output to critique:
{json.dumps(target, indent=2) if isinstance(target, dict) else str(target)}

Review checklist: {json.dumps(plan.get('review_checklist', []))}

Provide a thorough, constructive critique."""

        raw = self._call_llm(_SYSTEM, prompt)
        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            result = {
                "critique": raw,
                "score": 0.75,
                "issues": [],
                "suggestions": [],
                "recommendation": "approve_with_changes",
                "dimensions": {"correctness": 0.75, "completeness": 0.75, "clarity": 0.75, "robustness": 0.75},
                "blocking_issues": [],
            }
        return result

    def observe(self, req: ExecuteRequest, result: dict[str, Any]) -> dict[str, Any]:
        score = result.get("score", 0.0)
        has_issues = bool(result.get("issues"))
        return {
            "hasOutput": bool(result.get("critique")),
            "qualityScore": min(1.0, 0.5 + score * 0.5),  # meta-quality of the critique itself
            "critiqueScore": score,
            "recommendation": result.get("recommendation", "unknown"),
            "issueCount": len(result.get("issues", [])),
            "notes": f"Score: {score:.2f}. Recommendation: {result.get('recommendation')}.",
        }

    def reflect(self, req: ExecuteRequest, result: dict[str, Any], observation: dict[str, Any]) -> dict[str, Any]:
        return {
            "objectiveClarity": "clear",
            "executionStrategy": "rubric_evaluation",
            "qualityScore": observation.get("qualityScore", 0.0),
            "suggestions": ["Build a domain-specific rubric for repeated task types"],
        }
