"""Customer Success Manager skills — BaseTool subclasses."""
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


class SuccessPlanInput(BaseModel):
    customer_name: str = Field(..., description="Customer organisation name")
    business_objectives: list[str] = Field(..., description="Customer's stated business objectives")

class HealthScoreInput(BaseModel):
    customer_name: str = Field(..., description="Customer name")
    usage_data: str = Field(default="", description="Usage metrics summary")

class QBRInput(BaseModel):
    customer_name: str = Field(..., description="Customer name for QBR")
    period: str = Field(default="Q4", description="Quarter being reviewed")

class ChurnRiskInput(BaseModel):
    signals: list[str] = Field(..., description="Churn risk signals observed")
    customer_name: str = Field(..., description="At-risk customer name")


class SuccessPlanSkill(BaseTool):
    name: str = "success_plan"
    description: str = "Build customer success plans anchored to business outcomes."
    args_schema: type[BaseModel] = SuccessPlanInput

    def _run(self, customer_name: str, business_objectives: list[str]) -> str:
        objs = "\n".join(f"  {i+1}. {o}" for i, o in enumerate(business_objectives))
        return (
            f"Success plan: {customer_name}\n"
            f"Business objectives:\n{objs}\n"
            "Plan sections: Baseline metrics | 30/60/90 day milestones | "
            "Success criteria (measurable) | Adoption targets | "
            "Stakeholder map | Risk register | Escalation path | "
            "ROI measurement framework"
        )


class HealthScoringSkill(BaseTool):
    name: str = "health_scoring"
    description: str = "Calculate and interpret customer health scores."
    args_schema: type[BaseModel] = HealthScoreInput

    def _run(self, customer_name: str, usage_data: str = "") -> str:
        return (
            f"Health score: {customer_name}\n"
            f"Usage signals: {usage_data or 'pending data pull'}\n"
            "Dimensions: Product adoption (40%) | Engagement (20%) | "
            "Support tickets (15%) | Stakeholder sentiment (15%) | "
            "Contract health (10%)\n"
            "Output: Score 0–100 | Red/Amber/Green | Action triggers"
        )


class QBRSkill(BaseTool):
    name: str = "qbr_preparation"
    description: str = "Prepare and run Executive Business Reviews (QBRs)."
    args_schema: type[BaseModel] = QBRInput

    def _run(self, customer_name: str, period: str = "Q4") -> str:
        return (
            f"QBR: {customer_name} / {period}\n"
            "Agenda: Executive recap | Value delivered vs commitments | "
            "Product usage highlights | ROI calculation | "
            "Upcoming roadmap preview | Joint success goals for next quarter | "
            "Expansion discussion | Q&A\n"
            "Materials: Slide deck | Usage data export | ROI calculator"
        )


class ChurnRiskSkill(BaseTool):
    name: str = "churn_risk_management"
    description: str = "Identify, assess, and mitigate customer churn risks."
    args_schema: type[BaseModel] = ChurnRiskInput

    def _run(self, signals: list[str], customer_name: str) -> str:
        signal_list = "\n".join(f"  ⚠ {s}" for s in signals)
        return (
            f"Churn risk assessment: {customer_name}\n"
            f"Risk signals:\n{signal_list}\n"
            "Playbook: Immediate executive outreach | Root cause analysis | "
            "Recovery plan with 2-week check-ins | "
            "Executive sponsor loop-in | Escalation criteria | "
            "Win-back offer (if applicable)"
        )


CUSTOMER_SUCCESS_MANAGER_SKILLS: list[BaseTool] = [
    SuccessPlanSkill(),
    HealthScoringSkill(),
    QBRSkill(),
    ChurnRiskSkill(),
]
