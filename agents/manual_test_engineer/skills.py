"""Manual Test Engineer skills."""
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

class TestPlanInput(BaseModel):
    feature: str = Field(..., description="Feature to test")
    risk_areas: list[str] = Field(default_factory=list, description="High-risk areas to focus on")

class TestPlanSkill(BaseTool):
    name: str = "test_plan"
    description: str = "Create a comprehensive test plan for a feature."
    args_schema: type[BaseModel] = TestPlanInput
    def _run(self, feature: str, risk_areas: list[str] = None) -> str:
        risks = risk_areas or []
        return f"Test plan: {feature}\nRisk areas: {', '.join(risks) or 'TBD'}\nSections: Scope | Approach | Test cases | Entry/exit criteria | UAT plan | Sign-off checklist"

MANUAL_TEST_ENGINEER_SKILLS = [TestPlanSkill()]
