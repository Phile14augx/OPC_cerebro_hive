"""Technical Lead agent skills.

Each skill is a CrewAI-compatible BaseTool subclass with a Pydantic input
schema and _run() method. These skills represent the Technical Lead's domain
expertise in engineering execution, code quality, testing, CI/CD governance,
Git workflow enforcement, and team coordination.
"""
from __future__ import annotations

import json
from typing import Any, Optional, Type
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

class EngineeringTaskInput(BaseModel):
    objective: str = Field(..., description="Engineering objective or feature to implement.")
    solution_reference: Optional[str] = Field(None, description="Reference to approved solution architecture.")
    constraints: Optional[str] = Field(None, description="Technical constraints, SLOs, deadlines.")


class CodeReviewInput(BaseModel):
    pr_title: str = Field(..., description="Pull request title.")
    pr_description: str = Field(..., description="Pull request description and change summary.")
    capability: str = Field(..., description="Engineering capability: Backend, Frontend, AI, DevOps, QA.")
    files_changed: Optional[str] = Field(None, description="List of files changed in the PR.")


class ImplementationPlanInput(BaseModel):
    solution_architecture: str = Field(..., description="Approved solution architecture to decompose.")
    sprint_length_days: int = Field(default=14, description="Sprint length in days.")
    available_engineers: Optional[str] = Field(None, description="Available engineering capabilities.")


class GitWorkflowInput(BaseModel):
    feature_name: str = Field(..., description="Feature name to generate Git workflow spec for.")
    task_id: str = Field(..., description="Task ID for branch naming.")
    change_type: str = Field(default="feat", description="Conventional commit prefix: feat|fix|refactor|chore|test|docs.")


class TestStrategyInput(BaseModel):
    component: str = Field(..., description="Component to define test strategy for.")
    test_type: str = Field(default="unit", description="Test type: unit|integration|performance|e2e.")
    coverage_target: int = Field(default=90, description="Coverage target percentage.")


class CICDInput(BaseModel):
    service_name: str = Field(..., description="Service to configure CI/CD for.")
    deployment_strategy: str = Field(default="blue-green", description="Deployment strategy: blue-green|canary|rolling.")
    quality_gates: Optional[str] = Field(None, description="Required quality gates to include.")


class ArchComplianceInput(BaseModel):
    implementation: str = Field(..., description="Implementation or PR to validate against architecture.")
    solution_reference: str = Field(..., description="Solution architecture reference to validate against.")


class PerformanceInput(BaseModel):
    component: str = Field(..., description="Component to profile or optimize.")
    target_latency_ms: Optional[int] = Field(None, description="Target p99 latency in milliseconds.")
    target_throughput: Optional[str] = Field(None, description="Target throughput (rps, events/s, etc.).")


class DebuggingInput(BaseModel):
    symptom: str = Field(..., description="Observed symptom or error to debug.")
    component: str = Field(..., description="Component or service exhibiting the issue.")
    context: Optional[str] = Field(None, description="Relevant logs, traces, or metrics context.")


class ObservabilityInput(BaseModel):
    service_name: str = Field(..., description="Service to instrument for observability.")
    slo_targets: Optional[str] = Field(None, description="SLO targets: availability, latency, error rate.")


class TechDebtInput(BaseModel):
    area: str = Field(..., description="Codebase area or system with technical debt.")
    description: str = Field(..., description="Description of the debt item.")
    severity: str = Field(default="medium", description="Severity: low|medium|high|critical.")


class MentoringInput(BaseModel):
    engineer_role: str = Field(..., description="Role of the engineer to mentor.")
    topic: str = Field(..., description="Technical topic or skill area to mentor on.")
    context: Optional[str] = Field(None, description="Specific code or problem context for the session.")


class ReleaseInput(BaseModel):
    feature_name: str = Field(..., description="Feature or release to assess readiness for.")
    checklist_items: Optional[str] = Field(None, description="Custom release checklist items to include.")


class DXImprovementInput(BaseModel):
    friction_area: str = Field(..., description="Area of developer friction to address.")
    current_state: Optional[str] = Field(None, description="Current developer experience description.")


class SecurityReviewInput(BaseModel):
    component: str = Field(..., description="Component or PR to review for security issues.")
    threat_vectors: Optional[str] = Field(None, description="Known threat vectors to check against.")


class DocReviewInput(BaseModel):
    document_type: str = Field(..., description="Type of document: README|API|runbook|ADR|diagram.")
    component: str = Field(..., description="Component the document covers.")


# ===========================================================================
# Skill Implementations
# ===========================================================================

class TechnicalLeadershipSkill(BaseTool):
    name: str = "technical_leadership"
    description: str = (
        "Lead engineering teams through technical direction, mentoring, delivery governance, "
        "and engineering excellence. Produces leadership action plan and team coordination strategy."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "technical_leadership",
            "objective": objective,
            "leadership_actions": [
                "Clarify engineering objectives with Solution Architect",
                "Decompose into work packages per engineering capability",
                "Assign tasks to specialist engineers",
                "Set daily standups and unblock in < 4 hours",
                "Review PRs within 12-hour SLA",
                "Track KPIs: build success, test coverage, velocity, debt growth",
            ],
            "coordination_plan": {
                "daily_standup": "15 min — blockers first",
                "pr_review_sla_hours": 12,
                "blocker_escalation_hours": 4,
                "architecture_sync": "Per sprint with Solution Architect",
            },
        }, indent=2)


class SoftwareEngineeringSkill(BaseTool):
    name: str = "software_engineering"
    description: str = (
        "Apply and enforce software engineering fundamentals: SOLID principles, DRY, KISS, "
        "clean architecture, and design patterns across all implementations."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "software_engineering",
            "principles": {
                "SOLID": "Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion",
                "DRY": "Extract shared logic into reusable modules — no copy-paste",
                "KISS": "Simplest solution that meets quality attributes — no over-engineering",
                "Clean Architecture": "Dependency rule — inner layers never depend on outer layers",
            },
            "code_review_checklist": [
                "Single Responsibility per class/module/function",
                "Interface-first design — depend on abstractions",
                "No shared mutable state between modules",
                "Error handling at boundaries — not buried in business logic",
                "Meaningful names — no abbreviations, no hungarian notation",
                "Functions < 30 lines, cyclomatic complexity < 10",
            ],
        }, indent=2)


class SystemDesignSkill(BaseTool):
    name: str = "system_design"
    description: str = (
        "Design and validate system architectures. Used for implementation planning, "
        "technical analysis of approved designs, and identifying gaps before engineering starts."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "system_design",
            "analysis": {
                "components": "Validate single-responsibility decomposition",
                "interfaces": "Confirm all contracts defined before engineering",
                "data_flow": "Map request/event flows end-to-end",
                "cross_cutting": "Auth, observability, config, secrets — confirm coverage",
            },
            "implementation_readiness_check": [
                "Interface contracts defined for all components",
                "Technology choices made and ADRs documented",
                "Failure modes documented with test cases",
                "Observability strategy defined (logs, traces, metrics)",
                "Security review scheduled",
                "Acceptance criteria written for all tasks",
            ],
        }, indent=2)


class BackendDevelopmentSkill(BaseTool):
    name: str = "backend_development"
    description: str = (
        "Oversee and guide backend service implementation. Validates code quality, "
        "API contracts, database usage, async patterns, and error handling."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "backend_development",
            "review_focus": {
                "API": "OpenAPI-first, REST conventions, versioning, RFC 9457 errors",
                "Database": "Query efficiency, index usage, migration safety, transaction scope",
                "Async": "Non-blocking I/O, proper task cancellation, context propagation",
                "Error Handling": "Structured errors at boundaries, no swallowed exceptions",
                "Security": "Input validation, parameterised queries, secrets from vault",
            },
            "languages_supported": ["TypeScript/Node.js", "Python/FastAPI", "Go", "Java/Spring Boot"],
        }, indent=2)


class FrontendDevelopmentSkill(BaseTool):
    name: str = "frontend_development"
    description: str = (
        "Oversee and guide frontend application implementation in React and Next.js. "
        "Validates component design, state management, performance, and accessibility."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "frontend_development",
            "review_focus": {
                "Components": "Single-responsibility, composable, no prop drilling",
                "State": "Server state (React Query/SWR), client state (Zustand) — separated",
                "Performance": "Code splitting, lazy loading, memoisation, Core Web Vitals",
                "Accessibility": "WCAG 2.1 AA — keyboard nav, ARIA, colour contrast",
                "TypeScript": "Strict mode, no 'any', interface-first prop types",
            },
            "frameworks_supported": ["React 18+", "Next.js 14+", "TypeScript 5+"],
        }, indent=2)


class AIEngineeringSkill(BaseTool):
    name: str = "ai_engineering"
    description: str = (
        "Oversee LLM integration, AI pipeline engineering, and agentic system implementation. "
        "Validates prompt design, context budgeting, tool calling, streaming, and cost controls."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "ai_engineering",
            "review_focus": {
                "Prompts": "System/user/tool separation, token budget management, structured output",
                "Streaming": "AsyncGenerator internally — SSE/WebSocket at transport edge only",
                "Tool Calling": "Strict schema, validated output, graceful tool failure handling",
                "Cost Controls": "Token budget per request, model routing by complexity",
                "Observability": "Token usage, latency, cost, quality metrics tracked",
                "Agent Lifecycle": "plan → execute → observe → reflect enforced",
            },
        }, indent=2)


class DistributedSystemsSkill(BaseTool):
    name: str = "distributed_systems"
    description: str = (
        "Guide distributed system implementation. Validates fault tolerance, "
        "lease management, NATS JetStream usage, circuit breakers, and ExecutionJournal."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "distributed_systems",
            "review_focus": {
                "Transport": "NATS JetStream for internal — HTTP for external",
                "Leasing": "Requested→Reserved→Active→Completed→Released enforced",
                "Retry": "Exponential backoff + jitter, idempotent handlers only",
                "Circuit Breaker": "Per upstream dependency, half-open probe after cool-down",
                "DLQ": "Dead letter queue configured with retry limit and alerting",
                "Journal": "ExecutionJournal persists every event for audit and replay",
            },
        }, indent=2)


class CloudComputingSkill(BaseTool):
    name: str = "cloud_computing"
    description: str = (
        "Architect and oversee cloud infrastructure and services. Validates 12-factor compliance, "
        "stateless design, health probes, and IaC patterns."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "cloud_computing",
            "review_focus": {
                "12-Factor": "Config via env, stateless processes, explicit dependencies",
                "Health Probes": "Liveness + readiness + startup — distinct contracts",
                "Graceful Shutdown": "SIGTERM handler, drain in-flight requests, close connections",
                "IaC": "Helm/Kustomize/Terraform — no manual cloud console changes",
                "Secrets": "Secret Manager / Vault — never in env vars or config files",
            },
        }, indent=2)


class MicroservicesSkill(BaseTool):
    name: str = "microservices"
    description: str = (
        "Define and enforce microservice boundaries, communication patterns, and data ownership. "
        "Validates service isolation, API contracts, and no shared databases."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "microservices",
            "review_focus": {
                "Boundaries": "One DB per service — no shared schemas across services",
                "Communication": "Sync (REST) for queries, Async (NATS) for commands/events",
                "Contracts": "OpenAPI / AsyncAPI — versioned, documented, tested",
                "Reuse": "Check capability registry before creating new service",
                "Deployment": "Independent deployable — no coupled releases",
            },
        }, indent=2)


class ModularMonolithSkill(BaseTool):
    name: str = "modular_monolith_design"
    description: str = (
        "Apply modular monolith patterns: hard module boundaries, no cross-module imports, "
        "and clear extraction paths to microservices when scale demands it."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "modular_monolith_design",
            "review_focus": {
                "Module Boundaries": "No direct cross-module imports — use public interfaces only",
                "Shared Kernel": "Minimal shared types — no shared services between modules",
                "Extraction Path": "Document path to microservice extraction if needed",
                "Testing": "Module integration tests at public boundaries",
            },
        }, indent=2)


class EventDrivenArchSkill(BaseTool):
    name: str = "event_driven_architecture"
    description: str = (
        "Implement and validate EDA patterns: NATS JetStream subjects, consumer groups, "
        "idempotent handlers, DLQ configuration, and event schema versioning."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "event_driven_architecture",
            "review_focus": {
                "Subject Naming": "domain.aggregate.event — dot-separated hierarchy",
                "Consumers": "Durable consumers with explicit ack — no auto-ack",
                "Idempotency": "All consumers are idempotent — duplicate delivery handled",
                "DLQ": "Max deliver configured, DLQ subject monitored and alerted",
                "Schema": "Event schemas versioned — upcasters for evolution",
            },
        }, indent=2)


class CQRSSkill(BaseTool):
    name: str = "cqrs"
    description: str = (
        "Guide CQRS implementation: command handlers, read projections, consistency "
        "expectations, and projection rebuild strategies."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "cqrs",
            "review_focus": {
                "Write Model": "Command handler → aggregate → domain event → persist",
                "Read Model": "Denormalised projections — one per query use case",
                "Projections": "Event-driven rebuild, catch-up on start",
                "Consistency": "Document eventual consistency SLO and stale-read handling",
            },
        }, indent=2)


class EventSourcingSkill(BaseTool):
    name: str = "event_sourcing"
    description: str = (
        "Guide event-sourced system implementation: event stores, snapshots, "
        "projections, schema evolution with upcasters."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "event_sourcing",
            "review_focus": {
                "Event Store": "Append-only, schema-versioned events",
                "Snapshots": "Configured interval — reconstruct from snapshot + delta",
                "Projections": "Separate projection service, rebuildable from event log",
                "Upcasters": "For every schema change — backward compatibility maintained",
            },
        }, indent=2)


class RESTAPISkill(BaseTool):
    name: str = "rest_apis"
    description: str = (
        "Enforce REST API standards: resource naming, HTTP semantics, versioning, "
        "RFC 9457 error format, pagination, and OpenAPI 3.1 contract."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "rest_apis",
            "review_checklist": [
                "Noun-based resource URLs — no verbs in paths",
                "Correct HTTP methods: GET (safe), POST (create), PUT (replace), PATCH (partial), DELETE",
                "URL versioning: /v1/resources",
                "RFC 9457 Problem Details for errors",
                "Cursor-based pagination for collections",
                "OpenAPI 3.1 spec with examples and error schemas",
                "Idempotency keys on POST for non-idempotent operations",
            ],
        }, indent=2)


class GraphQLSkill(BaseTool):
    name: str = "graphql"
    description: str = (
        "Oversee GraphQL schema design and resolver implementation. Validates "
        "schema-first design, N+1 prevention with DataLoader, and error handling."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "graphql",
            "review_checklist": [
                "Schema-first design — SDL defined before resolvers",
                "DataLoader for all list resolvers — no N+1",
                "Error unions for expected errors — not generic GraphQL errors",
                "Field-level authorization — not only at resolver level",
                "Depth and complexity limits configured",
                "Subscription websocket connection management",
            ],
        }, indent=2)


class GRPCSkill(BaseTool):
    name: str = "grpc"
    description: str = (
        "Guide gRPC service implementation where appropriate. "
        "Note: prefer NATS JetStream for internal services — gRPC for external consumers only."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "grpc",
            "review_checklist": [
                "Proto file versioned and backward-compatible",
                "gRPC status codes used correctly — no HTTP 200 with error body",
                "Streaming mode appropriate (unary vs server vs bidirectional)",
                "Deadlines propagated on every call",
                "mTLS for service-to-service auth",
                "Note: Prefer NATS JetStream for internal — gRPC for external consumers only",
            ],
        }, indent=2)


class TypeScriptSkill(BaseTool):
    name: str = "typescript"
    description: str = (
        "Enforce TypeScript best practices: strict mode, type safety, "
        "interface-first design, and no 'any' escape hatches."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "typescript",
            "review_checklist": [
                "strict: true in tsconfig — no exceptions",
                "No 'any' — use 'unknown' with type guards",
                "Interface-first — define contracts as interfaces or types",
                "Discriminated unions for sum types",
                "Readonly where mutation is not intended",
                "Barrel exports with explicit re-exports",
                "No implicit returns — all paths return explicitly",
            ],
        }, indent=2)


class NodeJSSkill(BaseTool):
    name: str = "nodejs"
    description: str = (
        "Oversee Node.js backend implementation: async patterns, "
        "worker threads, event loop health, and performance profiling."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "nodejs",
            "review_checklist": [
                "All I/O is async — no blocking calls on main thread",
                "Unhandled promise rejections caught and logged",
                "Worker threads for CPU-bound work",
                "Connection pool sizes tuned for workload",
                "Memory leak checks: EventEmitter listeners removed on cleanup",
                "Graceful shutdown: drain in-flight, close server, then close DB pools",
            ],
        }, indent=2)


class PythonSkill(BaseTool):
    name: str = "python"
    description: str = (
        "Oversee Python implementation: async/await, type hints, "
        "Pydantic models, FastAPI conventions, and test patterns."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "python",
            "review_checklist": [
                "Type hints on all public functions and methods",
                "Pydantic models for all external data (requests, responses, config)",
                "async/await for all I/O — no threading.sleep in async context",
                "Context managers for resource cleanup (DB connections, file handles)",
                "Structured logging — no print() in production code",
                "pytest with fixtures — no unittest.TestCase",
                "ruff + mypy in CI — type errors block merge",
            ],
        }, indent=2)


class JavaSkill(BaseTool):
    name: str = "java"
    description: str = (
        "Oversee Java/Spring Boot implementation: dependency injection, "
        "JPA usage, transaction management, and testing with JUnit 5."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "java",
            "review_checklist": [
                "Constructor injection — not field injection",
                "JPA: lazy loading configured, N+1 prevented with @EntityGraph",
                "Transactions: @Transactional at service layer, not repository",
                "Records for immutable value objects",
                "JUnit 5 + Testcontainers for integration tests",
                "Checkstyle + PMD in CI",
            ],
        }, indent=2)


class GoSkill(BaseTool):
    name: str = "go"
    description: str = (
        "Oversee Go implementation: goroutine lifecycle, channel usage, "
        "error wrapping, stdlib conventions, and benchmark tests."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "go",
            "review_checklist": [
                "All goroutines have documented lifecycle and cancellation via context",
                "Errors wrapped with context: fmt.Errorf('...%w', err)",
                "No naked goroutines — always with WaitGroup or errgroup",
                "Channels: size documented, unbuffered by default",
                "Interface segregation: small interfaces in consumer packages",
                "golangci-lint in CI — errors block merge",
            ],
        }, indent=2)


class ReactSkill(BaseTool):
    name: str = "react"
    description: str = (
        "Oversee React frontend implementation: hooks, state management, "
        "performance optimization, and testing with React Testing Library."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "react",
            "review_checklist": [
                "Functional components only — no class components",
                "Custom hooks for reusable stateful logic",
                "React Query / SWR for server state",
                "useMemo/useCallback only where profiler shows benefit",
                "React Testing Library — test behaviour, not implementation",
                "No direct DOM manipulation — use refs only when necessary",
            ],
        }, indent=2)


class NextJSSkill(BaseTool):
    name: str = "nextjs"
    description: str = (
        "Oversee Next.js application implementation: App Router, RSC, "
        "data fetching strategies, caching, and deployment configuration."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "nextjs",
            "review_checklist": [
                "App Router — server components by default, client components where needed",
                "Data fetching at the lowest component level",
                "Cache strategy documented per route: static | dynamic | revalidate",
                "Image: next/image with explicit width/height",
                "Route handlers for API endpoints — not pages/api",
                "Middleware for auth — not in every page component",
            ],
        }, indent=2)


class SpringBootSkill(BaseTool):
    name: str = "spring_boot"
    description: str = (
        "Oversee Spring Boot service implementation: auto-configuration, "
        "security configuration, actuator endpoints, and JPA best practices."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "spring_boot",
            "review_checklist": [
                "Spring Security configured: CSRF, session policy, auth filters",
                "Actuator: health, info, metrics exposed — management port separate",
                "Application properties externalized via @ConfigurationProperties",
                "Database pool: HikariCP with min-idle, max-pool-size configured",
                "Exception handler: @ControllerAdvice with RFC 9457 ProblemDetail",
            ],
        }, indent=2)


class DatabaseDesignSkill(BaseTool):
    name: str = "database_design"
    description: str = (
        "Validate database schemas, indexing strategies, migration safety, "
        "and consistency model correctness in implementations."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "database_design",
            "review_checklist": [
                "Migrations: sequential, reversible, zero-downtime compatible",
                "Indexes: covering indexes for hot queries, no redundant indexes",
                "N+1: query plans reviewed for ORM-generated queries",
                "Transactions: narrowest scope possible — no long-held transactions",
                "One DB per service — no cross-service schema sharing",
                "Connection pool: sized correctly for workload",
            ],
        }, indent=2)


class SQLSkill(BaseTool):
    name: str = "sql"
    description: str = (
        "Review SQL queries, index design, query execution plans, "
        "and transaction boundary correctness."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "sql",
            "review_checklist": [
                "Parameterised queries only — no string concatenation",
                "EXPLAIN ANALYZE run on all hot paths",
                "Composite index column order matches query predicates",
                "SELECT * avoided in production queries",
                "Isolation level documented and justified per transaction",
                "Pagination: keyset (cursor) not OFFSET for large tables",
            ],
        }, indent=2)


class NoSQLSkill(BaseTool):
    name: str = "nosql"
    description: str = (
        "Guide NoSQL schema design for document, key-value, time-series, "
        "and graph stores. Validates access pattern alignment."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "nosql",
            "review_checklist": [
                "Schema designed for access patterns — not normalized like RDBMS",
                "Partition key avoids hot partitions",
                "TTL configured for ephemeral data",
                "Consistency level documented per query",
                "Index strategy: sparse indexes, compound indexes as needed",
            ],
        }, indent=2)


class RedisSkill(BaseTool):
    name: str = "redis"
    description: str = (
        "Oversee Redis usage: caching strategies, data structure selection, "
        "TTL management, eviction policies, and connection pooling."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "redis",
            "review_checklist": [
                "TTL set on all keys — no immortal keys",
                "Eviction policy matches use case: allkeys-lru for cache",
                "Pipelining for bulk operations — no round-trip per key",
                "Lua scripts for atomic multi-key operations",
                "Sentinel / Cluster for HA — no single-node in production",
                "Connection pool configured — not new connection per request",
            ],
        }, indent=2)


class PostgreSQLSkill(BaseTool):
    name: str = "postgresql"
    description: str = (
        "Oversee PostgreSQL implementation: advanced indexing, JSONB usage, "
        "partitioning, vacuum tuning, and replication configuration."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "postgresql",
            "review_checklist": [
                "BRIN indexes for append-only time-series tables",
                "GIN indexes for JSONB fields with contains queries",
                "Partial indexes for low-cardinality predicates",
                "Table partitioning for tables > 100M rows",
                "Autovacuum tuning for high-write tables",
                "Read replicas for reporting queries — not primary",
            ],
        }, indent=2)


class DockerSkill(BaseTool):
    name: str = "docker"
    description: str = (
        "Enforce Docker best practices: multi-stage builds, distroless base images, "
        "non-root users, vulnerability scanning, and image signing."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "docker",
            "review_checklist": [
                "Multi-stage build: builder → distroless runtime image",
                "Run as non-root user (UID 1000)",
                "No shell in production image (distroless)",
                "Trivy scan in CI — block on CRITICAL/HIGH CVEs",
                ".dockerignore present — exclude node_modules, .git, secrets",
                "Layer order: deps first, source last — maximize cache hits",
            ],
        }, indent=2)


class KubernetesSkill(BaseTool):
    name: str = "kubernetes"
    description: str = (
        "Oversee Kubernetes workload specifications, RBAC, network policies, "
        "HPA, PDB, and resource management across all services."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "kubernetes",
            "review_checklist": [
                "requests and limits set on all containers",
                "PDB: minAvailable ≥ 1 for all critical workloads",
                "HPA configured: CPU 70% or custom metric trigger",
                "RBAC: least-privilege ServiceAccount per workload",
                "Network Policy: default-deny, explicit allow rules",
                "Readiness probe: must not succeed until app is ready to serve",
                "Liveness probe: must fail only on actual stuck state",
            ],
        }, indent=2)


class CICDSkill(BaseTool):
    name: str = "cicd"
    description: str = (
        "Design and govern CI/CD pipelines: quality gates, GitHub Actions workflows, "
        "deployment strategies, and rollback automation."
    )

    def _run(self, service_name: str, deployment_strategy: str = "blue-green", quality_gates: str = "") -> str:
        return json.dumps({
            "skill": "cicd",
            "service": service_name,
            "ci_pipeline": {
                "stages": ["lint", "type-check", "unit-tests", "build", "sast", "container-build", "container-scan", "push"],
                "branch_trigger": "PR to main — all stages required",
                "main_trigger": "Push to main — full pipeline + deploy to staging",
            },
            "cd_pipeline": {
                "staging": "Auto-deploy on main merge",
                "production": f"Manual gate after staging validation — {deployment_strategy} deployment",
                "rollback": "Automatic on error-rate spike > 1% post-deploy",
            },
            "quality_gates": quality_gates or "lint, unit-tests (≥ 90%), sast, build — all must pass",
            "deployment_strategy": deployment_strategy,
        }, indent=2)


class GitWorkflowSkill(BaseTool):
    name: str = "git"
    description: str = (
        "Enforce the CerebroHive Git workflow: one feature per worktree, "
        "conventional commits, rebase before merge, and GitHub Actions must pass."
    )

    def _run(self, feature_name: str, task_id: str, change_type: str = "feat") -> str:
        slug = feature_name.lower().replace(" ", "-").replace("_", "-")[:40]
        branch = f"{change_type}/{task_id}-{slug}"
        return json.dumps({
            "skill": "git",
            "git_workflow": {
                "worktree": f"worktrees/{branch}",
                "branch": branch,
                "conventional_commit": f"{change_type}({slug}): <imperative description>",
                "rules": [
                    "One feature → One worktree",
                    "One worktree → One branch",
                    "One branch → One PR",
                    "One PR → One feature",
                    "Rebase onto origin/main before merge",
                    "Atomic commits — one logical change per commit",
                    "Conventional commit messages — no 'WIP' or 'fix'",
                    "GitHub Actions must pass before merge",
                    "Delete worktree after merge",
                    "Repository must remain releasable at all times",
                ],
                "pr_template": {
                    "title": f"{change_type}({slug}): <description>",
                    "body": "## Summary\n\n## Changes\n\n## Testing\n\n## Architecture Compliance\n\n## Checklist\n- [ ] Tests passing\n- [ ] Code reviewed\n- [ ] Documentation updated\n- [ ] Architecture validated",
                },
            },
        }, indent=2)


class GitHubSkill(BaseTool):
    name: str = "github"
    description: str = (
        "Manage GitHub repository settings, branch protection rules, "
        "PR review requirements, and repository governance."
    )

    def _run(self, feature_name: str, task_id: str, change_type: str = "feat") -> str:
        return json.dumps({
            "skill": "github",
            "branch_protection_rules": {
                "main": {
                    "require_pr_review": True,
                    "required_approvals": 1,
                    "require_status_checks": True,
                    "required_checks": ["lint", "unit-tests", "build", "sast"],
                    "require_linear_history": True,
                    "restrict_force_push": True,
                    "require_signed_commits": True,
                }
            },
            "repository_settings": {
                "auto_delete_branches": True,
                "allow_squash_merge": False,
                "allow_merge_commit": True,
                "allow_rebase_merge": True,
                "default_branch": "main",
            },
        }, indent=2)


class GitHubActionsSkill(BaseTool):
    name: str = "github_actions"
    description: str = (
        "Design and maintain GitHub Actions workflows: CI pipeline, security scanning, "
        "deployment automation, and scheduled jobs."
    )

    def _run(self, service_name: str, deployment_strategy: str = "blue-green", quality_gates: str = "") -> str:
        return json.dumps({
            "skill": "github_actions",
            "ci_workflow": {
                "file": f".github/workflows/{service_name}-ci.yml",
                "triggers": ["pull_request", "push to main"],
                "jobs": [
                    {"name": "lint", "steps": ["checkout", "setup-node/python", "install deps", "run lint"]},
                    {"name": "test", "steps": ["checkout", "install deps", "run unit tests", "upload coverage"]},
                    {"name": "build", "steps": ["checkout", "install deps", "build", "verify artifacts"]},
                    {"name": "sast", "steps": ["checkout", "run CodeQL / Semgrep", "upload SARIF"]},
                    {"name": "container", "needs": ["build"], "steps": ["build image", "scan with Trivy", "push to registry"]},
                ],
            },
            "cd_workflow": {
                "file": f".github/workflows/{service_name}-deploy.yml",
                "triggers": ["push to main (auto → staging)", "manual dispatch → prod"],
                "deployment_strategy": deployment_strategy,
            },
        }, indent=2)


class CodeReviewSkill(BaseTool):
    name: str = "code_review"
    description: str = (
        "Conduct comprehensive code reviews evaluating architecture compliance, "
        "code quality, security, test coverage, observability, and documentation."
    )

    def _run(self, pr_title: str, pr_description: str, capability: str = "", files_changed: str = "") -> str:
        return json.dumps({
            "skill": "code_review",
            "pr": pr_title,
            "capability": capability,
            "review_dimensions": {
                "Architecture Compliance": "Does implementation match approved solution design?",
                "Engineering Standards": "SOLID, DRY, KISS, clean architecture — all followed?",
                "Code Quality": "Readable, maintainable, well-named — no tech debt introduced?",
                "Security": "Input validation, secrets management, auth — secure by design?",
                "Testing": "Unit tests ≥ 90%, integration tests on critical paths?",
                "Observability": "Structured logs, OTel traces, RED metrics instrumented?",
                "Documentation": "README, API docs, inline comments updated?",
                "Git Compliance": "Atomic commits, conventional messages, clean history?",
            },
            "pr_sla_hours": 12,
            "review_outcome": "APPROVE | REQUEST_CHANGES | COMMENT",
        }, indent=2)


class PairProgrammingSkill(BaseTool):
    name: str = "pair_programming"
    description: str = (
        "Facilitate pair programming sessions for complex implementations, "
        "knowledge transfer, and junior engineer mentoring."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "pair_programming",
            "session_structure": {
                "setup": "Review task, acceptance criteria, and architecture doc together — 5 min",
                "driver_navigator": "Engineer drives, TL navigates — swap every 25 min",
                "test_first": "Write failing test, then implementation to pass — TDD",
                "refactor": "After green tests — refactor together, maintain green",
                "review": "Final review of session output — commit if acceptance criteria met",
            },
            "use_cases": [
                "Complex distributed system implementation",
                "First implementation of a new pattern",
                "Mentoring junior engineers on architectural patterns",
                "Debugging complex production issues",
                "Critical security-sensitive implementations",
            ],
        }, indent=2)


class ArchValidationSkill(BaseTool):
    name: str = "architecture_validation"
    description: str = (
        "Validate implementations against approved solution architectures and ADRs. "
        "Produces compliance report with pass/fail findings and remediation guidance."
    )

    def _run(self, implementation: str, solution_reference: str) -> str:
        return json.dumps({
            "skill": "architecture_validation",
            "implementation": implementation,
            "solution_reference": solution_reference,
            "compliance_checklist": [
                "Component boundaries match solution design",
                "Interface contracts implemented as specified",
                "Technology choices match ADR decisions",
                "Event schemas match defined contracts",
                "API contracts match OpenAPI specification",
                "No new dependencies without ADR",
                "No duplicate services introduced",
                "Scope boundary respected (M10.3 vs M10.4+)",
            ],
            "escalation": "Non-compliant implementations blocked — escalate to Solution Architect",
        }, indent=2)


class PerformanceEngineeringSkill(BaseTool):
    name: str = "performance_engineering"
    description: str = (
        "Identify performance bottlenecks in implementations, validate against SLOs, "
        "and produce optimization recommendations with before/after metrics."
    )

    def _run(self, component: str, target_latency_ms: int = None, target_throughput: str = "") -> str:
        return json.dumps({
            "skill": "performance_engineering",
            "component": component,
            "targets": {
                "p99_latency_ms": target_latency_ms or "TBD with SRE",
                "throughput": target_throughput or "TBD with SRE",
            },
            "profiling_approach": {
                "CPU": "Flamegraph — identify hot functions",
                "Memory": "Heap snapshot / allocation profiler",
                "I/O": "Trace blocking operations — async all the way down",
                "Database": "EXPLAIN ANALYZE on all hot queries",
            },
            "load_test_plan": "Ramp-up (10% → 100% over 5 min) → Steady (10 min) → Spike → Soak (30 min)",
        }, indent=2)


class ScalabilityEngineeringSkill(BaseTool):
    name: str = "scalability_engineering"
    description: str = (
        "Validate horizontal scaling strategies, stateless design, "
        "auto-scaling configurations, and load-shedding mechanisms."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "scalability_engineering",
            "review_checklist": [
                "Service is stateless — all state in external store",
                "No sticky sessions — any instance can handle any request",
                "HPA configured with appropriate triggers (CPU, custom metric)",
                "Connection pool sized for max replica count",
                "Queue-based load levelling for burst handling",
                "Load shedding via circuit breaker when overloaded",
            ],
        }, indent=2)


class DebuggingSkill(BaseTool):
    name: str = "debugging"
    description: str = (
        "Systematically debug distributed system issues using traces, logs, and metrics. "
        "Produces root cause analysis and remediation plan."
    )

    def _run(self, symptom: str, component: str, context: str = "") -> str:
        return json.dumps({
            "skill": "debugging",
            "symptom": symptom,
            "component": component,
            "debugging_methodology": {
                "step_1": "Reproduce reliably — characterise: always / intermittent / load-dependent",
                "step_2": "Check distributed traces — find the slow or failing span",
                "step_3": "Correlate logs at trace_id — find error or state anomaly",
                "step_4": "Check metrics: error rate, latency, saturation around incident time",
                "step_5": "Form hypothesis — test with minimal reproduction",
                "step_6": "Fix → test → verify in staging → deploy",
                "step_7": "Document root cause, fix, and prevention in incident report",
            },
            "context": context or "No context provided — start with traces",
        }, indent=2)


class ObservabilitySkill(BaseTool):
    name: str = "observability"
    description: str = (
        "Enforce observability-by-default: structured logs, OTel distributed traces, "
        "RED metrics, SLO dashboards, and alert runbooks."
    )

    def _run(self, service_name: str, slo_targets: str = "") -> str:
        return json.dumps({
            "skill": "observability",
            "service": service_name,
            "slo_targets": slo_targets or "Availability ≥ 99.9%, p99 latency < 500ms, error rate < 0.1%",
            "instrumentation_checklist": [
                "Structured JSON logs with: timestamp, service, version, level, message, trace_id, correlation_id",
                "OTel spans on every service call — W3C trace context propagated",
                "RED metrics per endpoint: Rate, Errors, Duration",
                "SLO dashboard with error budget burn rate",
                "Alert on: SLO violation, error budget burn > 2x, latency p99 spike",
                "Runbook linked from every alert",
            ],
        }, indent=2)


class LoggingSkill(BaseTool):
    name: str = "logging"
    description: str = (
        "Enforce structured logging standards: log levels, correlation IDs, "
        "PII masking, retention policies, and log shipping configuration."
    )

    def _run(self, service_name: str, slo_targets: str = "") -> str:
        return json.dumps({
            "skill": "logging",
            "review_checklist": [
                "Structured JSON — never printf-style strings",
                "Required fields: timestamp, service, version, level, message, trace_id, correlation_id",
                "Log levels: ERROR (actionable/alert) / WARN (investigate) / INFO (audit trail) / DEBUG (dev only)",
                "PII masked at logger level — never log raw email, name, or payment data",
                "No secrets in logs — ever",
                "Log volume: DEBUG suppressed in production by default",
            ],
        }, indent=2)


class MonitoringSkill(BaseTool):
    name: str = "monitoring"
    description: str = (
        "Design monitoring dashboards, SLO tracking, alert policies, "
        "and incident response runbooks."
    )

    def _run(self, service_name: str, slo_targets: str = "") -> str:
        return json.dumps({
            "skill": "monitoring",
            "dashboard_panels": [
                "Request rate (rpm) — by endpoint",
                "Error rate (%) — by endpoint and error type",
                "p50 / p95 / p99 latency — by endpoint",
                "SLO compliance — error budget remaining",
                "Saturation: CPU, memory, connection pool, queue depth",
            ],
            "alert_rules": [
                "Error rate > 1% for 5 min → page on-call",
                "Error budget burn > 2x for 1h → page on-call",
                "p99 latency > 2x baseline for 5 min → warn",
                "Queue depth > 10k for 2 min → warn",
            ],
        }, indent=2)


class OpenTelemetrySkill(BaseTool):
    name: str = "opentelemetry"
    description: str = (
        "Implement OpenTelemetry instrumentation: spans, metrics, logs, "
        "W3C trace context propagation, and OTLP export configuration."
    )

    def _run(self, service_name: str, slo_targets: str = "") -> str:
        return json.dumps({
            "skill": "opentelemetry",
            "instrumentation_guide": {
                "Traces": "OTel SDK → OTLP exporter → OTel Collector → Jaeger/Tempo",
                "Metrics": "OTel Metrics SDK → Prometheus exporter → Grafana",
                "Logs": "Structured JSON → log shipper → OTel Collector → Loki",
                "Propagation": "W3C TraceContext (traceparent) on HTTP headers and NATS message headers",
                "Sampling": "Head-based 10% + tail-based on errors and slow spans",
            },
            "required_spans": [
                "HTTP request/response (auto-instrumented)",
                "Database query (auto-instrumented)",
                "NATS publish / consume",
                "LLM call (manual with model, tokens, cost attributes)",
                "External API call",
            ],
        }, indent=2)


class TestingStrategiesSkill(BaseTool):
    name: str = "testing_strategies"
    description: str = (
        "Define and enforce comprehensive test strategies: unit, integration, "
        "E2E, performance — aligned with the testing trophy model."
    )

    def _run(self, component: str, test_type: str = "unit", coverage_target: int = 90) -> str:
        return json.dumps({
            "skill": "testing_strategies",
            "component": component,
            "strategy": {
                "unit_tests": f"Coverage target: {coverage_target}% — fast, isolated, deterministic",
                "integration_tests": "100% of critical paths — with real DB/queue via Testcontainers",
                "e2e_tests": "Happy path + key error paths — run in staging pre-production",
                "performance_tests": "Load + soak tests on critical endpoints — run weekly",
                "contract_tests": "Consumer-driven contracts for service boundaries",
            },
            "ci_gates": f"unit ≥ {coverage_target}%, integration on critical paths — block merge on failure",
        }, indent=2)


class UnitTestingSkill(BaseTool):
    name: str = "unit_testing"
    description: str = (
        "Enforce unit test coverage ≥ 90% with fast, isolated, deterministic tests "
        "using appropriate frameworks per language."
    )

    def _run(self, component: str, test_type: str = "unit", coverage_target: int = 90) -> str:
        return json.dumps({
            "skill": "unit_testing",
            "coverage_target_pct": coverage_target,
            "review_checklist": [
                "Tests are FIRST: Fast, Isolated, Repeatable, Self-validating, Timely",
                "One assert per test — clear failure reason",
                "No real network, DB, or filesystem in unit tests",
                "Arrange-Act-Assert structure in every test",
                "Test names describe: Given / When / Then",
                "Mutation testing score > 70% on critical paths",
            ],
            "frameworks": {
                "TypeScript/Node.js": "Vitest / Jest",
                "Python": "pytest with fixtures",
                "Go": "testing package + testify",
                "Java": "JUnit 5 + Mockito",
            },
        }, indent=2)


class IntegrationTestingSkill(BaseTool):
    name: str = "integration_testing"
    description: str = (
        "Enforce integration test coverage of all critical paths between components. "
        "Uses Testcontainers for real infrastructure in CI."
    )

    def _run(self, component: str, test_type: str = "integration", coverage_target: int = 100) -> str:
        return json.dumps({
            "skill": "integration_testing",
            "critical_paths_to_test": [
                "Service API → business logic → database",
                "Event publish → NATS → consumer → projection",
                "API gateway → service → downstream service",
                "Auth flow: token → validation → resource access",
            ],
            "tooling": {
                "Testcontainers": "Real PostgreSQL, Redis, NATS in CI containers",
                "Test isolation": "Each test: fresh DB state via transactions rolled back or truncate",
                "CI": "Integration tests in dedicated job — parallel where possible",
            },
        }, indent=2)


class PerformanceTestingSkill(BaseTool):
    name: str = "performance_testing"
    description: str = (
        "Design and execute load, stress, soak, and spike tests. "
        "Validates SLOs under realistic and peak load conditions."
    )

    def _run(self, component: str, test_type: str = "performance", coverage_target: int = 90) -> str:
        return json.dumps({
            "skill": "performance_testing",
            "test_scenarios": {
                "load_test": "100% expected load — 10 min — verify SLOs met",
                "stress_test": "200% expected load — find breaking point",
                "soak_test": "80% expected load — 60 min — detect memory leaks",
                "spike_test": "0% → 300% in 30s — verify auto-scaling and recovery",
            },
            "tooling": ["k6", "Locust", "Artillery"],
            "success_criteria": "p99 latency within SLO, error rate < 0.1%, no memory growth in soak",
        }, indent=2)


class SecurityBestPracticesSkill(BaseTool):
    name: str = "security_best_practices"
    description: str = (
        "Enforce security in every implementation: input validation, "
        "secrets management, authentication, authorization, and least privilege."
    )

    def _run(self, component: str, threat_vectors: str = "") -> str:
        return json.dumps({
            "skill": "security_best_practices",
            "review_checklist": [
                "Input validation on all external inputs — deny-by-default",
                "Parameterised queries — never string concatenation in SQL",
                "Secrets from Vault/Secret Manager — never in code or env vars",
                "Auth on every endpoint — no unauthenticated routes by accident",
                "AuthZ: RBAC/ABAC — least privilege",
                "CORS: explicit allow list — no wildcard in production",
                "Rate limiting on all public endpoints",
                "Dependency scanning: Dependabot/Snyk — auto-PRs on vulnerabilities",
            ],
            "threat_vectors": threat_vectors or "OWASP Top 10 — validate each item",
        }, indent=2)


class DevSecOpsSkill(BaseTool):
    name: str = "devsecops"
    description: str = (
        "Integrate security scanning (SAST, SCA, DAST, secrets) into all CI/CD pipelines. "
        "Produces DevSecOps pipeline configuration and policy definitions."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "devsecops",
            "pipeline_integration": {
                "SAST": "CodeQL / Semgrep on every PR — block on HIGH+",
                "SCA": "Dependabot / Snyk — auto-PRs for CVEs",
                "Secrets": "git-secrets / Trufflehog — pre-commit hook + CI scan",
                "Container": "Trivy on every image build — block on CRITICAL/HIGH",
                "DAST": "OWASP ZAP on staging — weekly scheduled scan",
                "SBOM": "CycloneDX generated on every release",
                "Policy": "OPA Gatekeeper policies on Kubernetes admission",
            },
        }, indent=2)


class MentoringSkill(BaseTool):
    name: str = "mentoring"
    description: str = (
        "Mentor engineers through code reviews, pair programming, and technical guidance. "
        "Produces a structured mentoring plan for skill development."
    )

    def _run(self, engineer_role: str, topic: str, context: str = "") -> str:
        return json.dumps({
            "skill": "mentoring",
            "engineer_role": engineer_role,
            "topic": topic,
            "mentoring_plan": {
                "objective": f"Help {engineer_role} develop competency in: {topic}",
                "approach": [
                    "Explain the principle with concrete examples",
                    "Show a reference implementation together",
                    "Pair program on a real task applying the principle",
                    "Code review their next implementation with coaching notes",
                    "Reflect in 1:1 on progress and next learning area",
                ],
                "context": context or "Schedule a pairing session to work through this together",
            },
        }, indent=2)


class EngineeringManagementSkill(BaseTool):
    name: str = "engineering_management"
    description: str = (
        "Manage engineering delivery: velocity tracking, blocker resolution, "
        "retrospectives, capacity planning, and team health monitoring."
    )

    def _run(self, objective: str, solution_reference: str = "", constraints: str = "") -> str:
        return json.dumps({
            "skill": "engineering_management",
            "delivery_management": {
                "velocity_tracking": "Story points / tasks completed vs planned — track weekly",
                "blocker_sla": "Resolve within 4 hours — escalate to Solution Architect if architectural",
                "pr_review_sla": "Review within 12 hours — no PR sits unreviewed overnight",
                "retrospective": "After every milestone — What went well / Improvement / Action items",
                "capacity_planning": "Account for holidays, oncall, tech debt allocation (20%)",
            },
            "kpi_dashboard": {
                "build_success_rate": "≥ 99%",
                "pr_review_sla": "< 12h",
                "unit_test_coverage": "≥ 90%",
                "tech_debt_growth": "< 2% per sprint",
            },
        }, indent=2)


class TechnicalDocumentationSkill(BaseTool):
    name: str = "technical_documentation"
    description: str = (
        "Enforce documentation standards: README, API docs, runbooks, ADRs, "
        "and architecture diagrams as required artifacts for every feature."
    )

    def _run(self, document_type: str, component: str) -> str:
        return json.dumps({
            "skill": "technical_documentation",
            "document_type": document_type,
            "component": component,
            "documentation_standards": {
                "README": "Purpose, setup, configuration, local dev, API reference, troubleshooting",
                "API Docs": "OpenAPI 3.1 spec — hosted at /docs — examples for every endpoint",
                "Runbook": "Alert name → symptoms → root causes → remediation steps → escalation",
                "ADR": "Status, Context, Decision, Consequences — one file per decision",
                "Architecture": "C4 diagrams (context + container + component) — Mermaid in repo",
            },
            "definition_of_done": "No PR merged without updated documentation for changed components",
        }, indent=2)


class ReleaseEngineeringSkill(BaseTool):
    name: str = "release_engineering"
    description: str = (
        "Manage release readiness: pre-release checklists, deployment coordination, "
        "canary rollout monitoring, and post-release validation."
    )

    def _run(self, feature_name: str, checklist_items: str = "") -> str:
        return json.dumps({
            "skill": "release_engineering",
            "feature": feature_name,
            "release_checklist": [
                "All acceptance criteria verified",
                "Unit test coverage ≥ 90%",
                "Integration tests passing",
                "Architecture compliance validated",
                "Security review signed off",
                "Performance validated against SLOs",
                "Observability instrumented and verified in staging",
                "Documentation updated (README, API, runbook, ADR)",
                "GitHub Actions all green",
                "Rollback plan documented",
                "On-call briefed on changes",
                *(checklist_items.split(",") if checklist_items else []),
            ],
            "deployment_strategy": "Blue-green — zero-downtime, instant rollback",
            "post_release_monitoring": "15 min intensive monitoring — error rate, latency, saturation",
        }, indent=2)


class DeveloperExperienceSkill(BaseTool):
    name: str = "developer_experience"
    description: str = (
        "Continuously improve developer experience: faster builds, better tooling, "
        "reduced friction, cleaner APIs, and improved local development setup."
    )

    def _run(self, friction_area: str, current_state: str = "") -> str:
        return json.dumps({
            "skill": "developer_experience",
            "friction_area": friction_area,
            "current_state": current_state or "Not described",
            "improvement_framework": {
                "Measure": "Time to first build, CI duration, local setup time, PR iteration cycles",
                "Identify": "Top 3 friction points from engineer feedback",
                "Prioritise": "Impact × Effort matrix — quick wins first",
                "Implement": "Automate, document, template — reduce cognitive load",
                "Validate": "Measure improvement vs baseline — track developer satisfaction",
            },
            "common_dx_improvements": [
                "Docker Compose for full local stack in one command",
                "Pre-commit hooks: auto-lint, type-check, secret scan",
                "Makefile / Taskfile with common dev commands",
                "VS Code dev containers for consistent environments",
                "Fast CI: cache deps, parallelise jobs, test sharding",
            ],
        }, indent=2)


class ImplementationPlanSkill(BaseTool):
    name: str = "implementation_planning"
    description: str = (
        "Decompose an approved solution architecture into a complete engineering "
        "implementation plan: work packages, tasks, assignments, Git workflows, and CI/CD config."
    )

    def _run(self, solution_architecture: str, sprint_length_days: int = 14, available_engineers: str = "") -> str:
        return json.dumps({
            "skill": "implementation_planning",
            "solution_reference": solution_architecture,
            "sprint_length_days": sprint_length_days,
            "plan_structure": {
                "work_packages": "One per engineering capability (Backend, Frontend, AI, DevOps, QA)",
                "tasks": "Atomic, 1–3 day tasks per work package with acceptance criteria",
                "git_workflow": "Worktree + branch + PR spec per task",
                "test_requirements": "Unit + integration requirements per task",
                "capability_assignments": "Explicit specialist per work package",
            },
            "available_engineers": available_engineers or "Derived from EIOS engineering roster",
        }, indent=2)


class TechDebtManagementSkill(BaseTool):
    name: str = "technical_debt_management"
    description: str = (
        "Identify, register, and prioritise technical debt. "
        "Produces debt register entries and remediation recommendations."
    )

    def _run(self, area: str, description: str, severity: str = "medium") -> str:
        return json.dumps({
            "skill": "technical_debt_management",
            "debt_item": {
                "area": area,
                "description": description,
                "severity": severity,
                "remediation": "Assess effort → schedule within 2 sprints for high/critical",
                "tracking": "Register in technical debt backlog — link to originating PR",
            },
            "debt_policy": {
                "critical": "Block next sprint planning until resolved",
                "high": "Schedule in next sprint (within 2 weeks)",
                "medium": "Backlog — resolve within 2 sprints",
                "low": "Backlog — opportunistic resolution",
                "growth_limit": "< 2% new debt per sprint",
            },
        }, indent=2)


# ===========================================================================
# Skill Registry
# ===========================================================================

TECHNICAL_LEAD_SKILLS = [
    TechnicalLeadershipSkill(),
    SoftwareEngineeringSkill(),
    SystemDesignSkill(),
    BackendDevelopmentSkill(),
    FrontendDevelopmentSkill(),
    AIEngineeringSkill(),
    DistributedSystemsSkill(),
    CloudComputingSkill(),
    MicroservicesSkill(),
    ModularMonolithSkill(),
    EventDrivenArchSkill(),
    CQRSSkill(),
    EventSourcingSkill(),
    RESTAPISkill(),
    GraphQLSkill(),
    GRPCSkill(),
    TypeScriptSkill(),
    NodeJSSkill(),
    PythonSkill(),
    JavaSkill(),
    GoSkill(),
    ReactSkill(),
    NextJSSkill(),
    SpringBootSkill(),
    DatabaseDesignSkill(),
    SQLSkill(),
    NoSQLSkill(),
    RedisSkill(),
    PostgreSQLSkill(),
    DockerSkill(),
    KubernetesSkill(),
    CICDSkill(),
    GitWorkflowSkill(),
    GitHubSkill(),
    GitHubActionsSkill(),
    CodeReviewSkill(),
    PairProgrammingSkill(),
    ArchValidationSkill(),
    PerformanceEngineeringSkill(),
    ScalabilityEngineeringSkill(),
    DebuggingSkill(),
    ObservabilitySkill(),
    LoggingSkill(),
    MonitoringSkill(),
    OpenTelemetrySkill(),
    TestingStrategiesSkill(),
    UnitTestingSkill(),
    IntegrationTestingSkill(),
    PerformanceTestingSkill(),
    SecurityBestPracticesSkill(),
    DevSecOpsSkill(),
    MentoringSkill(),
    EngineeringManagementSkill(),
    TechnicalDocumentationSkill(),
    ReleaseEngineeringSkill(),
    DeveloperExperienceSkill(),
    ImplementationPlanSkill(),
    TechDebtManagementSkill(),
]

__all__ = ["TECHNICAL_LEAD_SKILLS"]
