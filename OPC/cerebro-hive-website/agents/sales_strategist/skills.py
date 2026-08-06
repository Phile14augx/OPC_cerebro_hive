"""Sales Strategist skills — BaseTool subclasses."""
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


class ICPInput(BaseModel):
    market_segment: str = Field(..., description="Market segment to define ICP for")
    company_size: str = Field(default="enterprise", description="Company size: smb|mid-market|enterprise")

class PlaybookInput(BaseModel):
    stage: str = Field(..., description="Sales stage: discovery|demo|evaluation|negotiation|close")
    persona: str = Field(default="CTO", description="Buyer persona")

class ForecastInput(BaseModel):
    pipeline_data: str = Field(..., description="Pipeline summary or CSV-style data")
    period: str = Field(default="quarter", description="Forecast period")

class BattlecardInput(BaseModel):
    competitor: str = Field(..., description="Competitor name")
    deal_context: str = Field(default="", description="Deal context or known competitor strength")


class ICPDefinitionSkill(BaseTool):
    name: str = "icp_definition"
    description: str = "Define and refine Ideal Customer Profile for CerebroHive."
    args_schema: type[BaseModel] = ICPInput

    def _run(self, market_segment: str, company_size: str = "enterprise") -> str:
        return (
            f"ICP: {market_segment} / {company_size}\n"
            "Firmographic: Industry | Revenue | Headcount | Tech stack | "
            "AI maturity | Compliance requirements\n"
            "Technographic: Cloud-native | Kubernetes | LLM adoption\n"
            "Trigger events: AI initiative | Digital transformation | "
            "Compliance audit | M&A activity"
        )


class SalesPlaybookSkill(BaseTool):
    name: str = "sales_playbook"
    description: str = "Write detailed sales playbooks for each stage of the enterprise sales cycle."
    args_schema: type[BaseModel] = PlaybookInput

    def _run(self, stage: str, persona: str = "CTO") -> str:
        return (
            f"Sales playbook: {stage} stage / {persona} persona\n"
            "Components: Entry criteria | Objectives | "
            "Discovery questions | Objection handling | "
            "Success criteria | Next step | Exit criteria | "
            "Tools & resources needed | MEDDIC fields to update"
        )


class ForecastingSkill(BaseTool):
    name: str = "revenue_forecasting"
    description: str = "Build revenue forecasts from pipeline data."
    args_schema: type[BaseModel] = ForecastInput

    def _run(self, pipeline_data: str, period: str = "quarter") -> str:
        return (
            f"Revenue forecast ({period}):\n"
            f"Input: {pipeline_data[:100]}...\n"
            "Method: Stage-weighted probability | Commit/Best Case/Pipeline tiers | "
            "Historical conversion rates | Slippage factor | "
            "Output: Call number + range + risk items"
        )


class BattlecardSkill(BaseTool):
    name: str = "competitive_battlecard"
    description: str = "Create competitive battlecards for CerebroHive vs key competitors."
    args_schema: type[BaseModel] = BattlecardInput

    def _run(self, competitor: str, deal_context: str = "") -> str:
        return (
            f"Battlecard vs {competitor}:\n"
            f"Context: {deal_context or 'general competitive displacement'}\n"
            "Sections: Their strengths (acknowledge honestly) | "
            "Our differentiators | Trap-setting questions | "
            "Objection handling scripts | Win themes | "
            "Proof points (case studies, benchmarks) | "
            "Landmines to plant in evaluation criteria"
        )


SALES_STRATEGIST_SKILLS: list[BaseTool] = [
    ICPDefinitionSkill(),
    SalesPlaybookSkill(),
    ForecastingSkill(),
    BattlecardSkill(),
]
