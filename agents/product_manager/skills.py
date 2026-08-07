"""Product Manager skills — BaseTool subclasses for CrewAI/HiveSwarm compatibility."""
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


# ── Input schemas ─────────────────────────────────────────────────────────────

class ProductStrategyInput(BaseModel):
    objective: str = Field(..., description="Strategic product objective")
    timeframe: str = Field(default="quarterly", description="Planning timeframe")

class RoadmapInput(BaseModel):
    initiatives: list[str] = Field(..., description="List of initiatives to prioritise")
    constraints: str = Field(default="", description="Resource or time constraints")

class PRDInput(BaseModel):
    feature_name: str = Field(..., description="Feature or initiative name")
    user_problem: str = Field(..., description="Problem being solved")

class OKRInput(BaseModel):
    objective: str = Field(..., description="Qualitative objective")
    team: str = Field(default="engineering", description="Owning team")

class ResearchInput(BaseModel):
    research_question: str = Field(..., description="Customer or market research question")

class PrioritisationInput(BaseModel):
    items: list[str] = Field(..., description="Items to prioritise")
    framework: str = Field(default="RICE", description="Prioritisation framework: RICE|WSJF|MoSCoW")

class MetricsInput(BaseModel):
    feature: str = Field(..., description="Feature or product area")
    success_definition: str = Field(..., description="What success looks like")

class LaunchInput(BaseModel):
    feature: str = Field(..., description="Feature being launched")
    target_segment: str = Field(..., description="Target customer segment")


# ── Tool implementations ──────────────────────────────────────────────────────

class ProductStrategySkill(BaseTool):
    name: str = "product_strategy"
    description: str = "Define product strategy, vision, and positioning for CerebroHive EIOS."
    args_schema: type[BaseModel] = ProductStrategyInput

    def _run(self, objective: str, timeframe: str = "quarterly") -> str:
        return (
            f"Product strategy for '{objective}' ({timeframe}):\n"
            "- Market opportunity analysis\n- Competitive positioning\n"
            "- Strategic bets and trade-offs\n- Success metrics\n- Alignment to company OKRs"
        )


class RoadmapPlanningSkill(BaseTool):
    name: str = "roadmap_planning"
    description: str = "Build and prioritise a product roadmap from a list of initiatives."
    args_schema: type[BaseModel] = RoadmapInput

    def _run(self, initiatives: list[str], constraints: str = "") -> str:
        items = "\n".join(f"  {i+1}. {item}" for i, item in enumerate(initiatives))
        return (
            f"Roadmap planning for {len(initiatives)} initiatives:\n{items}\n"
            f"Constraints: {constraints or 'none specified'}\n"
            "Output: prioritised roadmap with Now/Next/Later buckets and rationale."
        )


class PRDWritingSkill(BaseTool):
    name: str = "prd_writing"
    description: str = "Write a Product Requirements Document (PRD) for a feature or initiative."
    args_schema: type[BaseModel] = PRDInput

    def _run(self, feature_name: str, user_problem: str) -> str:
        return (
            f"PRD: {feature_name}\n"
            f"Problem: {user_problem}\n"
            "Sections: Executive Summary | Goals & Non-Goals | User Stories | "
            "Acceptance Criteria | Success Metrics | Dependencies | Timeline | Risks"
        )


class OKRDefinitionSkill(BaseTool):
    name: str = "okr_definition"
    description: str = "Define OKRs (Objectives and Key Results) for a team or initiative."
    args_schema: type[BaseModel] = OKRInput

    def _run(self, objective: str, team: str = "engineering") -> str:
        return (
            f"OKR for {team}:\nObjective: {objective}\n"
            "Key Results:\n  KR1: [Measurable outcome with baseline and target]\n"
            "  KR2: [Measurable outcome with baseline and target]\n"
            "  KR3: [Measurable outcome with baseline and target]\n"
            "Review cadence: Weekly check-in, Monthly scoring, Quarterly reset."
        )


class CustomerDiscoverySkill(BaseTool):
    name: str = "customer_discovery"
    description: str = "Design and synthesise customer discovery research."
    args_schema: type[BaseModel] = ResearchInput

    def _run(self, research_question: str) -> str:
        return (
            f"Customer discovery for: '{research_question}'\n"
            "Methods: User interviews (n=10), Jobs-to-be-Done analysis, "
            "Pain/gain mapping, Synthesis into insight themes, "
            "Opportunity scoring matrix."
        )


class PrioritisationSkill(BaseTool):
    name: str = "prioritisation"
    description: str = "Prioritise a list of features or initiatives using a structured framework."
    args_schema: type[BaseModel] = PrioritisationInput

    def _run(self, items: list[str], framework: str = "RICE") -> str:
        return (
            f"Prioritisation using {framework} for {len(items)} items:\n"
            + "\n".join(f"  - {item}: [scored and ranked]" for item in items)
            + f"\nOutput: ranked list with {framework} scores and decision rationale."
        )


class MetricsAndAnalyticsSkill(BaseTool):
    name: str = "metrics_and_analytics"
    description: str = "Define product metrics, instrumentation plan, and analytics dashboard for a feature."
    args_schema: type[BaseModel] = MetricsInput

    def _run(self, feature: str, success_definition: str) -> str:
        return (
            f"Metrics plan for '{feature}':\n"
            f"Success definition: {success_definition}\n"
            "North Star metric | Leading indicators | Guardrail metrics | "
            "Event tracking plan | Dashboard specification | Alerting thresholds"
        )


class ProductLaunchSkill(BaseTool):
    name: str = "product_launch"
    description: str = "Plan and execute a product launch for a feature or initiative."
    args_schema: type[BaseModel] = LaunchInput

    def _run(self, feature: str, target_segment: str) -> str:
        return (
            f"Launch plan: {feature} → {target_segment}\n"
            "Pre-launch: Beta list, documentation, sales enablement, support training\n"
            "Launch day: Announcement, monitoring playbook, on-call rotation\n"
            "Post-launch: 7/14/30 day metrics review, iteration backlog"
        )


# ── Exports ───────────────────────────────────────────────────────────────────

PRODUCT_MANAGER_SKILLS: list[BaseTool] = [
    ProductStrategySkill(),
    RoadmapPlanningSkill(),
    PRDWritingSkill(),
    OKRDefinitionSkill(),
    CustomerDiscoverySkill(),
    PrioritisationSkill(),
    MetricsAndAnalyticsSkill(),
    ProductLaunchSkill(),
]
