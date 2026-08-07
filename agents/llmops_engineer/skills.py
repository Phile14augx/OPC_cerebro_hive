"""LLMOps Engineer skills — BaseTool subclasses."""
from __future__ import annotations

from typing import Any

try:
    from crewai.tools import BaseTool
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:  # type: ignore[no-redef]
        def __init_subclass__(cls, **kwargs: Any) -> None: ...
    def Field(*a: Any, **kw: Any) -> Any: return None  # noqa: N802
    class BaseTool:  # type: ignore[no-redef]
        name: str = ""
        description: str = ""
        def _run(self, *a: Any, **kw: Any) -> str: return ""


class DriftInput(BaseModel):
    model: str = Field(..., description="Model to monitor for drift")
    metric: str = Field(default="output_quality", description="Metric to track")

class DeployInput(BaseModel):
    model_version: str = Field(..., description="Model version to deploy")
    strategy: str = Field(default="canary", description="Strategy: canary|shadow|blue-green")


class DriftDetectionSkill(BaseTool):
    name: str = "drift_detection"
    description: str = "Monitor and detect prompt drift and output quality regression in production LLMs."
    args_schema: type[BaseModel] = DriftInput

    def _run(self, model: str, metric: str = "output_quality") -> str:
        return (
            f"Drift detection: {model} / {metric}\n"
            "Method: Statistical process control on rolling eval scores | "
            "Automated eval sample (5% of traffic) | LLM-as-judge scoring | "
            "Alert threshold: >10% quality degradation over 24h | "
            "Auto-rollback on >20% degradation"
        )


class ModelDeploySkill(BaseTool):
    name: str = "model_deployment"
    description: str = "Deploy new model versions with canary or shadow strategies."
    args_schema: type[BaseModel] = DeployInput

    def _run(self, model_version: str, strategy: str = "canary") -> str:
        return (
            f"Model deployment: {model_version} ({strategy})\n"
            "Process: Eval CI pass → Staging deploy → Smoke test → "
            f"{'5% traffic → 20% → 50% → 100%' if strategy == 'canary' else 'Shadow traffic → compare → promote'} | "
            "Rollback trigger: quality score drops >15% or error rate >1%"
        )


LLMOPS_ENGINEER_SKILLS: list[BaseTool] = [
    DriftDetectionSkill(),
    ModelDeploySkill(),
]
