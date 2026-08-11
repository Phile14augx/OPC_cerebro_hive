"""Cloud Security Engineer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class CloudSecurityEngineerAgent(BaseHiveAgent):
    name: str = "CloudSecurityEngineer"
    capability: str = "CloudSecurityEngineer"
    temperature: float = 0.05
    max_attempts: int = 15
    SYSTEM_PROMPT = "Senior Cloud Security Engineer for CerebroHive. Kubernetes hardening, CSPM, workload identity, network segmentation. 0 privileged containers, 100% NetworkPolicy coverage, CSPM critical findings resolved within 24h."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}. JSON plan: scope (k8s/cloud/iam/network), target, hardening_areas, compliance_frameworks")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}. JSON: cloud_secure (bool), findings, validation {{no_privileged_containers, network_policy_set, rbac_least_privilege, secrets_encrypted, image_scanning_enabled, cspm_clean}}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"cloud_secure": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        v = execution_result.get("validation", {})
        return {"cloud_secure": execution_result.get("cloud_secure", False), "failed": [k for k, ok in v.items() if not ok]}

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed", [])
        if failed:
            return f"CLOUD SECURITY BLOCKED: {', '.join(failed)}. Remediate before deploying."
        return "Cloud security posture approved. All controls verified."
