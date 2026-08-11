"""
ProjectManagerAgent — Enterprise Project Manager & Program Delivery Lead.

Role        : Enterprise Project Manager & Program Delivery Lead
Capability  : ProjectManager
Temperature : 0.2  (structured, consistent, process-oriented)
Model       : claude-opus-4-5
Reasoning   : enabled, max_attempts=12
Memory      : enabled

This agent translates strategic objectives into executable delivery plans.
It never implements — it plans, coordinates, monitors, and governs delivery.

Git Workflow Enforced:
  One Feature → One Worktree → One Branch → One PR → One Merge
  → Successful GitHub Actions → Delete Worktree

Lifecycle:
  plan()    → epics → milestones → features → user stories → tasks → acceptance criteria
  execute() → delivery manifest: sprint assignments, dependencies, risks, Git workflow gates
  observe() → delivery health scoring: on-time rate, blocker count, Git compliance
  reflect() → continuous improvement suggestions
"""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

_SYSTEM = """\
You are the Enterprise Project Manager for the CerebroHive Enterprise \
Intelligence Operating System (EIOS), reporting directly to CEO Agent (Hermes).

IDENTITY
--------
You possess decades of simulated experience managing enterprise software programs, \
AI platforms, cloud-native systems, digital transformation initiatives, product \
engineering organizations, agile delivery, and cross-functional technology teams.

Your responsibility is to convert strategic goals into structured execution plans \
that engineering teams can implement with confidence and predictability.

PRIME DIRECTIVES
----------------
1.  Never implement software — plan, coordinate, govern, and deliver.
2.  Transform every strategic objective into: Epics → Milestones → Features → \
    User Stories → Technical Tasks → Acceptance Criteria.
3.  Maintain complete traceability from business objective to engineering task.
4.  Proactively identify blockers, risks, and dependencies — never let them go \
    unmanaged.
5.  Enforce CerebroHive's Git workflow on every feature:
      • One Feature → One Worktree → One Branch → One PR → One Merge
      • One Merge → Successful GitHub Actions → Delete Worktree
      • Atomic commits only, Conventional Commit messages
      • Rebase onto origin/main before merge
      • No feature accumulation in branches
6.  Validate acceptance criteria before closing any feature or user story.
7.  Ensure documentation, testing, architecture updates, and release notes \
    accompany all completed work.
8.  Maintain delivery dashboards, milestone reports, sprint summaries, and \
    executive status reports.
9.  Escalate risks early — never surprise stakeholders with late-stage issues.
10. Optimize team throughput without sacrificing quality, security, or \
    architectural consistency.
11. Promote continuous improvement and predictable delivery.
12. Dependency Resolution SLA: < 24 hours. Blocker Resolution: < 1 business day.

KPI TARGETS
-----------
Project Delivery Success ≥ 95% | Milestones On Time ≥ 95% | Sprint Predictability ≥ 90%
Schedule Variance < 5% | Budget Variance < 5% | Critical Risks Mitigated ≥ 95%
Feature Completion Rate ≥ 95% | Documentation Completion ≥ 100%
Git Workflow Compliance ≥ 100% | GitHub Actions Success ≥ 99% | Release Success ≥ 99%

SKILLS
------
Enterprise Project Management, Program Management, Portfolio Management,
Agile Methodologies, Scrum, Kanban, Scaled Agile (SAFe), Sprint Planning,
Release Planning, Roadmap Planning, Strategic Planning, Epic Decomposition,
Feature Breakdown, User Story Writing, Technical Task Planning,
Dependency Management, Risk Management, Resource Planning, Capacity Planning,
Stakeholder Management, Cross-functional Coordination, Requirements Analysis,
Business Analysis, Change Management, Issue Management, Decision Tracking,
Meeting Facilitation, Architecture Awareness, SDLC, AI Project Delivery,
Cloud Project Management, DevOps Coordination, Product Lifecycle Management,
Engineering Governance, Quality Planning, Documentation Management,
Git Workflow Governance, Release Coordination, Communication Management,
Conflict Resolution, Continuous Improvement.

SPECIALIST CAPABILITIES FOR DELEGATION
---------------------------------------
SolutionArchitect, TechnicalLead, BackendEngineer, FrontendEngineer,
AIEngineer, DevOpsEngineer, QAEngineer, SecurityArchitect,
ProductManager, TechnicalWriter, Research, Critique, EnterpriseArchitect.

OUTPUT FORMAT (strict JSON)
---------------------------
{
  "delivery_summary": "...",
  "program_context": "...",
  "epics": [
    {
      "id": "E1",
      "title": "...",
      "business_value": "...",
      "milestones": [
        {
          "id": "E1.M1",
          "title": "...",
          "target_date": "YYYY-MM-DD or sprint reference",
          "success_criteria": "...",
          "features": [
            {
              "id": "E1.M1.F1",
              "title": "...",
              "user_stories": [
                {
                  "id": "E1.M1.F1.US1",
                  "as_a": "...",
                  "i_want": "...",
                  "so_that": "...",
                  "acceptance_criteria": ["...", "..."],
                  "tasks": [
                    {
                      "id": "E1.M1.F1.US1.T1",
                      "title": "...",
                      "capability": "...",
                      "estimate_days": 1,
                      "git_workflow": {
                        "worktree": "feat/<feature-slug>",
                        "branch": "feat/<feature-slug>",
                        "pr_title": "feat: ...",
                        "requires_github_actions": true
                      },
                      "parallelizable": true
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "risks": [
    {
      "id": "R1",
      "description": "...",
      "severity": "low|medium|high|critical",
      "probability": "low|medium|high",
      "impact": "...",
      "mitigation": "...",
      "owner": "...",
      "resolution_sla_hours": 24
    }
  ],
  "dependencies": [
    {
      "id": "D1",
      "from_task": "...",
      "to_task": "...",
      "type": "blocks|requires|informs",
      "resolution_owner": "...",
      "sla_hours": 24
    }
  ],
  "sprint_plan": [
    {
      "sprint": 1,
      "goal": "...",
      "tasks": ["task_id", "..."],
      "capacity_days": 10,
      "committed_days": 0
    }
  ],
  "release_plan": {
    "version": "...",
    "target_date": "...",
    "features_included": ["feature_id"],
    "release_criteria": ["...", "..."],
    "release_notes_required": true,
    "documentation_required": true
  },
  "delegation_manifest": [
    {
      "task_id": "...",
      "capability": "...",
      "sprint": 1,
      "priority": "normal|high|critical",
      "git_worktree": "feat/...",
      "blockers": []
    }
  ],
  "blockers": [],
  "escalations": [],
  "confidence": 0.0
}
"""

# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

_REQUIRED_KEYS = {
    "delivery_summary",
    "epics",
    "risks",
    "delegation_manifest",
}

_DELIVERY_KEYS = {
    "dependencies",
    "sprint_plan",
    "release_plan",
    "blockers",
}


def _score_delivery_plan(plan: dict[str, Any]) -> float:
    """Score 0–1 reflecting delivery planning rigour."""
    present = sum(1 for k in _REQUIRED_KEYS if plan.get(k))
    base = present / len(_REQUIRED_KEYS)

    delivery_present = sum(1 for k in _DELIVERY_KEYS if plan.get(k))
    delivery_bonus = (delivery_present / len(_DELIVERY_KEYS)) * 0.15

    # Decomposition depth
    epics = plan.get("epics", [])
    has_milestones = any(e.get("milestones") for e in epics)
    has_features = any(
        m.get("features") for e in epics for m in e.get("milestones", [])
    )
    has_stories = any(
        f.get("user_stories")
        for e in epics
        for m in e.get("milestones", [])
        for f in m.get("features", [])
    )
    has_tasks = any(
        us.get("tasks")
        for e in epics
        for m in e.get("milestones", [])
        for f in m.get("features", [])
        for us in f.get("user_stories", [])
    )
    depth = sum([has_milestones, has_features, has_stories, has_tasks])
    depth_bonus = (depth / 4) * 0.1

    # Git workflow coverage
    manifest = plan.get("delegation_manifest", [])
    tasks_with_git = sum(1 for t in manifest if t.get("git_worktree"))
    git_bonus = (tasks_with_git / max(len(manifest), 1)) * 0.05

    # Risk coverage
    risk_bonus = min(len(plan.get("risks", [])) * 0.01, 0.05)

    return min(base + delivery_bonus + depth_bonus + git_bonus + risk_bonus, 1.0)


def _count_all_tasks(epics: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        task
        for epic in epics
        for milestone in epic.get("milestones", [])
        for feature in milestone.get("features", [])
        for story in feature.get("user_stories", [])
        for task in story.get("tasks", [])
    ]


# ---------------------------------------------------------------------------
# ProjectManagerAgent
# ---------------------------------------------------------------------------

class ProjectManagerAgent(BaseHiveAgent):
    """
    Enterprise Project Manager & Program Delivery Lead.

    Capability tag: "ProjectManager"
    """

    capability = "ProjectManager"
    name = "Project Manager — Program Delivery Lead"

    # ------------------------------------------------------------------
    # plan(): delivery decomposition
    # ------------------------------------------------------------------

    def plan(self, req: ExecuteRequest) -> dict[str, Any]:
        """
        Decompose the objective into a full delivery plan:
        epics → milestones → features → user stories → tasks.

        Every task gets a Git workflow specification (worktree, branch, PR title).
        Every user story gets acceptance criteria.
        All risks, dependencies, and sprint assignments are identified.
        """
        prompt = (
            f"Objective: {req.objective}\n\n"
            f"Additional context:\n{json.dumps(req.input, indent=2) if req.input else 'none'}\n\n"
            "Produce a complete delivery plan following the output format exactly.\n"
            "Decompose to the task level. Every task must have a Git workflow specification.\n"
            "Every user story must have measurable acceptance criteria.\n"
            "Identify all risks with severity, probability, and mitigation.\n"
            "Identify all dependencies with resolution owner and SLA.\n"
            "Assign tasks to sprints with capacity awareness.\n"
            "Flag any blockers or escalations immediately.\n"
            "Enforce: One Feature → One Worktree → One Branch → One PR → One Merge.\n"
            "KPI targets: Delivery ≥ 95%, Git Compliance ≥ 100%, Blockers resolved < 1 day."
        )

        raw = self._call_llm(_SYSTEM, prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "delivery_summary": raw[:500],
                "epics": [],
                "risks": [],
                "dependencies": [],
                "sprint_plan": [],
                "release_plan": {},
                "delegation_manifest": [],
                "blockers": [],
                "escalations": [],
                "confidence": 0.4,
                "_parse_error": True,
            }

    # ------------------------------------------------------------------
    # execute(): produce delivery + delegation manifest
    # ------------------------------------------------------------------

    def execute(self, req: ExecuteRequest, plan: dict[str, Any]) -> dict[str, Any]:
        """
        PM does not implement — PM coordinates and governs delivery.
        Output is the delegation manifest ready for sprint dispatch,
        with Git workflow gates enforced per task.
        """
        epics = plan.get("epics", [])
        all_tasks = _count_all_tasks(epics)
        manifest = plan.get("delegation_manifest", [])
        risks = plan.get("risks", [])
        critical_risks = [r for r in risks if r.get("severity") == "critical"]
        blockers = plan.get("blockers", [])
        deps = plan.get("dependencies", [])
        sprint_plan = plan.get("sprint_plan", [])
        release_plan = plan.get("release_plan", {})

        # Git compliance check
        tasks_without_git = [
            t for t in all_tasks
            if not (t.get("git_workflow") or {}).get("worktree")
        ]

        # Capacity check
        total_committed = sum(
            sum(
                1 for tid in s.get("tasks", [])
                if any(t.get("id") == tid for t in all_tasks)
            )
            for s in sprint_plan
        )

        return {
            "delegation_manifest": manifest,
            "all_tasks": all_tasks,
            "total_epics": len(epics),
            "total_tasks": len(all_tasks),
            "total_stories": sum(
                len(f.get("user_stories", []))
                for e in epics
                for m in e.get("milestones", [])
                for f in m.get("features", [])
            ),
            "risks": risks,
            "critical_risks": critical_risks,
            "total_critical_risks": len(critical_risks),
            "dependencies": deps,
            "blocking_dependencies": [d for d in deps if d.get("type") == "blocks"],
            "sprint_plan": sprint_plan,
            "total_sprints": len(sprint_plan),
            "release_plan": release_plan,
            "blockers": blockers,
            "escalations": plan.get("escalations", []),
            "tasks_without_git_workflow": tasks_without_git,
            "git_compliance_pct": round(
                (1 - len(tasks_without_git) / max(len(all_tasks), 1)) * 100, 1
            ),
            "total_committed_tasks": total_committed,
            "delivery_summary": plan.get("delivery_summary", ""),
            "program_context": plan.get("program_context", ""),
            "confidence": plan.get("confidence", 0.0),
            "ready_to_dispatch": (
                bool(manifest) and len(critical_risks) == 0 and len(blockers) == 0
            ),
        }

    # ------------------------------------------------------------------
    # observe(): delivery health scoring
    # ------------------------------------------------------------------

    def observe(self, req: ExecuteRequest, result: dict[str, Any]) -> dict[str, Any]:
        quality_score = _score_delivery_plan(
            {
                "delivery_summary": result.get("delivery_summary"),
                "epics": [{"milestones": [{"features": [{"user_stories": [{"tasks": result.get("all_tasks", [])}]}]}]}],
                "risks": result.get("risks", []),
                "delegation_manifest": result.get("delegation_manifest", []),
                "dependencies": result.get("dependencies", []),
                "sprint_plan": result.get("sprint_plan", []),
                "release_plan": result.get("release_plan", {}),
                "blockers": result.get("blockers", []),
            }
        )

        git_compliance = result.get("git_compliance_pct", 0.0)
        git_ok = git_compliance >= 100.0
        critical_risks = result.get("total_critical_risks", 0)
        blockers = result.get("blockers", [])
        escalations = result.get("escalations", [])
        blocking_deps = result.get("blocking_dependencies", [])

        return {
            "hasOutput": bool(result.get("delegation_manifest")),
            "totalEpics": result.get("total_epics", 0),
            "totalTasks": result.get("total_tasks", 0),
            "totalStories": result.get("total_stories", 0),
            "totalSprints": result.get("total_sprints", 0),
            "criticalRisks": critical_risks,
            "activeBlockers": len(blockers),
            "blockingDependencies": len(blocking_deps),
            "pendingEscalations": len(escalations),
            "gitCompliancePct": git_compliance,
            "gitWorkflowCompliant": git_ok,
            "readyToDispatch": result.get("ready_to_dispatch", False),
            "qualityScore": quality_score,
            "notes": (
                f"Delivery plan: {result.get('total_epics', 0)} epic(s), "
                f"{result.get('total_tasks', 0)} task(s) across "
                f"{result.get('total_sprints', 0)} sprint(s). "
                f"Git compliance: {git_compliance}%. "
                f"{critical_risks} critical risk(s). "
                f"{len(blockers)} blocker(s). "
                f"{'⚠ BLOCKED — resolve before dispatch.' if not result.get('ready_to_dispatch') else '✓ Ready to dispatch.'}"
            ),
        }

    # ------------------------------------------------------------------
    # reflect(): continuous improvement suggestions
    # ------------------------------------------------------------------

    def reflect(
        self,
        req: ExecuteRequest,
        result: dict[str, Any],
        observation: dict[str, Any],
    ) -> dict[str, Any]:
        suggestions: list[str] = []

        if not observation.get("gitWorkflowCompliant"):
            suggestions.append(
                f"Git Workflow Compliance is {observation.get('gitCompliancePct', 0)}% — "
                "every task must have a worktree/branch/PR specification. "
                "Target: Git Workflow Compliance ≥ 100%."
            )
        if observation.get("criticalRisks", 0) > 0:
            suggestions.append(
                "Critical risks detected — delegation is BLOCKED. "
                "Escalate to CEO Agent (Hermes) and assign mitigation owners immediately. "
                "Dependency Resolution SLA: < 24 hours."
            )
        if observation.get("activeBlockers", 0) > 0:
            suggestions.append(
                f"{observation['activeBlockers']} active blocker(s) — "
                "each must be resolved within 1 business day. "
                "Assign an owner and track in the risk register."
            )
        if observation.get("blockingDependencies", 0) > 0:
            suggestions.append(
                f"{observation['blockingDependencies']} blocking dependency(ies) — "
                "resolve within the 24-hour SLA. Coordinate with dependency owners immediately."
            )
        if observation.get("totalSprints", 0) == 0:
            suggestions.append(
                "No sprint plan defined — assign all tasks to sprints with capacity estimates. "
                "Sprint Predictability target: ≥ 90%."
            )
        if not result.get("release_plan"):
            suggestions.append(
                "No release plan defined — specify target version, release date, "
                "included features, release criteria, documentation, and release notes. "
                "Release Success Rate target: ≥ 99%."
            )
        if observation.get("pendingEscalations", 0) > 0:
            suggestions.append(
                f"{observation['pendingEscalations']} pending escalation(s) — "
                "escalate to the CEO Agent (Hermes) immediately. Never suppress escalations."
            )

        return {
            "objectiveClarity": (
                "clear" if observation.get("totalTasks", 0) > 0 else "ambiguous"
            ),
            "executionStrategy": "agile_delivery_governance",
            "decompositionDepth": (
                "deep" if observation.get("totalStories", 0) > 3 else "shallow"
            ),
            "qualityScore": observation.get("qualityScore", 0.0),
            "suggestions": suggestions,
            "deliveryGovernance": {
                "gitWorkflowEnforced": observation.get("gitWorkflowCompliant", False),
                "sprintPlanDefined": observation.get("totalSprints", 0) > 0,
                "releasePlanDefined": bool(result.get("release_plan")),
                "risksDocumented": bool(result.get("risks")),
                "dependenciesTracked": bool(result.get("dependencies")),
                "blockersManaged": observation.get("activeBlockers", 0) == 0,
            },
        }
