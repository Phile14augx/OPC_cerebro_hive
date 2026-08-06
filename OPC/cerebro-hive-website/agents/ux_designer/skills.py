"""UX/UI Designer skills — BaseTool subclasses."""
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


class UserResearchInput(BaseModel):
    research_goal: str = Field(..., description="What we want to learn from users")
    user_segment: str = Field(default="enterprise", description="User segment to research")

class WireframeInput(BaseModel):
    feature: str = Field(..., description="Feature or flow to wireframe")
    fidelity: str = Field(default="mid", description="Fidelity: low|mid|high")

class DesignSystemInput(BaseModel):
    component: str = Field(..., description="Component or pattern to design/document")
    variant: str = Field(default="", description="Variant or state")

class AccessibilityInput(BaseModel):
    component_or_flow: str = Field(..., description="Component or flow to audit")
    wcag_level: str = Field(default="AA", description="WCAG level: A|AA|AAA")

class UsabilityTestInput(BaseModel):
    prototype_url: str = Field(default="", description="Figma prototype URL")
    tasks: list[str] = Field(..., description="Task scenarios for participants")

class HandoffInput(BaseModel):
    component: str = Field(..., description="Component or screen to hand off")
    includes_tokens: bool = Field(default=True, description="Include design tokens")


class UserResearchSkill(BaseTool):
    name: str = "user_research"
    description: str = "Plan and conduct user research to inform design decisions."
    args_schema: type[BaseModel] = UserResearchInput

    def _run(self, research_goal: str, user_segment: str = "enterprise") -> str:
        return (
            f"User research plan: '{research_goal}' ({user_segment} users)\n"
            "Methods: Semi-structured interviews (n=6–10) | Think-aloud sessions | "
            "Survey (n=50+) | Jobs-to-be-Done mapping | Affinity diagramming | "
            "Insight synthesis report | Design implications"
        )


class WireframingSkill(BaseTool):
    name: str = "wireframing"
    description: str = "Create wireframes and prototypes for features and user flows."
    args_schema: type[BaseModel] = WireframeInput

    def _run(self, feature: str, fidelity: str = "mid") -> str:
        return (
            f"Wireframe ({fidelity}-fi): '{feature}'\n"
            "Deliverables: User flow diagram | Screen wireframes | "
            "Interaction annotations | Loading/error/empty states | "
            "Mobile & desktop variants | Figma frames with auto-layout"
        )


class DesignSystemSkill(BaseTool):
    name: str = "design_system"
    description: str = "Design, document, and maintain CerebroHive's design system components."
    args_schema: type[BaseModel] = DesignSystemInput

    def _run(self, component: str, variant: str = "") -> str:
        return (
            f"Design system: {component}{' / ' + variant if variant else ''}\n"
            "Output: Figma component (auto-layout, variants, props) | "
            "Design tokens (colour, spacing, typography, shadow, radius) | "
            "Storybook spec | Usage guidelines | Do/Don't examples | "
            "Accessibility notes | Tailwind CSS class mapping"
        )


class AccessibilityAuditSkill(BaseTool):
    name: str = "accessibility_audit"
    description: str = "Audit designs for WCAG compliance and inclusive design principles."
    args_schema: type[BaseModel] = AccessibilityInput

    def _run(self, component_or_flow: str, wcag_level: str = "AA") -> str:
        return (
            f"Accessibility audit: '{component_or_flow}' (WCAG 2.2 {wcag_level})\n"
            "Checks: Colour contrast ratios | Focus indicators | ARIA roles & labels | "
            "Keyboard navigation order | Screen reader announcements | "
            "Touch target sizes (≥44px) | Motion sensitivity | "
            "Output: Pass/fail per criterion + remediation recommendations"
        )


class UsabilityTestingSkill(BaseTool):
    name: str = "usability_testing"
    description: str = "Design and run usability tests on prototypes."
    args_schema: type[BaseModel] = UsabilityTestInput

    def _run(self, prototype_url: str = "", tasks: list[str] = None) -> str:
        task_list = tasks or []
        return (
            f"Usability test plan ({len(task_list)} tasks):\n"
            + "\n".join(f"  T{i+1}: {t}" for i, t in enumerate(task_list))
            + "\nRecruit: 5–8 participants | Method: moderated think-aloud | "
            "Metrics: Task completion rate, time-on-task, error rate, SUS score | "
            "Output: Findings report + priority issue list"
        )


class HandoffSkill(BaseTool):
    name: str = "design_handoff"
    description: str = "Prepare and deliver design specs to frontend engineers."
    args_schema: type[BaseModel] = HandoffInput

    def _run(self, component: str, includes_tokens: bool = True) -> str:
        return (
            f"Design handoff: '{component}'\n"
            "Deliverables: Annotated Figma spec | "
            + ("Design token JSON (colour, spacing, typography) | " if includes_tokens else "")
            + "Component props table | State matrix (default/hover/focus/disabled/error) | "
            "Responsive breakpoints | Asset exports (SVG, PNG @1x/2x) | "
            "Acceptance criteria for QA"
        )


UX_DESIGNER_SKILLS: list[BaseTool] = [
    UserResearchSkill(),
    WireframingSkill(),
    DesignSystemSkill(),
    AccessibilityAuditSkill(),
    UsabilityTestingSkill(),
    HandoffSkill(),
]
