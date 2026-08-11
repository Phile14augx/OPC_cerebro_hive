"""
CeoAgent — Hermes, Chief Executive Officer & Enterprise Intelligence Orchestrator.

Role       : Master orchestrator of the CerebroHive EIOS.
Capability : "CEO"
Temperature: 0.2  (reasoning > creativity)
Model      : claude-opus-4-5  (highest reasoning tier available)

Lifecycle (BaseHiveAgent):
  plan()    → strategic decomposition (milestones → features → tasks)
  execute() → delegation manifest with agent assignments and governance gates
  observe() → governance & quality scoring
  reflect() → strategic learnings for continuous improvement
"""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

_SYSTEM = """\
You are Hermes, Chief Executive Officer and Master Orchestrator of the \
CerebroHive Enterprise Intelligence Operating System (EIOS).

IDENTITY
--------
You possess decades of simulated experience in enterprise architecture, \
AI consulting, software engineering, business strategy, organizational \
leadership, product development, cloud platforms, and autonomous AI systems.

PRIME DIRECTIVES
----------------
1. Never perform implementation work when a specialist agent exists.
2. Think strategically before acting tactically.
3. Every decision must consider: scalability, maintainability, governance, \
   security, cost optimisation, and long-term business value.
4. Break every objective into: Milestones → Features → Executable Tasks.
5. Assign each task to the most appropriate specialist capability.
6. Monitor execution, identify blockers, and resolve conflicts proactively.
7. Enforce documentation quality, testing discipline, and Git-workflow compliance.
8. Escalate risks immediately — never allow silent failures.
9. Never lose sight of the Enterprise Intelligence Operating System vision.

SKILLS
------
Strategic Planning, Enterprise Architecture, Project Planning, \
Roadmap Planning, Decision Analysis, Risk Assessment, Business Strategy, \
Architecture Governance, Technical Leadership, AI Consulting, \
Executive Communication, Systems Thinking, Capability Mapping, \
Portfolio Management.

AVAILABLE SPECIALIST CAPABILITIES
-----------------------------------
Planning, Critique, Coding, Research  (active in agent-runner)
EnterpriseArchitect, ProjectManager, SolutionArchitect, TechnicalLead,
ResearchScientist, BackendEngineer, FrontendEngineer, AIEngineer,
DevOpsEngineer, QAEngineer, SecurityArchitect, ProductManager,
TechnicalWriter, MarketingStrategist  (routable via swarm dispatcher)

OUTPUT FORMAT (strict JSON)
---------------------------
{
  "executive_summary": "...",
  "strategic_context": "...",
  "milestones": [
    {
      "id": "M1",
      "title": "...",
      "success_criteria": "...",
      "features": [
        {
          "id": "M1.F1",
          "title": "...",
          "tasks": [
            {
              "id": "M1.F1.T1",
              "title": "...",
              "capability": "...",
              "rationale": "...",
              "acceptance_criteria": "...",
              "estimated_complexity": "low|medium|high",
              "dependencies": [],
              "parallelizable": true
            }
          ]
        }
      ]
    }
  ],
  "risks": [
    {"id": "R1", "description": "...", "severity": "low|medium|high|critical", "mitigation": "..."}
  ],
  "governance_gates": ["...", "..."],
  "delegation_manifest": [
    {"task_id": "M1.F1.T1", "capability": "...", "priority": "normal|high|critical"}
  ],
  "architectural_decisions": ["...", "..."],
  "confidence": 0.0
}
"""

# ---------------------------------------------------------------------------
# Observe scoring helpers
# ---------------------------------------------------------------------------

_REQUIRED_TOP_KEYS = {
    "executive_summary",
    "milestones",
    "risks",
    "delegation_manifest",
}


def _score_plan(plan: dict[str, Any]) -> float:
    """Return a 0‒1 quality score for Hermes' strategic plan."""
    present = sum(1 for k in _REQUIRED_TOP_KEYS if plan.get(k))
    base = present / len(_REQUIRED_TOP_KEYS)

    milestones = plan.get("milestones", [])
    if not milestones:
        return base * 0.5

    # Reward feature + task decomposition depth
    has_features = any(m.get("features") for m in milestones)
    has_tasks = any(
        f.get("tasks")
        for m in milestones
        for f in m.get("features", [])
    )
    depth_bonus = (0.1 if has_features else 0) + (0.1 if has_tasks else 0)

    # Risk coverage
    risks = plan.get("risks", [])
    risk_bonus = min(len(risks) * 0.025, 0.1)

    return min(base + depth_bonus + risk_bonus, 1.0)


# ---------------------------------------------------------------------------
# CeoAgent
# ---------------------------------------------------------------------------

class CeoAgent(BaseHiveAgent):
    """
    Hermes — CEO & Enterprise Intelligence Orchestrator.

    Capability tag: "CEO"
    """

    capability = "CEO"
    name = "Hermes — CEO & EIOS Orchestrator"

    # ------------------------------------------------------------------
    # plan(): strategic decomposition
    # ------------------------------------------------------------------

    def plan(self, req: ExecuteRequest) -> dict[str, Any]:
        """
        Decompose the high-level objective into a full strategic plan:
        milestones → features → tasks → delegation manifest.
        """
        prompt = (
            f"Objective: {req.objective}\n\n"
            f"Additional context:\n{json.dumps(req.input, indent=2) if req.input else 'none'}\n\n"
            "Produce a complete strategic decomposition following the output format exactly. "
            "Be concise but thorough. Assign every task to the most appropriate specialist capability. "
            "Set confidence to reflect genuine uncertainty where present."
        )

        raw = self._call_llm(_SYSTEM, prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            # Graceful degradation — wrap raw text in minimal structure
            return {
                "executive_summary": raw[:500],
                "milestones": [],
                "risks": [],
                "delegation_manifest": [],
                "governance_gates": [],
                "confidence": 0.5,
                "_parse_error": True,
            }

    # ------------------------------------------------------------------
    # execute(): produce the delegation + governance artefacts
    # ------------------------------------------------------------------

    def execute(self, req: ExecuteRequest, plan: dict[str, Any]) -> dict[str, Any]:
        """
        Hermes does not implement — Hermes coordinates.
        Primary output is the delegation manifest ready for swarm dispatch.
        """
        milestones = plan.get("milestones", [])
        all_tasks: list[dict[str, Any]] = [
            task
            for milestone in milestones
            for feature in milestone.get("features", [])
            for task in feature.get("tasks", [])
        ]

        manifest = plan.get("delegation_manifest", [])

        return {
            "delegation_manifest": manifest,
            "all_tasks": all_tasks,
            "total_milestones": len(milestones),
            "total_tasks": len(all_tasks),
            "risks": plan.get("risks", []),
            "governance_gates": plan.get("governance_gates", []),
            "architectural_decisions": plan.get("architectural_decisions", []),
            "executive_summary": plan.get("executive_summary", ""),
            "strategic_context": plan.get("strategic_context", ""),
            "confidence": plan.get("confidence", 0.0),
            "ready_to_dispatch": bool(manifest),
        }

    # ------------------------------------------------------------------
    # observe(): governance + quality scoring
    # ------------------------------------------------------------------

    def observe(self, req: ExecuteRequest, result: dict[str, Any]) -> dict[str, Any]:
        manifest = result.get("delegation_manifest", [])
        risks = result.get("risks", [])
        gates = result.get("governance_gates", [])
        total_tasks = result.get("total_tasks", 0)

        critical_risks = [r for r in risks if r.get("severity") == "critical"]
        unassigned = [t for t in result.get("all_tasks", []) if not t.get("capability")]

        quality_score = _score_plan(
            {
                "executive_summary": result.get("executive_summary"),
                "milestones": [{"features": [{"tasks": result.get("all_tasks", [])}]}],
                "risks": risks,
                "delegation_manifest": manifest,
            }
        )

        return {
            "hasOutput": bool(manifest),
            "totalTasksDelegated": len(manifest),
            "totalTasksDecomposed": total_tasks,
            "unassignedTasks": len(unassigned),
            "criticalRisks": len(critical_risks),
            "governanceGates": len(gates),
            "qualityScore": quality_score,
            "readyToDispatch": result.get("ready_to_dispatch", False),
            "notes": (
                f"Delegation manifest with {len(manifest)} task(s) across "
                f"{result.get('total_milestones', 0)} milestone(s). "
                f"{len(critical_risks)} critical risk(s) identified."
            ),
        }

    # ------------------------------------------------------------------
    # reflect(): strategic learnings
    # ------------------------------------------------------------------

    def reflect(
        self,
        req: ExecuteRequest,
        result: dict[str, Any],
        observation: dict[str, Any],
    ) -> dict[str, Any]:
        suggestions: list[str] = []

        if observation.get("unassignedTasks", 0) > 0:
            suggestions.append(
                "Some tasks lack a capability assignment — review specialist availability."
            )
        if observation.get("criticalRisks", 0) > 0:
            suggestions.append(
                "Critical risks detected — escalate to stakeholders before dispatching."
            )
        if observation.get("governanceGates", 0) == 0:
            suggestions.append(
                "No governance gates defined — add review checkpoints for quality assurance."
            )
        if not result.get("architectural_decisions"):
            suggestions.append(
                "No architectural decisions recorded — document ADRs for each milestone."
            )

        return {
            "objectiveClarity": "clear" if observation.get("totalTasksDelegated", 0) > 0 else "ambiguous",
            "executionStrategy": "strategic_delegation",
            "decompositionDepth": (
                "deep" if observation.get("totalTasksDecomposed", 0) > 5 else "shallow"
            ),
            "qualityScore": observation.get("qualityScore", 0.0),
            "suggestions": suggestions,
            "enterpriseGovernance": {
                "gatesEnforced": bool(result.get("governance_gates")),
                "risksDocumented": bool(result.get("risks")),
                "adrsRecorded": bool(result.get("architectural_decisions")),
            },
        }
