"""Prompt Engineer skills — BaseTool subclasses."""
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


class PromptDesignInput(BaseModel):
    task: str = Field(..., description="Task the prompt should accomplish")
    output_format: str = Field(default="json", description="Expected output format")

class PromptEvalInput(BaseModel):
    prompt_id: str = Field(..., description="Prompt identifier to evaluate")
    eval_dataset: str = Field(default="", description="Evaluation dataset reference")

class PromptOptimInput(BaseModel):
    current_prompt: str = Field(..., description="Current prompt to optimise")
    target_improvement: str = Field(..., description="What to improve: accuracy|tokens|latency")


class PromptDesignSkill(BaseTool):
    name: str = "prompt_design"
    description: str = "Design high-quality prompts with chain-of-thought and structured output."
    args_schema: type[BaseModel] = PromptDesignInput

    def _run(self, task: str, output_format: str = "json") -> str:
        return (
            f"Prompt design for: '{task}' → {output_format}\n"
            "Techniques: Role assignment | Chain-of-thought | XML tagging | "
            f"Few-shot examples (3-5) | Output schema ({output_format}) | "
            "Negative constraints | Hallucination guardrails | "
            "Versioned in prompt registry"
        )


class PromptEvalSkill(BaseTool):
    name: str = "prompt_evaluation"
    description: str = "Evaluate prompt quality against a test dataset."
    args_schema: type[BaseModel] = PromptEvalInput

    def _run(self, prompt_id: str, eval_dataset: str = "") -> str:
        return (
            f"Evaluation: {prompt_id} on {eval_dataset or 'default eval set'}\n"
            "Metrics: Task accuracy | Faithfulness | Instruction following | "
            "Output format compliance | Hallucination rate | Token count | "
            "LLM-as-judge scores | Human eval sample (10%)\n"
            "Output: Eval report + regression vs previous version"
        )


class PromptOptimisationSkill(BaseTool):
    name: str = "prompt_optimisation"
    description: str = "Optimise existing prompts for accuracy, token efficiency, or latency."
    args_schema: type[BaseModel] = PromptOptimInput

    def _run(self, current_prompt: str, target_improvement: str) -> str:
        return (
            f"Optimising for {target_improvement}:\n"
            f"Current: {current_prompt[:80]}...\n"
            "Techniques applied: Token pruning | Instruction compression | "
            "Few-shot selection (gradient-free) | Format simplification | "
            "Output: Optimised prompt + eval comparison table"
        )


PROMPT_ENGINEER_SKILLS: list[BaseTool] = [
    PromptDesignSkill(),
    PromptEvalSkill(),
    PromptOptimisationSkill(),
]
