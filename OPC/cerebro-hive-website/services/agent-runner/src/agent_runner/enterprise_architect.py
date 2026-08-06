"""
EnterpriseArchitectAgent — Chief Enterprise Architect of the CerebroHive EIOS.

Role        : Enterprise Architect & Architecture Governance Lead
Capability  : EnterpriseArchitect
Temperature : 0.1  (maximally deterministic — standards-driven authority)
Model       : claude-opus-4-5  (reasoning quality over speed)
Reasoning   : enabled, max_attempts=15
Memory      : enabled

This agent is the architectural authority beneath the CEO Agent. It never
implements — it designs, governs, validates, and documents.

Lifecycle:
  plan()    → architectural decomposition: domains → capabilities → design tasks
  execute() → governance manifest: ADRs required, reviews needed, standards to apply
  observe() → architecture quality scoring: coverage, ADR completeness, risk density
  reflect() → governance improvement suggestions
"""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

_SYSTEM = """\
You are the Chief Enterprise Architect of the CerebroHive Enterprise Intelligence \
Operating System (EIOS) — the architectural authority beneath the CEO Agent (Hermes).

IDENTITY
--------
You possess decades of simulated experience designing enterprise platforms, \
cloud-native architectures, distributed systems, AI platforms, multi-agent \
ecosystems, developer platforms, and global-scale software systems.

Your responsibility covers every architectural layer of the CerebroHive ecosystem: \
Enterprise Intelligence OS, Runtime Platform, AI Platform, Knowledge Platform, \
Workflow Platform, Security Platform, Developer Platform, and Data Platform.

PRIME DIRECTIVES
----------------
1.  Act as the architectural authority — evaluate every request from an enterprise \
    architecture perspective before proposing implementation.
2.  Never optimize for short-term convenience at the expense of long-term \
    maintainability.
3.  Ensure all solutions align with EIOS architecture, capability model, enterprise \
    standards, and long-term roadmap.
4.  Design for: modularity, scalability, maintainability, resilience, observability, \
    interoperability, and zero-trust security.
5.  Identify architectural risks, trade-offs, constraints, dependencies, and quality \
    attributes BEFORE approving designs.
6.  Enforce Domain-Driven Design, Event-Driven Architecture, Clean Architecture, \
    API-first development, CQRS, Event Sourcing, and cloud-native principles.
7.  Require Architecture Decision Records (ADRs) for every significant architectural \
    change — ADR coverage must remain ≥ 100%.
8.  Recommend reusable platform capabilities before introducing new services — \
    Duplicate Platform Services must remain = 0.
9.  Prevent architectural duplication, unnecessary complexity, vendor lock-in, and \
    technical debt growth above 2%.
10. Ensure all designs support multi-tenancy, governance, observability, compliance, \
    and future extensibility.
11. Maintain Architecture Compliance ≥ 98% and Standards Compliance ≥ 100%.
12. Architecture Review SLA < 24 hours — respond quickly and with precision.
13. Collaborate with Solution Architects, Technical Leads, and Security Architects \
    while remaining focused on strategic architecture.
14. Every recommendation must be supported by sound architectural reasoning, \
    measurable quality attributes, and enterprise best practices.
15. Never lose sight of the Enterprise Intelligence Operating System vision.

SKILLS
------
Enterprise Architecture, Solution Architecture, System Architecture, \
Distributed Systems, Cloud Architecture, Microservices, Modular Monolith Design, \
Domain-Driven Design (DDD), Event-Driven Architecture, CQRS, Event Sourcing, \
API Design, Enterprise Integration, Capability Modeling, Business Capability Mapping, \
Architecture Governance, Architecture Review, Reference Architecture, \
Platform Architecture, Technology Strategy, Architecture Decision Records (ADR), \
Architecture Documentation, Knowledge Graph Design, AI System Design, \
Agentic System Design, Multi-Agent Architecture, Workflow Orchestration, \
Runtime Architecture, Infrastructure Architecture, Data Architecture, \
Security Architecture, Observability, Scalability Engineering, \
Performance Engineering, High Availability, Disaster Recovery, \
Business Continuity, Risk Assessment, Technology Evaluation, \
Technical Debt Analysis, Roadmap Planning, Standards Development, \
Engineering Governance, Enterprise Integration Patterns, Cost Optimization, \
Digital Transformation.

SPECIALIST CAPABILITIES AVAILABLE FOR DELEGATION
-------------------------------------------------
SolutionArchitect, TechnicalLead, SecurityArchitect, DataArchitect,
AIEngineer, DevOpsEngineer, BackendEngineer, FrontendEngineer,
Research (for technology evaluation), Critique (for design review).

OUTPUT FORMAT (strict JSON)
---------------------------
{
  "architecture_summary": "...",
  "domain_context": "...",
  "architectural_domains": [
    {
      "id": "D1",
      "name": "...",
      "bounded_context": "...",
      "capabilities": [
        {
          "id": "D1.C1",
          "name": "...",
          "quality_attributes": ["scalability", "resilience", "..."],
          "design_tasks": [
            {
              "id": "D1.C1.T1",
              "title": "...",
              "type": "adr|review|diagram|standards|validation|documentation",
              "capability": "...",
              "acceptance_criteria": "...",
              "adr_required": true,
              "parallelizable": true
            }
          ]
        }
      ]
    }
  ],
  "architectural_risks": [
    {
      "id": "AR1",
      "description": "...",
      "severity": "low|medium|high|critical",
      "quality_attribute_impact": ["..."],
      "mitigation": "...",
      "adr_required": true
    }
  ],
  "adrs_required": ["...", "..."],
  "governance_gates": [
    {
      "gate": "...",
      "owner": "...",
      "sla_hours": 24
    }
  ],
  "standards_applied": ["DDD", "EDA", "..."],
  "capability_reuse_recommendations": ["...", "..."],
  "technical_debt_items": [],
  "delegation_manifest": [
    {
      "task_id": "D1.C1.T1",
      "capability": "...",
      "priority": "normal|high|critical",
      "review_required": true
    }
  ],
  "kpi_projections": {
    "architecture_compliance": "...",
    "adr_coverage": "...",
    "duplicate_services": 0,
    "technical_debt_growth": "..."
  },
  "confidence": 0.0
}
"""

# ---------------------------------------------------------------------------
# Required output keys for scoring
# ---------------------------------------------------------------------------

_REQUIRED_KEYS = {
    "architecture_summary",
    "architectural_domains",
    "architectural_risks",
    "adrs_required",
    "delegation_manifest",
}

_GOVERNANCE_KEYS = {
    "governance_gates",
    "standards_applied",
    "capability_reuse_recommendations",
    "kpi_projections",
}


def _score_architecture_plan(plan: dict[str, Any]) -> float:
    """Score 0–1 reflecting architectural rigour of the plan."""
    # Base score: required keys present
    present = sum(1 for k in _REQUIRED_KEYS if plan.get(k))
    base = present / len(_REQUIRED_KEYS)

    # Governance depth bonus
    gov_present = sum(1 for k in _GOVERNANCE_KEYS if plan.get(k))
    gov_bonus = (gov_present / len(_GOVERNANCE_KEYS)) * 0.15

    # Domain + capability decomposition depth
    domains = plan.get("architectural_domains", [])
    has_capabilities = any(d.get("capabilities") for d in domains)
    has_tasks = any(
        c.get("design_tasks")
        for d in domains
        for c in d.get("capabilities", [])
    )
    depth_bonus = (0.05 if has_capabilities else 0) + (0.05 if has_tasks else 0)

    # Risk documentation
    risks = plan.get("architectural_risks", [])
    risk_bonus = min(len(risks) * 0.02, 0.1)

    # ADR coverage
    adrs = plan.get("adrs_required", [])
    adr_bonus = min(len(adrs) * 0.01, 0.05)

    return min(base + gov_bonus + depth_bonus + risk_bonus + adr_bonus, 1.0)


# ---------------------------------------------------------------------------
# EnterpriseArchitectAgent
# ---------------------------------------------------------------------------

class EnterpriseArchitectAgent(BaseHiveAgent):
    """
    Chief Enterprise Architect — architecture authority of the CerebroHive EIOS.

    Capability tag: "EnterpriseArchitect"
    """

    capability = "EnterpriseArchitect"
    name = "Enterprise Architect — Architecture Governance Lead"

    # ------------------------------------------------------------------
    # plan(): architectural decomposition
    # ------------------------------------------------------------------

    def plan(self, req: ExecuteRequest) -> dict[str, Any]:
        """
        Decompose the objective into an architecture plan:
        domains → bounded contexts → capabilities → design tasks.

        This agent evaluates EVERY request through an architectural lens first.
        It produces governance artefacts (ADRs, reviews, standards), not code.
        """
        prompt = (
            f"Objective: {req.objective}\n\n"
            f"Additional context:\n{json.dumps(req.input, indent=2) if req.input else 'none'}\n\n"
            "Produce a complete architectural decomposition following the output format exactly.\n"
            "Apply Domain-Driven Design, identify bounded contexts, map to capabilities.\n"
            "Flag every architectural risk with severity and quality-attribute impact.\n"
            "List every ADR that must be created before implementation begins.\n"
            "Recommend reuse of existing platform capabilities wherever possible.\n"
            "Set confidence to reflect genuine uncertainty (never inflate it).\n"
            "Remember: Architecture Compliance ≥ 98%, ADR Coverage ≥ 100%, "
            "Duplicate Services = 0, Technical Debt Growth < 2%."
        )

        raw = self._call_llm(_SYSTEM, prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "architecture_summary": raw[:500],
                "architectural_domains": [],
                "architectural_risks": [],
                "adrs_required": [],
                "governance_gates": [],
                "standards_applied": [],
                "capability_reuse_recommendations": [],
                "delegation_manifest": [],
                "kpi_projections": {},
                "confidence": 0.4,
                "_parse_error": True,
            }

    # ------------------------------------------------------------------
    # execute(): produce governance + delegation artefacts
    # ------------------------------------------------------------------

    def execute(self, req: ExecuteRequest, plan: dict[str, Any]) -> dict[str, Any]:
        """
        The Enterprise Architect governs and validates — never implements.
        Primary output is the governance manifest: ADRs to create, reviews to
        conduct, standards to enforce, and a delegation manifest for specialists.
        """
        domains = plan.get("architectural_domains", [])

        all_design_tasks: list[dict[str, Any]] = [
            task
            for domain in domains
            for cap in domain.get("capabilities", [])
            for task in cap.get("design_tasks", [])
        ]

        adrs_required = plan.get("adrs_required", [])
        risks = plan.get("architectural_risks", [])
        critical_risks = [r for r in risks if r.get("severity") == "critical"]
        gates = plan.get("governance_gates", [])
        manifest = plan.get("delegation_manifest", [])

        return {
            "delegation_manifest": manifest,
            "all_design_tasks": all_design_tasks,
            "total_domains": len(domains),
            "total_design_tasks": len(all_design_tasks),
            "adrs_required": adrs_required,
            "total_adrs_required": len(adrs_required),
            "architectural_risks": risks,
            "critical_risks": critical_risks,
            "total_critical_risks": len(critical_risks),
            "governance_gates": gates,
            "standards_applied": plan.get("standards_applied", []),
            "capability_reuse_recommendations": plan.get("capability_reuse_recommendations", []),
            "technical_debt_items": plan.get("technical_debt_items", []),
            "kpi_projections": plan.get("kpi_projections", {}),
            "architecture_summary": plan.get("architecture_summary", ""),
            "domain_context": plan.get("domain_context", ""),
            "confidence": plan.get("confidence", 0.0),
            "ready_to_delegate": bool(manifest) and len(critical_risks) == 0,
        }

    # ------------------------------------------------------------------
    # observe(): architecture quality scoring
    # ------------------------------------------------------------------

    def observe(self, req: ExecuteRequest, result: dict[str, Any]) -> dict[str, Any]:
        quality_score = _score_architecture_plan(
            {
                "architecture_summary": result.get("architecture_summary"),
                "architectural_domains": [{"capabilities": [{"design_tasks": result.get("all_design_tasks", [])}]}],
                "architectural_risks": result.get("architectural_risks", []),
                "adrs_required": result.get("adrs_required", []),
                "delegation_manifest": result.get("delegation_manifest", []),
                "governance_gates": result.get("governance_gates", []),
                "standards_applied": result.get("standards_applied", []),
                "capability_reuse_recommendations": result.get("capability_reuse_recommendations", []),
                "kpi_projections": result.get("kpi_projections", {}),
            }
        )

        manifest = result.get("delegation_manifest", [])
        adrs = result.get("adrs_required", [])
        gates = result.get("governance_gates", [])
        critical = result.get("total_critical_risks", 0)
        tasks_missing_adr = [
            t for t in result.get("all_design_tasks", [])
            if t.get("adr_required") and not adrs
        ]

        return {
            "hasOutput": bool(manifest),
            "totalDomainsAnalyzed": result.get("total_domains", 0),
            "totalDesignTasksDelegated": len(manifest),
            "totalADRsRequired": len(adrs),
            "tasksMissingADR": len(tasks_missing_adr),
            "criticalArchitecturalRisks": critical,
            "governanceGates": len(gates),
            "standardsApplied": len(result.get("standards_applied", [])),
            "reuseRecommendations": len(result.get("capability_reuse_recommendations", [])),
            "readyToDelegate": result.get("ready_to_delegate", False),
            "qualityScore": quality_score,
            "notes": (
                f"Architecture plan covering {result.get('total_domains', 0)} domain(s), "
                f"{len(adrs)} ADR(s) required, "
                f"{critical} critical risk(s). "
                f"{'⚠ BLOCKED: critical risks must be resolved before delegation.' if critical > 0 else '✓ Ready to delegate.'}"
            ),
        }

    # ------------------------------------------------------------------
    # reflect(): governance improvement suggestions
    # ------------------------------------------------------------------

    def reflect(
        self,
        req: ExecuteRequest,
        result: dict[str, Any],
        observation: dict[str, Any],
    ) -> dict[str, Any]:
        suggestions: list[str] = []

        if observation.get("totalADRsRequired", 0) == 0:
            suggestions.append(
                "No ADRs identified — any significant architectural change requires at least one ADR. "
                "ADR coverage must remain ≥ 100%."
            )
        if observation.get("criticalArchitecturalRisks", 0) > 0:
            suggestions.append(
                "Critical architectural risks detected — delegation must be BLOCKED until risks are "
                "mitigated. Escalate to CEO Agent (Hermes) immediately."
            )
        if observation.get("governanceGates", 0) == 0:
            suggestions.append(
                "No governance gates defined — add Architecture Review Board (ARB) checkpoints "
                "and mandatory review gates with 24-hour SLA."
            )
        if observation.get("standardsApplied", 0) == 0:
            suggestions.append(
                "No architectural standards referenced — all designs must cite applicable standards "
                "(DDD, EDA, Clean Architecture, Zero Trust, etc.)."
            )
        if observation.get("reuseRecommendations", 0) == 0:
            suggestions.append(
                "No capability reuse recommendations — always evaluate existing platform capabilities "
                "before proposing new services. Duplicate Services must remain = 0."
            )
        if not result.get("technical_debt_items"):
            suggestions.append(
                "No technical debt items identified — assess whether this change introduces any debt. "
                "Technical Debt Growth must remain < 2%."
            )

        return {
            "objectiveClarity": (
                "clear" if observation.get("totalDesignTasksDelegated", 0) > 0 else "ambiguous"
            ),
            "executionStrategy": "architecture_governance",
            "architecturalRigour": (
                "high" if observation.get("qualityScore", 0) >= 0.8
                else "medium" if observation.get("qualityScore", 0) >= 0.6
                else "low"
            ),
            "qualityScore": observation.get("qualityScore", 0.0),
            "suggestions": suggestions,
            "governanceCompliance": {
                "adrCoverageEnforced": observation.get("totalADRsRequired", 0) > 0,
                "criticalRisksBlocking": observation.get("criticalArchitecturalRisks", 0) > 0,
                "governanceGatesDefined": observation.get("governanceGates", 0) > 0,
                "standardsReferenced": observation.get("standardsApplied", 0) > 0,
                "reuseEvaluated": observation.get("reuseRecommendations", 0) > 0,
            },
        }
