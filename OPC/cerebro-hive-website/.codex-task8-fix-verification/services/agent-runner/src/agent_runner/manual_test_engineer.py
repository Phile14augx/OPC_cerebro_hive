"""Manual Test Engineer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class ManualTestEngineerAgent(BaseHiveAgent):
    name: str = "ManualTestEngineer"
    capability: str = "ManualTestEngineer"
    temperature: float = 0.15
    max_attempts: int = 12
    SYSTEM_PROMPT = "Senior Manual Test Engineer for CerebroHive. Design test plans, run exploratory testing, coordinate UAT. Defect escape rate <=2%. UAT sign-off rate >=95% first pass. 100% feature test plan coverage."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}. JSON plan: feature, test_approach, risk_areas, test_cases [{{'id','scenario','steps','expected'}}], uat_plan")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}. JSON: test_complete (bool), defects_found [{{'id','severity','description'}}], uat_approved (bool), sign_off_ready (bool)")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"test_complete": False, "uat_approved": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        defects = execution_result.get("defects_found", [])
        critical = [d for d in defects if d.get("severity") in ("critical", "blocker")]
        return {"uat_approved": execution_result.get("uat_approved", False), "critical_defects": len(critical), "total_defects": len(defects)}

    def reflect(self, observations: dict[str, Any]) -> str:
        if observations.get("critical_defects", 0) > 0:
            return f"UAT FAILED: {observations['critical_defects']} critical defect(s). Release blocked."
        return f"UAT passed. {observations.get('total_defects', 0)} minor defect(s) logged. Sign-off granted."
