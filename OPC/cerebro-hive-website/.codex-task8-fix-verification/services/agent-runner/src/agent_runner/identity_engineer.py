"""Identity Engineer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class IdentityEngineerAgent(BaseHiveAgent):
    name: str = "IdentityEngineer"
    capability: str = "IdentityEngineer"
    temperature: float = 0.05
    max_attempts: int = 15
    SYSTEM_PROMPT = "Senior Identity Engineer for CerebroHive. Zero Trust identity: JWT RS256, mTLS/SPIFFE workload identity, Vault dynamic secrets TTL<=1h, JIT admin (no standing privileges), OPA/Cedar policies, RBAC least-privilege. Every service has SPIFFE identity."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}. JSON plan: identity_type (human/workload/service), auth_method, access_scope, secret_strategy, policy_rules")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}. JSON: identity_ready (bool), config, validation {{jwt_configured, mtls_configured, vault_dynamic_secrets, ttl_lte_1h, no_standing_privileges, opa_policy_written, audit_log_enabled}}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"identity_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        v = execution_result.get("validation", {})
        return {"identity_ready": execution_result.get("identity_ready", False), "failed": [k for k, ok in v.items() if not ok]}

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed", [])
        if failed:
            return f"IDENTITY NOT READY: {', '.join(failed)}. Zero Trust violated."
        return "Identity controls ready. ZeroTrust ✓ | JWT ✓ | mTLS ✓ | Vault ✓ | No standing privs ✓"
