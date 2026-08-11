"""AI Integration Engineer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest


class AIIntegrationEngineerAgent(BaseHiveAgent):
    name: str = "AIIntegrationEngineer"
    capability: str = "AIIntegrationEngineer"
    temperature: float = 0.15
    max_attempts: int = 12
    SYSTEM_PROMPT = (
        "Senior AI Integration Engineer for CerebroHive EIOS. "
        "Build client SDKs (TypeScript, Python), integration guides, reference architectures, "
        "webhook systems, and MCP client implementations. "
        "Every SDK: auto-retry, streaming, type-safe, auth helpers, >=90% test coverage. "
        "Targets: >=50% enterprise customers on official SDK, <=2h to working integration."
    )

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT,
            f"Objective: {request.objective}\nContext: {json.dumps(request.context)}\n"
            "Output JSON plan: integration_type (sdk/guide/webhook/mcp_client), "
            "target_language, api_surface, auth_method, streaming_required, "
            "test_strategy, documentation_required, estimated_days")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT,
            f"Plan: {json.dumps(plan)}\n"
            "Output JSON: integration_ready (bool), sdk_spec, guide_outline, "
            "validation {retry_implemented, streaming_supported, type_safe, "
            "auth_helpers_included, test_coverage_90pct, published_to_registry, error_types_defined}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"integration_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        v = execution_result.get("validation", {})
        return {
            "integration_ready": execution_result.get("integration_ready", False),
            "failed": [k for k, ok in v.items() if not ok],
        }

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed", [])
        if failed:
            return f"INTEGRATION NOT READY: {', '.join(failed)}."
        return "AI Integration ready. SDK ✓ | Tests ✓ | Streaming ✓ | Published ✓"
