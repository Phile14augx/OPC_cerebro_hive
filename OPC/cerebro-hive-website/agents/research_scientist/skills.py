"""Research Scientist skills — BaseTool subclasses."""
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


class ExperimentInput(BaseModel):
    hypothesis: str = Field(..., description="Research hypothesis to test")
    methodology: str = Field(default="", description="Preferred methodology")

class LiteratureInput(BaseModel):
    topic: str = Field(..., description="Research topic or domain")
    scope: str = Field(default="recent", description="Scope: recent|comprehensive|survey")

class EvalInput(BaseModel):
    model_or_system: str = Field(..., description="Model or AI system to evaluate")
    task_type: str = Field(..., description="Task type: RAG|agent|generation|classification")

class BenchmarkInput(BaseModel):
    capability: str = Field(..., description="Capability to benchmark")
    baseline: str = Field(default="", description="Baseline system to compare against")

class DatasetInput(BaseModel):
    domain: str = Field(..., description="Domain for dataset curation")
    size: int = Field(default=100, description="Target dataset size")

class ReportInput(BaseModel):
    findings: str = Field(..., description="Key research findings to report")
    audience: str = Field(default="engineering", description="Target audience")


class ExperimentDesignSkill(BaseTool):
    name: str = "experiment_design"
    description: str = "Design rigorous experiments to test AI research hypotheses."
    args_schema: type[BaseModel] = ExperimentInput

    def _run(self, hypothesis: str, methodology: str = "") -> str:
        return (
            f"Experiment design for hypothesis: '{hypothesis}'\n"
            f"Methodology: {methodology or 'ablation study + held-out test set'}\n"
            "Components: Control group | Treatment variants | Metrics | "
            "Statistical power analysis | Reproducibility requirements | "
            "Data splits | Significance threshold (p < 0.05)"
        )


class LiteratureReviewSkill(BaseTool):
    name: str = "literature_review"
    description: str = "Conduct a structured literature review on an AI research topic."
    args_schema: type[BaseModel] = LiteratureInput

    def _run(self, topic: str, scope: str = "recent") -> str:
        return (
            f"Literature review: '{topic}' (scope: {scope})\n"
            "Sources: arXiv, NeurIPS, ICML, ICLR, ACL, EMNLP\n"
            "Output: Key papers | SOTA summary | Open problems | "
            "Relevant techniques for CerebroHive | Citation list"
        )


class AIEvaluationSkill(BaseTool):
    name: str = "ai_evaluation"
    description: str = "Design and run evaluation frameworks for AI models and systems."
    args_schema: type[BaseModel] = EvalInput

    def _run(self, model_or_system: str, task_type: str) -> str:
        return (
            f"Evaluation framework for {model_or_system} ({task_type}):\n"
            "Metrics: Task-specific + Faithfulness + Relevance + Groundedness\n"
            "Methodology: Human eval + Automated judge (LLM-as-judge) + "
            "Statistical significance | Dataset: ≥50 examples | "
            "Baselines: GPT-4o, Claude Opus | Output: eval report + leaderboard"
        )


class BenchmarkDesignSkill(BaseTool):
    name: str = "benchmark_design"
    description: str = "Design internal benchmarks for CerebroHive AI capabilities."
    args_schema: type[BaseModel] = BenchmarkInput

    def _run(self, capability: str, baseline: str = "") -> str:
        return (
            f"Benchmark design for capability: '{capability}'\n"
            f"Baseline: {baseline or 'current production model'}\n"
            "Components: Test suite definition | Scoring rubric | "
            "Automated evaluation harness | Regression detection | "
            "Public leaderboard integration | Versioned benchmark datasets"
        )


class DatasetCurationSkill(BaseTool):
    name: str = "dataset_curation"
    description: str = "Curate high-quality datasets for AI training and evaluation."
    args_schema: type[BaseModel] = DatasetInput

    def _run(self, domain: str, size: int = 100) -> str:
        return (
            f"Dataset curation for '{domain}' (target: {size} examples):\n"
            "Steps: Source identification | Quality filtering | Deduplication | "
            "Human annotation | Inter-annotator agreement (κ > 0.8) | "
            "Train/val/test split | Bias audit | Data cards | Version control"
        )


class ResearchReportSkill(BaseTool):
    name: str = "research_report"
    description: str = "Write internal research reports translating findings to actionable recommendations."
    args_schema: type[BaseModel] = ReportInput

    def _run(self, findings: str, audience: str = "engineering") -> str:
        return (
            f"Research report for {audience}:\n"
            f"Findings: {findings}\n"
            "Format: Executive summary | Background | Methodology | Results | "
            "Limitations | Recommendations | Next steps | Appendix (data & code)"
        )


RESEARCH_SCIENTIST_SKILLS: list[BaseTool] = [
    ExperimentDesignSkill(),
    LiteratureReviewSkill(),
    AIEvaluationSkill(),
    BenchmarkDesignSkill(),
    DatasetCurationSkill(),
    ResearchReportSkill(),
]
