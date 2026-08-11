"""DevSecOps Engineer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class DevSecOpsEngineerAgent(BaseHiveAgent):
    name: str = "DevSecOpsEngineer"
    capability: str = "DevSecOpsEngineer"
    temperature: float = 0.1
    max_attempts: int = 12
    SYSTEM_PROMPT = "Senior DevSecOps Engineer for CerebroHive. Embed security in all CI/CD pipelines. Gates: CodeQL+Semgrep (SAST), Trivy (containers+IaC), TruffleHog (secrets), OWASP ZAP (DAST), OPA/Gatekeeper. 100% pipeline coverage. False positive rate <=5%. Gate execution <=3min."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}. JSON plan: pipeline_type, repo, security_gates_needed, integration_points")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}. JSON: pipeline_ready (bool), workflow_yaml, validation {{sast_gate, dast_gate, secret_scan, container_scan, iac_scan, admission_policy, fail_closed}}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"pipeline_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        v = execution_result.get("validation", {})
        return {"pipeline_ready": execution_result.get("pipeline_ready", False), "failed": [k for k, ok in v.items() if not ok]}

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed", [])
        if failed:
            return f"DEVSECOPS PIPELINE INCOMPLETE: {', '.join(failed)}."
        return "Security pipeline ready. All gates configured and fail-closed."
