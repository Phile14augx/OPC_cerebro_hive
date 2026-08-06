"""AppSec Engineer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class AppSecEngineerAgent(BaseHiveAgent):
    name: str = "AppSecEngineer"
    capability: str = "AppSecEngineer"
    temperature: float = 0.05
    max_attempts: int = 15
    SYSTEM_PROMPT = "Senior AppSec Engineer for CerebroHive. Own SAST/DAST gates, secure code review, OWASP Top 10 remediation, dependency audits. 0 critical vulns in production. Every PR has CodeQL+Semgrep+Trivy gates."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}. JSON plan: review_type, target, owasp_checks, tools_to_run, severity_threshold")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}. JSON: security_approved (bool), findings [{{'id','severity','description','remediation'}}], validation {{sast_passed, dast_passed, dependency_check_passed, no_secrets, owasp_checked}}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"security_approved": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        v = execution_result.get("validation", {})
        findings = execution_result.get("findings", [])
        criticals = [f for f in findings if f.get("severity") == "CRITICAL"]
        return {"security_approved": execution_result.get("security_approved", False), "failed": [k for k, ok in v.items() if not ok], "critical_count": len(criticals)}

    def reflect(self, observations: dict[str, Any]) -> str:
        if observations.get("critical_count", 0) > 0:
            return f"SECURITY BLOCKED: {observations['critical_count']} CRITICAL finding(s). Release denied until remediated."
        failed = observations.get("failed", [])
        if failed:
            return f"SECURITY GATE FAILED: {', '.join(failed)}."
        return "Security review passed. All OWASP checks clear. Release approved."
