"""
Enterprise Architect Agent — Skill Definitions (CrewAI BaseTool pattern).

46 skills covering the full architecture governance surface of the CerebroHive EIOS.
All skills are governance/analysis-level — they produce artefacts (ADRs, diagrams,
assessments, standards), never implementation code.

Usage (CrewAI):
    from agents.enterprise_architect.skills import ENTERPRISE_ARCHITECT_SKILLS
    ea_agent = Agent(role="Enterprise Architect", tools=ENTERPRISE_ARCHITECT_SKILLS, ...)

Usage (HiveSwarm / standalone):
    skill = ADRGeneratorSkill()
    result = skill._run(decision="...", context="...", options=[...])
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
# 1. Enterprise Architecture
# =============================================================================
class EnterpriseArchitectureInput(BaseModel):
    scope: str = Field(..., description="Domain or system under architectural analysis.")
    objectives: Optional[list[str]] = Field(default=None, description="Business or technical objectives to address.")

class EnterpriseArchitectureSkill(BaseTool):
    name: str = "enterprise_architecture"
    description: str = (
        "Produce a full enterprise architecture analysis: capability map, domain model, "
        "integration landscape, quality attributes, and governance recommendations."
    )
    args_schema: Type[BaseModel] = EnterpriseArchitectureInput

    def _run(self, scope: str, objectives: Optional[list[str]] = None) -> str:
        return json.dumps({
            "skill": "enterprise_architecture", "scope": scope,
            "output_schema": {
                "capability_map": "Business + technical capability hierarchy",
                "domain_model": "Bounded contexts and aggregate roots",
                "integration_landscape": "System context diagram inputs",
                "quality_attributes": "list[{attribute, target, rationale}]",
                "governance_recommendations": "list[str]",
                "adrs_required": "list[str]",
            },
        }, indent=2)


# =============================================================================
# 2. Solution Architecture
# =============================================================================
class SolutionArchitectureInput(BaseModel):
    requirement: str = Field(..., description="Business requirement or feature to architect.")
    constraints: Optional[list[str]] = Field(default=None, description="Technical or business constraints.")

class SolutionArchitectureSkill(BaseTool):
    name: str = "solution_architecture"
    description: str = (
        "Translate a business requirement into a solution blueprint with component "
        "breakdown, integration points, data flows, and quality-attribute targets."
    )
    args_schema: Type[BaseModel] = SolutionArchitectureInput

    def _run(self, requirement: str, constraints: Optional[list[str]] = None) -> str:
        return json.dumps({
            "skill": "solution_architecture", "requirement": requirement,
            "constraints": constraints or [],
            "output_schema": {
                "solution_blueprint": "Component diagram inputs",
                "integration_points": "list[{system, protocol, data_format}]",
                "data_flows": "list[{source, sink, transformation}]",
                "quality_targets": "dict[attribute, target]",
                "risks": "list[{description, severity, mitigation}]",
            },
        }, indent=2)


# =============================================================================
# 3. Domain-Driven Design (DDD)
# =============================================================================
class DDDInput(BaseModel):
    domain: str = Field(..., description="Business domain to analyse with DDD.")
    existing_model: Optional[str] = Field(default=None, description="Existing domain model if any.")

class DDDSkill(BaseTool):
    name: str = "domain_driven_design"
    description: str = (
        "Apply DDD to a business domain: identify bounded contexts, aggregates, "
        "domain events, value objects, and define the ubiquitous language."
    )
    args_schema: Type[BaseModel] = DDDInput

    def _run(self, domain: str, existing_model: Optional[str] = None) -> str:
        return json.dumps({
            "skill": "domain_driven_design", "domain": domain,
            "output_schema": {
                "bounded_contexts": "list[{name, description, owner_team}]",
                "context_map": "list[{context_a, relationship, context_b}]",
                "aggregates": "list[{context, name, root_entity, invariants}]",
                "domain_events": "list[{name, trigger, payload_schema}]",
                "ubiquitous_language": "dict[term, definition]",
                "value_objects": "list[{name, attributes}]",
            },
        }, indent=2)


# =============================================================================
# 4. Event-Driven Architecture
# =============================================================================
class EDAInput(BaseModel):
    system: str = Field(..., description="System or workflow to design with EDA.")
    event_catalog: Optional[list[str]] = Field(default=None, description="Known domain events.")

class EDASkill(BaseTool):
    name: str = "event_driven_architecture"
    description: str = (
        "Design an event-driven system: define event schemas, producers, consumers, "
        "event bus topology, choreography vs orchestration, and dead-letter strategies."
    )
    args_schema: Type[BaseModel] = EDAInput

    def _run(self, system: str, event_catalog: Optional[list[str]] = None) -> str:
        return json.dumps({
            "skill": "event_driven_architecture", "system": system,
            "output_schema": {
                "event_catalog": "list[{name, schema, producer, consumers, retention}]",
                "topology": "choreography|orchestration|hybrid",
                "event_bus": "{technology, partitioning_strategy, replication}",
                "consumer_groups": "list[{name, events, processing_guarantee}]",
                "dead_letter_strategy": "str",
                "idempotency_approach": "str",
            },
        }, indent=2)


# =============================================================================
# 5. Architecture Decision Record (ADR) Generator
# =============================================================================
class ADRInput(BaseModel):
    decision: str = Field(..., description="Architectural decision to document.")
    context: str = Field(..., description="Context and problem statement.")
    options: list[str] = Field(..., description="Options considered.")
    chosen_option: Optional[str] = Field(default=None, description="Chosen option if already decided.")

class ADRGeneratorSkill(BaseTool):
    name: str = "architecture_decision_records"
    description: str = (
        "Generate a complete Architecture Decision Record (ADR) following MADR format. "
        "Required for every significant architectural change. ADR coverage must be ≥ 100%."
    )
    args_schema: Type[BaseModel] = ADRInput

    def _run(self, decision: str, context: str, options: list[str], chosen_option: Optional[str] = None) -> str:
        return json.dumps({
            "skill": "architecture_decision_records",
            "adr_template": {
                "title": f"ADR: {decision}",
                "status": "proposed",
                "context": context,
                "decision_drivers": [],
                "considered_options": options,
                "decision_outcome": {
                    "chosen_option": chosen_option or "TBD",
                    "rationale": "",
                    "positive_consequences": [],
                    "negative_consequences": [],
                },
                "pros_and_cons": {opt: {"pros": [], "cons": []} for opt in options},
                "links": [],
            },
        }, indent=2)


# =============================================================================
# 6. Architecture Review
# =============================================================================
class ArchitectureReviewInput(BaseModel):
    artefact: str = Field(..., description="Design, PR, RFC, or system to review.")
    review_type: str = Field(default="design_review", description="Type: design_review|adr_review|security_review|compliance_check|gate_approval")

class ArchitectureReviewSkill(BaseTool):
    name: str = "architecture_review"
    description: str = (
        "Conduct a rigorous architecture review (SLA < 24 hours). Produces a structured "
        "review report with pass/fail verdict, findings, required changes, and ADR needs."
    )
    args_schema: Type[BaseModel] = ArchitectureReviewInput

    def _run(self, artefact: str, review_type: str = "design_review") -> str:
        return json.dumps({
            "skill": "architecture_review", "artefact": artefact, "review_type": review_type,
            "checklist": [
                "Aligns with EIOS architecture and capability model",
                "Domain boundaries correctly defined",
                "No duplication of existing platform capabilities",
                "API contracts defined and versioned",
                "Quality attributes addressed (scalability, resilience, security, observability)",
                "Zero Trust security model applied",
                "ADR created for any new architectural direction",
                "Multi-tenancy and compliance requirements met",
                "Observability instrumentation defined",
                "Data model consistent with existing schemas",
                "No unnecessary vendor lock-in introduced",
                "Technical debt impact assessed",
            ],
            "output_schema": {
                "verdict": "approved|rejected|needs_revision|conditional_approval",
                "findings": "list[{severity, category, description, recommendation}]",
                "required_changes": "list[str]",
                "adrs_required": "list[str]",
                "conditions": "list[str] (for conditional approval)",
            },
        }, indent=2)


# =============================================================================
# 7. Capability Modeling
# =============================================================================
class CapabilityModelingInput(BaseModel):
    domain: str = Field(..., description="Business or technical domain to model.")
    perspective: str = Field(default="business", description="Perspective: business|technical|platform")

class CapabilityModelingSkill(BaseTool):
    name: str = "capability_modeling"
    description: str = (
        "Build a capability model for a domain: identify capabilities, map them to "
        "business outcomes, assess maturity, and recommend platform reuse."
    )
    args_schema: Type[BaseModel] = CapabilityModelingInput

    def _run(self, domain: str, perspective: str = "business") -> str:
        return json.dumps({
            "skill": "capability_modeling", "domain": domain, "perspective": perspective,
            "output_schema": {
                "capability_map": "list[{id, name, description, level, parent_id, maturity}]",
                "business_outcomes": "dict[capability_id, list[outcome]]",
                "platform_reuse": "list[{capability, existing_service, reuse_recommendation}]",
                "gaps": "list[{capability, gap_description, priority}]",
                "investment_priorities": "list[capability_id]",
            },
        }, indent=2)


# =============================================================================
# 8. Reference Architecture
# =============================================================================
class ReferenceArchitectureInput(BaseModel):
    domain: str = Field(..., description="Domain requiring a reference architecture.")
    technology_stack: Optional[list[str]] = Field(default=None, description="Preferred technology stack.")

class ReferenceArchitectureSkill(BaseTool):
    name: str = "reference_architecture"
    description: str = (
        "Define a reusable reference architecture for a domain: canonical patterns, "
        "component templates, integration blueprints, and governance guidelines."
    )
    args_schema: Type[BaseModel] = ReferenceArchitectureInput

    def _run(self, domain: str, technology_stack: Optional[list[str]] = None) -> str:
        return json.dumps({
            "skill": "reference_architecture", "domain": domain,
            "output_schema": {
                "canonical_patterns": "list[{name, description, diagram_hint}]",
                "component_templates": "list[{name, responsibilities, interfaces}]",
                "integration_blueprint": "list[{source, target, pattern, protocol}]",
                "technology_choices": "dict[layer, recommended_technology]",
                "governance_guidelines": "list[str]",
                "anti_patterns": "list[{name, description, why_to_avoid}]",
            },
        }, indent=2)


# =============================================================================
# 9. Risk Assessment
# =============================================================================
class ArchRiskAssessmentInput(BaseModel):
    scope: str = Field(..., description="System, design, or change being assessed.")
    context: Optional[dict] = Field(default=None, description="Additional context.")

class ArchRiskAssessmentSkill(BaseTool):
    name: str = "risk_assessment"
    description: str = (
        "Identify and score architectural risks across technical, security, operational, "
        "compliance, and strategic dimensions. Critical risks block delegation."
    )
    args_schema: Type[BaseModel] = ArchRiskAssessmentInput

    def _run(self, scope: str, context: Optional[dict] = None) -> str:
        return json.dumps({
            "skill": "risk_assessment", "scope": scope,
            "risk_dimensions": [
                "architectural_integrity", "security", "compliance", "scalability",
                "resilience", "interoperability", "vendor_lock_in", "technical_debt",
                "operational", "data_governance", "ai_governance",
            ],
            "output_schema": {
                "risks": "list[{id, dimension, description, probability, impact, severity, quality_attribute_impact, mitigation, adr_required}]",
                "critical_risks": "list[risk_id]",
                "blocking_risks": "list[risk_id]",
                "risk_matrix": "2D probability × impact grid",
            },
        }, indent=2)


# =============================================================================
# 10. Technology Evaluation
# =============================================================================
class TechnologyEvaluationInput(BaseModel):
    technology: str = Field(..., description="Technology, framework, or platform to evaluate.")
    use_case: str = Field(..., description="Intended use case in the EIOS.")
    alternatives: Optional[list[str]] = Field(default=None, description="Alternative options to compare.")

class TechnologyEvaluationSkill(BaseTool):
    name: str = "technology_evaluation"
    description: str = (
        "Evaluate a technology against EIOS requirements using the Technology Radar "
        "framework (Adopt/Trial/Assess/Hold) with structured scoring."
    )
    args_schema: Type[BaseModel] = TechnologyEvaluationInput

    def _run(self, technology: str, use_case: str, alternatives: Optional[list[str]] = None) -> str:
        return json.dumps({
            "skill": "technology_evaluation", "technology": technology, "use_case": use_case,
            "evaluation_criteria": [
                "Alignment with EIOS architecture", "Maturity and community support",
                "Scalability", "Security posture", "Vendor lock-in risk",
                "Operational complexity", "Cost (TCO)", "Integration complexity",
                "License compatibility", "Long-term viability",
            ],
            "output_schema": {
                "radar_status": "Adopt|Trial|Assess|Hold",
                "scores": "dict[criterion, score_0_to_10]",
                "total_score": "float",
                "recommendation": "str",
                "rationale": "str",
                "risks": "list[str]",
                "adr_required": "bool",
                "alternatives_comparison": "dict[option, scores]",
            },
        }, indent=2)


# =============================================================================
# 11. Technical Debt Analysis
# =============================================================================
class TechnicalDebtInput(BaseModel):
    system: str = Field(..., description="System or codebase to analyse for technical debt.")

class TechnicalDebtSkill(BaseTool):
    name: str = "technical_debt_analysis"
    description: str = (
        "Identify, quantify, and prioritise technical debt. Technical Debt Growth "
        "must remain < 2% — flag items that risk breaching this threshold."
    )
    args_schema: Type[BaseModel] = TechnicalDebtInput

    def _run(self, system: str) -> str:
        return json.dumps({
            "skill": "technical_debt_analysis", "system": system,
            "debt_categories": [
                "design_debt", "architecture_debt", "code_debt", "test_debt",
                "documentation_debt", "infrastructure_debt", "security_debt",
            ],
            "output_schema": {
                "debt_items": "list[{id, category, description, severity, estimated_effort, business_impact, remediation_priority}]",
                "total_debt_score": "float 0–100",
                "debt_growth_risk": "low|medium|high (flag if approaching 2% threshold)",
                "remediation_roadmap": "list[{debt_id, sprint, owner}]",
            },
        }, indent=2)


# =============================================================================
# 12. API Design
# =============================================================================
class APIDesignInput(BaseModel):
    service: str = Field(..., description="Service or capability requiring API design.")
    api_style: str = Field(default="REST", description="API style: REST|GraphQL|gRPC|AsyncAPI|Event")

class APIDesignSkill(BaseTool):
    name: str = "api_design"
    description: str = (
        "Define API contracts, versioning strategy, and governance standards for "
        "a service. Produces OpenAPI/AsyncAPI spec inputs and design guidelines."
    )
    args_schema: Type[BaseModel] = APIDesignInput

    def _run(self, service: str, api_style: str = "REST") -> str:
        return json.dumps({
            "skill": "api_design", "service": service, "api_style": api_style,
            "output_schema": {
                "api_contract": f"{api_style} spec skeleton (endpoints, schemas, errors)",
                "versioning_strategy": "url_path|header|content_negotiation",
                "breaking_change_policy": "str",
                "rate_limiting": "{strategy, limits}",
                "authentication": "OAuth2|JWT|API_Key|mTLS",
                "error_format": "RFC 7807 Problem Details",
                "pagination": "{strategy, max_page_size}",
                "governance_checklist": "list[str]",
            },
        }, indent=2)


# =============================================================================
# 13. Distributed Systems
# =============================================================================
class DistributedSystemsInput(BaseModel):
    system: str = Field(..., description="Distributed system to design or review.")
    scale_target: Optional[str] = Field(default=None, description="Target scale (e.g. '10k RPS', '1M users').")

class DistributedSystemsSkill(BaseTool):
    name: str = "distributed_systems"
    description: str = (
        "Design fault-tolerant, scalable distributed system topologies: consistency models, "
        "partitioning, replication, consensus, and failure handling patterns."
    )
    args_schema: Type[BaseModel] = DistributedSystemsInput

    def _run(self, system: str, scale_target: Optional[str] = None) -> str:
        return json.dumps({
            "skill": "distributed_systems", "system": system, "scale_target": scale_target,
            "output_schema": {
                "consistency_model": "strong|eventual|causal|linearizable",
                "partitioning_strategy": "hash|range|geo|none",
                "replication_strategy": "{factor, sync_mode}",
                "failure_modes": "list[{scenario, impact, mitigation}]",
                "cap_tradeoffs": "str",
                "topology_diagram_hint": "str",
            },
        }, indent=2)


# =============================================================================
# 14. Cloud Architecture
# =============================================================================
class CloudArchitectureInput(BaseModel):
    workload: str = Field(..., description="Workload or system to cloud-architect.")
    cloud_providers: Optional[list[str]] = Field(default=None, description="Target cloud providers.")

class CloudArchitectureSkill(BaseTool):
    name: str = "cloud_architecture"
    description: str = (
        "Architect cloud-native, multi-cloud, or hybrid solutions: landing zone design, "
        "service selection, IAM, networking topology, and cost optimisation."
    )
    args_schema: Type[BaseModel] = CloudArchitectureInput

    def _run(self, workload: str, cloud_providers: Optional[list[str]] = None) -> str:
        return json.dumps({
            "skill": "cloud_architecture", "workload": workload,
            "cloud_providers": cloud_providers or ["AWS", "GCP", "Azure"],
            "output_schema": {
                "landing_zone": "{account_structure, networking, iam_boundaries}",
                "service_selection": "dict[layer, service]",
                "networking_topology": "{vpc, subnets, peering, ingress_egress}",
                "iam_model": "{roles, policies, least_privilege_notes}",
                "cost_estimate": "{monthly_usd_estimate, optimisation_tips}",
                "multi_cloud_strategy": "primary|active_active|active_passive|none",
            },
        }, indent=2)


# =============================================================================
# 15. CQRS
# =============================================================================
class CQRSInput(BaseModel):
    domain: str = Field(..., description="Domain to apply CQRS to.")

class CQRSSkill(BaseTool):
    name: str = "cqrs"
    description: str = (
        "Apply CQRS to a domain: separate command and query models, define read projections, "
        "command handlers, and synchronisation strategy."
    )
    args_schema: Type[BaseModel] = CQRSInput

    def _run(self, domain: str) -> str:
        return json.dumps({
            "skill": "cqrs", "domain": domain,
            "output_schema": {
                "command_model": "list[{command, handler, aggregate, events_emitted}]",
                "query_model": "list[{query, projection, read_store, update_trigger}]",
                "synchronisation": "eventual_consistency|strong|saga",
                "read_stores": "list[{name, technology, update_strategy}]",
                "consistency_lag_slo": "str",
            },
        }, indent=2)


# =============================================================================
# 16. Event Sourcing
# =============================================================================
class EventSourcingInput(BaseModel):
    aggregate: str = Field(..., description="Aggregate root to event-source.")

class EventSourcingSkill(BaseTool):
    name: str = "event_sourcing"
    description: str = (
        "Design an event-sourced aggregate: define the event log schema, snapshots, "
        "replay strategy, and projection rebuild plan."
    )
    args_schema: Type[BaseModel] = EventSourcingInput

    def _run(self, aggregate: str) -> str:
        return json.dumps({
            "skill": "event_sourcing", "aggregate": aggregate,
            "output_schema": {
                "event_log_schema": "{event_id, aggregate_id, event_type, payload, timestamp, version}",
                "events": "list[{name, triggers, payload_schema, version}]",
                "snapshot_strategy": "{frequency, storage, rebuild_threshold}",
                "replay_strategy": "{from_snapshot, parallel_replay, ordering}",
                "projections": "list[{name, events_consumed, read_store, rebuild_time_estimate}]",
                "retention_policy": "str",
            },
        }, indent=2)


# =============================================================================
# 17. Multi-Agent Architecture
# =============================================================================
class MultiAgentArchInput(BaseModel):
    system: str = Field(..., description="Multi-agent system to architect.")
    agent_count: Optional[int] = Field(default=None, description="Expected number of agents.")

class MultiAgentArchSkill(BaseTool):
    name: str = "multi_agent_architecture"
    description: str = (
        "Design multi-agent system topology: agent roles, coordination patterns, "
        "memory architecture, tool access model, and delegation protocols."
    )
    args_schema: Type[BaseModel] = MultiAgentArchInput

    def _run(self, system: str, agent_count: Optional[int] = None) -> str:
        return json.dumps({
            "skill": "multi_agent_architecture", "system": system,
            "output_schema": {
                "agent_topology": "list[{name, capability, reports_to, concurrency}]",
                "coordination_pattern": "hierarchical|flat|hybrid",
                "delegation_protocol": "{task_routing, priority_model, fallback}",
                "memory_architecture": "{short_term, long_term, shared_knowledge}",
                "tool_access_model": "dict[agent_role, allowed_tools]",
                "failure_handling": "{agent_failure, retry, circuit_breaker}",
                "observability": "{tracing, metrics, audit_log}",
            },
        }, indent=2)


# =============================================================================
# 18. Observability
# =============================================================================
class ObservabilityInput(BaseModel):
    system: str = Field(..., description="System requiring observability design.")

class ObservabilitySkill(BaseTool):
    name: str = "observability"
    description: str = (
        "Define observability standards for a system: metrics, distributed tracing, "
        "structured logging, alerting rules, dashboards, and SLO definitions."
    )
    args_schema: Type[BaseModel] = ObservabilityInput

    def _run(self, system: str) -> str:
        return json.dumps({
            "skill": "observability", "system": system,
            "output_schema": {
                "metrics": "list[{name, type, labels, description, alert_threshold}]",
                "traces": "{instrumentation, sampling_rate, trace_propagation}",
                "logs": "{format, level_policy, structured_fields, retention}",
                "slos": "list[{name, sli, target_pct, error_budget}]",
                "dashboards": "list[{name, panels, audience}]",
                "alerting_rules": "list[{name, condition, severity, runbook}]",
            },
        }, indent=2)


# =============================================================================
# 19. Security Architecture (Oversight)
# =============================================================================
class SecurityArchOverviewInput(BaseModel):
    system: str = Field(..., description="System requiring security architecture review.")
    threat_model: Optional[str] = Field(default=None, description="Existing threat model if available.")

class SecurityArchSkill(BaseTool):
    name: str = "security_architecture"
    description: str = (
        "Provide security architecture oversight: zero-trust design review, threat model "
        "assessment, compliance mapping, and security governance recommendations."
    )
    args_schema: Type[BaseModel] = SecurityArchOverviewInput

    def _run(self, system: str, threat_model: Optional[str] = None) -> str:
        return json.dumps({
            "skill": "security_architecture", "system": system,
            "output_schema": {
                "zero_trust_assessment": "list[{principle, status, gaps}]",
                "threat_surface": "list[{threat, likelihood, impact, control}]",
                "compliance_mapping": "dict[framework, coverage_pct]",
                "security_controls": "list[{control, layer, implementation_guidance}]",
                "escalation_to_security_architect": "bool",
                "adrs_required": "list[str]",
            },
        }, indent=2)


# =============================================================================
# 20. Data Architecture
# =============================================================================
class DataArchitectureInput(BaseModel):
    domain: str = Field(..., description="Data domain to architect.")
    data_types: Optional[list[str]] = Field(default=None, description="Types of data: transactional, analytical, streaming, etc.")

class DataArchitectureSkill(BaseTool):
    name: str = "data_architecture"
    description: str = (
        "Design data architecture: storage strategy, data models, pipeline patterns, "
        "governance policies, lineage, and master data management."
    )
    args_schema: Type[BaseModel] = DataArchitectureInput

    def _run(self, domain: str, data_types: Optional[list[str]] = None) -> str:
        return json.dumps({
            "skill": "data_architecture", "domain": domain,
            "output_schema": {
                "storage_strategy": "dict[data_type, storage_technology]",
                "data_models": "list[{entity, schema_hint, relationships}]",
                "pipeline_patterns": "list[{pattern, use_case, technology}]",
                "data_governance": "{ownership, classification, retention, access_control}",
                "lineage_tracking": "{tool, granularity}",
                "master_data_management": "{strategy, golden_record_approach}",
            },
        }, indent=2)


# =============================================================================
# 21. Infrastructure Architecture
# =============================================================================
class InfrastructureArchInput(BaseModel):
    system: str = Field(..., description="System requiring infrastructure architecture.")

class InfrastructureArchSkill(BaseTool):
    name: str = "infrastructure_architecture"
    description: str = (
        "Define infrastructure topology: IaC patterns, compute/network/storage design, "
        "environment strategy, and GitOps deployment model."
    )
    args_schema: Type[BaseModel] = InfrastructureArchInput

    def _run(self, system: str) -> str:
        return json.dumps({
            "skill": "infrastructure_architecture", "system": system,
            "output_schema": {
                "iac_pattern": "Terraform|Pulumi|CDK|Helm",
                "compute": "{type, autoscaling, spot_strategy}",
                "networking": "{topology, security_groups, ingress}",
                "storage": "{block, object, file, backup}",
                "environment_strategy": "dev|staging|prod|dr",
                "gitops_model": "{tool, promotion_flow, rollback_strategy}",
            },
        }, indent=2)


# =============================================================================
# 22. AI System Design
# =============================================================================
class AISystemDesignInput(BaseModel):
    use_case: str = Field(..., description="AI use case to architect.")
    modalities: Optional[list[str]] = Field(default=None, description="AI modalities: LLM, vision, audio, embedding, etc.")

class AISystemDesignSkill(BaseTool):
    name: str = "ai_system_design"
    description: str = (
        "Architect AI/ML systems: model serving, RAG pipelines, fine-tuning strategy, "
        "AI governance, safety controls, and evaluation frameworks."
    )
    args_schema: Type[BaseModel] = AISystemDesignInput

    def _run(self, use_case: str, modalities: Optional[list[str]] = None) -> str:
        return json.dumps({
            "skill": "ai_system_design", "use_case": use_case,
            "output_schema": {
                "model_serving": "{serving_framework, latency_slo, scaling}",
                "rag_pipeline": "{retrieval_strategy, embedding_model, vector_store, reranking}",
                "fine_tuning_strategy": "{approach, dataset_requirements, evaluation_protocol}",
                "ai_governance": "{model_registry, versioning, lineage, bias_checks}",
                "safety_controls": "{guardrails, output_filtering, human_in_loop}",
                "evaluation_framework": "{metrics, benchmarks, regression_tests}",
                "cost_model": "{per_call_cost, monthly_estimate}",
            },
        }, indent=2)


# =============================================================================
# 23. Workflow Orchestration
# =============================================================================
class WorkflowOrchestrationInput(BaseModel):
    workflow: str = Field(..., description="Workflow or business process to architect.")

class WorkflowOrchestrationSkill(BaseTool):
    name: str = "workflow_orchestration"
    description: str = (
        "Architect workflow engine patterns: DAG definition, long-running processes, "
        "saga coordination, compensation logic, and durability guarantees."
    )
    args_schema: Type[BaseModel] = WorkflowOrchestrationInput

    def _run(self, workflow: str) -> str:
        return json.dumps({
            "skill": "workflow_orchestration", "workflow": workflow,
            "output_schema": {
                "dag_definition": "{nodes, edges, conditional_branches}",
                "durability": "at_least_once|exactly_once|best_effort",
                "saga_pattern": "choreography|orchestration",
                "compensation_steps": "list[{step, compensating_action}]",
                "timeout_handling": "{step_timeout, workflow_timeout, escalation}",
                "observability": "{state_visibility, replay_capability}",
            },
        }, indent=2)


# =============================================================================
# 24. Microservices
# =============================================================================
class MicroservicesInput(BaseModel):
    domain: str = Field(..., description="Domain to decompose into microservices.")

class MicroservicesSkill(BaseTool):
    name: str = "microservices"
    description: str = (
        "Define microservice boundaries using DDD: identify services, "
        "API contracts, inter-service communication patterns, and data ownership."
    )
    args_schema: Type[BaseModel] = MicroservicesInput

    def _run(self, domain: str) -> str:
        return json.dumps({
            "skill": "microservices", "domain": domain,
            "output_schema": {
                "services": "list[{name, bounded_context, responsibilities, api_style, data_owner}]",
                "communication_patterns": "dict[pair, sync|async|event]",
                "service_mesh": "{tool, mTLS, traffic_management}",
                "deployment_topology": "{containers, orchestrator, sidecar}",
                "anti_patterns_avoided": "list[str]",
            },
        }, indent=2)


# =============================================================================
# 25. Enterprise Integration
# =============================================================================
class EnterpriseIntegrationInput(BaseModel):
    systems: list[str] = Field(..., description="Systems requiring integration.")
    integration_style: str = Field(default="event_driven", description="Style: point_to_point|hub_spoke|event_driven|api_gateway")

class EnterpriseIntegrationSkill(BaseTool):
    name: str = "enterprise_integration"
    description: str = (
        "Design integration architecture across enterprise systems: messaging patterns, "
        "data transformation, API orchestration, and integration governance."
    )
    args_schema: Type[BaseModel] = EnterpriseIntegrationInput

    def _run(self, systems: list[str], integration_style: str = "event_driven") -> str:
        return json.dumps({
            "skill": "enterprise_integration", "systems": systems, "style": integration_style,
            "output_schema": {
                "integration_map": "list[{source, target, pattern, protocol, data_format}]",
                "canonical_data_model": "{purpose, key_entities}",
                "transformation_strategy": "{tool, mapping_approach}",
                "error_handling": "{retry, dead_letter, alerting}",
                "governance": "{versioning, deprecation_policy, SLA}",
            },
        }, indent=2)


# =============================================================================
# 26. Architecture Documentation
# =============================================================================
class ArchDocumentationInput(BaseModel):
    system: str = Field(..., description="System to document architecturally.")
    views: Optional[list[str]] = Field(default=None, description="Views to produce: context|container|component|deployment|sequence")

class ArchDocumentationSkill(BaseTool):
    name: str = "architecture_documentation"
    description: str = (
        "Produce C4-model architecture documentation: context, container, component, "
        "and deployment views with Mermaid/PlantUML diagram inputs."
    )
    args_schema: Type[BaseModel] = ArchDocumentationInput

    def _run(self, system: str, views: Optional[list[str]] = None) -> str:
        default_views = ["context", "container", "component", "deployment"]
        return json.dumps({
            "skill": "architecture_documentation", "system": system,
            "views_to_produce": views or default_views,
            "output_schema": {
                "c4_context": "{actors, systems, relationships}",
                "c4_container": "{containers, technologies, inter_container_comms}",
                "c4_component": "{components, responsibilities, dependencies}",
                "c4_deployment": "{environments, infrastructure, deployment_units}",
                "sequence_diagrams": "list[{scenario, participants, steps}]",
                "diagram_format": "mermaid|plantuml|structurizr",
            },
        }, indent=2)


# =============================================================================
# 27. Knowledge Graph Design
# =============================================================================
class KnowledgeGraphInput(BaseModel):
    domain: str = Field(..., description="Domain for knowledge graph schema design.")

class KnowledgeGraphSkill(BaseTool):
    name: str = "knowledge_graph_design"
    description: str = (
        "Design knowledge graph schemas, ontologies, entity-relationship models, "
        "and graph query patterns for the EIOS knowledge platform."
    )
    args_schema: Type[BaseModel] = KnowledgeGraphInput

    def _run(self, domain: str) -> str:
        return json.dumps({
            "skill": "knowledge_graph_design", "domain": domain,
            "output_schema": {
                "ontology": "{classes, properties, relationships, constraints}",
                "entity_types": "list[{name, attributes, relationships}]",
                "edge_types": "list[{name, source_type, target_type, cardinality}]",
                "query_patterns": "list[{use_case, cypher_hint, sparql_hint}]",
                "ingestion_pipeline": "{sources, extraction, transformation, loading}",
                "indexing_strategy": "{full_text, vector, graph_indexes}",
            },
        }, indent=2)


# =============================================================================
# 28. Scalability Engineering
# =============================================================================
class ScalabilityInput(BaseModel):
    system: str = Field(..., description="System to design for scalability.")
    scale_targets: Optional[dict] = Field(default=None, description="Scale targets: {rps, users, data_volume}")

class ScalabilitySkill(BaseTool):
    name: str = "scalability_engineering"
    description: str = (
        "Design scalability patterns: horizontal/vertical scaling, sharding, caching layers, "
        "load balancing, and capacity planning models."
    )
    args_schema: Type[BaseModel] = ScalabilityInput

    def _run(self, system: str, scale_targets: Optional[dict] = None) -> str:
        return json.dumps({
            "skill": "scalability_engineering", "system": system, "scale_targets": scale_targets or {},
            "output_schema": {
                "scaling_strategy": "horizontal|vertical|hybrid",
                "sharding_approach": "{strategy, key, rebalancing}",
                "caching_layers": "list[{level, technology, ttl, invalidation}]",
                "load_balancing": "{algorithm, health_checks, session_affinity}",
                "capacity_model": "{formula, growth_assumptions, headroom_pct}",
                "bottleneck_analysis": "list[{component, bottleneck, mitigation}]",
            },
        }, indent=2)


# =============================================================================
# 29. High Availability
# =============================================================================
class HighAvailabilityInput(BaseModel):
    system: str = Field(..., description="System requiring HA design.")
    availability_target: str = Field(default="99.9%", description="Target availability SLA (e.g. '99.99%').")

class HighAvailabilitySkill(BaseTool):
    name: str = "high_availability"
    description: str = (
        "Design high-availability patterns: replication, failover, circuit breakers, "
        "health checks, and multi-AZ/region redundancy."
    )
    args_schema: Type[BaseModel] = HighAvailabilityInput

    def _run(self, system: str, availability_target: str = "99.9%") -> str:
        return json.dumps({
            "skill": "high_availability", "system": system, "target": availability_target,
            "output_schema": {
                "replication": "{strategy, factor, sync_mode}",
                "failover": "{rto_target, rpo_target, mechanism}",
                "circuit_breaker": "{threshold, timeout, half_open_probe}",
                "health_checks": "{liveness, readiness, startup, intervals}",
                "redundancy": "{zones, regions, active_active_or_passive}",
                "chaos_engineering_plan": "list[{experiment, expected_outcome}]",
            },
        }, indent=2)


# =============================================================================
# 30. Disaster Recovery
# =============================================================================
class DisasterRecoveryInput(BaseModel):
    system: str = Field(..., description="System requiring DR design.")
    rto_hours: Optional[float] = Field(default=4.0, description="Recovery Time Objective in hours.")
    rpo_hours: Optional[float] = Field(default=1.0, description="Recovery Point Objective in hours.")

class DisasterRecoverySkill(BaseTool):
    name: str = "disaster_recovery"
    description: str = (
        "Define DR architecture: backup strategy, recovery procedures, RTO/RPO targets, "
        "runbooks, and regular DR test schedules."
    )
    args_schema: Type[BaseModel] = DisasterRecoveryInput

    def _run(self, system: str, rto_hours: float = 4.0, rpo_hours: float = 1.0) -> str:
        return json.dumps({
            "skill": "disaster_recovery", "system": system,
            "targets": {"rto_hours": rto_hours, "rpo_hours": rpo_hours},
            "output_schema": {
                "backup_strategy": "{frequency, retention, storage, encryption}",
                "recovery_procedures": "list[{scenario, steps, owner, estimated_time}]",
                "dr_site": "warm_standby|cold_standby|active_active",
                "failover_runbook": "step-by-step DR activation",
                "test_schedule": "{frequency, scope, success_criteria}",
                "communication_plan": "{stakeholders, notification_sequence}",
            },
        }, indent=2)


# =============================================================================
# 31. Performance Engineering
# =============================================================================
class PerformanceInput(BaseModel):
    system: str = Field(..., description="System requiring performance architecture.")

class PerformanceSkill(BaseTool):
    name: str = "performance_engineering"
    description: str = (
        "Define performance budgets, SLOs, and architectural patterns for latency, "
        "throughput, and resource efficiency targets."
    )
    args_schema: Type[BaseModel] = PerformanceInput

    def _run(self, system: str) -> str:
        return json.dumps({
            "skill": "performance_engineering", "system": system,
            "output_schema": {
                "performance_budget": "dict[operation, {p50, p95, p99} ms]",
                "slos": "list[{name, sli, target}]",
                "profiling_strategy": "{tools, sampling_rate, environments}",
                "optimisation_patterns": "list[{pattern, applicable_when}]",
                "load_test_plan": "{scenarios, ramp_up, peak_rps, duration}",
                "resource_efficiency_targets": "dict[resource, target_utilisation_pct]",
            },
        }, indent=2)


# =============================================================================
# 32. Standards Development
# =============================================================================
class StandardsDevelopmentInput(BaseModel):
    standard_name: str = Field(..., description="Name of the standard to develop.")
    domain: str = Field(..., description="Domain the standard applies to.")

class StandardsDevelopmentSkill(BaseTool):
    name: str = "standards_development"
    description: str = (
        "Author architectural standards for the EIOS. Standards Compliance must remain "
        "≥ 100% — all new standards include measurable compliance criteria."
    )
    args_schema: Type[BaseModel] = StandardsDevelopmentInput

    def _run(self, standard_name: str, domain: str) -> str:
        return json.dumps({
            "skill": "standards_development",
            "output_schema": {
                "standard": {
                    "id": f"STD-{domain.upper()}-XXX",
                    "name": standard_name,
                    "domain": domain,
                    "version": "1.0.0",
                    "status": "draft|review|approved|deprecated",
                    "rationale": "str",
                    "requirements": "list[{id, statement, MUST|SHOULD|MAY, measurable_criterion}]",
                    "examples": "list[{good, bad}]",
                    "compliance_check": "{automated: bool, tool: str, manual_review: bool}",
                    "exceptions_process": "str",
                    "review_cycle": "str",
                },
            },
        }, indent=2)


# =============================================================================
# 33. Business Continuity
# =============================================================================
class BusinessContinuityInput(BaseModel):
    organisation: str = Field(..., description="Organisation unit or system requiring BCP.")

class BusinessContinuitySkill(BaseTool):
    name: str = "business_continuity"
    description: str = "Design business continuity architecture and recovery plans for critical EIOS functions."
    args_schema: Type[BaseModel] = BusinessContinuityInput

    def _run(self, organisation: str) -> str:
        return json.dumps({
            "skill": "business_continuity", "organisation": organisation,
            "output_schema": {
                "critical_functions": "list[{function, rto, rpo, dependencies}]",
                "continuity_strategies": "dict[function, strategy]",
                "recovery_teams": "list[{function, lead, escalation}]",
                "communication_matrix": "list[{stakeholder, channel, trigger}]",
                "test_plan": "{tabletop, simulation, full_dr, schedule}",
            },
        }, indent=2)


# =============================================================================
# 34. Modular Monolith Design
# =============================================================================
class ModularMonolithInput(BaseModel):
    system: str = Field(..., description="System to design as a modular monolith.")

class ModularMonolithSkill(BaseTool):
    name: str = "modular_monolith_design"
    description: str = (
        "Design a modular monolith: module boundaries, inter-module contracts, "
        "dependency rules, and migration path to microservices if needed."
    )
    args_schema: Type[BaseModel] = ModularMonolithInput

    def _run(self, system: str) -> str:
        return json.dumps({
            "skill": "modular_monolith_design", "system": system,
            "output_schema": {
                "modules": "list[{name, responsibilities, public_api, internal_api, dependencies}]",
                "dependency_rules": "list[str]",
                "inter_module_contracts": "list[{caller, callee, contract_type}]",
                "package_structure": "str",
                "microservices_extraction_path": "list[{module, extraction_order, rationale}]",
            },
        }, indent=2)


# =============================================================================
# 35. Business Capability Mapping
# =============================================================================
class BusinessCapabilityInput(BaseModel):
    business_unit: str = Field(..., description="Business unit or product to map.")

class BusinessCapabilitySkill(BaseTool):
    name: str = "business_capability_mapping"
    description: str = "Map technology investments to business capabilities. Capability Mapping must be ≥ 100%."
    args_schema: Type[BaseModel] = BusinessCapabilityInput

    def _run(self, business_unit: str) -> str:
        return json.dumps({
            "skill": "business_capability_mapping", "business_unit": business_unit,
            "output_schema": {
                "capability_tree": "Hierarchical capability map L1→L2→L3",
                "technology_mapping": "dict[capability, list[technology/service]]",
                "maturity_assessment": "dict[capability, current|target maturity 1-5]",
                "investment_alignment": "dict[capability, investment_priority]",
                "gaps": "list[{capability, gap, recommendation}]",
            },
        }, indent=2)


# =============================================================================
# 36. Platform Architecture
# =============================================================================
class PlatformArchInput(BaseModel):
    platform: str = Field(..., description="Platform layer to architect (runtime, AI, knowledge, workflow, data, security, developer).")

class PlatformArchSkill(BaseTool):
    name: str = "platform_architecture"
    description: str = "Architect EIOS platform layers: runtime, AI, knowledge, workflow, data, security, and developer platforms."
    args_schema: Type[BaseModel] = PlatformArchInput

    def _run(self, platform: str) -> str:
        return json.dumps({
            "skill": "platform_architecture", "platform": platform,
            "output_schema": {
                "platform_components": "list[{name, responsibility, api_surface, consumers}]",
                "platform_contracts": "list[{consumer_type, contract, SLA}]",
                "extensibility_model": "{plugin_points, extension_api, versioning}",
                "tenant_isolation": "{strategy, data_separation, config_isolation}",
                "platform_governance": "{versioning, deprecation, backwards_compatibility}",
                "reusability_targets": "{Platform_Reusability_pct: '≥90%'}",
            },
        }, indent=2)


# =============================================================================
# 37. Technology Strategy
# =============================================================================
class TechStrategyInput(BaseModel):
    horizon: str = Field(default="3_years", description="Strategy horizon: 1_year|3_years|5_years")

class TechStrategySkill(BaseTool):
    name: str = "technology_strategy"
    description: str = "Define the EIOS technology strategy and roadmap: current state, target state, and transition path."
    args_schema: Type[BaseModel] = TechStrategyInput

    def _run(self, horizon: str = "3_years") -> str:
        return json.dumps({
            "skill": "technology_strategy", "horizon": horizon,
            "output_schema": {
                "current_state": "{technology_landscape, gaps, technical_debt_summary}",
                "target_state": "{architecture_vision, key_capabilities, technology_choices}",
                "transition_roadmap": "list[{phase, initiatives, milestones, dependencies}]",
                "technology_radar": "{adopt: [], trial: [], assess: [], hold: []}",
                "investment_priorities": "list[{initiative, rationale, roi_estimate}]",
                "risk_summary": "list[{risk, mitigation}]",
            },
        }, indent=2)


# =============================================================================
# 38. Agentic System Design
# =============================================================================
class AgenticDesignInput(BaseModel):
    agent_system: str = Field(..., description="Agentic system to design.")

class AgenticDesignSkill(BaseTool):
    name: str = "agentic_system_design"
    description: str = "Design agentic system architecture: agent lifecycle, memory, tool integration, safety, and governance."
    args_schema: Type[BaseModel] = AgenticDesignInput

    def _run(self, agent_system: str) -> str:
        return json.dumps({
            "skill": "agentic_system_design", "agent_system": agent_system,
            "output_schema": {
                "agent_lifecycle": "{spawn, plan, execute, observe, reflect, terminate}",
                "memory_architecture": "{working, episodic, semantic, procedural}",
                "tool_access_model": "{tool_registry, permission_model, sandboxing}",
                "safety_controls": "{guardrails, human_in_loop, output_validation}",
                "governance": "{audit_trail, explainability, cost_controls}",
                "inter_agent_protocol": "{communication, delegation, trust_model}",
            },
        }, indent=2)


# =============================================================================
# 39. Runtime Architecture
# =============================================================================
class RuntimeArchInput(BaseModel):
    runtime_scope: str = Field(..., description="Scope of the runtime to architect (task queue, worker pool, dispatcher, etc.).")

class RuntimeArchSkill(BaseTool):
    name: str = "runtime_architecture"
    description: str = "Design the EIOS execution runtime: task queuing, worker pools, dispatch, and execution lifecycle."
    args_schema: Type[BaseModel] = RuntimeArchInput

    def _run(self, runtime_scope: str) -> str:
        return json.dumps({
            "skill": "runtime_architecture", "runtime_scope": runtime_scope,
            "output_schema": {
                "execution_model": "{sync|async, at_least_once|exactly_once}",
                "task_queue": "{technology, partitioning, priority_model, dlq}",
                "worker_pool": "{concurrency_model, auto_scaling, resource_limits}",
                "dispatcher": "{routing_strategy, capability_matching, load_balancing}",
                "execution_lifecycle": "{spawn, assign, execute, observe, complete, retry}",
                "observability": "{task_tracing, worker_metrics, execution_audit}",
            },
        }, indent=2)


# =============================================================================
# 40. Engineering Governance
# =============================================================================
class EngineeringGovernanceInput(BaseModel):
    scope: str = Field(..., description="Engineering organisation or team to govern.")

class EngineeringGovernanceSkill(BaseTool):
    name: str = "engineering_governance"
    description: str = "Define engineering governance policies: coding standards, review processes, quality gates, and compliance checks."
    args_schema: Type[BaseModel] = EngineeringGovernanceInput

    def _run(self, scope: str) -> str:
        return json.dumps({
            "skill": "engineering_governance", "scope": scope,
            "output_schema": {
                "coding_standards": "list[{language, standard, linter, enforced_by}]",
                "review_gates": "list[{gate, criteria, owner, SLA}]",
                "quality_thresholds": "{test_coverage_pct, code_duplication_pct, vulnerability_severity}",
                "compliance_checks": "list[{check, tool, frequency}]",
                "exception_process": "{request_flow, approver, documentation}",
                "metrics": "list[{name, target, measurement_frequency}]",
            },
        }, indent=2)


# =============================================================================
# 41. Enterprise Integration Patterns
# =============================================================================
class EIPInput(BaseModel):
    integration_problem: str = Field(..., description="Integration problem to solve with EIP.")

class EIPSkill(BaseTool):
    name: str = "enterprise_integration_patterns"
    description: str = "Apply Enterprise Integration Patterns (EIP): message routing, transformation, aggregation, correlation, and splitter patterns."
    args_schema: Type[BaseModel] = EIPInput

    def _run(self, integration_problem: str) -> str:
        return json.dumps({
            "skill": "enterprise_integration_patterns",
            "applicable_patterns": [
                "Message Router", "Message Filter", "Content-Based Router",
                "Aggregator", "Splitter", "Message Translator", "Correlation ID",
                "Dead Letter Channel", "Claim Check", "Competing Consumers",
                "Publish-Subscribe", "Request-Reply", "Return Address",
            ],
            "output_schema": {
                "recommended_patterns": "list[{pattern, rationale, implementation_hint}]",
                "message_flow_diagram": "str (Mermaid hint)",
                "channel_topology": "list[{channel, type, producer, consumers}]",
                "error_patterns": "list[{pattern, trigger, recovery}]",
            },
        }, indent=2)


# =============================================================================
# 42. Cost Optimization
# =============================================================================
class CostOptimizationInput(BaseModel):
    system: str = Field(..., description="System to optimise for cost.")
    monthly_budget_usd: Optional[float] = Field(default=None, description="Target monthly budget.")

class CostOptimizationSkill(BaseTool):
    name: str = "cost_optimization"
    description: str = "Optimise architectural decisions for cost efficiency without sacrificing quality or performance."
    args_schema: Type[BaseModel] = CostOptimizationInput

    def _run(self, system: str, monthly_budget_usd: Optional[float] = None) -> str:
        return json.dumps({
            "skill": "cost_optimization", "system": system, "budget_usd": monthly_budget_usd,
            "output_schema": {
                "cost_breakdown": "dict[component, monthly_usd]",
                "optimisation_opportunities": "list[{opportunity, saving_estimate, trade_off, effort}]",
                "right_sizing_recommendations": "list[{resource, current, recommended, saving}]",
                "reserved_vs_on_demand": "{recommendation, savings_pct}",
                "autoscaling_savings": "{potential_saving_pct, configuration}",
                "architectural_changes": "list[{change, cost_impact, quality_impact}]",
            },
        }, indent=2)


# =============================================================================
# 43. Roadmap Planning (Architecture)
# =============================================================================
class ArchRoadmapInput(BaseModel):
    initiatives: list[str] = Field(..., description="Architecture initiatives to roadmap.")
    horizon_months: int = Field(default=12, description="Roadmap horizon in months.")

class ArchRoadmapSkill(BaseTool):
    name: str = "roadmap_planning"
    description: str = "Define the long-term architecture and technology roadmap for the EIOS. Sequences by dependency order and business value."
    args_schema: Type[BaseModel] = ArchRoadmapInput

    def _run(self, initiatives: list[str], horizon_months: int = 12) -> str:
        return json.dumps({
            "skill": "roadmap_planning", "initiatives": initiatives, "horizon_months": horizon_months,
            "output_schema": {
                "now": "list[initiative] (0–3 months)",
                "next": "list[initiative] (3–6 months)",
                "later": "list[initiative] (6+ months)",
                "dependencies": "list[{initiative, depends_on}]",
                "architecture_milestones": "list[{milestone, date, success_criteria}]",
                "adrs_to_create": "list[{adr_title, initiative, priority}]",
            },
        }, indent=2)


# =============================================================================
# 44. Digital Transformation
# =============================================================================
class DigitalTransformationInput(BaseModel):
    organisation: str = Field(..., description="Organisation or product line undergoing digital transformation.")

class DigitalTransformationSkill(BaseTool):
    name: str = "digital_transformation"
    description: str = "Guide AI-first digital transformation: capability maturity assessment, modernisation roadmap, and change architecture."
    args_schema: Type[BaseModel] = DigitalTransformationInput

    def _run(self, organisation: str) -> str:
        return json.dumps({
            "skill": "digital_transformation", "organisation": organisation,
            "output_schema": {
                "maturity_assessment": "dict[capability, current_level_1_to_5]",
                "transformation_themes": "list[{theme, description, ai_first_approach}]",
                "modernisation_roadmap": "list[{initiative, legacy_system, modern_replacement, timeline}]",
                "change_architecture": "{organisation_design, platform_enablement, governance}",
                "quick_wins": "list[{initiative, impact, effort, timeline}]",
                "risks": "list[{risk, mitigation}]",
            },
        }, indent=2)


# =============================================================================
# 45. Business Continuity Planning
# (variant of business_continuity focused on planning artefacts)
# =============================================================================
class BCPInput(BaseModel):
    critical_systems: list[str] = Field(..., description="Critical systems requiring BCP coverage.")

class BCPSkill(BaseTool):
    name: str = "business_continuity_planning"
    description: str = "Produce business continuity planning artefacts: BIA, recovery strategies, and test schedules."
    args_schema: Type[BaseModel] = BCPInput

    def _run(self, critical_systems: list[str]) -> str:
        return json.dumps({
            "skill": "business_continuity_planning", "critical_systems": critical_systems,
            "output_schema": {
                "business_impact_analysis": "dict[system, {rto, rpo, financial_impact, reputational_impact}]",
                "recovery_strategies": "dict[system, strategy]",
                "bcp_document": "{scope, objectives, roles, procedures, contacts}",
                "test_schedule": "{annual_tabletop, semi_annual_simulation, quarterly_backup_test}",
            },
        }, indent=2)


# =============================================================================
# 46. Architecture Governance (Enforcement)
# =============================================================================
class ArchGovernanceEnforcementInput(BaseModel):
    governance_type: str = Field(
        default="arb_review",
        description="Type: arb_review|standards_audit|compliance_scan|adr_audit|technical_debt_review"
    )
    scope: str = Field(..., description="Scope of governance enforcement.")

class ArchGovernanceEnforcementSkill(BaseTool):
    name: str = "architecture_governance_enforcement"
    description: str = (
        "Enforce architectural governance: ARB reviews, standards audits, compliance scans, "
        "ADR audits, and technical debt reviews. Architecture Compliance must remain ≥ 98%."
    )
    args_schema: Type[BaseModel] = ArchGovernanceEnforcementInput

    def _run(self, governance_type: str = "arb_review", scope: str = "") -> str:
        return json.dumps({
            "skill": "architecture_governance_enforcement",
            "governance_type": governance_type, "scope": scope,
            "output_schema": {
                "findings": "list[{id, severity, category, description, remediation, owner, deadline}]",
                "compliance_score": "float 0–100 (target ≥ 98)",
                "adr_coverage": "float 0–100 (target 100)",
                "standards_violations": "list[{standard, violation, system, remediation}]",
                "technical_debt_items": "list[{item, severity, growth_risk}]",
                "escalations": "list[str]",
                "remediation_plan": "list[{finding_id, action, owner, due_date}]",
            },
        }, indent=2)


# =============================================================================
# Skill Registry
# =============================================================================

ENTERPRISE_ARCHITECT_SKILLS: list[BaseTool] = [
    EnterpriseArchitectureSkill(),
    SolutionArchitectureSkill(),
    DDDSkill(),
    EDASkill(),
    ADRGeneratorSkill(),
    ArchitectureReviewSkill(),
    CapabilityModelingSkill(),
    ReferenceArchitectureSkill(),
    ArchRiskAssessmentSkill(),
    TechnologyEvaluationSkill(),
    TechnicalDebtSkill(),
    APIDesignSkill(),
    DistributedSystemsSkill(),
    CloudArchitectureSkill(),
    CQRSSkill(),
    EventSourcingSkill(),
    MultiAgentArchSkill(),
    ObservabilitySkill(),
    SecurityArchSkill(),
    DataArchitectureSkill(),
    InfrastructureArchSkill(),
    AISystemDesignSkill(),
    WorkflowOrchestrationSkill(),
    MicroservicesSkill(),
    EnterpriseIntegrationSkill(),
    ArchDocumentationSkill(),
    KnowledgeGraphSkill(),
    ScalabilitySkill(),
    HighAvailabilitySkill(),
    DisasterRecoverySkill(),
    PerformanceSkill(),
    StandardsDevelopmentSkill(),
    BusinessContinuitySkill(),
    ModularMonolithSkill(),
    BusinessCapabilitySkill(),
    PlatformArchSkill(),
    TechStrategySkill(),
    AgenticDesignSkill(),
    RuntimeArchSkill(),
    EngineeringGovernanceSkill(),
    EIPSkill(),
    CostOptimizationSkill(),
    ArchRoadmapSkill(),
    DigitalTransformationSkill(),
    BCPSkill(),
    ArchGovernanceEnforcementSkill(),
]

__all__ = [
    "ENTERPRISE_ARCHITECT_SKILLS",
    "ADRGeneratorSkill",
    "ArchitectureReviewSkill",
    "ArchGovernanceEnforcementSkill",
    "EnterpriseArchitectureSkill",
    "TechnologyEvaluationSkill",
    "MultiAgentArchSkill",
    "AISystemDesignSkill",
    "AgenticDesignSkill",
    "RuntimeArchSkill",
]
