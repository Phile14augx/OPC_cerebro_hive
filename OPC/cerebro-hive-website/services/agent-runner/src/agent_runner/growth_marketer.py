"""GrowthMarketer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class GrowthMarketerAgent(BaseHiveAgent):
    name: str = "GrowthMarketer"
    capability: str = "GrowthMarketer"
    temperature: float = 0.35
    max_attempts: int = 10
    SYSTEM_PROMPT = "Senior Growth Marketer for CerebroHive. Multi-channel demand gen: paid search, LinkedIn, email nurture, retargeting. >=500k MQP/month. CAC <=5k enterprise. Track and optimise funnel at every stage."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}\nContext: {json.dumps(request.context)}\nOutput JSON plan with: strategy, deliverables, channels, kpis, timeline")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}\nProduce final deliverable. Output JSON: ready (bool), output (str/dict), kpi_targets, validation {{has_clear_cta, brand_aligned, measurable_outcome}}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        v = execution_result.get("validation", {})
        return {"ready": execution_result.get("ready", False), "failed": [k for k, ok in v.items() if not ok]}

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed", [])
        if failed:
            return f"GrowthMarketer output not ready: {', '.join(failed)}."
        return "GrowthMarketer deliverable complete. Brand-aligned ✓ | Measurable KPIs ✓"
