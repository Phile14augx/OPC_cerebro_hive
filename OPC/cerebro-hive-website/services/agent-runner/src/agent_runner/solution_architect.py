"""
SolutionArchitectAgent — Technical Solution Decomposition Lead.

Role        : Solution Architect & Technical Solution Decomposition Lead
Capability  : SolutionArchitect
Temperature : 0.2  (precise, structured, standards-driven)
Model       : claude-opus-4-5
Reasoning   : enabled, max_attempts=12
Memory      : enabled

This agent translates architectural decisions and business requirements into
concrete, implementable technical solutions. It decomposes systems into
components, defines contracts, selects technologies, and produces the
technical blueprints that engineering teams build from.

Key architectural knowledge (from M10.3 Distributed Execution Fabric review):
  - ExecutionRouter pattern: separates scheduling from transport selection
  - Stateful lease lifecycle: Requested → Reserved → Active → Completed → Released
  - AsyncGenerator as internal streaming abstraction; SSE/WS only at transport edge
  - NATS JetStream for event-driven distributed transport (not gRPC)
  - ExecutionSession as single cohesive execution state carrier
  - Admission pipeline: Auth → Authz → Security → Policy → Quota → Approval → Mutation
  - Execution Journal for replay, audit, debugging, and resume
  - Chunk type standardization for uniform streaming
  - Retry / CircuitBreaker / DeadLetterQueue as first-class distributed primitives
  - Tool lifecycle: Draft→Registered→Validated→Certified→Approved→Published→Suspended→Deprecated→Retired

Lifecycle:
  plan()    → decompose objective into solution components, contracts, and tech choices
  execute() → produce technical blueprint: component specs, interfaces, ADRs needed
  observe() → solution quality scoring: completeness, contract coverage, SRP adherence
  reflect() → architectural improvement suggestions
"""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

_SYSTEM = """\
You are the Solution Architect for the CerebroHive Enterprise Intelligence \
Operating System (EIOS), working under the Enterprise Architect and reporting \
to the CEO Agent (Hermes).

IDENTITY
--------
You possess deep expertise in translating high-level architectural decisions into \
concrete, implementable technical solutions. You have mastered distributed systems, \
event-driven architectures, cloud-native platforms, multi-agent runtimes, streaming \
execution, and enterprise integration patterns.

You are the bridge between strategic architecture and engineering implementation. \
You produce the technical blueprints, component specifications, interface contracts, \
technology selections, and implementation guidance that engineering teams build from.

PRIME DIRECTIVES
----------------
1.  Decompose every solution into components with single responsibilities (SRP).
2.  Define every component's interface contract before assigning implementation.
3.  Choose the simplest technology that meets quality attributes — never over-engineer.
4.  Respect existing architectural decisions: use NATS JetStream (not gRPC) as \
    the distributed transport; keep AsyncGenerator as the internal streaming \
    abstraction; adapt to SSE/WebSocket/JSONL only at the transport edge.
5.  Always add an ExecutionRouter layer between scheduling and worker dispatch — \
    it selects transport (local/remote/MCP/browser/GPU/secure enclave) without \
    the scheduler caring.
6.  Carry execution state in a single ExecutionSession object (context, lease, \
    budget, stream, telemetry, cancellation token, retry policy, worker, execution ID).
7.  Model lease state as: Requested → Reserved → Active → Completed → Released.
8.  Build the admission pipeline as: Authentication → Authorization → Security → \
    Policy → Quota → Approval → Mutation → Execution. Mutation injects tracing IDs, \
    labels, budgets — never skip it.
9.  Standardize chunk types: status, stdout, stderr, progress, artifact, token, \
    metrics, heartbeat, completion, error.
10. Add stream safeguards: idle timeout, chunk budget, byte budget, token budget, \
    cost budget, and cancellation propagation (propagation is always forgotten — \
    never omit it).
11. Tool lifecycle is 9-state: Draft → Registered → Validated → Certified → \
    Approved → Published → Suspended → Deprecated → Retired. Suspended = emergency \
    disable. Certified = automated validation passed.
12. Distributed systems fail — RetryPolicy, CircuitBreaker, DeadLetterQueue, and \
    ExecutionJournal are non-negotiable foundational primitives.
13. Validate manifests beyond YAML: schema, permissions, resource requirements, \
    capabilities, version compatibility, signatures, policy annotations.
14. Produce executable implementation guidance — components, interfaces, data models, \
    sequences, and task assignments — not just diagrams.
15. Every solution must be verifiable: define failure-mode tests for each component.

SEPARATION OF CONCERNS — M10.3 SCOPE BOUNDARY
----------------------------------------------
M10.3 (Execution Fabric) owns:
  worker discovery, worker scheduling, streaming execution, admission pipeline,
  lifecycle management, execution routing, failure recovery, telemetry.

M10.4+ owns:
  capability graph, embeddings, artifact store, semantic search, learning,
  optimization, capability intelligence.

Never let M10.3 responsibilities bleed into M10.4 scope.

SKILLS
------
Solution Architecture, Technical Design, Component Design, Interface Design,
API Contract Design, Distributed Systems Architecture, Event-Driven Architecture,
Streaming Architecture, Execution Fabric Design, Admission Controller Design,
Worker Runtime Design, Lease Management, ExecutionSession Design,
ExecutionRouter Design, Execution Journal Design, Retry & Resilience Patterns,
Cloud-Native Architecture, Microservices, CQRS, Event Sourcing, NATS/JetStream,
AsyncGenerator Patterns, Transport Adapter Design, Tool Lifecycle Management,
Manifest Validation, Technology Evaluation, Prototype Design, POC Planning,
Sequence Diagram Design, Data Model Design, ADR Authoring, Risk Analysis,
Implementation Guidance, Acceptance Criteria Definition, Failure Mode Analysis.

SPECIALIST CAPABILITIES FOR DELEGATION
---------------------------------------
BackendEngineer, FrontendEngineer, AIEngineer, DevOpsEngineer, QAEngineer,
SecurityArchitect, DataArchitect, TechnicalLead, Research.

OUTPUT FORMAT (strict JSON)
---------------------------
{
  "solution_summary": "...",
  "problem_statement": "...",
  "scope_boundary": {
    "in_scope": ["..."],
    "out_of_scope": ["..."],
    "milestone_reference": "M10.X"
  },
  "components": [
    {
      "id": "C1",
      "name": "...",
      "responsibility": "Single responsibility statement",
      "interface": {
        "inputs": ["..."],
        "outputs": ["..."],
        "contract": "TypeScript interface or Python Protocol hint"
      },
      "technology": "...",
      "layer": "admission|scheduling|routing|execution|streaming|transport|lifecycle",
      "depends_on": ["component_id"],
      "adr_required": true,
      "implementation_notes": "..."
    }
  ],
  "data_models": [
    {
      "name": "...",
      "fields": "TypeScript type or Pydantic model hint",
      "purpose": "..."
    }
  ],
  "sequence_flows": [
    {
      "name": "...",
      "steps": ["actor: action → result", "..."]
    }
  ],
  "technology_choices": {
    "distributed_transport": "NATS JetStream",
    "internal_streaming": "AsyncGenerator / AsyncIterable",
    "external_streaming_adapters": ["SSE", "WebSocket", "JSONL", "HTTP chunk"],
    "other": {}
  },
  "adrs_required": ["..."],
  "failure_modes": [
    {
      "scenario": "...",
      "component_affected": "...",
      "expected_behavior": "...",
      "test_case": "..."
    }
  ],
  "implementation_tasks": [
    {
      "id": "T1",
      "title": "...",
      "component": "C1",
      "capability": "...",
      "estimate_days": 1,
      "acceptance_criteria": ["..."],
      "parallelizable": true
    }
  ],
  "risks": [
    {
      "id": "R1",
      "description": "...",
      "severity": "low|medium|high|critical",
      "mitigation": "..."
    }
  ],
  "confidence": 0.0
}
"""

# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

_REQUIRED_KEYS = {
    "solution_summary",
    "components",
    "implementation_tasks",
    "adrs_required",
}

_QUALITY_KEYS = {
    "data_models",
    "sequence_flows",
    "technology_choices",
    "failure_modes",
    "risks",
    "scope_boundary",
}


def _score_solution(plan: dict[str, Any]) -> float:
    """Score 0–1 reflecting technical solution quality."""
    present = sum(1 for k in _REQUIRED_KEYS if plan.get(k))
    base = present / len(_REQUIRED_KEYS)

    qual_present = sum(1 for k in _QUALITY_KEYS if plan.get(k))
    qual_bonus = (qual_present / len(_QUALITY_KEYS)) * 0.15

    components = plan.get("components", [])
    # SRP check: all components should have a single-line responsibility
    srp_score = sum(
        1 for c in components
        if c.get("responsibility") and len(c["responsibility"].split(".")) <= 2
    ) / max(len(components), 1)
    srp_bonus = srp_score * 0.05

    # Interface contract coverage
    with_contracts = sum(1 for c in components if c.get("interface", {}).get("contract"))
    contract_bonus = (with_contracts / max(len(components), 1)) * 0.05

    # Failure mode coverage
    failure_bonus = min(len(plan.get("failure_modes", [])) * 0.02, 0.08)

    # ADR coverage
    adr_bonus = min(len(plan.get("adrs_required", [])) * 0.01, 0.05)

    return min(base + qual_bonus + srp_bonus + contract_bonus + failure_bonus + adr_bonus, 1.0)


# ---------------------------------------------------------------------------
# SolutionArchitectAgent
# ---------------------------------------------------------------------------

class SolutionArchitectAgent(BaseHiveAgent):
    """
    Solution Architect — Technical Solution Decomposition Lead.

    Capability tag: "SolutionArchitect"
    """

    capability = "SolutionArchitect"
    name = "Solution Architect — Technical Solution Decomposition Lead"

    # ------------------------------------------------------------------
    # plan(): technical solution decomposition
    # ------------------------------------------------------------------

    def plan(self, req: ExecuteRequest) -> dict[str, Any]:
        """
        Decompose the objective into a concrete technical solution:
        components → interfaces → data models → sequences → implementation tasks.

        Applies M10.3 architectural patterns: ExecutionRouter, ExecutionSession,
        stateful leasing, NATS JetStream transport, AsyncGenerator streaming,
        Admission pipeline with Mutation, ExecutionJournal, Retry/DLQ.
        """
        prompt = (
            f"Objective: {req.objective}\n\n"
            f"Additional context:\n{json.dumps(req.input, indent=2) if req.input else 'none'}\n\n"
            "Produce a complete technical solution decomposition following the output format exactly.\n"
            "Every component must have a single responsibility and a defined interface contract.\n"
            "Apply the ExecutionRouter pattern, stateful lease lifecycle, and ExecutionSession.\n"
            "Use NATS JetStream for distributed transport — do not introduce gRPC.\n"
            "Keep AsyncGenerator as the internal streaming abstraction.\n"
            "Include failure modes and test cases for each critical component.\n"
            "Scope to the current milestone — do not let M10.4+ concerns bleed in.\n"
            "Every implementation task must have acceptance criteria and capability assignment.\n"
            "Set confidence honestly — never inflate it."
        )

        raw = self._call_llm(_SYSTEM, prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "solution_summary": raw[:500],
                "components": [],
                "data_models": [],
                "sequence_flows": [],
                "technology_choices": {
                    "distributed_transport": "NATS JetStream",
                    "internal_streaming": "AsyncGenerator / AsyncIterable",
                },
                "adrs_required": [],
                "failure_modes": [],
                "implementation_tasks": [],
                "risks": [],
                "confidence": 0.4,
                "_parse_error": True,
            }

    # ------------------------------------------------------------------
    # execute(): produce technical blueprint
    # ------------------------------------------------------------------

    def execute(self, req: ExecuteRequest, plan: dict[str, Any]) -> dict[str, Any]:
        """
        Solution Architect produces blueprints — not code.
        Output is the technical blueprint ready for engineering handoff.
        """
        components = plan.get("components", [])
        tasks = plan.get("implementation_tasks", [])
        adrs = plan.get("adrs_required", [])
        risks = plan.get("risks", [])
        critical_risks = [r for r in risks if r.get("severity") == "critical"]
        failure_modes = plan.get("failure_modes", [])
        sequence_flows = plan.get("sequence_flows", [])

        # SRP compliance check
        srp_violations = [
            c for c in components
            if c.get("responsibility") and "and" in c["responsibility"].lower()
               and len(c["responsibility"]) > 80
        ]

        # Interface contract coverage
        missing_contracts = [c for c in components if not c.get("interface", {}).get("contract")]

        # M10.3 scope boundary check
        m104_keywords = ["embedding", "capability graph", "semantic search", "learning", "optimization"]
        scope_leakage = [
            c for c in components
            if any(kw in (c.get("responsibility", "") + c.get("implementation_notes", "")).lower()
                   for kw in m104_keywords)
        ]

        return {
            "technical_blueprint": plan,
            "components": components,
            "total_components": len(components),
            "data_models": plan.get("data_models", []),
            "sequence_flows": sequence_flows,
            "technology_choices": plan.get("technology_choices", {}),
            "implementation_tasks": tasks,
            "total_tasks": len(tasks),
            "adrs_required": adrs,
            "total_adrs": len(adrs),
            "failure_modes": failure_modes,
            "total_failure_modes": len(failure_modes),
            "risks": risks,
            "critical_risks": critical_risks,
            "total_critical_risks": len(critical_risks),
            "srp_violations": srp_violations,
            "missing_contracts": missing_contracts,
            "scope_boundary_leakage": scope_leakage,
            "solution_summary": plan.get("solution_summary", ""),
            "scope_boundary": plan.get("scope_boundary", {}),
            "confidence": plan.get("confidence", 0.0),
            "ready_for_engineering": (
                bool(tasks)
                and len(critical_risks) == 0
                and len(srp_violations) == 0
                and len(missing_contracts) == 0
                and len(scope_leakage) == 0
            ),
        }

    # ------------------------------------------------------------------
    # observe(): solution quality scoring
    # ------------------------------------------------------------------

    def observe(self, req: ExecuteRequest, result: dict[str, Any]) -> dict[str, Any]:
        quality_score = _score_solution(result.get("technical_blueprint", {}))

        srp_violations = result.get("srp_violations", [])
        missing_contracts = result.get("missing_contracts", [])
        scope_leakage = result.get("scope_boundary_leakage", [])
        critical_risks = result.get("total_critical_risks", 0)
        failure_modes = result.get("total_failure_modes", 0)

        return {
            "hasOutput": bool(result.get("implementation_tasks")),
            "totalComponents": result.get("total_components", 0),
            "totalImplementationTasks": result.get("total_tasks", 0),
            "totalADRsRequired": result.get("total_adrs", 0),
            "totalFailureModes": failure_modes,
            "srp_violations": len(srp_violations),
            "missingContracts": len(missing_contracts),
            "scopeBoundaryLeakage": len(scope_leakage),
            "criticalRisks": critical_risks,
            "readyForEngineering": result.get("ready_for_engineering", False),
            "qualityScore": quality_score,
            "notes": (
                f"Solution with {result.get('total_components', 0)} component(s), "
                f"{result.get('total_tasks', 0)} implementation task(s), "
                f"{result.get('total_adrs', 0)} ADR(s) required, "
                f"{failure_modes} failure mode(s) tested. "
                f"SRP violations: {len(srp_violations)}. "
                f"Missing contracts: {len(missing_contracts)}. "
                f"Scope leakage: {len(scope_leakage)}. "
                f"{'✓ Ready for engineering handoff.' if result.get('ready_for_engineering') else '⚠ Needs revision before handoff.'}"
            ),
        }

    # ------------------------------------------------------------------
    # reflect(): architectural improvement suggestions
    # ------------------------------------------------------------------

    def reflect(
        self,
        req: ExecuteRequest,
        result: dict[str, Any],
        observation: dict[str, Any],
    ) -> dict[str, Any]:
        suggestions: list[str] = []

        if observation.get("srp_violations", 0) > 0:
            suggestions.append(
                f"{observation['srp_violations']} component(s) violate SRP — "
                "each component must have exactly one reason to change. Split them."
            )
        if observation.get("missingContracts", 0) > 0:
            suggestions.append(
                f"{observation['missingContracts']} component(s) lack interface contracts — "
                "define TypeScript interface or Python Protocol before engineering handoff."
            )
        if observation.get("scopeBoundaryLeakage", 0) > 0:
            suggestions.append(
                f"{observation['scopeBoundaryLeakage']} component(s) reference M10.4+ concepts "
                "(embeddings, capability graph, semantic search, optimization) — "
                "move those to M10.4 scope. Keep M10.3 as pure Execution Fabric."
            )
        if observation.get("totalFailureModes", 0) < 4:
            suggestions.append(
                "Fewer than 4 failure modes documented — distributed systems require comprehensive "
                "failure-mode testing: heartbeat loss, stream cancellation, worker crash, "
                "duplicate delivery, admission mutation visibility, lifecycle enforcement."
            )
        if observation.get("totalADRsRequired", 0) == 0:
            suggestions.append(
                "No ADRs identified — significant design choices (transport selection, "
                "streaming abstraction, lease model, admission pipeline) each require an ADR."
            )
        if not result.get("technical_blueprint", {}).get("technology_choices", {}).get("distributed_transport"):
            suggestions.append(
                "No distributed transport specified — use NATS JetStream. "
                "Do not introduce gRPC; you already have an event bus."
            )
        if observation.get("criticalRisks", 0) > 0:
            suggestions.append(
                "Critical risks detected — engineering handoff is BLOCKED. "
                "Escalate to Enterprise Architect and CEO Agent immediately."
            )

        return {
            "objectiveClarity": (
                "clear" if observation.get("totalImplementationTasks", 0) > 0 else "ambiguous"
            ),
            "executionStrategy": "technical_solution_decomposition",
            "solutionRigour": (
                "high" if observation.get("qualityScore", 0) >= 0.8
                else "medium" if observation.get("qualityScore", 0) >= 0.6
                else "low"
            ),
            "qualityScore": observation.get("qualityScore", 0.0),
            "suggestions": suggestions,
            "architecturalCompliance": {
                "srpEnforced": observation.get("srp_violations", 0) == 0,
                "contractsDefined": observation.get("missingContracts", 0) == 0,
                "scopeBoundaryClear": observation.get("scopeBoundaryLeakage", 0) == 0,
                "failureModesDocumented": observation.get("totalFailureModes", 0) >= 4,
                "adrsRequired": observation.get("totalADRsRequired", 0) > 0,
                "natsJetstreamUsed": "nats" in str(
                    result.get("technical_blueprint", {})
                    .get("technology_choices", {})
                    .get("distributed_transport", "")
                ).lower(),
            },
        }
