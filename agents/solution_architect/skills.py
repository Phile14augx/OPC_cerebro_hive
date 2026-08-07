"""Solution Architect agent skills.

Each skill is a CrewAI-compatible BaseTool subclass with a Pydantic input
schema and _run() method. These skills represent the Solution Architect's
domain expertise in technical solution design, distributed systems, API design,
and enterprise integration patterns.
"""
from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# CrewAI shim — enables portability outside CrewAI environment
# ---------------------------------------------------------------------------
try:
    from crewai.tools import BaseTool
except ImportError:  # pragma: no cover

    class BaseTool:  # type: ignore[no-redef]
        """Minimal shim so skills run without crewai installed."""

        name: str = ""
        description: str = ""

        def __init_subclass__(cls, **kwargs: Any) -> None:
            super().__init_subclass__(**kwargs)

        def run(self, **kwargs: Any) -> str:
            return self._run(**kwargs)

        def _run(self, **kwargs: Any) -> str:  # pragma: no cover
            raise NotImplementedError


# ===========================================================================
# Input Schemas
# ===========================================================================

class SolutionArchitectureInput(BaseModel):
    objective: str = Field(..., description="Business objective or capability to design for.")
    constraints: Optional[str] = Field(None, description="Technical constraints, SLOs, or budget limits.")
    context: Optional[str] = Field(None, description="Existing architecture context and integration points.")


class ServiceDecompositionInput(BaseModel):
    domain: str = Field(..., description="Domain or capability to decompose into services.")
    requirements: str = Field(..., description="Functional and non-functional requirements.")
    existing_services: Optional[str] = Field(None, description="Existing services to avoid duplicating.")


class APIDesignInput(BaseModel):
    service_name: str = Field(..., description="Service name to design the API for.")
    operations: str = Field(..., description="List of operations the API must support.")
    protocol: str = Field(default="REST", description="API protocol: REST, GraphQL, gRPC, or Event.")
    consumers: Optional[str] = Field(None, description="Known API consumers and their access patterns.")


class DataModelInput(BaseModel):
    domain: str = Field(..., description="Domain entity or aggregate to model.")
    attributes: str = Field(..., description="Required attributes and relationships.")
    storage_type: str = Field(default="relational", description="Storage type: relational, document, graph, vector.")


class SequenceDiagramInput(BaseModel):
    flow_name: str = Field(..., description="Name of the interaction flow to diagram.")
    components: str = Field(..., description="Components involved in the flow.")
    trigger: str = Field(..., description="What triggers this flow.")


class IntegrationInput(BaseModel):
    source_system: str = Field(..., description="Source system name.")
    target_system: str = Field(..., description="Target system name.")
    integration_type: str = Field(default="async", description="Integration type: sync, async, event, ETL.")
    data_contract: Optional[str] = Field(None, description="Data contract or schema being exchanged.")


class TechnologyEvaluationInput(BaseModel):
    problem: str = Field(..., description="Technical problem to evaluate technologies for.")
    candidates: str = Field(..., description="Technology candidates to evaluate.")
    quality_attributes: Optional[str] = Field(None, description="Quality attributes to prioritize.")


class ADRInput(BaseModel):
    decision: str = Field(..., description="The architectural decision being made.")
    context: str = Field(..., description="Context and problem statement driving the decision.")
    alternatives: str = Field(..., description="Alternatives considered.")
    rationale: str = Field(..., description="Rationale for the chosen option.")


class FailureModeInput(BaseModel):
    component: str = Field(..., description="Component or system to analyze failure modes for.")
    failure_scenario: str = Field(..., description="Failure scenario to analyze.")


class RiskAnalysisInput(BaseModel):
    solution: str = Field(..., description="Solution or component to assess risks for.")
    context: Optional[str] = Field(None, description="Deployment context and environment.")


class ExecutionFabricInput(BaseModel):
    component: str = Field(..., description="Execution Fabric component to design (router, session, lease, etc.).")
    requirements: str = Field(..., description="Component requirements and quality attributes.")


class StreamingInput(BaseModel):
    pipeline_name: str = Field(..., description="Streaming pipeline to design.")
    source: str = Field(..., description="Stream source description.")
    consumers: str = Field(..., description="Stream consumers and their access patterns.")
    transport: str = Field(default="AsyncGenerator", description="Internal transport: AsyncGenerator or NATS.")


class AdmissionPipelineInput(BaseModel):
    pipeline_name: str = Field(..., description="Name of the admission pipeline to design.")
    validators: Optional[str] = Field(None, description="Custom validators to include beyond the standard set.")


class ObservabilityInput(BaseModel):
    service_name: str = Field(..., description="Service to design observability for.")
    slo_targets: Optional[str] = Field(None, description="SLO targets: availability, latency, error rate.")


class ScalabilityInput(BaseModel):
    service_name: str = Field(..., description="Service to design scaling for.")
    expected_load: Optional[str] = Field(None, description="Expected load characteristics.")
    scaling_model: str = Field(default="horizontal", description="Scaling model: horizontal, vertical, or both.")


class DeploymentInput(BaseModel):
    service_name: str = Field(..., description="Service to design deployment topology for.")
    environment: str = Field(default="kubernetes", description="Deployment environment.")
    ha_required: bool = Field(default=True, description="Whether high availability is required.")


class CapabilityMappingInput(BaseModel):
    objective: str = Field(..., description="Business objective to map to existing platform capabilities.")
    platform_context: Optional[str] = Field(None, description="Known platform capabilities to evaluate against.")


class SecurityDesignInput(BaseModel):
    component: str = Field(..., description="Component to design security for.")
    threat_model: Optional[str] = Field(None, description="Known threats and attack vectors.")


class PerformanceInput(BaseModel):
    component: str = Field(..., description="Component to design for performance.")
    latency_target_ms: Optional[int] = Field(None, description="Target p99 latency in milliseconds.")
    throughput_target: Optional[str] = Field(None, description="Target throughput (rps, events/s, etc.).")


class ImplementationGuidanceInput(BaseModel):
    component: str = Field(..., description="Component to generate implementation guidance for.")
    design_spec: str = Field(..., description="Design specification to translate into implementation tasks.")


# ===========================================================================
# Skill Implementations
# ===========================================================================

class SolutionArchitectureSkill(BaseTool):
    name: str = "solution_architecture"
    description: str = (
        "Translate business objectives and requirements into concrete technical solution blueprints. "
        "Produces a full solution design: components, interfaces, data flows, technology choices, "
        "integration points, deployment topology, and implementation roadmap."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Solution Architecture Blueprint\n"
            f"================================\n"
            f"Objective: {objective}\n"
            f"Constraints: {constraints or 'None specified'}\n"
            f"Context: {context or 'Greenfield'}\n\n"
            f"Components: [Decompose into bounded services with SRP]\n"
            f"Interfaces: [Define TypeScript/Python Protocols for all boundaries]\n"
            f"Data Flows: [Map request/response and event flows]\n"
            f"Technology Choices: [Select with trade-off analysis + ADR]\n"
            f"Integration Points: [Identify upstream/downstream dependencies]\n"
            f"Deployment Topology: [Container/Kubernetes/Cloud design]\n"
            f"Implementation Roadmap: [Phased delivery with acceptance criteria]\n"
            f"Non-Functional Coverage: [Scalability, Reliability, Security, Observability]\n"
            f"Failure Modes: [≥4 scenarios with expected behavior and test cases]\n"
            f"Risk Assessment: [Technical risks with mitigation strategies]"
        )


class EnterpriseApplicationDesignSkill(BaseTool):
    name: str = "enterprise_application_design"
    description: str = (
        "Design large-scale enterprise applications aligned with enterprise architecture standards. "
        "Applies layered architecture, separation of concerns, and enterprise integration patterns."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Enterprise Application Design\n"
            f"Objective: {objective}\n"
            f"Architecture Layers: [Presentation → Application → Domain → Infrastructure]\n"
            f"Separation of Concerns: [Bounded modules with defined interfaces]\n"
            f"Enterprise Patterns: [Repository, Unit of Work, CQRS, Mediator as appropriate]\n"
            f"Quality Attributes: [Maintainability, Extensibility, Testability, Deployability]\n"
            f"Governance Alignment: [ADRs, coding standards, review gates]"
        )


class SystemDesignSkill(BaseTool):
    name: str = "system_design"
    description: str = (
        "Design complete system architectures from context to component level using C4 modeling. "
        "Produces Context, Container, Component diagrams and written specifications."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"System Design — C4 Model\n"
            f"System: {objective}\n"
            f"Level 1 — Context: [System actors, external dependencies, data flows]\n"
            f"Level 2 — Containers: [Services, databases, message brokers, frontends]\n"
            f"Level 3 — Components: [Internal modules per container with SRP]\n"
            f"Cross-Cutting: [Auth, logging, tracing, config, secrets management]"
        )


class DistributedSystemsSkill(BaseTool):
    name: str = "distributed_systems"
    description: str = (
        "Design fault-tolerant distributed systems. Covers consensus, leasing, partition tolerance, "
        "failure recovery, distributed tracing, and the M10.3 Execution Fabric patterns."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Distributed System Design\n"
            f"Problem: {objective}\n"
            f"Consistency Model: [Strong/Eventual — choose with rationale]\n"
            f"Lease Management: [Requested→Reserved→Active→Completed→Released]\n"
            f"Failure Handling: [RetryPolicy, CircuitBreaker, DLQ, ExecutionJournal]\n"
            f"Transport: [NATS JetStream for internal — never gRPC]\n"
            f"Observability: [Distributed tracing with span propagation, RED metrics]\n"
            f"Partitioning: [Shard key selection, rebalancing strategy]"
        )


class CloudNativeSkill(BaseTool):
    name: str = "cloud_native_architecture"
    description: str = (
        "Apply cloud-native principles: stateless services, 12-factor app, health probes, "
        "graceful shutdown, horizontal scaling, and infrastructure-as-code."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Cloud-Native Architecture\n"
            f"Service: {objective}\n"
            f"12-Factor Compliance: [Config, backing services, processes, logs]\n"
            f"Health Probes: [Liveness, readiness, startup — distinct contracts]\n"
            f"Graceful Shutdown: [SIGTERM handler, in-flight request draining, connection cleanup]\n"
            f"Horizontal Scaling: [Stateless design, HPA/KEDA triggers, pod disruption budgets]\n"
            f"IaC: [Helm charts / Kustomize / Terraform with GitOps delivery]"
        )


class MicroservicesSkill(BaseTool):
    name: str = "microservices"
    description: str = (
        "Define microservice boundaries, communication patterns, and interface contracts. "
        "Applies DDD bounded contexts and the strangler fig pattern for decomposition."
    )

    def _run(self, domain: str, requirements: str, existing_services: str = "") -> str:
        return (
            f"Microservice Decomposition\n"
            f"Domain: {domain}\n"
            f"Services Identified: [Single-responsibility services with defined boundaries]\n"
            f"Communication: [Sync (REST/gRPC) for queries; Async (NATS) for commands/events]\n"
            f"Data Ownership: [One DB per service — no shared schemas]\n"
            f"Interface Contracts: [OpenAPI / AsyncAPI per service]\n"
            f"Reuse Check: {existing_services or 'No existing services to evaluate'}"
        )


class ModularMonolithSkill(BaseTool):
    name: str = "modular_monolith"
    description: str = (
        "Design modular monolith architectures for contexts where microservices add premature complexity. "
        "Strong module boundaries with future extraction paths."
    )

    def _run(self, domain: str, requirements: str, existing_services: str = "") -> str:
        return (
            f"Modular Monolith Design\n"
            f"Domain: {domain}\n"
            f"Module Boundaries: [Hard module interfaces — no cross-module imports]\n"
            f"Shared Kernel: [Minimal shared types only]\n"
            f"Extraction Path: [Module-to-service migration plan when scale demands it]\n"
            f"Testing Strategy: [Module integration tests at boundaries]"
        )


class DomainDrivenDesignSkill(BaseTool):
    name: str = "domain_driven_design"
    description: str = (
        "Apply DDD tactical and strategic patterns: ubiquitous language, aggregates, "
        "value objects, domain events, repositories, and context maps."
    )

    def _run(self, domain: str, requirements: str, existing_services: str = "") -> str:
        return (
            f"Domain-Driven Design\n"
            f"Domain: {domain}\n"
            f"Ubiquitous Language: [Domain glossary — shared with product and engineering]\n"
            f"Aggregates: [Consistency boundaries with root entities]\n"
            f"Value Objects: [Immutable, equality by value]\n"
            f"Domain Events: [Past-tense events representing state changes]\n"
            f"Repositories: [Aggregate persistence abstraction]\n"
            f"Context Map: [Upstream/downstream relationships with integration patterns]"
        )


class BoundedContextSkill(BaseTool):
    name: str = "bounded_context_design"
    description: str = (
        "Define bounded contexts and integration contracts. Produces context maps with "
        "relationship types: Conformist, ACL, Partnership, Shared Kernel, Customer/Supplier."
    )

    def _run(self, domain: str, requirements: str, existing_services: str = "") -> str:
        return (
            f"Bounded Context Design\n"
            f"Domain: {domain}\n"
            f"Contexts: [Named bounded contexts with explicit language and rules]\n"
            f"Context Map: [Relationship types — Conformist/ACL/Partnership]\n"
            f"Integration Points: [Upstream/downstream with translation layer specs]\n"
            f"Ubiquitous Language per Context: [Glossary per bounded context]"
        )


class EventDrivenArchSkill(BaseTool):
    name: str = "event_driven_architecture"
    description: str = (
        "Design event-driven architectures using NATS JetStream. "
        "Covers event catalog, topic design, consumer groups, ordering guarantees, and DLQ."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Event-Driven Architecture\n"
            f"Objective: {objective}\n"
            f"Transport: NATS JetStream (internal) | HTTP (external)\n"
            f"Event Catalog: [Event names, schemas, producers, consumers]\n"
            f"Topic Design: [Subject hierarchy, partitioning, retention]\n"
            f"Ordering: [At-least-once delivery with idempotent consumers]\n"
            f"DLQ Strategy: [Dead letter subject, retry limits, alerting]\n"
            f"Choreography vs Orchestration: [Decision with rationale]"
        )


class CQRSSkill(BaseTool):
    name: str = "cqrs"
    description: str = (
        "Apply CQRS pattern: separate command and query models with async read projections. "
        "Covers write model validation, read model materialization, and consistency guarantees."
    )

    def _run(self, domain: str, requirements: str, existing_services: str = "") -> str:
        return (
            f"CQRS Design\n"
            f"Domain: {domain}\n"
            f"Write Model: [Aggregate with command handlers and domain events]\n"
            f"Read Model: [Denormalized projections optimized per query]\n"
            f"Projection Strategy: [Event-driven materialization with catch-up]\n"
            f"Consistency: [Eventual — document lag SLO and stale-read handling]"
        )


class EventSourcingSkill(BaseTool):
    name: str = "event_sourcing"
    description: str = (
        "Design event-sourced systems with immutable event logs, snapshot strategies, "
        "and projection pipelines. Covers append-only stores and replay semantics."
    )

    def _run(self, domain: str, requirements: str, existing_services: str = "") -> str:
        return (
            f"Event Sourcing Design\n"
            f"Domain: {domain}\n"
            f"Event Store: [Append-only log with schema evolution strategy]\n"
            f"Snapshots: [Snapshot interval, state reconstruction with snapshots]\n"
            f"Projections: [Event handlers that materialize read models]\n"
            f"Replay: [Full replay, partial replay, projection rebuild strategy]\n"
            f"Schema Evolution: [Upcasters for backward-compatible event changes]"
        )


class WorkflowOrchestrationSkill(BaseTool):
    name: str = "workflow_orchestration"
    description: str = (
        "Design durable workflow orchestration with state machines, saga patterns, "
        "compensation logic, and long-running process management."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Workflow Orchestration Design\n"
            f"Objective: {objective}\n"
            f"State Machine: [States, transitions, terminal states]\n"
            f"Saga Pattern: [Choreography or orchestration — with rationale]\n"
            f"Compensation: [Rollback steps for each forward step]\n"
            f"Durability: [Persistent workflow state with resumability]\n"
            f"Timeout Strategy: [Per-step timeouts with escalation]"
        )


class RESTAPIDesignSkill(BaseTool):
    name: str = "rest_api_design"
    description: str = (
        "Design RESTful APIs with resource modeling, versioning strategy, error conventions, "
        "pagination, filtering, and OpenAPI 3.1 contract generation."
    )

    def _run(self, service_name: str, operations: str, protocol: str = "REST", consumers: str = "") -> str:
        return (
            f"REST API Design — {service_name}\n"
            f"Operations: {operations}\n"
            f"Resources: [Noun-based resource hierarchy]\n"
            f"HTTP Methods: [GET/POST/PUT/PATCH/DELETE with correct semantics]\n"
            f"Versioning: [URL versioning /v1/ — with deprecation policy]\n"
            f"Error Format: [RFC 9457 Problem Details]\n"
            f"Pagination: [Cursor-based pagination for large collections]\n"
            f"Filtering: [Query parameter conventions]\n"
            f"OpenAPI: [3.1 spec with examples and error schemas]\n"
            f"Consumers: {consumers or 'Not specified — design for general consumption'}"
        )


class GraphQLSkill(BaseTool):
    name: str = "graphql"
    description: str = (
        "Design GraphQL schemas, resolvers, subscriptions, and federation strategies. "
        "Covers schema-first design, N+1 prevention with DataLoader, and schema stitching."
    )

    def _run(self, service_name: str, operations: str, protocol: str = "GraphQL", consumers: str = "") -> str:
        return (
            f"GraphQL Design — {service_name}\n"
            f"Schema: [Type definitions, interfaces, unions, enums]\n"
            f"Queries: [Query resolvers with field-level authorization]\n"
            f"Mutations: [Input types, error unions, optimistic updates]\n"
            f"Subscriptions: [Real-time events over WebSocket]\n"
            f"N+1 Prevention: [DataLoader per resolver]\n"
            f"Federation: [Subgraph design if applicable]"
        )


class GRPCSkill(BaseTool):
    name: str = "grpc"
    description: str = (
        "Design gRPC service definitions, streaming patterns, and load-balancing strategies. "
        "Note: prefer NATS JetStream for internal services; use gRPC only for external integrations."
    )

    def _run(self, service_name: str, operations: str, protocol: str = "gRPC", consumers: str = "") -> str:
        return (
            f"gRPC Design — {service_name}\n"
            f"Proto Service: [Service definition with method signatures]\n"
            f"Streaming Mode: [Unary / Server streaming / Client streaming / Bidirectional]\n"
            f"Error Handling: [gRPC status codes with details proto]\n"
            f"Load Balancing: [Client-side with service mesh or headless DNS]\n"
            f"Note: Use NATS JetStream for internal services — reserve gRPC for external consumers."
        )


class EventStreamingSkill(BaseTool):
    name: str = "event_streaming"
    description: str = (
        "Design event streaming topologies using NATS JetStream. "
        "Covers subject hierarchy, consumer groups, ack policies, replay, and retention."
    )

    def _run(self, pipeline_name: str, source: str, consumers: str, transport: str = "NATS") -> str:
        return (
            f"Event Streaming Design — {pipeline_name}\n"
            f"Source: {source}\n"
            f"Transport: NATS JetStream\n"
            f"Subject Hierarchy: [domain.aggregate.event — dot-separated]\n"
            f"Stream Config: [Retention, storage, replicas, max age]\n"
            f"Consumer Groups: [Durable consumers with explicit ack]\n"
            f"Replay: [Per-consumer sequence replay capability]\n"
            f"DLQ: [Max deliver + nack → dead letter subject]\n"
            f"Consumers: {consumers}"
        )


class MessagingSkill(BaseTool):
    name: str = "messaging_systems"
    description: str = (
        "Apply messaging patterns: queues, topics, pub-sub, dead-letter queues, retries, "
        "and poison message handling with NATS JetStream."
    )

    def _run(self, pipeline_name: str, source: str, consumers: str, transport: str = "NATS") -> str:
        return (
            f"Messaging Design\n"
            f"Pipeline: {pipeline_name}\n"
            f"Patterns: [Work queue / Pub-Sub / Request-Reply — select with rationale]\n"
            f"Delivery: [At-least-once with idempotent consumers]\n"
            f"DLQ: [Dead letter queue with retry limit and alerting]\n"
            f"Poison Messages: [Inspection → repair → replay or discard flow]"
        )


class APIGatewaySkill(BaseTool):
    name: str = "api_gateway_design"
    description: str = (
        "Design API gateway configuration: routing, rate limiting, authentication, "
        "authorization, request transformation, and circuit breaking."
    )

    def _run(self, service_name: str, operations: str, protocol: str = "REST", consumers: str = "") -> str:
        return (
            f"API Gateway Design — {service_name}\n"
            f"Routing: [Path-based routing with upstream service mapping]\n"
            f"Auth: [JWT validation, API key, mTLS — per consumer tier]\n"
            f"Rate Limiting: [Token bucket — per consumer/tenant/endpoint]\n"
            f"Transformation: [Request/response transformation rules]\n"
            f"Circuit Breaking: [Upstream health check with fallback]\n"
            f"Observability: [Access logs, latency histograms, error rates per route]"
        )


class IntegrationArchSkill(BaseTool):
    name: str = "integration_architecture"
    description: str = (
        "Design system integrations: synchronous REST, asynchronous event, ETL pipelines, "
        "and streaming integrations with error handling and schema contracts."
    )

    def _run(self, source_system: str, target_system: str, integration_type: str = "async", data_contract: str = "") -> str:
        return (
            f"Integration Architecture\n"
            f"Source: {source_system} → Target: {target_system}\n"
            f"Type: {integration_type}\n"
            f"Data Contract: {data_contract or 'To be defined'}\n"
            f"Pattern: [Point-to-point / Event-driven / ETL — with rationale]\n"
            f"Error Handling: [Retry policy, DLQ, alerting, replay]\n"
            f"Observability: [Integration metrics: latency, volume, error rate]\n"
            f"Schema Evolution: [Versioning strategy for contract changes]"
        )


class EnterpriseIntegrationPatternsSkill(BaseTool):
    name: str = "enterprise_integration_patterns"
    description: str = (
        "Apply Enterprise Integration Patterns (EIP): message routers, transformers, "
        "splitters, aggregators, adapters, correlation IDs, and canonical data models."
    )

    def _run(self, source_system: str, target_system: str, integration_type: str = "async", data_contract: str = "") -> str:
        return (
            f"Enterprise Integration Patterns\n"
            f"Source: {source_system} → Target: {target_system}\n"
            f"Patterns Applied: [Router, Transformer, Aggregator, Splitter, Adapter]\n"
            f"Canonical Model: [Shared data model for multi-system integration]\n"
            f"Correlation ID: [End-to-end trace ID across all systems]\n"
            f"Adapter: [Anti-corruption layer between bounded contexts]"
        )


class PlatformEngineeringSkill(BaseTool):
    name: str = "platform_engineering"
    description: str = (
        "Design developer platforms with golden paths, self-service capabilities, "
        "internal developer portals, and paved roads for common engineering workflows."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Platform Engineering Design\n"
            f"Objective: {objective}\n"
            f"Golden Paths: [Opinionated defaults for common patterns]\n"
            f"Self-Service: [Developer portal, scaffolding, catalog]\n"
            f"Abstractions: [Platform APIs hiding infrastructure complexity]\n"
            f"DX Metrics: [Time-to-first-deploy, deployment frequency, cognitive load]"
        )


class AIPlatformDesignSkill(BaseTool):
    name: str = "ai_platform_design"
    description: str = (
        "Design AI/ML platforms: model serving, inference pipelines, evaluation frameworks, "
        "prompt management, and model versioning strategies."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"AI Platform Design\n"
            f"Objective: {objective}\n"
            f"Model Serving: [Inference API, batching, caching, versioning]\n"
            f"Evaluation: [Offline eval harness, online A/B testing, human eval]\n"
            f"Prompt Management: [Version-controlled templates with experiment tracking]\n"
            f"Observability: [Token usage, latency, cost, quality metrics]"
        )


class LLMIntegrationSkill(BaseTool):
    name: str = "llm_integration"
    description: str = (
        "Design LLM integration patterns: prompt management, context window budgeting, "
        "tool calling, structured outputs, streaming, and cost controls."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"LLM Integration Design\n"
            f"Objective: {objective}\n"
            f"Prompt Architecture: [System / User / Tool result / Assistant turn structure]\n"
            f"Context Budget: [Token allocation across system, history, tools, output]\n"
            f"Tool Calling: [Tool schemas with strict output validation]\n"
            f"Streaming: [AsyncGenerator → SSE/WebSocket transport adapter]\n"
            f"Cost Controls: [Token budgets, max_tokens, model routing by task complexity]\n"
            f"Fallback: [Model fallback chain on quota/error]"
        )


class RAGArchitectureSkill(BaseTool):
    name: str = "rag_architecture"
    description: str = (
        "Design Retrieval-Augmented Generation pipelines: document ingestion, chunking, "
        "embedding, indexing, retrieval, reranking, and generation with cited sources."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"RAG Architecture\n"
            f"Objective: {objective}\n"
            f"Ingestion: [Document parsing, chunking strategy, metadata extraction]\n"
            f"Embedding: [Model selection, batch processing, versioning]\n"
            f"Index: [Vector store selection with ANN strategy]\n"
            f"Retrieval: [Hybrid search: dense + sparse with RRF fusion]\n"
            f"Reranking: [Cross-encoder reranking for precision]\n"
            f"Generation: [Context assembly, citation tracking, hallucination controls]"
        )


class AgenticSystemsSkill(BaseTool):
    name: str = "agentic_systems"
    description: str = (
        "Design multi-agent systems: agent runtimes, coordination protocols, tool registries, "
        "memory systems, and the M10.3 Execution Fabric pipeline."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Agentic System Design\n"
            f"Objective: {objective}\n"
            f"Execution Pipeline: [Planner→Admission→Scheduler→LeaseManager→Router→Session→Worker→Sandbox→Stream→Transport]\n"
            f"Tool Registry: [9-state lifecycle: Draft→Registered→Validated→Certified→Approved→Published→Suspended→Deprecated→Retired]\n"
            f"Memory: [Episodic, semantic, procedural — with retrieval strategy]\n"
            f"Coordination: [Hierarchical delegation with capability matching]\n"
            f"Admission: [Auth→Authz→Security→Policy→Quota→Approval→Mutation→Execution]\n"
            f"Observability: [ExecutionJournal for replay, audit, debug, resume]"
        )


class KnowledgeGraphSkill(BaseTool):
    name: str = "knowledge_graph_design"
    description: str = (
        "Design knowledge graphs: ontologies, entity schemas, relationship types, "
        "traversal APIs, and graph database selection (Neo4j / property graph)."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Knowledge Graph Design\n"
            f"Objective: {objective}\n"
            f"Ontology: [Entity types, relationship types, property schemas]\n"
            f"Traversal API: [Cypher queries / GraphQL / REST traversal endpoints]\n"
            f"Ingestion: [Entity extraction, relationship inference, deduplication]\n"
            f"Consistency: [Entity resolution strategy]\n"
            f"Note: Knowledge graph is M10.4+ scope — not M10.3 Execution Fabric."
        )


class VectorDatabaseSkill(BaseTool):
    name: str = "vector_database_architecture"
    description: str = (
        "Design vector database strategies: embedding pipelines, ANN indexing (HNSW/IVF), "
        "hybrid search, metadata filtering, and namespace/collection management."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Vector Database Architecture\n"
            f"Objective: {objective}\n"
            f"Embedding Pipeline: [Model → batch processing → versioned index]\n"
            f"ANN Index: [HNSW for recall/speed balance; IVF for large scale]\n"
            f"Hybrid Search: [Dense + BM25 sparse with RRF fusion]\n"
            f"Metadata Filtering: [Pre-filter vs post-filter strategy]\n"
            f"Note: Vector database is M10.4+ scope — not M10.3 Execution Fabric."
        )


class DataModelingSkill(BaseTool):
    name: str = "data_modeling"
    description: str = (
        "Design conceptual, logical, and physical data models for relational, document, "
        "and graph stores. Produces ERDs, schema definitions, and normalization analysis."
    )

    def _run(self, domain: str, attributes: str, storage_type: str = "relational") -> str:
        return (
            f"Data Modeling — {domain}\n"
            f"Storage: {storage_type}\n"
            f"Attributes: {attributes}\n"
            f"Conceptual: [Entity-Relationship model]\n"
            f"Logical: [Normalized schema — 3NF for relational]\n"
            f"Physical: [DDL with indexes, partitions, constraints]\n"
            f"Consistency: [Transactional boundaries, isolation levels]\n"
            f"Evolution: [Migration strategy with zero-downtime deployment]"
        )


class DatabaseDesignSkill(BaseTool):
    name: str = "database_design"
    description: str = (
        "Design relational and document schemas with indexing, partitioning, "
        "replication strategy, and consistency guarantees."
    )

    def _run(self, domain: str, attributes: str, storage_type: str = "relational") -> str:
        return (
            f"Database Design — {domain}\n"
            f"Schema: [Tables/Collections with field types and constraints]\n"
            f"Indexes: [Composite indexes for query patterns, covering indexes]\n"
            f"Partitioning: [Range/Hash partition key selection]\n"
            f"Replication: [Primary-replica with read routing]\n"
            f"Migrations: [Sequential, reversible, zero-downtime]"
        )


class CachingStrategiesSkill(BaseTool):
    name: str = "caching_strategies"
    description: str = (
        "Design multi-layer cache architectures: write-through, read-through, write-back, "
        "cache-aside, TTL strategies, and cache invalidation patterns."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Caching Strategy\n"
            f"Objective: {objective}\n"
            f"Cache Layers: [L1 in-process → L2 Redis → L3 CDN]\n"
            f"Strategy: [Cache-aside for flexibility / Read-through for simplicity]\n"
            f"TTL: [Per-data-type TTL with jitter to prevent thundering herd]\n"
            f"Invalidation: [Event-driven invalidation on write events]\n"
            f"Warm-up: [Cache warming strategy on cold start]"
        )


class SearchArchSkill(BaseTool):
    name: str = "search_architecture"
    description: str = (
        "Design search platforms: indexing pipelines, relevance ranking, faceting, "
        "autocomplete, spell correction, and multi-language support."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Search Architecture\n"
            f"Objective: {objective}\n"
            f"Indexing: [Document pipeline: extract → transform → index]\n"
            f"Ranking: [BM25 baseline + semantic boosting]\n"
            f"Faceting: [Aggregation buckets for filtering]\n"
            f"Autocomplete: [Edge n-gram prefix index]\n"
            f"Analytics: [Query analytics for ranking feedback loop]"
        )


class ObservabilitySkill(BaseTool):
    name: str = "observability"
    description: str = (
        "Design observability stacks with structured logging, distributed tracing, "
        "RED metrics (Rate/Errors/Duration), dashboards, and alerting runbooks."
    )

    def _run(self, service_name: str, slo_targets: str = "") -> str:
        return (
            f"Observability Design — {service_name}\n"
            f"SLOs: {slo_targets or 'To be defined with product'}\n"
            f"Logs: [Structured JSON — correlation_id, trace_id, service, level, message]\n"
            f"Traces: [Distributed tracing — span per service call with baggage propagation]\n"
            f"Metrics: [RED — Rate, Errors, Duration per endpoint]\n"
            f"Dashboards: [SLO dashboard, error budget burn rate, saturation]\n"
            f"Alerts: [SLO violation → page; error budget burn → warn]"
        )


class LoggingSkill(BaseTool):
    name: str = "logging"
    description: str = (
        "Design structured logging standards: log levels, correlation IDs, "
        "sensitive data masking, retention policies, and log shipping architecture."
    )

    def _run(self, service_name: str, slo_targets: str = "") -> str:
        return (
            f"Logging Design — {service_name}\n"
            f"Format: [Structured JSON — always, no printf-style strings]\n"
            f"Fields: [timestamp, service, version, level, message, trace_id, correlation_id, user_id(masked)]\n"
            f"Levels: [ERROR (actionable) / WARN (investigate) / INFO (audit) / DEBUG (development)]\n"
            f"Masking: [PII fields masked at logger level — never log raw secrets]\n"
            f"Retention: [30d hot / 90d warm / 365d archive]\n"
            f"Shipping: [Structured → aggregator → OpenSearch/Loki]"
        )


class DistributedTracingSkill(BaseTool):
    name: str = "distributed_tracing"
    description: str = (
        "Design distributed tracing with W3C Trace Context propagation, "
        "sampling strategies, span attributes, and trace-to-log correlation."
    )

    def _run(self, service_name: str, slo_targets: str = "") -> str:
        return (
            f"Distributed Tracing — {service_name}\n"
            f"Standard: W3C Trace Context (traceparent/tracestate)\n"
            f"Propagation: [HTTP headers / NATS message headers — consistent]\n"
            f"Sampling: [Head-based 10% + tail-based on errors/slow spans]\n"
            f"Span Attributes: [service.name, db.statement, http.method, messaging.destination]\n"
            f"Correlation: [trace_id in every log line — join traces ↔ logs]"
        )


class PerformanceEngineeringSkill(BaseTool):
    name: str = "performance_engineering"
    description: str = (
        "Design for performance: profiling strategy, bottleneck analysis, "
        "connection pooling, query optimization, and load testing plans."
    )

    def _run(self, component: str, latency_target_ms: int = None, throughput_target: str = "") -> str:
        target = f"p99 < {latency_target_ms}ms" if latency_target_ms else "TBD"
        return (
            f"Performance Engineering — {component}\n"
            f"Targets: Latency {target} | Throughput: {throughput_target or 'TBD'}\n"
            f"Profiling: [CPU, memory, I/O, lock contention — baseline first]\n"
            f"Bottlenecks: [Database N+1, serialization overhead, blocking I/O]\n"
            f"Connection Pooling: [Pool sizing formula: (core_count * 2) + disk_spindles]\n"
            f"Load Testing: [Ramp-up → steady-state → spike → soak test plan]"
        )


class ScalabilitySkill(BaseTool):
    name: str = "scalability_engineering"
    description: str = (
        "Design horizontal and vertical scaling strategies with SLOs, capacity models, "
        "auto-scaling triggers, and load shedding for overload protection."
    )

    def _run(self, service_name: str, expected_load: str = "", scaling_model: str = "horizontal") -> str:
        return (
            f"Scalability Design — {service_name}\n"
            f"Model: {scaling_model} scaling\n"
            f"Expected Load: {expected_load or 'To be characterized with load tests'}\n"
            f"HPA Triggers: [CPU > 70% or custom metric (queue depth, rps)]\n"
            f"Stateless Design: [No sticky sessions — all state in external store]\n"
            f"Load Shedding: [Request queue with circuit breaker on overload]\n"
            f"Capacity Model: [Little's Law — throughput × latency = concurrency]"
        )


class ResilienceEngineeringSkill(BaseTool):
    name: str = "resilience_engineering"
    description: str = (
        "Design resilient systems: circuit breakers, bulkhead isolation, "
        "retry policies with jitter, dead-letter queues, and chaos engineering approach."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Resilience Engineering\n"
            f"Objective: {objective}\n"
            f"Circuit Breaker: [Half-open probe after cool-down — per upstream dependency]\n"
            f"Bulkhead: [Thread/connection pool isolation per dependency]\n"
            f"Retry: [Exponential backoff + jitter — max 3 attempts, idempotent only]\n"
            f"DLQ: [Poison messages → dead letter → alert → manual replay]\n"
            f"ExecutionJournal: [Persist every execution event for replay and audit]\n"
            f"Chaos: [Fault injection plan: latency, errors, partition, resource exhaustion]"
        )


class HighAvailabilitySkill(BaseTool):
    name: str = "high_availability"
    description: str = (
        "Design HA architectures: active-active vs active-passive, redundancy, "
        "failover automation, health checks, and pod disruption budgets."
    )

    def _run(self, service_name: str, expected_load: str = "", scaling_model: str = "horizontal") -> str:
        return (
            f"High Availability — {service_name}\n"
            f"Mode: Active-Active (preferred) / Active-Passive (for stateful)\n"
            f"Replicas: [Minimum 2 replicas across availability zones]\n"
            f"Health Checks: [Liveness + readiness + startup probes with distinct SLAs]\n"
            f"Failover: [Automated failover < 30s — no manual intervention]\n"
            f"PDB: [Pod disruption budget ≥ 50% always available during rolling updates]"
        )


class DisasterRecoverySkill(BaseTool):
    name: str = "disaster_recovery"
    description: str = (
        "Design DR strategies: RTO/RPO target setting, backup schedules, "
        "restore procedures, failover runbooks, and DR test cadence."
    )

    def _run(self, service_name: str, expected_load: str = "", scaling_model: str = "horizontal") -> str:
        return (
            f"Disaster Recovery — {service_name}\n"
            f"RTO: [Maximum tolerable downtime — set with product/business]\n"
            f"RPO: [Maximum tolerable data loss — set with product/business]\n"
            f"Backup: [Automated backup schedule — daily full, hourly incremental]\n"
            f"Restore: [Documented restore procedure with SLA]\n"
            f"Failover: [Cross-region or cross-zone failover runbook]\n"
            f"DR Test: [Quarterly DR drill — document results and gaps]"
        )


class SecurityByDesignSkill(BaseTool):
    name: str = "security_by_design"
    description: str = (
        "Embed security at every layer: threat modeling (STRIDE), zero trust, "
        "defense in depth, secrets management, and supply chain security."
    )

    def _run(self, component: str, threat_model: str = "") -> str:
        return (
            f"Security by Design — {component}\n"
            f"Threat Model: {threat_model or 'Apply STRIDE: Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation'}\n"
            f"Zero Trust: [Verify every request — no implicit network trust]\n"
            f"Defense in Depth: [Multiple security layers — network, app, data]\n"
            f"Secrets: [Vault / Secret Manager — never in code or env vars]\n"
            f"Supply Chain: [SBOM, dependency scanning, container signing]"
        )


class IdentityAccessSkill(BaseTool):
    name: str = "identity_and_access_management"
    description: str = (
        "Design IAM strategies: OIDC/OAuth2 flows, RBAC/ABAC policy models, "
        "token lifecycle management, API key strategies, and federation."
    )

    def _run(self, component: str, threat_model: str = "") -> str:
        return (
            f"Identity & Access Management — {component}\n"
            f"Auth Protocol: [OIDC for user identity / OAuth2 for service auth]\n"
            f"RBAC: [Roles with minimum privilege — owner/editor/viewer at resource level]\n"
            f"ABAC: [Attribute-based for fine-grained tenant/org scoping]\n"
            f"Token Lifecycle: [Short-lived access tokens (15m) + refresh rotation]\n"
            f"API Keys: [Hashed storage, scoped, rotatable, expirable]"
        )


class InfrastructureDesignSkill(BaseTool):
    name: str = "infrastructure_design"
    description: str = (
        "Design cloud infrastructure: network topology, VPC design, subnet segmentation, "
        "security groups, NAT, load balancers, and private connectivity."
    )

    def _run(self, service_name: str, expected_load: str = "", scaling_model: str = "horizontal") -> str:
        return (
            f"Infrastructure Design — {service_name}\n"
            f"Network: [VPC with public/private/data subnet tiers]\n"
            f"Ingress: [ALB for HTTP / NLB for TCP — with WAF on public endpoints]\n"
            f"Egress: [NAT Gateway per AZ for private subnet outbound]\n"
            f"Private Connectivity: [VPC endpoints / PrivateLink for cloud services]\n"
            f"Security Groups: [Least-privilege — deny all inbound by default]"
        )


class ContainerizationSkill(BaseTool):
    name: str = "containerization"
    description: str = (
        "Design containerization strategies: multi-stage Dockerfiles, distroless base images, "
        "image layering, vulnerability scanning, and registry governance."
    )

    def _run(self, service_name: str, expected_load: str = "", scaling_model: str = "horizontal") -> str:
        return (
            f"Containerization — {service_name}\n"
            f"Dockerfile: [Multi-stage build — builder → distroless runtime image]\n"
            f"Base Image: [Distroless or minimal Alpine — no shell in prod image]\n"
            f"Non-Root: [Run as non-root user — UID 1000]\n"
            f"Scanning: [Trivy scan in CI — block on CRITICAL/HIGH]\n"
            f"Registry: [GHCR or ECR with image signing (cosign)]"
        )


class KubernetesArchSkill(BaseTool):
    name: str = "kubernetes_architecture"
    description: str = (
        "Design Kubernetes workload specifications, resource quotas, RBAC, "
        "network policies, and operator patterns for complex stateful workloads."
    )

    def _run(self, service_name: str, expected_load: str = "", scaling_model: str = "horizontal") -> str:
        return (
            f"Kubernetes Architecture — {service_name}\n"
            f"Workload: [Deployment / StatefulSet — with rationale]\n"
            f"Resources: [requests/limits set — VPA for right-sizing]\n"
            f"RBAC: [ServiceAccount with least-privilege ClusterRole]\n"
            f"Network Policy: [Default-deny + explicit allow rules]\n"
            f"PDB: [minAvailable = 1 minimum for all critical workloads]\n"
            f"Operator: [Custom controller if lifecycle complexity warrants it]"
        )


class DevSecOpsSkill(BaseTool):
    name: str = "devsecops"
    description: str = (
        "Design DevSecOps pipelines: SAST, DAST, SCA, secret scanning, "
        "policy-as-code enforcement, and compliance gate integration."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"DevSecOps Pipeline Design\n"
            f"Objective: {objective}\n"
            f"SAST: [CodeQL / Semgrep — on PR; block on HIGH+]\n"
            f"SCA: [Dependabot / Snyk — auto-PRs for vulnerabilities]\n"
            f"Secret Scanning: [git-secrets / Trufflehog — pre-commit + CI]\n"
            f"DAST: [OWASP ZAP on staging — weekly schedule]\n"
            f"Policy as Code: [OPA Gatekeeper policies on Kubernetes admission]\n"
            f"SBOM: [Generate CycloneDX SBOM on every release]"
        )


class CICDSkill(BaseTool):
    name: str = "cicd_integration"
    description: str = (
        "Design CI/CD pipeline architectures: build, test, security scan, deploy, "
        "promote strategies with feature flags, canary, and blue-green deployments."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"CI/CD Pipeline Design\n"
            f"Objective: {objective}\n"
            f"CI: [Lint → Unit Test → Build → SAST → Container Build → Push]\n"
            f"CD: [Deploy to staging → Integration Tests → Promote to prod]\n"
            f"Strategy: [Blue-Green for stateless / Canary for high-risk changes]\n"
            f"Feature Flags: [LaunchDarkly / custom — decouple deploy from release]\n"
            f"Rollback: [Automated rollback on error-rate spike post-deploy]\n"
            f"Git Workflow: [One Feature → One Branch → One PR → One Merge → Actions → Delete]"
        )


class ArchDocumentationSkill(BaseTool):
    name: str = "architecture_documentation"
    description: str = (
        "Produce C4 model architecture documentation: Context, Container, Component, "
        "and Code diagrams with written specifications in Mermaid or PlantUML."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Architecture Documentation\n"
            f"System: {objective}\n"
            f"C4 Context: [System actors, external systems, integrations]\n"
            f"C4 Container: [Services, databases, message brokers]\n"
            f"C4 Component: [Internal components per container]\n"
            f"ADRs: [One ADR per significant decision]\n"
            f"Format: [Mermaid diagrams + Markdown prose — version-controlled in repo]"
        )


class ArchReviewSkill(BaseTool):
    name: str = "architecture_reviews"
    description: str = (
        "Conduct structured architecture reviews: completeness check, quality attribute "
        "assessment, risk identification, compliance verification, and review report generation."
    )

    def _run(self, solution: str, context: str = "") -> str:
        return (
            f"Architecture Review\n"
            f"Solution: {solution}\n"
            f"SLA: < 24 hours\n"
            f"Checklist:\n"
            f"  ✓ Single Responsibility per component\n"
            f"  ✓ Interface contracts defined\n"
            f"  ✓ Non-functional requirements covered\n"
            f"  ✓ Failure modes documented (≥4)\n"
            f"  ✓ ADRs for significant decisions\n"
            f"  ✓ Security by design embedded\n"
            f"  ✓ Observability by default\n"
            f"  ✓ Scope boundary respected (M10.3 vs M10.4+)\n"
            f"  ✓ NATS JetStream as internal transport\n"
            f"  ✓ No duplicate services vs existing platform capabilities"
        )


class TechnicalSpecSkill(BaseTool):
    name: str = "technical_specifications"
    description: str = (
        "Produce implementation-ready technical specifications: HLD (High-Level Design), "
        "LLD (Low-Level Design), and engineering handoff documents with acceptance criteria."
    )

    def _run(self, component: str, design_spec: str) -> str:
        return (
            f"Technical Specification — {component}\n"
            f"HLD: [System context, component diagram, technology choices, quality attributes]\n"
            f"LLD: [Detailed component design, API contracts, data schemas, sequence flows]\n"
            f"Acceptance Criteria: [Testable, measurable — BDD Given/When/Then format]\n"
            f"Engineering Handoff: [Implementation tasks with clear definition of done]\n"
            f"Rework Prevention: [Pre-mortem — identify ambiguities before engineering starts]"
        )


class TechnologyEvaluationSkill(BaseTool):
    name: str = "technology_evaluation"
    description: str = (
        "Evaluate and select technologies with structured trade-off analysis. "
        "Produces a decision matrix and ADR with rationale for the chosen option."
    )

    def _run(self, problem: str, candidates: str, quality_attributes: str = "") -> str:
        return (
            f"Technology Evaluation\n"
            f"Problem: {problem}\n"
            f"Candidates: {candidates}\n"
            f"Quality Attributes: {quality_attributes or 'Scalability, Reliability, Maintainability, Security'}\n"
            f"Decision Matrix: [Score each candidate on each quality attribute 1-5]\n"
            f"Recommendation: [Highest weighted score — with caveats]\n"
            f"ADR: [Document decision, context, alternatives, rationale, consequences]"
        )


class EngineeringGovernanceSkill(BaseTool):
    name: str = "engineering_governance"
    description: str = (
        "Define engineering standards, coding conventions, compliance checkpoints, "
        "and quality gates for the EIOS engineering organization."
    )

    def _run(self, objective: str, constraints: str = "", context: str = "") -> str:
        return (
            f"Engineering Governance\n"
            f"Objective: {objective}\n"
            f"Coding Standards: [Language-specific style guides — enforced by linters in CI]\n"
            f"Quality Gates: [PR checklist → automated checks → architecture review → merge]\n"
            f"Compliance: [Security scan, license check, SBOM on every release]\n"
            f"ADR Process: [Propose → Review → Decide → Record → Publish]\n"
            f"Debt Tracking: [Technical debt register with severity and resolution SLA]"
        )


class ADRAuthoringSkill(BaseTool):
    name: str = "adr_authoring"
    description: str = (
        "Author Architecture Decision Records (ADRs) for all significant technical decisions. "
        "Follows the standard ADR template: Status, Context, Decision, Consequences."
    )

    def _run(self, decision: str, context: str, alternatives: str, rationale: str) -> str:
        return (
            f"Architecture Decision Record\n"
            f"============================\n"
            f"Title: ADR-XXXX — {decision}\n"
            f"Status: Proposed\n"
            f"Date: {{}}\n\n"
            f"Context:\n{context}\n\n"
            f"Decision:\nWe will {decision}\n\n"
            f"Alternatives Considered:\n{alternatives}\n\n"
            f"Rationale:\n{rationale}\n\n"
            f"Consequences:\n"
            f"  Positive: [Benefits realized from this decision]\n"
            f"  Negative: [Trade-offs accepted]\n"
            f"  Risks: [Risks introduced and mitigation strategies]"
        )


class FailureModeAnalysisSkill(BaseTool):
    name: str = "failure_mode_analysis"
    description: str = (
        "Document distributed system failure modes with expected behavior, "
        "detection strategy, mitigation, and test case specification. Minimum 4 failure modes."
    )

    def _run(self, component: str, failure_scenario: str) -> str:
        return (
            f"Failure Mode Analysis — {component}\n"
            f"Scenario: {failure_scenario}\n\n"
            f"Failure Mode 1: [Component crash / pod restart]\n"
            f"  Detection: [Health check → Kubernetes restart]\n"
            f"  Expected: [Requests fail with 503; retry succeeds after restart]\n"
            f"  Test: [Kill pod; verify requests retry and succeed within SLO]\n\n"
            f"Failure Mode 2: [Upstream dependency timeout]\n"
            f"  Detection: [Circuit breaker opens after threshold]\n"
            f"  Expected: [Fast-fail with fallback response; alert fires]\n"
            f"  Test: [Inject 5s latency; verify circuit opens and fallback activates]\n\n"
            f"Failure Mode 3: [Message queue backpressure]\n"
            f"  Detection: [Queue depth metric crosses threshold]\n"
            f"  Expected: [Consumer scales out; DLQ captures poison messages]\n"
            f"  Test: [Pause consumers; produce burst; verify DLQ and scaling]\n\n"
            f"Failure Mode 4: [Data partition / network split]\n"
            f"  Detection: [Health check failures from isolated partition]\n"
            f"  Expected: [Writes fail safe; reads serve stale with staleness indicator]\n"
            f"  Test: [Block network between nodes; verify CAP theorem behavior]"
        )


class RiskAnalysisSkill(BaseTool):
    name: str = "risk_analysis"
    description: str = (
        "Identify and assess technical risks in proposed solutions with likelihood, "
        "impact scoring, and mitigation strategies."
    )

    def _run(self, solution: str, context: str = "") -> str:
        return (
            f"Risk Analysis — {solution}\n"
            f"Context: {context or 'EIOS production environment'}\n\n"
            f"Risk Registry:\n"
            f"  [ID] [Description] [Likelihood: H/M/L] [Impact: H/M/L] [Mitigation]\n\n"
            f"Critical Risks (H/H): [Block delegation — must resolve before engineering starts]\n"
            f"High Risks (H/M or M/H): [Must have mitigation plan before sprint start]\n"
            f"Medium Risks (M/M): [Owner assigned, tracked in backlog]\n"
            f"Low Risks (L/*): [Accepted with monitoring]"
        )


class ExecutionFabricDesignSkill(BaseTool):
    name: str = "execution_fabric_design"
    description: str = (
        "Design M10.3 Execution Fabric components: ExecutionScheduler, WorkerLeaseManager, "
        "ExecutionRouter, ExecutionSession, StreamSandbox, and ExecutionJournal."
    )

    def _run(self, component: str, requirements: str) -> str:
        return (
            f"Execution Fabric Design — {component}\n"
            f"Requirements: {requirements}\n\n"
            f"Pipeline: Planner→AdmissionController→ExecutionScheduler→WorkerLeaseManager\n"
            f"          →ExecutionRouter→ExecutionSession→ExecutionWorker→StreamSandbox\n"
            f"          →AsyncGenerator→TransportAdapter→Client\n\n"
            f"ExecutionRouter: Selects transport without scheduler awareness\n"
            f"ExecutionSession: Context+Lease+Budget+Stream+Telemetry+CancellationToken\n"
            f"Lease Lifecycle: Requested→Reserved→Active→Completed→Released\n"
            f"Chunk Types: status/stdout/stderr/progress/artifact/token/metrics/heartbeat/completion/error\n"
            f"Journal: Every event persisted — enables replay, audit, debug, resume"
        )


class StreamingArchSkill(BaseTool):
    name: str = "streaming_architecture"
    description: str = (
        "Design streaming architectures: AsyncGenerator internally, transport adapters "
        "at the edge (SSE, WebSocket, JSONL, HTTP chunked). Never expose SSE inside the runtime."
    )

    def _run(self, pipeline_name: str, source: str, consumers: str, transport: str = "AsyncGenerator") -> str:
        return (
            f"Streaming Architecture — {pipeline_name}\n"
            f"Source: {source}\n"
            f"Internal Transport: AsyncGenerator[StreamChunk]\n"
            f"Transport Adapters: [SSE / WebSocket / JSONL / HTTP chunk — at edge only]\n"
            f"Chunk Types: status, stdout, stderr, progress, artifact, token, metrics, heartbeat, completion, error\n"
            f"Safeguards: idle timeout, chunk budget, byte budget, token budget, cost budget, cancellation propagation\n"
            f"Consumers: {consumers}\n"
            f"Note: Runtime never knows about SSE — adapters convert at the transport edge."
        )


class AdmissionPipelineSkill(BaseTool):
    name: str = "admission_controller_design"
    description: str = (
        "Design pluggable admission pipelines: Auth→Authz→Security→Policy→Quota→Approval→Mutation→Execution. "
        "Mutation injects tracing IDs, labels, budgets. All validators implement IAdmissionValidator."
    )

    def _run(self, pipeline_name: str, validators: str = "") -> str:
        return (
            f"Admission Pipeline — {pipeline_name}\n"
            f"Standard Stages:\n"
            f"  1. Authentication   — verify identity\n"
            f"  2. Authorization    — check permissions\n"
            f"  3. Security         — scan for malicious payloads\n"
            f"  4. Policy           — enforce organizational policies\n"
            f"  5. Quota            — check resource limits\n"
            f"  6. Approval         — governance gate for sensitive operations\n"
            f"  7. Mutation         — inject tracing IDs, labels, metadata, budgets\n"
            f"  8. Execution        — dispatch to worker\n\n"
            f"Custom Validators: {validators or 'None specified'}\n"
            f"Interface: IAdmissionValidator — pluggable design like Kubernetes webhooks\n"
            f"Short-circuit: First failing validator stops the pipeline immediately"
        )


class ImplementationGuidanceSkill(BaseTool):
    name: str = "implementation_guidance"
    description: str = (
        "Produce clear implementation tasks with acceptance criteria for engineering teams. "
        "Translates design specifications into sprint-ready engineering work items."
    )

    def _run(self, component: str, design_spec: str) -> str:
        return (
            f"Implementation Guidance — {component}\n"
            f"Design: {design_spec}\n\n"
            f"Tasks:\n"
            f"  T1: [Scaffold component with interface definitions] → AC: [Compiles, tests pass]\n"
            f"  T2: [Implement core business logic] → AC: [Unit tests ≥ 80% coverage]\n"
            f"  T3: [Integration with upstream/downstream] → AC: [Integration tests pass]\n"
            f"  T4: [Observability instrumentation] → AC: [Metrics/traces visible in dashboard]\n"
            f"  T5: [Failure mode tests] → AC: [≥4 failure scenarios tested]\n\n"
            f"Definition of Done:\n"
            f"  ✓ Tests passing\n"
            f"  ✓ Code reviewed\n"
            f"  ✓ Observability verified\n"
            f"  ✓ Documentation updated\n"
            f"  ✓ Architecture review signed off"
        )


class CapabilityMappingSkill(BaseTool):
    name: str = "capability_mapping"
    description: str = (
        "Map business objectives to existing platform capabilities before creating new services. "
        "Enforces reuse-first — duplicate services = 0 KPI."
    )

    def _run(self, objective: str, platform_context: str = "") -> str:
        return (
            f"Capability Mapping\n"
            f"Objective: {objective}\n"
            f"Platform Context: {platform_context or 'EIOS capability registry'}\n\n"
            f"Existing Capabilities:\n"
            f"  [Search registry for capabilities matching objective]\n"
            f"  [Evaluate fit: full match / partial match / gap]\n\n"
            f"Reuse Recommendation:\n"
            f"  Full Match: Use existing service as-is\n"
            f"  Partial Match: Extend existing service (prefer over new service)\n"
            f"  Gap: Design new service — document why existing capabilities are insufficient\n\n"
            f"Duplicate Services Check: [Cross-reference all proposed services vs registry]"
        )


# ===========================================================================
# Skill Registry
# ===========================================================================

SOLUTION_ARCHITECT_SKILLS = [
    SolutionArchitectureSkill(),
    EnterpriseApplicationDesignSkill(),
    SystemDesignSkill(),
    DistributedSystemsSkill(),
    CloudNativeSkill(),
    MicroservicesSkill(),
    ModularMonolithSkill(),
    DomainDrivenDesignSkill(),
    BoundedContextSkill(),
    EventDrivenArchSkill(),
    CQRSSkill(),
    EventSourcingSkill(),
    WorkflowOrchestrationSkill(),
    RESTAPIDesignSkill(),
    GraphQLSkill(),
    GRPCSkill(),
    EventStreamingSkill(),
    MessagingSkill(),
    APIGatewaySkill(),
    IntegrationArchSkill(),
    EnterpriseIntegrationPatternsSkill(),
    PlatformEngineeringSkill(),
    AIPlatformDesignSkill(),
    LLMIntegrationSkill(),
    RAGArchitectureSkill(),
    AgenticSystemsSkill(),
    KnowledgeGraphSkill(),
    VectorDatabaseSkill(),
    DataModelingSkill(),
    DatabaseDesignSkill(),
    CachingStrategiesSkill(),
    SearchArchSkill(),
    ObservabilitySkill(),
    LoggingSkill(),
    DistributedTracingSkill(),
    PerformanceEngineeringSkill(),
    ScalabilitySkill(),
    ResilienceEngineeringSkill(),
    HighAvailabilitySkill(),
    DisasterRecoverySkill(),
    SecurityByDesignSkill(),
    IdentityAccessSkill(),
    InfrastructureDesignSkill(),
    ContainerizationSkill(),
    KubernetesArchSkill(),
    DevSecOpsSkill(),
    CICDSkill(),
    ArchDocumentationSkill(),
    ArchReviewSkill(),
    TechnicalSpecSkill(),
    TechnologyEvaluationSkill(),
    EngineeringGovernanceSkill(),
    ADRAuthoringSkill(),
    FailureModeAnalysisSkill(),
    RiskAnalysisSkill(),
    ExecutionFabricDesignSkill(),
    StreamingArchSkill(),
    AdmissionPipelineSkill(),
    ImplementationGuidanceSkill(),
    CapabilityMappingSkill(),
]

__all__ = ["SOLUTION_ARCHITECT_SKILLS"]
