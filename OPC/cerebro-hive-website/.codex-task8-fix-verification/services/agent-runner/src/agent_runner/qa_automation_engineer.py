"""QA Automation Engineer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class QAAutomationEngineerAgent(BaseHiveAgent):
    name: str = "QAAutomationEngineer"
    capability: str = "QAAutomationEngineer"
    temperature: float = 0.1
    max_attempts: int = 12
    SYSTEM_PROMPT = "Senior QA Automation Engineer for CerebroHive. Build automated test suites: Playwright (E2E), Vitest (unit), Pact (contract), k6 (performance). >=90% automation rate, <=1% flaky tests, E2E suite <=10min."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}. JSON plan: test_types_needed, framework, page_objects, test_data_strategy, ci_integration")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}. JSON: tests_ready (bool), test_files [{{'path','type','count'}}], validation {{unit_tests, integration_tests, e2e_tests, contract_tests, ci_integrated, no_flaky_tests}}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"tests_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        v = execution_result.get("validation", {})
        return {"tests_ready": execution_result.get("tests_ready", False), "failed": [k for k, ok in v.items() if not ok]}

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed", [])
        if failed:
            return f"TEST SUITE INCOMPLETE: {', '.join(failed)}."
        return "Test suite complete. Unit ✓ | Integration ✓ | E2E ✓ | Contract ✓ | CI ✓"
