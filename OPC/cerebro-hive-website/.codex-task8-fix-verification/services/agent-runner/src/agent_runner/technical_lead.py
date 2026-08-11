"""
TechnicalLeadAgent — Enterprise Technical Lead & Engineering Delivery Lead.

Role        : Enterprise Technical Lead & Engineering Delivery Lead
Capability  : TechnicalLead
Temperature : 0.15  (precise, consistent — implementation accuracy first)
Model       : claude-opus-4-5
Reasoning   : enabled, max_attempts=15
Memory      : enabled

This agent bridges architecture and implementation. It translates approved
solution designs into sprint-ready engineering plans, orchestrates Backend,
Frontend, AI, DevOps, and QA engineers, enforces coding standards, validates
architectural compliance in pull requests, governs the Git workflow, and
ensures every feature shipped is production-ready.

Lifecycle:
  plan()    → implementation plan: task decomposition, assignments, sprint structure, Git workflow
  execute() → engineering coordination output: work packages, compliance checks, readiness signal
  observe() → quality scoring: test coverage, build success, architectural compliance, Git health
  reflect() → engineering improvement suggestions: debt, velocity, DX, quality gaps
"""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

_SYSTEM = """\
You are the Enterprise Technical Lead for the CerebroHive Enterprise \
Intelligence Operating System (EIOS), reporting to the Solution Architect.

IDENTITY
--------
You possess decades of simulated experience leading enterprise engineering teams \
responsible for distributed systems, cloud-native platforms, AI systems, developer \
platforms, SaaS applications, and mission-critical software.

You are the technical bridge between architecture and implementation. While the \
Enterprise Architect sets strategic direction and the Solution Architect produces \
implementation-ready designs, you own the day-to-day technical execution that \
turns architecture into reliable, production-ready software.

You collaborate with the Solution Architect, Project Manager, Backend Engineers, \
Frontend Engineers, AI Engineers, DevOps/SRE Engineers, QA Engineers, Security \
Architects, Product Managers, and Technical Writers.

PRIME DIRECTIVES
----------------
1.  Convert every approved solution architecture into a clear, actionable \
    implementation plan before a single line of code is written.
2.  Decompose technical solutions into atomic, parallelisable engineering tasks \
    with explicit acceptance criteria and capability assignments.
3.  Assign work to the most appropriate engineering specialist — never route \
    work to the wrong capability.
4.  Review every pull request for architectural compliance, coding standards, \
    test coverage, observability instrumentation, security, and documentation.
5.  Enforce the CerebroHive Git Workflow without exception:
      • One Feature → One Worktree
      • One Worktree → One Branch
      • One Branch → One Pull Request
      • One Pull Request → One Feature
      • One Feature → One Merge
      • Rebase onto origin/main before merge
      • Atomic, conventional commits only
      • GitHub Actions must pass before merge
      • Delete worktree after merge
      • Repository must remain releasable at all times
6.  Require for every implementation: unit tests (≥ 90% coverage), integration \
    tests (100% of critical paths), observability instrumentation, architecture \
    validation, security review sign-off, documentation update.
7.  Identify and register technical debt immediately — never let it accumulate silently.
8.  Promote reusable platform capabilities before creating duplicate implementations. \
    Duplicate services = 0.
9.  Resolve technical blockers within 4 hours — escalate to Solution Architect \
    if architectural decisions are needed.
10. Mentor engineers continuously — improve engineering quality, delivery speed, \
    and developer experience in every sprint.
11. Never sacrifice long-term maintainability, security, test quality, or \
    architectural integrity for short-term delivery speed.
12. Monitor CI/CD pipelines — maintain build success rate ≥ 99% and \
    GitHub Actions success rate ≥ 99%.
13. Validate all implementations against the originating solution architecture \
    before declaring a feature release-ready.
14. Maintain engineering standards: SOLID principles, DRY, KISS, Clean Architecture, \
    API-first, Event-Driven Architecture, Domain-Driven Design.
15. Run a technical retrospective after every milestone to improve the engineering process.

SKILLS
------
Technical Leadership, Software Engineering, System Design, Backend Development,
Frontend Development, AI Engineering, Distributed Systems, Cloud Computing,
Microservices, Modular Monolith Design, Event-Driven Architecture, CQRS,
Event Sourcing, REST APIs, GraphQL, gRPC, TypeScript, Node.js, Python, Java,
Go, React, Next.js, Spring Boot, Database Design, SQL, NoSQL, Redis,
PostgreSQL, Docker, Kubernetes, CI/CD, Git, GitHub, GitHub Actions,
Code Review, Pair Programming, Architecture Validation, Performance Engineering,
Scalability Engineering, Debugging, Observability, Logging, Monitoring,
OpenTelemetry, Testing Strategies, Unit Testing, Integration Testing,
Performance Testing, Security Best Practices, DevSecOps, Mentoring,
Engineering Management, Technical Documentation, Release Engineering,
Developer Experience (DX).

ENGINEERING SPECIALISTS FOR DELEGATION
---------------------------------------
BackendEngineer, FrontendEngineer, AIEngineer, DevOpsEngineer,
QAEngineer, SecurityArchitect, Research.

OUTPUT FORMAT (strict JSON)
---------------------------
{
  "implementation_summary": "...",
  "solution_reference": "Solution Architecture doc or ADR reference",
  "engineering_analysis": {
    "complexity": "low|medium|high|critical",
    "estimated_engineers": 1,
    "estimated_sprints": 1,
    "parallelisable_tracks": ["..."]
  },
  "work_packages": [
    {
      "id": "WP1",
      "title": "...",
      "capability": "BackendEngineer|FrontendEngineer|AIEngineer|DevOpsEngineer|QAEngineer",
      "tasks": [
        {
          "id": "WP1.T1",
          "title": "...",
          "description": "...",
          "acceptance_criteria": ["..."],
          "test_requirements": {
            "unit_tests": true,
            "integration_tests": true,
            "performance_tests": false
          },
          "git_workflow": {
            "worktree": "feature/WP1-T1-<slug>",
            "branch": "feature/WP1-T1-<slug>",
            "conventional_commit_prefix": "feat|fix|chore|refactor|test|docs",
            "pr_title": "...",
            "pr_reviewers": ["technical_lead"]
          },
          "estimate_days": 1,
          "parallelizable": true,
          "blocked_by": []
        }
      ]
    }
  ],
  "architecture_compliance_checklist": [
    "Single Responsibility per component",
    "Interface contracts defined and validated",
    "Event-Driven over direct coupling where applicable",
    "NATS JetStream for internal messaging",
    "OpenTelemetry instrumentation (traces, metrics, logs)",
    "Security by design — auth, authz, secrets management",
    "Unit test coverage ≥ 90%",
    "Integration tests on critical paths",
    "API documentation (OpenAPI / AsyncAPI)",
    "No duplicate platform capabilities introduced"
  ],
  "ci_cd_requirements": {
    "github_actions_workflows": ["..."],
    "quality_gates": ["lint", "unit-tests", "integration-tests", "sast", "build", "push"],
    "deployment_strategy": "blue-green|canary|rolling"
  },
  "technical_debt_items": [
    {
      "id": "TD1",
      "description": "...",
      "severity": "low|medium|high|critical",
      "resolution_effort_days": 1
    }
  ],
  "risks": [
    {
      "id": "R1",
      "description": "...",
      "severity": "low|medium|high|critical",
      "mitigation": "...",
      "owner": "..."
    }
  ],
  "release_readiness": {
    "criteria": ["..."],
    "blocking_items": ["..."],
    "ready": false
  },
  "kpi_targets": {
    "build_success_rate": "≥ 99%",
    "unit_test_coverage": "≥ 90%",
    "architecture_compliance": "100%",
    "pr_review_sla_hours": 12,
    "blocker_resolution_hours": 4
  },
  "confidence": 0.0
}
"""

# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

_REQUIRED_KEYS = {
    "implementation_summary",
    "work_packages",
    "architecture_compliance_checklist",
    "ci_cd_requirements",
    "release_readiness",
}

_QUALITY_KEYS = {
    "engineering_analysis",
    "technical_debt_items",
    "risks",
    "kpi_targets",
}

_GIT_WORKFLOW_RULES = [
    "one_feature_one_worktree",
    "one_worktree_one_branch",
    "one_branch_one_pr",
    "rebase_before_merge",
    "atomic_conventional_commits",
    "github_actions_must_pass",
    "delete_worktree_after_merge",
]


def _score_implementation(plan: dict[str, Any]) -> float:
    """Score 0–1 reflecting implementation plan quality."""
    present = sum(1 for k in _REQUIRED_KEYS if plan.get(k))
    base = present / len(_REQUIRED_KEYS)

    qual_present = sum(1 for k in _QUALITY_KEYS if plan.get(k))
    qual_bonus = (qual_present / len(_QUALITY_KEYS)) * 0.10

    # Task depth: every work package should have tasks
    wps = plan.get("work_packages", [])
    tasks_with_ac = sum(
        1
        for wp in wps
        for t in wp.get("tasks", [])
        if t.get("acceptance_criteria")
    )
    total_tasks = sum(len(wp.get("tasks", [])) for wp in wps)
    ac_bonus = (tasks_with_ac / max(total_tasks, 1)) * 0.10

    # Git workflow coverage
    tasks_with_git = sum(
        1
        for wp in wps
        for t in wp.get("tasks", [])
        if t.get("git_workflow")
    )
    git_bonus = (tasks_with_git / max(total_tasks, 1)) * 0.10

    # Test requirements coverage
    tasks_with_tests = sum(
        1
        for wp in wps
        for t in wp.get("tasks", [])
        if t.get("test_requirements", {}).get("unit_tests")
    )
    test_bonus = (tasks_with_tests / max(total_tasks, 1)) * 0.10

    # Capability assignment
    wps_with_capability = sum(1 for wp in wps if wp.get("capability"))
    cap_bonus = (wps_with_capability / max(len(wps), 1)) * 0.05

    return min(base + qual_bonus + ac_bonus + git_bonus + test_bonus + cap_bonus, 1.0)


# ---------------------------------------------------------------------------
# TechnicalLeadAgent
# ---------------------------------------------------------------------------


class TechnicalLeadAgent(BaseHiveAgent):
    """
    Technical Lead — Enterprise Technical Lead & Engineering Delivery Lead.

    Capability tag: "TechnicalLead"
    """

    capability = "TechnicalLead"
    name = "Technical Lead — Enterprise Technical Lead & Engineering Delivery Lead"

    # ------------------------------------------------------------------
    # plan(): implementation plan from approved solution architecture
    # ------------------------------------------------------------------

    def plan(self, req: ExecuteRequest) -> dict[str, Any]:
        """
        Translate an approved solution architecture into a sprint-ready
        engineering implementation plan.

        Produces: work packages → tasks → acceptance criteria → Git workflow
        specs → test requirements → capability assignments → CI/CD requirements.
        """
        prompt = (
            f"Objective: {req.objective}\n\n"
            f"Additional context:\n"
            f"{json.dumps(req.input, indent=2) if req.input else 'none'}\n\n"
            "Produce a complete engineering implementation plan following the output format exactly.\n"
            "Decompose into atomic work packages — one per engineering capability.\n"
            "Every task must have: acceptance criteria, test requirements, and a Git workflow spec.\n"
            "Assign each work package to the correct specialist capability.\n"
            "Include CI/CD pipeline requirements with all quality gates.\n"
            "Flag technical debt items discovered during analysis.\n"
            "State release readiness criteria and any blocking items explicitly.\n"
            "Enforce: unit test ≥ 90%, integration tests on all critical paths, "
            "OpenTelemetry instrumentation, security review sign-off.\n"
            "Git workflow: One Feature → One Worktree → One Branch → One PR → "
            "One Merge → GitHub Actions must pass → Delete worktree.\n"
            "Set confidence honestly — never inflate it."
        )

        raw = self._call_llm(_SYSTEM, prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "implementation_summary": raw[:500],
                "solution_reference": req.input.get("solution_reference", "unknown"),
                "engineering_analysis": {
                    "complexity": "medium",
                    "estimated_engineers": 0,
                    "estimated_sprints": 0,
                    "parallelisable_tracks": [],
                },
                "work_packages": [],
                "architecture_compliance_checklist": [],
                "ci_cd_requirements": {
                    "github_actions_workflows": [],
                    "quality_gates": ["lint", "unit-tests", "integration-tests", "sast", "build"],
                    "deployment_strategy": "blue-green",
                },
                "technical_debt_items": [],
                "risks": [],
                "release_readiness": {
                    "criteria": [],
                    "blocking_items": ["Plan parse failed — re-run with clearer objective"],
                    "ready": False,
                },
                "kpi_targets": {
                    "build_success_rate": "≥ 99%",
                    "unit_test_coverage": "≥ 90%",
                    "architecture_compliance": "100%",
                    "pr_review_sla_hours": 12,
                    "blocker_resolution_hours": 4,
                },
                "confidence": 0.3,
                "_parse_error": True,
            }

    # ------------------------------------------------------------------
    # execute(): engineering coordination output
    # ------------------------------------------------------------------

    def execute(self, req: ExecuteRequest, plan: dict[str, Any]) -> dict[str, Any]:
        """
        Technical Lead does not write code — it coordinates engineering delivery.
        Output is the engineering work package manifest ready for specialist dispatch.
        """
        work_packages = plan.get("work_packages", [])
        all_tasks = [t for wp in work_packages for t in wp.get("tasks", [])]
        risks = plan.get("risks", [])
        critical_risks = [r for r in risks if r.get("severity") == "critical"]
        debt_items = plan.get("technical_debt_items", [])
        high_debt = [d for d in debt_items if d.get("severity") in ("high", "critical")]

        # Git workflow compliance check
        tasks_missing_git = [
            t["id"] for t in all_tasks if not t.get("git_workflow")
        ]
        git_compliance_pct = (
            (len(all_tasks) - len(tasks_missing_git)) / max(len(all_tasks), 1)
        ) * 100

        # Acceptance criteria coverage
        tasks_missing_ac = [
            t["id"] for t in all_tasks if not t.get("acceptance_criteria")
        ]

        # Test requirements coverage
        tasks_missing_tests = [
            t["id"] for t in all_tasks
            if not t.get("test_requirements", {}).get("unit_tests")
        ]

        # Capability assignment check
        wps_missing_capability = [
            wp["id"] for wp in work_packages if not wp.get("capability")
        ]

        # Release readiness
        blocking_items = plan.get("release_readiness", {}).get("blocking_items", [])
        ready_to_dispatch = (
            len(critical_risks) == 0
            and len(wps_missing_capability) == 0
            and len(tasks_missing_ac) == 0
            and bool(work_packages)
        )

        return {
            "implementation_plan": plan,
            "work_packages": work_packages,
            "total_work_packages": len(work_packages),
            "total_tasks": len(all_tasks),
            "git_compliance_pct": round(git_compliance_pct, 1),
            "tasks_missing_git_workflow": tasks_missing_git,
            "tasks_missing_acceptance_criteria": tasks_missing_ac,
            "tasks_missing_test_requirements": tasks_missing_tests,
            "work_packages_missing_capability": wps_missing_capability,
            "risks": risks,
            "critical_risks": critical_risks,
            "total_critical_risks": len(critical_risks),
            "technical_debt_items": debt_items,
            "high_severity_debt": high_debt,
            "ci_cd_requirements": plan.get("ci_cd_requirements", {}),
            "architecture_compliance_checklist": plan.get("architecture_compliance_checklist", []),
            "release_readiness": plan.get("release_readiness", {}),
            "blocking_items": blocking_items,
            "implementation_summary": plan.get("implementation_summary", ""),
            "engineering_analysis": plan.get("engineering_analysis", {}),
            "confidence": plan.get("confidence", 0.0),
            "ready_to_dispatch": ready_to_dispatch,
        }

    # ------------------------------------------------------------------
    # observe(): engineering quality scoring
    # ------------------------------------------------------------------

    def observe(self, req: ExecuteRequest, result: dict[str, Any]) -> dict[str, Any]:
        quality_score = _score_implementation(result.get("implementation_plan", {}))

        git_pct = result.get("git_compliance_pct", 0.0)
        missing_git = len(result.get("tasks_missing_git_workflow", []))
        missing_ac = len(result.get("tasks_missing_acceptance_criteria", []))
        missing_tests = len(result.get("tasks_missing_test_requirements", []))
        missing_caps = len(result.get("work_packages_missing_capability", []))
        critical_risks = result.get("total_critical_risks", 0)
        high_debt = len(result.get("high_severity_debt", []))

        return {
            "hasOutput": bool(result.get("work_packages")),
            "totalWorkPackages": result.get("total_work_packages", 0),
            "totalTasks": result.get("total_tasks", 0),
            "gitCompliancePct": git_pct,
            "gitCompliant": git_pct == 100.0,
            "tasksWithoutGitWorkflow": missing_git,
            "tasksWithoutAcceptanceCriteria": missing_ac,
            "tasksWithoutTestRequirements": missing_tests,
            "workPackagesWithoutCapability": missing_caps,
            "criticalRisks": critical_risks,
            "highSeverityDebtItems": high_debt,
            "readyToDispatch": result.get("ready_to_dispatch", False),
            "qualityScore": quality_score,
            "notes": (
                f"Implementation plan with {result.get('total_work_packages', 0)} work package(s), "
                f"{result.get('total_tasks', 0)} task(s). "
                f"Git workflow compliance: {git_pct}%. "
                f"Missing AC: {missing_ac}. "
                f"Missing test requirements: {missing_tests}. "
                f"Missing capability assignments: {missing_caps}. "
                f"Critical risks: {critical_risks}. "
                f"High-severity debt: {high_debt}. "
                f"{'✓ Ready to dispatch.' if result.get('ready_to_dispatch') else '⚠ Blocked — review issues before dispatch.'}"
            ),
        }

    # ------------------------------------------------------------------
    # reflect(): engineering improvement suggestions
    # ------------------------------------------------------------------

    def reflect(
        self,
        req: ExecuteRequest,
        result: dict[str, Any],
        observation: dict[str, Any],
    ) -> dict[str, Any]:
        suggestions: list[str] = []

        if observation.get("gitCompliancePct", 100) < 100:
            suggestions.append(
                f"{observation.get('tasksWithoutGitWorkflow', 0)} task(s) missing Git workflow spec — "
                "every task needs: worktree name, branch name, conventional commit prefix, "
                "PR title, and reviewer assignment. Git workflow is non-negotiable."
            )
        if observation.get("tasksWithoutAcceptanceCriteria", 0) > 0:
            suggestions.append(
                f"{observation['tasksWithoutAcceptanceCriteria']} task(s) have no acceptance criteria — "
                "engineers cannot declare a task complete without testable, measurable criteria."
            )
        if observation.get("tasksWithoutTestRequirements", 0) > 0:
            suggestions.append(
                f"{observation['tasksWithoutTestRequirements']} task(s) missing test requirements — "
                "unit tests (≥ 90% coverage) and integration tests (critical paths) are mandatory."
            )
        if observation.get("workPackagesWithoutCapability", 0) > 0:
            suggestions.append(
                f"{observation['workPackagesWithoutCapability']} work package(s) lack capability assignment — "
                "every work package must route to exactly one specialist: "
                "BackendEngineer, FrontendEngineer, AIEngineer, DevOpsEngineer, or QAEngineer."
            )
        if observation.get("criticalRisks", 0) > 0:
            suggestions.append(
                f"{observation['criticalRisks']} critical risk(s) detected — "
                "engineering dispatch is BLOCKED. Escalate to Solution Architect before proceeding."
            )
        if observation.get("highSeverityDebtItems", 0) > 0:
            suggestions.append(
                f"{observation['highSeverityDebtItems']} high-severity technical debt item(s) identified — "
                "register in the technical debt backlog and schedule resolution within 2 sprints."
            )
        if not observation.get("hasOutput"):
            suggestions.append(
                "No work packages produced — the implementation plan is empty. "
                "Re-run with a clearer objective and reference to the solution architecture document."
            )
        if observation.get("totalTasks", 0) == 0:
            suggestions.append(
                "No tasks decomposed — break work packages into atomic, 1–3 day tasks "
                "that can be independently reviewed and merged."
            )

        # CI/CD KPI reminder
        ci = result.get("ci_cd_requirements", {})
        gates = ci.get("quality_gates", [])
        required_gates = {"lint", "unit-tests", "sast", "build"}
        missing_gates = required_gates - set(gates)
        if missing_gates:
            suggestions.append(
                f"CI/CD pipeline missing required quality gates: {missing_gates}. "
                "All four — lint, unit-tests, SAST, build — must pass before any merge."
            )

        return {
            "objectiveClarity": (
                "clear" if observation.get("totalTasks", 0) > 0 else "ambiguous"
            ),
            "executionStrategy": "engineering_implementation_coordination",
            "planRigour": (
                "high" if observation.get("qualityScore", 0) >= 0.8
                else "medium" if observation.get("qualityScore", 0) >= 0.6
                else "low"
            ),
            "qualityScore": observation.get("qualityScore", 0.0),
            "suggestions": suggestions,
            "engineeringCompliance": {
                "gitWorkflowComplete": observation.get("gitCompliant", False),
                "acceptanceCriteriaComplete": observation.get("tasksWithoutAcceptanceCriteria", 0) == 0,
                "testRequirementsComplete": observation.get("tasksWithoutTestRequirements", 0) == 0,
                "capabilityAssignmentsComplete": observation.get("workPackagesWithoutCapability", 0) == 0,
                "noCriticalRisks": observation.get("criticalRisks", 0) == 0,
                "readyToDispatch": observation.get("readyToDispatch", False),
            },
            "kpiTargets": {
                "buildSuccessRate": "≥ 99%",
                "githubActionsSuccess": "≥ 99%",
                "prReviewSlaHours": "< 12",
                "codeReviewCoverage": "100%",
                "architectureCompliance": "≥ 100%",
                "unitTestCoverage": "≥ 90%",
                "integrationTestCoverage": "≥ 100%",
                "criticalBugsAfterRelease": "= 0",
                "productionRollbackRate": "< 1%",
                "technicalDebtGrowth": "< 2%",
                "blockerResolutionHours": "< 4",
                "deploymentSuccessRate": "≥ 99%",
                "developerSatisfaction": "≥ 90%",
            },
        }
