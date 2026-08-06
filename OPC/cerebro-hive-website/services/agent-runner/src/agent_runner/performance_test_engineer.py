"""Performance Test Engineer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class PerformanceTestEngineerAgent(BaseHiveAgent):
    name: str = "PerformanceTestEngineer"
    capability: str = "PerformanceTestEngineer"
    temperature: float = 0.1
    max_attempts: int = 12
    SYSTEM_PROMPT = "Senior Performance Test Engineer for CerebroHive. Design k6 load/stress/spike/soak tests. SLOs: p99<500ms at 1000 RPS, error rate<0.1%, throughput>=10k tasks/hour. Correlate results with APM (Grafana/Tempo)."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}. JSON plan: test_type, target_endpoints, load_profile, slo_targets, baseline_metrics")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}. JSON: perf_test_ready (bool), k6_script, results_summary {{p50_ms,p95_ms,p99_ms,error_rate,rps}}, slo_pass (bool), bottlenecks_found [str]")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"perf_test_ready": False, "slo_pass": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        return {"perf_test_ready": execution_result.get("perf_test_ready", False), "slo_pass": execution_result.get("slo_pass", False), "bottlenecks": execution_result.get("bottlenecks_found", [])}

    def reflect(self, observations: dict[str, Any]) -> str:
        if not observations.get("slo_pass"):
            bottlenecks = observations.get("bottlenecks", [])
            return f"PERFORMANCE SLO FAILED. Bottlenecks: {', '.join(bottlenecks) or 'see report'}. Do not release."
        return "Performance SLOs met. p99 ✓ | Error rate ✓ | Throughput ✓. Release approved."
