"""Accessibility Specialist Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class AccessibilitySpecialistAgent(BaseHiveAgent):
    name: str = "AccessibilitySpecialist"
    capability: str = "AccessibilitySpecialist"
    temperature: float = 0.1
    max_attempts: int = 12
    SYSTEM_PROMPT = "Senior Accessibility Specialist for CerebroHive. WCAG 2.2 AA mandatory. Run axe-core, screen reader (NVDA/JAWS/VoiceOver), keyboard nav, colour contrast audits. 0 critical axe violations. 100% keyboard coverage. Advocate for inclusive design."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}. JSON plan: scope, wcag_criteria_to_test, tools, screen_readers, user_personas_with_disabilities")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}. JSON: a11y_approved (bool), violations [{{'criterion','severity','element','fix'}}], validation {{contrast_pass,focus_visible,aria_correct,keyboard_navigable,screen_reader_pass}}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"a11y_approved": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        violations = execution_result.get("violations", [])
        critical = [v for v in violations if v.get("severity") in ("critical", "serious")]
        return {"a11y_approved": execution_result.get("a11y_approved", False), "critical_violations": len(critical), "total_violations": len(violations)}

    def reflect(self, observations: dict[str, Any]) -> str:
        if observations.get("critical_violations", 0) > 0:
            return f"A11Y BLOCKED: {observations['critical_violations']} critical WCAG violation(s). Release denied."
        return f"Accessibility approved. {observations.get('total_violations', 0)} minor issue(s). WCAG 2.2 AA ✓"
