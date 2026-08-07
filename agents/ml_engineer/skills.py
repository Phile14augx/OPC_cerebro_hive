"""ML Engineer skills — BaseTool subclasses."""
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


class FineTuneInput(BaseModel):
    base_model: str = Field(..., description="Base model to fine-tune")
    task: str = Field(..., description="Task to fine-tune for")
    method: str = Field(default="lora", description="Method: lora|qlora|full")

class EvalInput(BaseModel):
    model: str = Field(..., description="Model to evaluate")
    benchmark: str = Field(..., description="Benchmark or eval suite")


class FineTuningSkill(BaseTool):
    name: str = "fine_tuning"
    description: str = "Fine-tune LLMs using LoRA/QLoRA for task-specific performance."
    args_schema: type[BaseModel] = FineTuneInput

    def _run(self, base_model: str, task: str, method: str = "lora") -> str:
        return (
            f"Fine-tuning: {base_model} → {task} ({method.upper()})\n"
            "Config: LoRA r=16, alpha=32, dropout=0.05 | "
            "Optimiser: AdamW with cosine LR schedule | "
            "Dataset: curated + deduped | Eval: held-out 20% | "
            "Tracking: W&B experiment | Model card: auto-generated | "
            "Serving: merged weights → vLLM"
        )


class ModelEvalSkill(BaseTool):
    name: str = "model_evaluation"
    description: str = "Evaluate ML models against benchmarks and internal eval suites."
    args_schema: type[BaseModel] = EvalInput

    def _run(self, model: str, benchmark: str) -> str:
        return (
            f"Model eval: {model} on {benchmark}\n"
            "Metrics: Task accuracy | Faithfulness | Bias audit | "
            "Latency (p50/p95/p99) | Cost per inference | "
            "Comparison vs baseline + previous version\n"
            "Output: Eval card + Go/No-go recommendation"
        )


ML_ENGINEER_SKILLS: list[BaseTool] = [
    FineTuningSkill(),
    ModelEvalSkill(),
]
