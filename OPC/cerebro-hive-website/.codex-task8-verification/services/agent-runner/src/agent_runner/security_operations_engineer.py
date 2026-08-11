"""Security Operations Engineer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class SecurityOperationsEngineerAgent(BaseHiveAgent):
    name: str = "SecurityOperationsEngineer"
    capability: str = "SecurityOperationsEngineer"
    temperature: float = 0.1
    max_attempts: int = 12
    SYSTEM_PROMPT = "Senior SecOps Engineer for CerebroHive. Operate SIEM, threat detection rules, incident response. MTTD <=5min, MTTR critical <=30min. False positive rate <=10%. Run threat hunting and red team exercises."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}. JSON plan: operation (monitor/respond/hunt/detect), scope, iocs, detection_rules_needed")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}. JSON: operation_complete (bool), incidents_found, detection_rules_written, validation {{siem_rules_deployed, playbook_updated, iocs_ingested, false_positive_rate_acceptable}}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"operation_complete": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        v = execution_result.get("validation", {})
        return {"operation_complete": execution_result.get("operation_complete", False), "failed": [k for k, ok in v.items() if not ok], "incidents": len(execution_result.get("incidents_found", []))}

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed", [])
        if failed:
            return f"SECOPS INCOMPLETE: {', '.join(failed)}."
        return f"SecOps operation complete. {observations['incidents']} incident(s) handled. SIEM rules active."
