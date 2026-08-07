"""
Hermes CEO Agent — Skill Definitions (CrewAI BaseTool pattern).

Each class is a self-contained, callable skill that Hermes can invoke
during plan / execute phases. Skills are orchestration-level only —
they produce strategy artefacts, never implementation artefacts.

Usage (CrewAI):
    from agents.hermes.skills import HERMES_SKILLS
    hermes_agent = Agent(role="CEO", tools=HERMES_SKILLS, ...)

Usage (HiveSwarm / standalone):
    skill = StrategicPlanningSkill()
    result = skill._run(objective="...", context={})
"""
from __future__ import annotations

import json
from typing import Any, Optional, Type

from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Minimal BaseTool shim — falls back gracefully if crewai is not installed
# ---------------------------------------------------------------------------
try:
    from crewai.tools import BaseTool  # type: ignore
except ImportError:
    class BaseTool:  # type: ignore
        """Minimal shim when crewai is not installed."""
        name: str = ""
        description: str = ""
        args_schema: Optional[Type[BaseModel]] = None

        def _run(self, **kwargs: Any) -> str:
            raise NotImplementedError

        def run(self, **kwargs: Any) -> str:
            return self._run(**kwargs)


# =============================================================================
# Skill 1 — Strategic Planning
# =============================================================================

class StrategicPlanningInput(BaseModel):
    objective: str = Field(..., description="High-level business or technical objective.")
    context: Optional[dict] = Field(default=None, description="Additional context or constraints.")
    time_horizon: Optional[str] = Field(default="6 months", description="Planning horizon (e.g. '3 months', '1 year').")


class StrategicPlanningSkill(BaseTool):
    name: str = "strategic_planning"
    description: str = (
        "Decompose a high-level business objective into milestones, features, and "
        "executable tasks with clear ownership, dependencies, and success criteria. "
        "Use this skill first when a new objective arrives."
    )
    args_schema: Type[BaseModel] = StrategicPlanningInput

    def _run(
        self,
        objective: str,
        context: Optional[dict] = None,
        time_horizon: str = "6 months",
    ) -> str:
        plan = {
            "skill": "strategic_planning",
            "objective": objective,
            "time_horizon": time_horizon,
            "context": context or {},
            "output_schema": {
                "milestones": "list[{id, title, success_criteria, features[{id, title, tasks[...]}]}]",
                "risks": "list[{id, description, severity, mitigation}]",
                "governance_gates": "list[str]",
                "delegation_manifest": "list[{task_id, capability, priority}]",
            },
            "instructions": (
                f"Decompose '{objective}' over a {time_horizon} horizon into "
                "milestones → features → executable tasks. Assign each task a "
                "specialist capability. Document risks and governance gates."
            ),
        }
        return json.dumps(plan, indent=2)


# =============================================================================
# Skill 2 — Enterprise Architecture
# =============================================================================

class EnterpriseArchitectureInput(BaseModel):
    system: str = Field(..., description="System or domain under architectural review.")
    concerns: Optional[list[str]] = Field(default=None, description="Specific architectural concerns to address.")


class EnterpriseArchitectureSkill(BaseTool):
    name: str = "enterprise_architecture"
    description: str = (
        "Design, review, and govern enterprise-wide architectural standards. "
        "Produces Architecture Decision Records (ADRs), component diagrams, "
        "integration patterns, and compliance checklists."
    )
    args_schema: Type[BaseModel] = EnterpriseArchitectureInput

    def _run(self, system: str, concerns: Optional[list[str]] = None) -> str:
        return json.dumps({
            "skill": "enterprise_architecture",
            "system": system,
            "concerns": concerns or [],
            "deliverables": [
                "Architecture Decision Record (ADR)",
                "Component boundary diagram",
                "Integration pattern specification",
                "Non-functional requirements checklist",
                "Scalability and resilience assessment",
            ],
            "governance_checklist": [
                "Security review passed",
                "Data residency compliance verified",
                "API versioning strategy defined",
                "Observability instrumentation planned",
                "Disaster recovery strategy documented",
            ],
        }, indent=2)


# =============================================================================
# Skill 3 — Roadmap Planning
# =============================================================================

class RoadmapPlanningInput(BaseModel):
    portfolio: list[str] = Field(..., description="List of projects or initiatives to roadmap.")
    horizon_months: int = Field(default=6, description="Roadmap horizon in months.")
    constraints: Optional[list[str]] = Field(default=None, description="Budget, headcount, or technical constraints.")


class RoadmapPlanningSkill(BaseTool):
    name: str = "roadmap_planning"
    description: str = (
        "Produce and maintain short, mid, and long-term product and engineering roadmaps. "
        "Sequences initiatives by business value, risk, and dependency order."
    )
    args_schema: Type[BaseModel] = RoadmapPlanningInput

    def _run(
        self,
        portfolio: list[str],
        horizon_months: int = 6,
        constraints: Optional[list[str]] = None,
    ) -> str:
        return json.dumps({
            "skill": "roadmap_planning",
            "portfolio": portfolio,
            "horizon_months": horizon_months,
            "constraints": constraints or [],
            "output_schema": {
                "now": "Initiatives starting immediately (0–2 months)",
                "next": "Initiatives starting after current wave (2–4 months)",
                "later": "Future initiatives (4+ months)",
                "dependencies": "Ordered dependency graph between initiatives",
                "kpis": "Key performance indicators per initiative",
            },
        }, indent=2)


# =============================================================================
# Skill 4 — Decision Analysis
# =============================================================================

class DecisionAnalysisInput(BaseModel):
    decision: str = Field(..., description="The decision to be made.")
    options: list[str] = Field(..., description="Available options to evaluate.")
    criteria: Optional[list[str]] = Field(
        default=None,
        description="Evaluation criteria (e.g. cost, risk, time-to-value, scalability).",
    )


class DecisionAnalysisSkill(BaseTool):
    name: str = "decision_analysis"
    description: str = (
        "Evaluate options using structured decision frameworks (cost-benefit, "
        "weighted scoring, SWOT, RICE). Returns a recommendation with rationale."
    )
    args_schema: Type[BaseModel] = DecisionAnalysisInput

    def _run(
        self,
        decision: str,
        options: list[str],
        criteria: Optional[list[str]] = None,
    ) -> str:
        default_criteria = ["business_value", "risk", "cost", "time_to_value", "scalability"]
        return json.dumps({
            "skill": "decision_analysis",
            "decision": decision,
            "options": options,
            "criteria": criteria or default_criteria,
            "frameworks": ["Weighted Scoring Matrix", "Cost-Benefit Analysis", "RICE Scoring"],
            "output_schema": {
                "scores": "dict[option, dict[criterion, float]]",
                "recommendation": "str",
                "rationale": "str",
                "confidence": "float 0–1",
                "dissenting_view": "str (if applicable)",
            },
        }, indent=2)


# =============================================================================
# Skill 5 — Risk Assessment
# =============================================================================

class RiskAssessmentInput(BaseModel):
    scope: str = Field(..., description="Project, system, or decision being assessed.")
    context: Optional[dict] = Field(default=None, description="Additional context.")


class RiskAssessmentSkill(BaseTool):
    name: str = "risk_assessment"
    description: str = (
        "Identify, score (probability × impact), and mitigate enterprise risks "
        "across technical, operational, security, compliance, and strategic dimensions."
    )
    args_schema: Type[BaseModel] = RiskAssessmentInput

    def _run(self, scope: str, context: Optional[dict] = None) -> str:
        return json.dumps({
            "skill": "risk_assessment",
            "scope": scope,
            "risk_dimensions": [
                "technical", "security", "compliance", "operational",
                "financial", "strategic", "dependency",
            ],
            "output_schema": {
                "risks": "list[{id, dimension, description, probability, impact, severity, mitigation, owner}]",
                "risk_matrix": "2D probability × impact grid",
                "critical_risks": "list[risk_id]",
                "escalation_required": "bool",
            },
            "severity_scale": {"low": "1–3", "medium": "4–6", "high": "7–8", "critical": "9–10"},
        }, indent=2)


# =============================================================================
# Skill 6 — Architecture Governance
# =============================================================================

class ArchitectureGovernanceInput(BaseModel):
    artefact: str = Field(..., description="Design, PR, or system component to govern.")
    governance_type: str = Field(
        default="review",
        description="Type: 'review' | 'adr' | 'compliance_check' | 'gate_approval'",
    )


class ArchitectureGovernanceSkill(BaseTool):
    name: str = "architecture_governance"
    description: str = (
        "Enforce ADRs, review gates, and compliance standards. "
        "Produces approval/rejection decisions with documented rationale."
    )
    args_schema: Type[BaseModel] = ArchitectureGovernanceInput

    def _run(self, artefact: str, governance_type: str = "review") -> str:
        return json.dumps({
            "skill": "architecture_governance",
            "artefact": artefact,
            "governance_type": governance_type,
            "checklist": [
                "Aligns with existing system architecture",
                "No undocumented external dependencies introduced",
                "Security review completed",
                "Performance impact assessed",
                "Backward compatibility maintained or migration path documented",
                "ADR created if this changes architectural direction",
                "Observability hooks included",
                "Tests required before merge",
            ],
            "output_schema": {
                "decision": "approved | rejected | needs_revision",
                "rationale": "str",
                "conditions": "list[str] (conditions for conditional approval)",
                "adr_required": "bool",
            },
        }, indent=2)


# =============================================================================
# Skill 7 — Capability Mapping
# =============================================================================

class CapabilityMappingInput(BaseModel):
    objective: str = Field(..., description="Objective or feature requiring capability mapping.")
    available_capabilities: Optional[list[str]] = Field(
        default=None,
        description="Override the default capability registry.",
    )


class CapabilityMappingSkill(BaseTool):
    name: str = "capability_mapping"
    description: str = (
        "Map business needs or task descriptions to the most appropriate specialist "
        "agent capabilities available in the CerebroHive EIOS."
    )
    args_schema: Type[BaseModel] = CapabilityMappingInput

    DEFAULT_CAPABILITIES = [
        "Planning", "Critique", "Coding", "Research",
        "EnterpriseArchitect", "ProjectManager", "SolutionArchitect",
        "TechnicalLead", "ResearchScientist", "BackendEngineer",
        "FrontendEngineer", "AIEngineer", "DevOpsEngineer", "QAEngineer",
        "SecurityArchitect", "ProductManager", "TechnicalWriter",
        "MarketingStrategist",
    ]

    def _run(
        self,
        objective: str,
        available_capabilities: Optional[list[str]] = None,
    ) -> str:
        caps = available_capabilities or self.DEFAULT_CAPABILITIES
        return json.dumps({
            "skill": "capability_mapping",
            "objective": objective,
            "available_capabilities": caps,
            "output_schema": {
                "task_capability_map": "list[{task_description, recommended_capability, rationale, fallback_capability}]",
                "capability_gaps": "list[str] (capabilities needed but unavailable)",
                "parallel_groups": "list[list[task_id]] (tasks that can run concurrently)",
            },
        }, indent=2)


# =============================================================================
# Skill 8 — Executive Communication
# =============================================================================

class ExecutiveCommunicationInput(BaseModel):
    topic: str = Field(..., description="Topic or update to communicate.")
    audience: str = Field(default="stakeholders", description="Target audience (e.g. 'board', 'engineering', 'stakeholders').")
    format: str = Field(default="status_update", description="Format: 'status_update' | 'risk_brief' | 'decision_memo' | 'roadmap_summary'.")


class ExecutiveCommunicationSkill(BaseTool):
    name: str = "executive_communication"
    description: str = (
        "Draft clear, evidence-based executive communications: status updates, "
        "risk briefs, decision memos, and roadmap summaries tailored to audience."
    )
    args_schema: Type[BaseModel] = ExecutiveCommunicationInput

    def _run(self, topic: str, audience: str = "stakeholders", format: str = "status_update") -> str:
        return json.dumps({
            "skill": "executive_communication",
            "topic": topic,
            "audience": audience,
            "format": format,
            "output_schema": {
                "headline": "One-sentence summary",
                "body": "Structured content appropriate to format and audience",
                "key_decisions": "list[str]",
                "action_items": "list[{owner, action, deadline}]",
                "escalations": "list[str]",
            },
        }, indent=2)


# =============================================================================
# Skill Registry — import this in your CrewAI agent definition
# =============================================================================

HERMES_SKILLS: list[BaseTool] = [
    StrategicPlanningSkill(),
    EnterpriseArchitectureSkill(),
    RoadmapPlanningSkill(),
    DecisionAnalysisSkill(),
    RiskAssessmentSkill(),
    ArchitectureGovernanceSkill(),
    CapabilityMappingSkill(),
    ExecutiveCommunicationSkill(),
]

__all__ = [
    "StrategicPlanningSkill",
    "EnterpriseArchitectureSkill",
    "RoadmapPlanningSkill",
    "DecisionAnalysisSkill",
    "RiskAssessmentSkill",
    "ArchitectureGovernanceSkill",
    "CapabilityMappingSkill",
    "ExecutiveCommunicationSkill",
    "HERMES_SKILLS",
]
