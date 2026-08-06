"""LLMOps Engineer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest


class LLMOpsEngineerAgent(BaseHiveAgent):
    name: str = "LLMOpsEngineer"
    capability: str = "LLMOpsEngineer"
    temperature: float = 0.1
    max_attempts: int = 12
    SYSTEM_PROMPT = (
        "Senior LLMOps Engineer for CerebroHive EIOS. "
        "Own model deployment pipeline, drift detection, output quality monitoring, "
        "safety monitoring, cost optimisation, and AI incident response. "
        "Targets: detect quality regression <=24h, model deploy lead time <=4h, "
        "0 undetected safety violations. "
        "Canary/shadow deployments, automated rollback on >15% quality drop."
    )

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT,
            f"Objective: {request.objective}\nContext: {json.dumps(request.context)}\n"
            "Output JSON plan: operation_type (deploy/monitor/rollback/cost_optimise), "
            "model_version, deployment_strategy, monitoring_metrics, alert_thresholds, "
            "rollback_trigger, estimated_hours")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT,
            f"Plan: {json.dumps(plan)}\n"
            "Output JSON: operation_ready (bool), deployment_config, monitoring_config, "
            "validation {canary_configured, rollback_configured, safety_monitoring_enabled, "
            "cost_alerts_set, drift_detection_enabled, eval_cicd_wired}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"operation_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        v = execution_result.get("validation", {})
        return {
            "operation_ready": execution_result.get("operation_ready", False),
            "failed": [k for k, ok in v.items() if not ok],
        }

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed", [])
        if failed:
            return f"LLMOPS NOT READY: {', '.join(failed)}."
        return "LLMOps operation ready. Canary ✓ | Rollback ✓ | Safety monitoring ✓ | Cost alerts ✓"
