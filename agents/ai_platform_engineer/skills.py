"""AI Platform Engineer skills — BaseTool subclasses."""
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


class ModelServingInput(BaseModel):
    model_id: str = Field(..., description="Model identifier to serve")
    serving_mode: str = Field(default="vllm", description="Mode: vllm|triton|ollama")

class GatewayInput(BaseModel):
    routes: list[str] = Field(..., description="Model routes to configure")
    features: list[str] = Field(default_factory=list, description="Features: caching|rate-limiting|auth")

class CostInput(BaseModel):
    model: str = Field(..., description="Model to analyse costs for")
    request_volume: int = Field(default=10000, description="Daily request volume")


class ModelServingSkill(BaseTool):
    name: str = "model_serving"
    description: str = "Deploy and configure LLM model serving infrastructure."
    args_schema: type[BaseModel] = ModelServingInput

    def _run(self, model_id: str, serving_mode: str = "vllm") -> str:
        return (
            f"Model serving: {model_id} via {serving_mode}\n"
            "Config: Tensor parallelism | Continuous batching | "
            "KV cache management | Dynamic quantisation | "
            "Health checks | Prometheus metrics | GPU memory limits | "
            "Kubernetes Deployment + HPA on GPU utilisation"
        )


class AIGatewaySkill(BaseTool):
    name: str = "ai_gateway"
    description: str = "Configure AI gateway for routing, caching, and rate limiting."
    args_schema: type[BaseModel] = GatewayInput

    def _run(self, routes: list[str], features: list[str] = None) -> str:
        feats = features or ["caching", "rate-limiting", "auth"]
        return (
            f"AI Gateway config for {len(routes)} routes:\n"
            f"Features: {', '.join(feats)}\n"
            "Capabilities: Semantic cache (Redis) | Model fallback routing | "
            "Token budget enforcement | JWT auth | Retry on 429/503 | "
            "Distributed rate limiting | Cost attribution headers"
        )


class CostOptimisationSkill(BaseTool):
    name: str = "llm_cost_optimisation"
    description: str = "Analyse and optimise LLM inference costs."
    args_schema: type[BaseModel] = CostInput

    def _run(self, model: str, request_volume: int = 10000) -> str:
        return (
            f"Cost analysis: {model} @ {request_volume:,} req/day\n"
            "Optimisations: Prompt caching (Anthropic) | Semantic dedup cache | "
            "Model tiering (fast model for simple tasks) | Batch requests | "
            "Output length limits | Token budget alerts | "
            "Cost attribution by team/feature/customer"
        )


AI_PLATFORM_ENGINEER_SKILLS: list[BaseTool] = [
    ModelServingSkill(),
    AIGatewaySkill(),
    CostOptimisationSkill(),
]
