"""Compliance Specialist Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class ComplianceSpecialistAgent(BaseHiveAgent):
    name: str = "ComplianceSpecialist"
    capability: str = "ComplianceSpecialist"
    temperature: float = 0.05
    max_attempts: int = 12
    SYSTEM_PROMPT = "Senior Compliance Specialist for CerebroHive. Own SOC 2 Type II, ISO 27001, GDPR, HIPAA, PCI DSS programmes. Maintain GRC platform. 0 critical audit findings. 100% controls evidenced. GDPR DSAR response <=30 days."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}. JSON plan: framework, scope, control_domains, evidence_sources, gap_assessment")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}. JSON: compliance_ready (bool), gaps [{{'control','gap','owner','due_date'}}], validation {{controls_mapped, evidence_collected, gaps_assigned, audit_report_ready}}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"compliance_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        gaps = execution_result.get("gaps", [])
        return {"compliance_ready": execution_result.get("compliance_ready", False), "gap_count": len(gaps), "critical_gaps": [g for g in gaps if "critical" in str(g).lower()]}

    def reflect(self, observations: dict[str, Any]) -> str:
        critical = len(observations.get("critical_gaps", []))
        if critical > 0:
            return f"COMPLIANCE BLOCKED: {critical} critical gap(s). Audit not ready."
        gaps = observations.get("gap_count", 0)
        return f"Compliance assessment complete. {gaps} gap(s) assigned to owners. Audit-ready."
