"""Product Manager Agent — PRD authoring, roadmap prioritisation, OKR definition."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse


class ProductManagerAgent(BaseHiveAgent):
    """Senior Product Manager & Enterprise Product Strategy Lead."""

    name: str = "ProductManager"
    capability: str = "ProductManager"
    temperature: float = 0.2
    max_attempts: int = 12

    SYSTEM_PROMPT = """You are a Senior Product Manager & Enterprise Product Strategy Lead for CerebroHive EIOS.

CORE MANDATES:
- Every initiative must map to a measurable OKR — no output-without-outcome
- PRDs are complete when engineering has zero ambiguity: goals, non-goals, acceptance criteria, metrics, dependencies
- Prioritisation is always evidence-based: customer interviews, usage data, revenue impact, strategic alignment
- The roadmap is a living contract, not a wish list — every item has a clear rationale and owner
- You write for two audiences simultaneously: executives (outcomes) and engineers (specifics)

PRD REQUIRED SECTIONS:
1. Problem Statement (user pain, evidence)
2. Goals & Non-Goals
3. User Stories (As a <persona>, I want to <action> so that <value>)
4. Acceptance Criteria (measurable, testable)
5. Success Metrics (North Star + guardrails)
6. Technical Dependencies
7. Launch Plan (phased rollout, feature flags)
8. Risks & Mitigations

PRIORITISATION FRAMEWORKS:
- RICE (Reach × Impact × Confidence ÷ Effort) for feature backlog
- WSJF (Cost of Delay ÷ Job Size) for programme-level sequencing
- MoSCoW for release scoping

OKR STANDARDS:
- Objectives: inspiring, qualitative, memorable
- Key Results: measurable, time-bound, challenging but achievable (70% = success)
- Max 3 KRs per objective, max 3 objectives per team per quarter

STAKEHOLDER COMMUNICATION:
- Weekly product updates to engineering leads (written)
- Monthly roadmap reviews with executive team
- Quarterly OKR scoring and retrospectives
- Async-first: decisions documented in Notion/Confluence before meetings"""

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Objective: {request.objective}
Context: {json.dumps(request.context, indent=2)}

Create a structured product plan with JSON output:
{{
  "problem_statement": "...",
  "target_persona": "...",
  "goals": ["..."],
  "non_goals": ["..."],
  "user_stories": ["As a <X> I want to <Y> so that <Z>", ...],
  "acceptance_criteria": ["...", ...],
  "success_metrics": {{"north_star": "...", "guardrails": ["..."]}},
  "prioritisation_score": {{"rice_reach": 0, "rice_impact": 0, "rice_confidence": 0, "rice_effort": 0}},
  "dependencies": ["...", ...],
  "risks": [{{"risk": "...", "mitigation": "..."}}],
  "launch_phases": ["Phase 1: ...", "Phase 2: ..."],
  "okrs": [{{"objective": "...", "key_results": ["..."]}}],
  "timeline_weeks": 0
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            return json.loads(raw[start:end])
        except Exception:
            return {"raw": raw, "problem_statement": request.objective}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Plan:
{json.dumps(plan, indent=2)}

Validate this product plan and produce the final PRD-ready output.
Check:
1. Are all acceptance criteria measurable (not vague)?
2. Does every user story have clear value for the user?
3. Are success metrics observable with existing analytics?
4. Are dependencies identified and owners assigned?
5. Are risks mitigated, not just acknowledged?
6. Does the OKR have ≥1 quantifiable key result?

Output JSON:
{{
  "prd_ready": true/false,
  "validation_issues": ["..."],
  "prd": {{...complete PRD document...}},
  "okrs": [...],
  "rice_score": 0.0,
  "recommended_quarter": "Q1/Q2/Q3/Q4 YYYY",
  "executive_summary": "2-sentence summary for CEO/board"
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            result = json.loads(raw[start:end])
        except Exception:
            result = {"raw": raw, "prd_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        return {
            "prd_ready": execution_result.get("prd_ready", False),
            "validation_issues": len(execution_result.get("validation_issues", [])),
            "rice_score": execution_result.get("rice_score", 0),
            "has_okrs": bool(execution_result.get("okrs")),
            "has_executive_summary": bool(execution_result.get("executive_summary")),
            "recommended_quarter": execution_result.get("recommended_quarter", ""),
        }

    def reflect(self, observations: dict[str, Any]) -> str:
        issues = observations.get("validation_issues", 0)
        prd_ready = observations.get("prd_ready", False)
        rice = observations.get("rice_score", 0)
        if not prd_ready or issues > 0:
            return (
                f"PRD NOT READY — {issues} validation issue(s) must be resolved. "
                "Engineering cannot start until all acceptance criteria are measurable "
                "and all dependencies have owners."
            )
        return (
            f"PRD approved for engineering handoff. "
            f"RICE score: {rice:.1f}. "
            f"Recommended delivery: {observations.get('recommended_quarter', 'TBD')}. "
            "OKRs defined. Success metrics instrumented. Risks mitigated."
        )
