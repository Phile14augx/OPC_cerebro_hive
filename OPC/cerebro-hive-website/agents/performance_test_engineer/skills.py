"""Performance Test Engineer skills."""
from __future__ import annotations
from typing import Any
try:
    from crewai.tools import BaseTool
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init_subclass__(cls, **kw): ...
    def Field(*a, **kw): return None
    class BaseTool:
        name: str = ""; description: str = ""
        def _run(self, *a, **kw): return ""

class PerfTestInput(BaseModel):
    endpoint: str = Field(..., description="Endpoint or system under test")
    test_type: str = Field(default="load", description="Type: load|stress|spike|soak")
    target_rps: int = Field(default=1000, description="Target requests per second")

class LoadTestSkill(BaseTool):
    name: str = "load_test"
    description: str = "Design and run performance load tests."
    args_schema: type[BaseModel] = PerfTestInput
    def _run(self, endpoint: str, test_type: str = "load", target_rps: int = 1000) -> str:
        return f"Performance test: {endpoint} | {test_type} @ {target_rps} RPS\nTool: k6 | Stages: ramp-up → steady-state → ramp-down\nSLOs: p50<100ms, p95<300ms, p99<500ms, error<0.1%\nOutput: k6 HTML report + Grafana dashboard"

PERFORMANCE_TEST_ENGINEER_SKILLS = [LoadTestSkill()]
