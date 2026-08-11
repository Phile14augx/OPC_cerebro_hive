"""AI Platform Engineer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest


class AIPlatformEngineerAgent(BaseHiveAgent):
    name: str = "AIPlatformEngineer"
    capability: str = "AIPlatformEngineer"
    temperature: float = 0.1
    max_attempts: int = 12
    SYSTEM_PROMPT = "Senior AI Platform Engineer for CerebroHive. Own vLLM serving, AI gateway, GPU infra."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}. JSON plan.")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}. JSON with platform_ready bool.")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"platform_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        v = execution_result.get("validation", {})
        return {"platform_ready": execution_result.get("platform_ready", False), "failed_checks": [k for k, ok in v.items() if not ok]}

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed_checks", [])
        return f"NOT READY: {', '.join(failed)}." if failed else "AI Platform ready."
