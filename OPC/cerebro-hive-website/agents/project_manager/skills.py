"""
Project Manager Agent — Skill Definitions (CrewAI BaseTool pattern).

41 skills covering enterprise project delivery, agile coordination, Git workflow
governance, risk management, and stakeholder communication for the CerebroHive EIOS.

Usage (CrewAI):
    from agents.project_manager.skills import PROJECT_MANAGER_SKILLS
    pm = Agent(role="Project Manager", tools=PROJECT_MANAGER_SKILLS, ...)
"""
from __future__ import annotations

import json
from typing import Any, Optional, Type

from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# BaseTool shim
# ---------------------------------------------------------------------------
try:
    from crewai.tools import BaseTool  # type: ignore
except ImportError:
    class BaseTool:  # type: ignore
        name: str = ""
        description: str = ""
        args_schema: Optional[Type[BaseModel]] = None

        def _run(self, **kwargs: Any) -> str:
            raise NotImplementedError

        def run(self, **kwargs: Any) -> str:
            return self._run(**kwargs)


# =============================================================================
# 1. Epic Decomposition
# =============================================================================
class EpicDecompositionInput(BaseModel):
    initiative: str = Field(..., description="Strategic initiative or project to decompose.")
    context: Optional[str] = Field(default=None, description="Business context or constraints.")

class EpicDecompositionSkill(BaseTool):
    name: str = "epic_decomposition"
    description: str = (
        "Break a strategic initiative into Epics → Milestones → Features → "
        "User Stories → Technical Tasks with acceptance criteria and Git workflow specs."
    )
    args_schema: Type[BaseModel] = EpicDecompositionInput

    def _run(self, initiative: str, context: Optional[str] = None) -> str:
        return json.dumps({
            "skill": "epic_decomposition", "initiative": initiative,
            "output_schema": {
                "epics": "list[{id, title, business_value, milestones[{id, title, target_date, features[{id, title, user_stories[{id, as_a, i_want, so_that, acceptance_criteria, tasks}]}]}]}]",
                "decomposition_principles": [
                    "Epics = 2–4 week deliverable clusters",
                    "Milestones = measurable outcomes with dates",
                    "Features = shippable increments",
                    "User stories = testable behaviors",
                    "Tasks = 1-day atomic units of work",
                ],
            },
        }, indent=2)


# =============================================================================
# 2. User Story Writing
# =============================================================================
class UserStoryInput(BaseModel):
    feature: str = Field(..., description="Feature to write user stories for.")
    personas: Optional[list[str]] = Field(default=None, description="User personas involved.")

class UserStorySkill(BaseTool):
    name: str = "user_story_writing"
    description: str = (
        "Write well-formed user stories with 'As a / I want / So that' format "
        "and measurable acceptance criteria using BDD Given/When/Then."
    )
    args_schema: Type[BaseModel] = UserStoryInput

    def _run(self, feature: str, personas: Optional[list[str]] = None) -> str:
        return json.dumps({
            "skill": "user_story_writing", "feature": feature,
            "output_schema": {
                "user_stories": "list[{id, as_a, i_want, so_that, acceptance_criteria: list[Given/When/Then], story_points, priority, definition_of_done}]",
                "definition_of_done": [
                    "Code reviewed and approved",
                    "Unit tests pass (≥80% coverage)",
                    "Integration tests pass",
                    "Documentation updated",
                    "Acceptance criteria verified",
                    "Git workflow compliant (PR merged, worktree deleted)",
                    "GitHub Actions green",
                ],
            },
        }, indent=2)


# =============================================================================
# 3. Sprint Planning
# =============================================================================
class SprintPlanningInput(BaseModel):
    backlog_items: list[str] = Field(..., description="Backlog item IDs or titles to consider for the sprint.")
    team_capacity_days: int = Field(..., description="Total team capacity in person-days.")
    sprint_goal: Optional[str] = Field(default=None, description="Proposed sprint goal.")

class SprintPlanningSkill(BaseTool):
    name: str = "sprint_planning"
    description: str = (
        "Plan a sprint: select backlog items within capacity, assign tasks, set sprint goal, "
        "identify dependencies, and produce a sprint commitment with confidence estimate."
    )
    args_schema: Type[BaseModel] = SprintPlanningInput

    def _run(self, backlog_items: list[str], team_capacity_days: int, sprint_goal: Optional[str] = None) -> str:
        return json.dumps({
            "skill": "sprint_planning",
            "output_schema": {
                "sprint_goal": sprint_goal or "TBD",
                "committed_items": "list[{id, title, estimate_days, assignee, git_worktree}]",
                "total_committed_days": f"<= {team_capacity_days}",
                "capacity_utilization_pct": "float (target 80–90%)",
                "deferred_items": "list[{id, reason}]",
                "sprint_risks": "list[{description, mitigation}]",
                "confidence": "float 0–1 (Sprint Predictability target ≥ 90%)",
                "daily_standup_template": "{yesterday, today, blockers}",
            },
        }, indent=2)


# =============================================================================
# 4. Risk Management
# =============================================================================
class RiskManagementInput(BaseModel):
    project: str = Field(..., description="Project or initiative to assess for risks.")
    phase: str = Field(default="planning", description="Project phase: planning|execution|release|closure")

class RiskManagementSkill(BaseTool):
    name: str = "risk_management"
    description: str = (
        "Identify, assess (probability × impact), and mitigate project risks. "
        "Critical risks are escalated immediately. Resolution SLA: < 24 hours."
    )
    args_schema: Type[BaseModel] = RiskManagementInput

    def _run(self, project: str, phase: str = "planning") -> str:
        return json.dumps({
            "skill": "risk_management", "project": project, "phase": phase,
            "risk_categories": [
                "schedule", "scope", "resource", "technical", "dependency",
                "architectural", "security", "budget", "stakeholder", "quality",
            ],
            "output_schema": {
                "risks": "list[{id, category, description, probability, impact, severity, mitigation, owner, resolution_sla_hours, status}]",
                "critical_risks": "list[risk_id] — BLOCKS dispatch",
                "risk_register": "Full risk tracking document",
                "escalation_required": "bool",
                "escalation_targets": "list[agent_name]",
            },
        }, indent=2)


# =============================================================================
# 5. Dependency Management
# =============================================================================
class DependencyInput(BaseModel):
    tasks: list[str] = Field(..., description="Task IDs or titles to map dependencies for.")

class DependencySkill(BaseTool):
    name: str = "dependency_management"
    description: str = (
        "Identify, track, and resolve inter-task and inter-team dependencies. "
        "Dependency Resolution SLA: < 24 hours. Blocking dependencies stop dispatch."
    )
    args_schema: Type[BaseModel] = DependencyInput

    def _run(self, tasks: list[str]) -> str:
        return json.dumps({
            "skill": "dependency_management", "tasks": tasks,
            "output_schema": {
                "dependency_map": "list[{id, from_task, to_task, type: blocks|requires|informs, resolution_owner, sla_hours}]",
                "critical_path": "list[task_id] in order",
                "parallel_tracks": "list[list[task_id]]",
                "blocking_dependencies": "list[dependency_id] — must resolve before dispatch",
                "dependency_matrix": "2D task × task dependency grid",
            },
        }, indent=2)


# =============================================================================
# 6. Git Workflow Governance
# =============================================================================
class GitWorkflowInput(BaseModel):
    feature: str = Field(..., description="Feature name to create Git workflow spec for.")
    task_description: str = Field(..., description="Brief task description for commit/PR naming.")

class GitWorkflowSkill(BaseTool):
    name: str = "git_workflow_governance"
    description: str = (
        "Generate Git workflow specifications for a feature task. "
        "Enforces: One Feature → One Worktree → One Branch → One PR → One Merge. "
        "Git Workflow Compliance must remain ≥ 100%."
    )
    args_schema: Type[BaseModel] = GitWorkflowInput

    GIT_RULES = [
        "One Feature → One Worktree",
        "One Worktree → One Branch",
        "One Branch → One Pull Request",
        "One Pull Request → One Merge",
        "One Merge → Successful GitHub Actions",
        "No feature accumulation",
        "Atomic commits only",
        "Conventional Commit messages",
        "Rebase onto origin/main before merge",
        "Delete worktree after merge",
    ]

    def _run(self, feature: str, task_description: str) -> str:
        slug = feature.lower().replace(" ", "-").replace("_", "-")
        return json.dumps({
            "skill": "git_workflow_governance",
            "workflow_spec": {
                "worktree": f"feat/{slug}",
                "branch": f"feat/{slug}",
                "commit_message": f"feat({slug}): {task_description.lower()[:60]}",
                "pr_title": f"feat: {task_description}",
                "pr_checklist": [
                    "Rebase onto origin/main completed",
                    "All GitHub Actions passing",
                    "Acceptance criteria verified",
                    "Documentation updated",
                    "Tests passing (coverage ≥ 80%)",
                    "Code review approved",
                    "No uncommitted changes",
                ],
                "post_merge": "Delete worktree and remote branch",
                "rules_enforced": self.GIT_RULES,
            },
        }, indent=2)


# =============================================================================
# 7. Release Planning
# =============================================================================
class ReleasePlanningInput(BaseModel):
    version: str = Field(..., description="Release version (e.g. '1.2.0').")
    features: list[str] = Field(..., description="Feature IDs or titles included in this release.")
    target_date: Optional[str] = Field(default=None, description="Target release date (YYYY-MM-DD).")

class ReleasePlanningSkill(BaseTool):
    name: str = "release_planning"
    description: str = (
        "Plan a software release: scope, schedule, readiness criteria, release notes, "
        "rollback plan, and coordination checklist. Release Success Rate target: ≥ 99%."
    )
    args_schema: Type[BaseModel] = ReleasePlanningInput

    def _run(self, version: str, features: list[str], target_date: Optional[str] = None) -> str:
        return json.dumps({
            "skill": "release_planning",
            "output_schema": {
                "release_plan": {
                    "version": version, "target_date": target_date or "TBD",
                    "features_included": features,
                    "release_criteria": [
                        "All features pass acceptance criteria",
                        "Test coverage ≥ 80%",
                        "Security scan clean",
                        "Performance benchmarks met",
                        "Documentation complete",
                        "Release notes published",
                        "GitHub Actions green on main",
                        "Staging environment validated",
                    ],
                    "release_notes_required": True,
                    "documentation_required": True,
                    "rollback_plan": "{trigger_conditions, rollback_steps, owner}",
                    "deployment_checklist": "list[step]",
                    "stakeholder_communication": "{announce_before_hours, channels}",
                },
            },
        }, indent=2)


# =============================================================================
# 8. Roadmap Planning
# =============================================================================
class RoadmapInput(BaseModel):
    epics: list[str] = Field(..., description="Epics or initiatives to roadmap.")
    horizon_sprints: int = Field(default=6, description="Roadmap horizon in sprints.")

class RoadmapSkill(BaseTool):
    name: str = "roadmap_planning"
    description: str = "Build a delivery roadmap: sequence epics by dependency and priority, assign to sprints, and set milestone dates."
    args_schema: Type[BaseModel] = RoadmapInput

    def _run(self, epics: list[str], horizon_sprints: int = 6) -> str:
        return json.dumps({
            "skill": "roadmap_planning",
            "output_schema": {
                "roadmap": "list[{sprint, epics, milestone, deliverable, confidence}]",
                "now": "Sprint 1–2 commitments",
                "next": "Sprint 3–4 targets",
                "later": "Sprint 5+ aspirations",
                "dependencies": "Ordered dependency graph",
                "milestones": "list[{name, sprint, success_criteria}]",
                "risks": "list[{description, impact_sprint}]",
            },
        }, indent=2)


# =============================================================================
# 9. Capacity Planning
# =============================================================================
class CapacityInput(BaseModel):
    team: str = Field(..., description="Team name or identifier.")
    sprint_count: int = Field(default=3, description="Number of sprints to plan capacity for.")
    team_size: int = Field(..., description="Number of engineers on the team.")

class CapacitySkill(BaseTool):
    name: str = "capacity_planning"
    description: str = "Assess team capacity per sprint, factor in PTO and ceremonies, and balance workload to prevent overcommitment."
    args_schema: Type[BaseModel] = CapacityInput

    def _run(self, team: str, sprint_count: int = 3, team_size: int = 5) -> str:
        return json.dumps({
            "skill": "capacity_planning", "team": team,
            "output_schema": {
                "capacity_model": "dict[sprint, {gross_days, ceremony_overhead_days, pto_days, net_capacity_days}]",
                "recommended_commitment_pct": 80,
                "available_per_sprint": f"{team_size} engineers × net_days × 0.8",
                "velocity_baseline": "{story_points_or_tasks_per_sprint}",
                "overcommitment_warnings": "list[{sprint, overcommit_by_days}]",
                "rebalancing_recommendations": "list[str]",
            },
        }, indent=2)


# =============================================================================
# 10. Stakeholder Management
# =============================================================================
class StakeholderInput(BaseModel):
    project: str = Field(..., description="Project requiring stakeholder management.")

class StakeholderSkill(BaseTool):
    name: str = "stakeholder_management"
    description: str = "Identify stakeholders, assess influence/interest, define communication cadence, and manage expectations."
    args_schema: Type[BaseModel] = StakeholderInput

    def _run(self, project: str) -> str:
        return json.dumps({
            "skill": "stakeholder_management", "project": project,
            "output_schema": {
                "stakeholder_register": "list[{name, role, influence, interest, communication_channel, cadence}]",
                "influence_interest_matrix": "{high_influence_high_interest: manage_closely, ...}",
                "communication_plan": "dict[stakeholder, {format, frequency, owner}]",
                "escalation_paths": "list[{trigger, escalate_to, timeline}]",
                "satisfaction_target_pct": 95,
            },
        }, indent=2)


# =============================================================================
# 11. Change Management
# =============================================================================
class ChangeManagementInput(BaseModel):
    change: str = Field(..., description="Proposed scope or requirement change.")
    impacted_items: Optional[list[str]] = Field(default=None, description="Epics, features, or tasks impacted.")

class ChangeManagementSkill(BaseTool):
    name: str = "change_management"
    description: str = "Manage scope changes: impact analysis on schedule, budget, and quality, approval workflow, and replanning."
    args_schema: Type[BaseModel] = ChangeManagementInput

    def _run(self, change: str, impacted_items: Optional[list[str]] = None) -> str:
        return json.dumps({
            "skill": "change_management", "change": change,
            "output_schema": {
                "impact_analysis": "{schedule_impact_days, budget_impact_usd, quality_risk, affected_items}",
                "approval_required_from": "list[role]",
                "alternatives": "list[{option, trade_offs}]",
                "recommendation": "str",
                "replanning_required": "bool",
                "communication_required": "list[stakeholder]",
            },
        }, indent=2)


# =============================================================================
# 12. Requirements Analysis
# =============================================================================
class RequirementsInput(BaseModel):
    initiative: str = Field(..., description="Initiative or feature to analyse requirements for.")
    source_documents: Optional[list[str]] = Field(default=None, description="Source documents (PRDs, specs, ADRs).")

class RequirementsSkill(BaseTool):
    name: str = "requirements_analysis"
    description: str = "Analyse business and technical requirements and convert them to structured delivery artifacts with priority and acceptance criteria."
    args_schema: Type[BaseModel] = RequirementsInput

    def _run(self, initiative: str, source_documents: Optional[list[str]] = None) -> str:
        return json.dumps({
            "skill": "requirements_analysis", "initiative": initiative,
            "output_schema": {
                "functional_requirements": "list[{id, description, priority: MoSCoW, source}]",
                "non_functional_requirements": "list[{id, category, description, measurable_target}]",
                "constraints": "list[{description, type: technical|business|regulatory}]",
                "assumptions": "list[str]",
                "open_questions": "list[{question, owner, deadline}]",
                "traceability_matrix": "dict[requirement_id, list[story_id]]",
            },
        }, indent=2)


# =============================================================================
# 13. Milestone Tracking
# =============================================================================
class MilestoneInput(BaseModel):
    milestones: list[str] = Field(..., description="Milestone names or IDs to track.")

class MilestoneSkill(BaseTool):
    name: str = "milestone_tracker"
    description: str = "Track milestone progress, compute schedule variance, forecast completion, and flag at-risk milestones. Target: ≥ 95% on time."
    args_schema: Type[BaseModel] = MilestoneInput

    def _run(self, milestones: list[str]) -> str:
        return json.dumps({
            "skill": "milestone_tracker", "milestones": milestones,
            "output_schema": {
                "milestone_status": "list[{id, title, target_date, forecast_date, status: on_track|at_risk|delayed, variance_days, completion_pct}]",
                "schedule_variance_pct": "float (target < 5%)",
                "at_risk_milestones": "list[milestone_id]",
                "recovery_actions": "list[{milestone_id, action, owner, deadline}]",
                "executive_summary": "str",
            },
        }, indent=2)


# =============================================================================
# 14. Issue Management
# =============================================================================
class IssueInput(BaseModel):
    project: str = Field(..., description="Project to manage issues for.")

class IssueSkill(BaseTool):
    name: str = "issue_management"
    description: str = "Track, prioritize, and resolve project issues within SLA. Engineering blockers must be resolved < 1 business day."
    args_schema: Type[BaseModel] = IssueInput

    def _run(self, project: str) -> str:
        return json.dumps({
            "skill": "issue_management", "project": project,
            "output_schema": {
                "issue_log": "list[{id, title, severity, type: blocker|bug|impediment|question, owner, raised_date, sla_deadline, status, resolution}]",
                "blockers": "list[issue_id] — resolution SLA < 1 business day",
                "escalation_required": "bool",
                "aging_issues": "list[{issue_id, days_open, escalation_action}]",
                "resolution_rate_pct": "float (target: 0 unmanaged blockers)",
            },
        }, indent=2)


# =============================================================================
# 15. Decision Tracking
# =============================================================================
class DecisionInput(BaseModel):
    context: str = Field(..., description="Context requiring a project decision.")
    options: list[str] = Field(..., description="Decision options.")

class DecisionSkill(BaseTool):
    name: str = "decision_tracking"
    description: str = "Log project decisions with context, options evaluated, rationale, owner, and outcomes for full audit trail."
    args_schema: Type[BaseModel] = DecisionInput

    def _run(self, context: str, options: list[str]) -> str:
        return json.dumps({
            "skill": "decision_tracking",
            "output_schema": {
                "decision_record": {
                    "id": "DEC-XXX",
                    "date": "YYYY-MM-DD",
                    "context": context,
                    "options_considered": options,
                    "decision": "TBD",
                    "rationale": "str",
                    "owner": "str",
                    "stakeholders_informed": "list[str]",
                    "review_date": "YYYY-MM-DD",
                    "outcome": "TBD",
                },
            },
        }, indent=2)


# =============================================================================
# 16. Program Management
# =============================================================================
class ProgramInput(BaseModel):
    program: str = Field(..., description="Program name encompassing multiple projects.")

class ProgramSkill(BaseTool):
    name: str = "program_management"
    description: str = "Coordinate multiple related projects toward a common program goal: portfolio view, inter-project dependencies, resource sharing."
    args_schema: Type[BaseModel] = ProgramInput

    def _run(self, program: str) -> str:
        return json.dumps({
            "skill": "program_management", "program": program,
            "output_schema": {
                "program_charter": "{vision, objectives, scope, stakeholders, governance}",
                "project_portfolio": "list[{project_id, status, health, milestone, owner}]",
                "inter_project_dependencies": "list[{from_project, to_project, dependency, sla}]",
                "resource_sharing": "list[{resource, projects_sharing, conflict_risk}]",
                "program_risks": "list[{risk, affected_projects, mitigation}]",
                "governance_cadence": "{steering_committee, frequency, reporting}",
            },
        }, indent=2)


# =============================================================================
# 17. Portfolio Management
# =============================================================================
class PortfolioInput(BaseModel):
    initiatives: list[str] = Field(..., description="Initiatives in the portfolio.")

class PortfolioSkill(BaseTool):
    name: str = "portfolio_management"
    description: str = "Oversee project portfolio: strategic alignment scoring, prioritization, capacity allocation, and investment tracking."
    args_schema: Type[BaseModel] = PortfolioInput

    def _run(self, initiatives: list[str]) -> str:
        return json.dumps({
            "skill": "portfolio_management", "initiatives": initiatives,
            "output_schema": {
                "portfolio_view": "list[{initiative, strategic_score, roi_estimate, effort, priority_rank, status}]",
                "resource_allocation": "dict[initiative, capacity_pct]",
                "investment_tracking": "dict[initiative, {budget, spent, forecast}]",
                "strategic_alignment_matrix": "dict[initiative, {objective, alignment_score}]",
                "deprioritize_recommendations": "list[{initiative, rationale}]",
            },
        }, indent=2)


# =============================================================================
# 18. Agile Methodologies
# =============================================================================
class AgileInput(BaseModel):
    team: str = Field(..., description="Team to apply agile methodology to.")
    methodology: str = Field(default="scrum", description="Methodology: scrum|kanban|safe|scrumban")

class AgileSkill(BaseTool):
    name: str = "agile_methodologies"
    description: str = "Apply and tailor agile methodologies for a team: ceremonies, artifacts, metrics, and continuous improvement cadence."
    args_schema: Type[BaseModel] = AgileInput

    def _run(self, team: str, methodology: str = "scrum") -> str:
        return json.dumps({
            "skill": "agile_methodologies", "team": team, "methodology": methodology,
            "output_schema": {
                "ceremonies": "list[{name, cadence, duration, participants, output}]",
                "artifacts": "list[{name, owner, update_frequency}]",
                "metrics": "list[{metric, target, measurement_tool}]",
                "improvement_backlog": "list[{item, retrospective_source, owner}]",
                "team_agreements": "list[{agreement, rationale}]",
            },
        }, indent=2)


# =============================================================================
# 19. Scrum
# =============================================================================
class ScrumInput(BaseModel):
    team: str = Field(..., description="Scrum team name.")
    sprint_length_weeks: int = Field(default=2, description="Sprint length in weeks.")

class ScrumSkill(BaseTool):
    name: str = "scrum"
    description: str = "Facilitate Scrum: sprint planning, daily standups, sprint review, retrospective, and backlog refinement."
    args_schema: Type[BaseModel] = ScrumInput

    def _run(self, team: str, sprint_length_weeks: int = 2) -> str:
        return json.dumps({
            "skill": "scrum", "team": team, "sprint_length_weeks": sprint_length_weeks,
            "ceremonies": {
                "sprint_planning": f"Day 1, {sprint_length_weeks*5*60}min max",
                "daily_standup": "Every day, 15min, {yesterday, today, blockers}",
                "sprint_review": f"Day {sprint_length_weeks*5}, 60min, demo to stakeholders",
                "retrospective": f"Day {sprint_length_weeks*5}, 90min, {went_well, improve, actions}",
                "backlog_refinement": "Mid-sprint, 60min, groom top 2 sprints",
            },
            "output_schema": {
                "sprint_backlog": "list[{story_id, title, points, assignee, status}]",
                "burndown": "{ideal_line, actual_line, forecast}",
                "velocity": "{last_3_sprints_avg, current_sprint_target}",
                "retrospective_actions": "list[{action, owner, sprint_target}]",
            },
        }, indent=2)


# =============================================================================
# 20. Kanban
# =============================================================================
class KanbanInput(BaseModel):
    team: str = Field(..., description="Team using Kanban.")
    columns: Optional[list[str]] = Field(default=None, description="Board columns.")

class KanbanSkill(BaseTool):
    name: str = "kanban"
    description: str = "Manage continuous flow with WIP limits, throughput optimization, and cycle time measurement."
    args_schema: Type[BaseModel] = KanbanInput

    def _run(self, team: str, columns: Optional[list[str]] = None) -> str:
        default_cols = ["Backlog", "Ready", "In Progress", "Review", "Done"]
        return json.dumps({
            "skill": "kanban", "team": team,
            "board_columns": columns or default_cols,
            "output_schema": {
                "wip_limits": "dict[column, max_items]",
                "cycle_time": "{p50_days, p85_days, p95_days}",
                "throughput": "{items_per_week, trend}",
                "flow_efficiency": "float pct (value_add_time / total_time)",
                "bottleneck_analysis": "list[{column, avg_wait_days, recommendation}]",
                "cumulative_flow_diagram": "{scope, completed, in_progress}",
            },
        }, indent=2)


# =============================================================================
# 21. Scaled Agile (SAFe)
# =============================================================================
class SAFeInput(BaseModel):
    program: str = Field(..., description="Program or Agile Release Train (ART) name.")

class SAFeSkill(BaseTool):
    name: str = "scaled_agile"
    description: str = "Coordinate agile delivery at scale: PI Planning, ART synchronization, value streams, and program increments."
    args_schema: Type[BaseModel] = SAFeInput

    def _run(self, program: str) -> str:
        return json.dumps({
            "skill": "scaled_agile", "program": program,
            "output_schema": {
                "pi_objectives": "list[{team, objective, business_value, committed}]",
                "program_board": "{features, iterations, dependencies, risks}",
                "art_sync_cadence": "{frequency, participants, agenda}",
                "value_streams": "list[{name, steps, lead_time}]",
                "innovation_planning_iteration": "{capacity_pct: 20, activities}",
            },
        }, indent=2)


# =============================================================================
# 22. Resource Planning
# =============================================================================
class ResourceInput(BaseModel):
    project: str = Field(..., description="Project requiring resource planning.")
    skills_required: Optional[list[str]] = Field(default=None, description="Required skill sets.")

class ResourceSkill(BaseTool):
    name: str = "resource_planning"
    description: str = "Plan resource allocation across teams, skills, and timelines. Identify skill gaps and recommend hiring or reallocation."
    args_schema: Type[BaseModel] = ResourceInput

    def _run(self, project: str, skills_required: Optional[list[str]] = None) -> str:
        return json.dumps({
            "skill": "resource_planning", "project": project,
            "output_schema": {
                "resource_plan": "list[{role, skill_required, allocated_person, allocation_pct, start_date, end_date}]",
                "skill_gaps": "list[{skill, gap_size, mitigation: hire|contract|upskill|reassign}]",
                "utilization_forecast": "dict[person, {sprint, utilization_pct}]",
                "contention_risks": "list[{person, competing_projects, risk}]",
                "hiring_recommendations": "list[{role, urgency, justification}]",
            },
        }, indent=2)


# =============================================================================
# 23. Cross-functional Coordination
# =============================================================================
class CrossFunctionalInput(BaseModel):
    initiative: str = Field(..., description="Initiative requiring cross-functional coordination.")
    teams: list[str] = Field(..., description="Teams involved.")

class CrossFunctionalSkill(BaseTool):
    name: str = "cross_functional_coordination"
    description: str = "Coordinate across engineering, product, architecture, QA, and DevOps teams: RACI matrix, sync cadence, and escalation paths."
    args_schema: Type[BaseModel] = CrossFunctionalInput

    def _run(self, initiative: str, teams: list[str]) -> str:
        return json.dumps({
            "skill": "cross_functional_coordination", "initiative": initiative, "teams": teams,
            "output_schema": {
                "raci_matrix": "dict[activity, {responsible, accountable, consulted, informed}]",
                "sync_cadence": "list[{meeting, frequency, participants, agenda}]",
                "communication_channels": "dict[purpose, channel]",
                "escalation_paths": "list[{trigger, escalate_to, sla_hours}]",
                "inter_team_dependencies": "list[{from_team, to_team, dependency, owner}]",
            },
        }, indent=2)


# =============================================================================
# 24. Engineering Governance
# =============================================================================
class EngineeringGovInput(BaseModel):
    scope: str = Field(..., description="Engineering scope to govern (team, project, or org).")

class EngineeringGovSkill(BaseTool):
    name: str = "engineering_governance"
    description: str = "Enforce engineering standards, code review processes, quality gates, and Git workflow compliance ≥ 100%."
    args_schema: Type[BaseModel] = EngineeringGovInput

    def _run(self, scope: str) -> str:
        return json.dumps({
            "skill": "engineering_governance", "scope": scope,
            "output_schema": {
                "git_compliance_check": "{compliance_pct, violations, remediation}",
                "pr_review_sla": "{target_hours: 24, current_avg, at_risk}",
                "github_actions_health": "{success_pct, failing_workflows, remediation}",
                "quality_gates": "list[{gate, status, blocking}]",
                "documentation_completion": "{pct, missing_items}",
                "governance_score": "float 0–100 (target ≥ 95)",
            },
        }, indent=2)


# =============================================================================
# 25. Quality Planning
# =============================================================================
class QualityPlanningInput(BaseModel):
    project: str = Field(..., description="Project requiring a quality plan.")

class QualityPlanningSkill(BaseTool):
    name: str = "quality_planning"
    description: str = "Plan quality activities: test strategy, coverage targets, review gates, and definition of done for the project."
    args_schema: Type[BaseModel] = QualityPlanningInput

    def _run(self, project: str) -> str:
        return json.dumps({
            "skill": "quality_planning", "project": project,
            "output_schema": {
                "test_strategy": "{unit, integration, e2e, performance, security, acceptance}",
                "coverage_targets": "{unit_pct: 80, integration_pct: 70, e2e_pct: 60}",
                "review_gates": "list[{gate, criteria, owner, SLA}]",
                "definition_of_done": "list[criterion]",
                "qa_coordination": "{qa_lead, review_cadence, blocking_criteria}",
                "defect_sla": "{critical_hours: 4, high_hours: 24, medium_hours: 72}",
            },
        }, indent=2)


# =============================================================================
# 26. Documentation Management
# =============================================================================
class DocumentationInput(BaseModel):
    project: str = Field(..., description="Project to track documentation for.")

class DocumentationSkill(BaseTool):
    name: str = "documentation_management"
    description: str = "Track and enforce documentation completion ≥ 100%. Every feature requires docs, release notes, and architecture updates."
    args_schema: Type[BaseModel] = DocumentationInput

    def _run(self, project: str) -> str:
        return json.dumps({
            "skill": "documentation_management", "project": project,
            "required_docs": [
                "API documentation", "Architecture decision records (ADRs)",
                "Deployment runbooks", "Release notes", "User guides",
                "Onboarding docs", "Retrospective reports", "Architecture diagrams",
            ],
            "output_schema": {
                "documentation_tracker": "list[{doc_type, feature, owner, status, due_date}]",
                "completion_pct": "float (target ≥ 100%)",
                "overdue_docs": "list[{doc_type, overdue_days, owner}]",
                "blocking_releases": "list[{doc_type, blocks_release}]",
            },
        }, indent=2)


# =============================================================================
# 27. DevOps Coordination
# =============================================================================
class DevOpsCoordInput(BaseModel):
    release: str = Field(..., description="Release or deployment to coordinate.")

class DevOpsCoordSkill(BaseTool):
    name: str = "devops_coordination"
    description: str = "Coordinate DevOps activities: CI/CD pipeline health, release scheduling, infrastructure changes, and GitHub Actions success ≥ 99%."
    args_schema: Type[BaseModel] = DevOpsCoordInput

    def _run(self, release: str) -> str:
        return json.dumps({
            "skill": "devops_coordination", "release": release,
            "output_schema": {
                "cicd_health": "{github_actions_success_pct, failing_pipelines, remediation}",
                "deployment_checklist": "list[{step, owner, status}]",
                "infrastructure_changes": "list[{change, owner, review_required, impact}]",
                "rollback_readiness": "{plan_exists, tested, owner}",
                "release_window": "{start, end, change_freeze}",
                "post_deploy_monitoring": "{duration_hours, metrics_to_watch, escalation}",
            },
        }, indent=2)


# =============================================================================
# 28. Communication Management
# =============================================================================
class CommunicationInput(BaseModel):
    project: str = Field(..., description="Project requiring communication management.")
    audience: str = Field(default="all", description="Audience: executives|engineering|stakeholders|all")

class CommunicationSkill(BaseTool):
    name: str = "communication_management"
    description: str = "Produce and manage project communications: status reports, dashboards, executive summaries, and sprint updates."
    args_schema: Type[BaseModel] = CommunicationInput

    def _run(self, project: str, audience: str = "all") -> str:
        return json.dumps({
            "skill": "communication_management", "project": project, "audience": audience,
            "output_schema": {
                "status_report": "{period, summary, milestones, risks, blockers, next_actions, RAG_status}",
                "executive_dashboard": "{delivery_health, kpi_scorecard, top_risks, decisions_needed}",
                "sprint_update": "{sprint_goal, completed, in_progress, blockers, next_sprint_preview}",
                "communication_calendar": "list[{report, frequency, audience, channel, owner}]",
                "rag_status": "Red|Amber|Green with rationale",
            },
        }, indent=2)


# =============================================================================
# 29. Continuous Improvement
# =============================================================================
class ContinuousImprovementInput(BaseModel):
    team: str = Field(..., description="Team to run continuous improvement for.")
    retrospective_data: Optional[str] = Field(default=None, description="Retrospective notes or feedback.")

class ContinuousImprovementSkill(BaseTool):
    name: str = "continuous_improvement"
    description: str = "Facilitate retrospectives, identify improvement actions, track implementation, and measure impact on delivery metrics."
    args_schema: Type[BaseModel] = ContinuousImprovementInput

    def _run(self, team: str, retrospective_data: Optional[str] = None) -> str:
        return json.dumps({
            "skill": "continuous_improvement", "team": team,
            "output_schema": {
                "went_well": "list[str]",
                "improve": "list[str]",
                "action_items": "list[{action, owner, sprint_target, success_metric}]",
                "metrics_trend": "dict[metric, {current, previous, trend: up|down|stable}]",
                "experiment_backlog": "list[{hypothesis, experiment, measure}]",
                "improvement_velocity": "{actions_completed_last_3_sprints, completion_rate_pct}",
            },
        }, indent=2)


# =============================================================================
# 30. AI Project Delivery
# =============================================================================
class AIProjectInput(BaseModel):
    ai_initiative: str = Field(..., description="AI/ML initiative to plan delivery for.")

class AIProjectSkill(BaseTool):
    name: str = "ai_project_delivery"
    description: str = "Manage AI/ML project delivery: data pipeline sprints, model iteration cycles, evaluation gates, and RAG/agent deployment planning."
    args_schema: Type[BaseModel] = AIProjectInput

    def _run(self, ai_initiative: str) -> str:
        return json.dumps({
            "skill": "ai_project_delivery", "initiative": ai_initiative,
            "ai_specific_activities": [
                "Data collection and labelling sprint",
                "Model baseline training sprint",
                "Evaluation and benchmarking gate",
                "Fine-tuning iteration cycles",
                "RAG pipeline integration sprint",
                "Safety and guardrail review",
                "Staging environment validation",
                "Production deployment and monitoring",
            ],
            "output_schema": {
                "ai_delivery_plan": "{phases, milestones, evaluation_gates, rollback_criteria}",
                "data_pipeline_tasks": "list[{task, owner, data_source, timeline}]",
                "model_iteration_plan": "{baseline, iterations, acceptance_threshold}",
                "evaluation_framework": "{metrics, benchmarks, human_eval_required}",
                "monitoring_plan": "{drift_detection, cost_tracking, quality_metrics}",
            },
        }, indent=2)


# =============================================================================
# 31. Release Coordination
# =============================================================================
class ReleaseCoordInput(BaseModel):
    version: str = Field(..., description="Version to coordinate release for.")

class ReleaseCoordSkill(BaseTool):
    name: str = "release_coordination"
    description: str = "Coordinate software release: readiness checks, go/no-go decision, deployment scheduling, and post-release monitoring. Release Success Rate ≥ 99%."
    args_schema: Type[BaseModel] = ReleaseCoordInput

    def _run(self, version: str) -> str:
        return json.dumps({
            "skill": "release_coordination", "version": version,
            "output_schema": {
                "release_readiness_checklist": "list[{item, status: pass|fail|pending, blocker}]",
                "go_no_go_decision": "{recommendation, blocking_items, sign_off_required_from}",
                "deployment_schedule": "{window, environment_order, rollback_trigger}",
                "stakeholder_notifications": "list[{stakeholder, channel, timing}]",
                "post_release_monitoring": "{duration, metrics, escalation_criteria}",
                "retrospective_scheduled": "bool",
            },
        }, indent=2)


# =============================================================================
# 32. Strategic Planning
# =============================================================================
class StrategicDeliveryInput(BaseModel):
    objective: str = Field(..., description="Strategic objective to plan delivery for.")

class StrategicDeliverySkill(BaseTool):
    name: str = "strategic_planning"
    description: str = "Translate strategic objectives into an executable program plan with epics, milestones, KPIs, and governance checkpoints."
    args_schema: Type[BaseModel] = StrategicDeliveryInput

    def _run(self, objective: str) -> str:
        return json.dumps({
            "skill": "strategic_planning", "objective": objective,
            "output_schema": {
                "program_plan": "{vision, objectives, scope, out_of_scope, assumptions}",
                "epics": "list[{id, title, business_value, priority, effort_estimate}]",
                "milestones": "list[{id, title, target_date, success_criteria, dependencies}]",
                "kpis": "list[{metric, baseline, target, measurement_method}]",
                "governance_checkpoints": "list[{name, timing, participants, decisions}]",
                "budget_estimate": "{phases, total_usd, contingency_pct}",
            },
        }, indent=2)


# =============================================================================
# 33. Architecture Awareness
# =============================================================================
class ArchAwarenessInput(BaseModel):
    feature: str = Field(..., description="Feature to check for architectural implications.")

class ArchAwarenessSkill(BaseTool):
    name: str = "architecture_awareness"
    description: str = "Ensure delivery plans respect architectural decisions, governance gates, and ADR requirements before task dispatch."
    args_schema: Type[BaseModel] = ArchAwarenessInput

    def _run(self, feature: str) -> str:
        return json.dumps({
            "skill": "architecture_awareness", "feature": feature,
            "output_schema": {
                "architectural_dependencies": "list[{component, impact, adr_required}]",
                "governance_gates_required": "list[{gate, owner, sla_hours}]",
                "adrs_to_review": "list[adr_id]",
                "architectural_risks": "list[{risk, severity, mitigation}]",
                "escalate_to_enterprise_architect": "bool",
                "blockers": "list[str]",
            },
        }, indent=2)


# =============================================================================
# 34. SDLC
# =============================================================================
class SDLCInput(BaseModel):
    project_type: str = Field(default="agile", description="Project type: agile|waterfall|hybrid|kanban")

class SDLCSkill(BaseTool):
    name: str = "sdlc"
    description: str = "Govern the full Software Development Lifecycle: requirements → design → develop → test → deploy → operate → improve."
    args_schema: Type[BaseModel] = SDLCInput

    def _run(self, project_type: str = "agile") -> str:
        return json.dumps({
            "skill": "sdlc", "project_type": project_type,
            "phases": ["Requirements", "Architecture", "Development", "Testing", "Release", "Operations", "Retrospective"],
            "output_schema": {
                "phase_gates": "list[{phase, entry_criteria, exit_criteria, approver}]",
                "artifacts_per_phase": "dict[phase, list[artifact]]",
                "quality_gates": "list[{phase, gate, criteria, blocking}]",
                "documentation_requirements": "dict[phase, list[doc_type]]",
                "handoff_protocols": "list[{from_phase, to_phase, handoff_checklist}]",
            },
        }, indent=2)


# =============================================================================
# 35. Cloud Project Management
# =============================================================================
class CloudProjectInput(BaseModel):
    cloud_initiative: str = Field(..., description="Cloud project or migration initiative.")

class CloudProjectSkill(BaseTool):
    name: str = "cloud_project_management"
    description: str = "Manage cloud infrastructure projects: provisioning timelines, migration planning, cost governance, and FinOps coordination."
    args_schema: Type[BaseModel] = CloudProjectInput

    def _run(self, cloud_initiative: str) -> str:
        return json.dumps({
            "skill": "cloud_project_management", "initiative": cloud_initiative,
            "output_schema": {
                "provisioning_plan": "list[{resource, environment, owner, eta}]",
                "migration_phases": "list[{phase, workloads, risk, rollback}]",
                "cost_governance": "{budget_usd, alerts, finops_owner}",
                "compliance_checkpoints": "list[{regulation, checkpoint, evidence}]",
                "decommission_plan": "list[{old_resource, decommission_date, dependencies}]",
            },
        }, indent=2)


# =============================================================================
# 36. Product Lifecycle Management
# =============================================================================
class ProductLifecycleInput(BaseModel):
    product: str = Field(..., description="Product to manage lifecycle for.")

class ProductLifecycleSkill(BaseTool):
    name: str = "product_lifecycle_management"
    description: str = "Manage product from inception to sunset: versioning strategy, deprecation policy, and end-of-life planning."
    args_schema: Type[BaseModel] = ProductLifecycleInput

    def _run(self, product: str) -> str:
        return json.dumps({
            "skill": "product_lifecycle_management", "product": product,
            "output_schema": {
                "lifecycle_stage": "inception|growth|maturity|decline|sunset",
                "versioning_strategy": "{scheme: semver, release_cadence, LTS_policy}",
                "deprecation_policy": "{notice_period_months, migration_path, support_end_date}",
                "eol_plan": "{announcement_date, migration_guide, sunset_date}",
                "feature_toggle_strategy": "{tool, cleanup_policy}",
            },
        }, indent=2)


# =============================================================================
# 37. Business Analysis
# =============================================================================
class BusinessAnalysisInput(BaseModel):
    problem: str = Field(..., description="Business problem or opportunity to analyse.")

class BusinessAnalysisSkill(BaseTool):
    name: str = "business_analysis"
    description: str = "Bridge business needs and technical solutions: root cause analysis, process mapping, cost-benefit analysis, and success metrics."
    args_schema: Type[BaseModel] = BusinessAnalysisInput

    def _run(self, problem: str) -> str:
        return json.dumps({
            "skill": "business_analysis", "problem": problem,
            "output_schema": {
                "root_cause_analysis": "{fishbone_summary, contributing_factors, root_cause}",
                "as_is_process": "list[{step, owner, pain_point}]",
                "to_be_process": "list[{step, owner, improvement}]",
                "cost_benefit_analysis": "{investment_usd, expected_benefit_usd, payback_months}",
                "success_metrics": "list[{metric, baseline, target, measurement_method}]",
                "recommendation": "str",
            },
        }, indent=2)


# =============================================================================
# 38. Conflict Resolution
# =============================================================================
class ConflictInput(BaseModel):
    conflict: str = Field(..., description="Conflict description.")
    parties: list[str] = Field(..., description="Parties involved in the conflict.")

class ConflictSkill(BaseTool):
    name: str = "conflict_resolution"
    description: str = "Identify and resolve team conflicts, competing priorities, and resource contention with structured facilitation."
    args_schema: Type[BaseModel] = ConflictInput

    def _run(self, conflict: str, parties: list[str]) -> str:
        return json.dumps({
            "skill": "conflict_resolution", "conflict": conflict, "parties": parties,
            "output_schema": {
                "root_cause": "str",
                "interests_per_party": "dict[party, list[interest]]",
                "options": "list[{option, pros, cons, acceptability}]",
                "recommended_resolution": "str",
                "action_items": "list[{action, owner, deadline}]",
                "escalation_required": "bool",
                "follow_up_date": "YYYY-MM-DD",
            },
        }, indent=2)


# =============================================================================
# 39. Meeting Facilitation
# =============================================================================
class MeetingInput(BaseModel):
    meeting_type: str = Field(..., description="Meeting type: standup|planning|review|retro|steering|kickoff")
    participants: list[str] = Field(..., description="Meeting participants.")

class MeetingSkill(BaseTool):
    name: str = "meeting_facilitation"
    description: str = "Facilitate effective meetings: structured agendas, time-boxing, decisions, and action items with owners and deadlines."
    args_schema: Type[BaseModel] = MeetingInput

    def _run(self, meeting_type: str, participants: list[str]) -> str:
        return json.dumps({
            "skill": "meeting_facilitation",
            "output_schema": {
                "agenda": "list[{item, duration_min, facilitator, expected_outcome}]",
                "pre_read": "list[{document, required_for}]",
                "decisions_made": "list[{decision, owner, rationale}]",
                "action_items": "list[{action, owner, due_date, priority}]",
                "parking_lot": "list[{topic, owner, follow_up_meeting}]",
                "next_meeting": "{date, participants, agenda_preview}",
            },
        }, indent=2)


# =============================================================================
# 40. Technical Task Planning
# =============================================================================
class TechnicalTaskInput(BaseModel):
    user_story: str = Field(..., description="User story to break into technical tasks.")
    capability: str = Field(..., description="Agent capability responsible for implementation.")

class TechnicalTaskSkill(BaseTool):
    name: str = "technical_task_planning"
    description: str = "Break user stories into atomic 1-day technical tasks, each with a complete Git workflow specification and acceptance criteria."
    args_schema: Type[BaseModel] = TechnicalTaskInput

    def _run(self, user_story: str, capability: str) -> str:
        return json.dumps({
            "skill": "technical_task_planning",
            "output_schema": {
                "tasks": "list[{id, title, capability, estimate_days: 1, git_workflow: {worktree, branch, commit_message, pr_title}, acceptance_criteria, parallelizable}]",
                "task_ordering": "list[task_id] in dependency order",
                "parallel_groups": "list[list[task_id]]",
                "total_effort_days": "float",
                "risks": "list[{task_id, risk, mitigation}]",
            },
            "git_workflow_reminder": "One Feature → One Worktree → One Branch → One PR → One Merge → GitHub Actions → Delete Worktree",
        }, indent=2)


# =============================================================================
# 41. Executive Reporting
# =============================================================================
class ExecutiveReportInput(BaseModel):
    project: str = Field(..., description="Project to report on.")
    period: str = Field(default="weekly", description="Reporting period: daily|weekly|monthly|quarterly")

class ExecutiveReportSkill(BaseTool):
    name: str = "executive_reporting"
    description: str = "Produce executive status reports and delivery dashboards with RAG status, KPI scorecard, risks, and decisions needed."
    args_schema: Type[BaseModel] = ExecutiveReportInput

    def _run(self, project: str, period: str = "weekly") -> str:
        return json.dumps({
            "skill": "executive_reporting", "project": project, "period": period,
            "output_schema": {
                "rag_status": "Red|Amber|Green with rationale",
                "kpi_scorecard": "dict[kpi, {target, actual, status}]",
                "headline_summary": "str (2–3 sentences, executive-level)",
                "milestones_this_period": "list[{milestone, status, variance_days}]",
                "top_risks": "list[{risk, severity, mitigation_status}]",
                "decisions_needed": "list[{decision, owner, deadline, options}]",
                "next_period_plan": "list[{commitment, owner}]",
                "budget_status": "{budget_usd, spent_usd, forecast_usd, variance_pct}",
            },
        }, indent=2)


# =============================================================================
# Skill Registry
# =============================================================================

PROJECT_MANAGER_SKILLS: list[BaseTool] = [
    EpicDecompositionSkill(),
    UserStorySkill(),
    SprintPlanningSkill(),
    RiskManagementSkill(),
    DependencySkill(),
    GitWorkflowSkill(),
    ReleasePlanningSkill(),
    RoadmapSkill(),
    CapacitySkill(),
    StakeholderSkill(),
    ChangeManagementSkill(),
    RequirementsSkill(),
    MilestoneSkill(),
    IssueSkill(),
    DecisionSkill(),
    ProgramSkill(),
    PortfolioSkill(),
    AgileSkill(),
    ScrumSkill(),
    KanbanSkill(),
    SAFeSkill(),
    ResourceSkill(),
    CrossFunctionalSkill(),
    EngineeringGovSkill(),
    QualityPlanningSkill(),
    DocumentationSkill(),
    DevOpsCoordSkill(),
    CommunicationSkill(),
    ContinuousImprovementSkill(),
    AIProjectSkill(),
    ReleaseCoordSkill(),
    StrategicDeliverySkill(),
    ArchAwarenessSkill(),
    SDLCSkill(),
    CloudProjectSkill(),
    ProductLifecycleSkill(),
    BusinessAnalysisSkill(),
    ConflictSkill(),
    MeetingSkill(),
    TechnicalTaskSkill(),
    ExecutiveReportSkill(),
]

__all__ = [
    "PROJECT_MANAGER_SKILLS",
    "EpicDecompositionSkill",
    "UserStorySkill",
    "SprintPlanningSkill",
    "RiskManagementSkill",
    "GitWorkflowSkill",
    "ReleasePlanningSkill",
    "MilestoneSkill",
    "ExecutiveReportSkill",
]
