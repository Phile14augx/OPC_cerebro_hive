"""
BackendEngineerAgent — Senior Backend Engineer & Distributed Systems Developer.

Role        : Senior Backend Engineer & Distributed Systems Developer
Capability  : BackendEngineer
Temperature : 0.1  (deterministic — production-quality implementations)
Model       : claude-opus-4-5
Reasoning   : enabled, max_attempts=15
Memory      : enabled

This agent is the implementation specialist responsible for building server-side
capabilities of the CerebroHive EIOS. It translates approved technical specs into
production-ready backend services: REST/GraphQL/gRPC APIs, event-driven processors,
domain services, repositories, authentication modules, and platform integrations.

Unlike strategic agents (CEO, Architect, TL), this agent PRODUCES implementations:
actual code, SQL schemas, OpenAPI specs, test suites, and deployment configs.

Lifecycle:
  plan()    → implementation plan: decompose spec into files, endpoints, schemas, tests
  execute() → produce implementation: code, schemas, specs, test stubs
  observe() → quality scoring: coverage, API completeness, security checks, observability
  reflect() → improvement suggestions: perf, patterns, test gaps, tech debt
"""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

_SYSTEM = """\
You are a Senior Backend Engineer for the CerebroHive Enterprise Intelligence \
Operating System (EIOS), reporting to the Technical Lead.

IDENTITY
--------
You possess decades of simulated experience designing and building enterprise \
software platforms, distributed systems, cloud-native services, AI infrastructure, \
workflow engines, developer platforms, event-driven systems, and mission-critical APIs.

You specialize in transforming approved solution architectures and technical \
specifications into reliable, production-ready backend services with high code \
quality, comprehensive testing, and full observability.

PRIME DIRECTIVES
----------------
1.  Read the technical specification and architecture doc BEFORE writing a single \
    line of code. Understand the business capability first.
2.  Design the API contract (OpenAPI / AsyncAPI) before implementing the endpoint. \
    API-first, always.
3.  Follow Clean Architecture: domain layer at the core — no framework bleed into \
    business logic.
4.  Apply SOLID principles in every module — especially Single Responsibility and \
    Dependency Inversion.
5.  Use Domain-Driven Design for business-heavy services: aggregates, value objects, \
    domain events, repositories.
6.  Check the platform capability registry BEFORE building a new service. \
    Reuse over rebuild. Duplicate services = 0.
7.  Every implementation includes: input validation, structured error handling, \
    structured logging (JSON + correlation ID), OTel distributed traces, \
    RED metrics, configuration management, unit tests (≥ 90% coverage), \
    and integration tests on all critical paths.
8.  Security by design: parameterised queries, secrets from vault/Secret Manager, \
    auth on every endpoint, input sanitisation, OWASP Top 10 reviewed.
9.  Async all the way: never block the event loop. Use AsyncGenerator for streaming.
10. Use NATS JetStream for internal event messaging — not Kafka unless already \
    present in the platform.
11. Enforce the Git workflow: atomic commits with conventional messages, \
    one branch per task, GitHub Actions must pass, worktree deleted after merge.
12. Performance targets: p99 latency defined per endpoint, N+1 queries \
    eliminated, connection pools sized for workload.
13. Database migrations: sequential, reversible, zero-downtime compatible.
14. Never deploy untested code. Unit tests must pass before PR creation. \
    Integration tests must pass in CI before merge.
15. Document every public API with OpenAPI 3.1 and every event with AsyncAPI 2.x.

PREFERRED TECHNOLOGY STACK
---------------------------
Runtime       : TypeScript / Node.js (primary), Python / FastAPI (AI services), Go (perf-critical)
Framework     : NestJS (enterprise), Fastify (high-perf), Express.js (lightweight)
ORM           : Prisma (TypeScript), SQLAlchemy / SQLModel (Python)
Database      : PostgreSQL (primary), Redis (cache/queue), MongoDB (document when needed)
Messaging     : NATS JetStream (internal), Kafka (external/legacy when required)
Auth          : OAuth2 / OIDC (Keycloak / Auth0), JWT short-lived tokens, RBAC/ABAC
Observability : OpenTelemetry SDK → OTLP collector, Prometheus metrics, structured JSON logs
Container     : Multi-stage Docker (distroless), Kubernetes with HPA, PDB, network policies
CI/CD         : GitHub Actions — lint → type-check → unit tests → build → SAST → push

SKILLS
------
Backend Engineering, Distributed Systems, Cloud-Native Development, Microservices,
Modular Monoliths, TypeScript, Node.js, NestJS, Express.js, Fastify, Python,
FastAPI, Java, Spring Boot, Go, REST APIs, GraphQL, gRPC, WebSockets,
Event-Driven Architecture, CQRS, Event Sourcing, NATS, Kafka, Redis,
PostgreSQL, MySQL, MongoDB, Prisma ORM, Drizzle ORM, SQL Optimization,
Caching, Authentication, Authorization, OAuth2, OIDC, JWT, RBAC, ABAC,
Secrets Management, Docker, Kubernetes, OpenTelemetry, Prometheus, Grafana,
Logging, Tracing, Performance Optimization, Concurrency, Async Programming,
Testing, Unit Testing, Integration Testing, Contract Testing, API Versioning,
CI/CD, Git, GitHub Actions, Security Best Practices, OWASP, Software Architecture,
Clean Architecture, SOLID Principles.

OUTPUT FORMAT (strict JSON)
---------------------------
{
  "implementation_summary": "...",
  "capability": "business capability being implemented",
  "architecture_reference": "solution doc or ADR reference",
  "api_design": {
    "type": "REST|GraphQL|gRPC|Event",
    "endpoints": [
      {
        "method": "GET|POST|PUT|PATCH|DELETE",
        "path": "/v1/resource",
        "summary": "...",
        "request_schema": "TypeScript interface or JSON Schema",
        "response_schema": "TypeScript interface or JSON Schema",
        "auth_required": true,
        "rate_limited": true
      }
    ],
    "events": [
      {
        "subject": "domain.aggregate.event",
        "direction": "publish|consume",
        "schema": "TypeScript interface"
      }
    ]
  },
  "implementation": {
    "files": [
      {
        "path": "src/...",
        "type": "service|controller|repository|domain|dto|schema|test|config",
        "description": "what this file contains",
        "code": "full implementation or detailed stub"
      }
    ],
    "database": {
      "schema_changes": "Prisma schema or SQL DDL",
      "migration_notes": "zero-downtime strategy"
    },
    "dependencies": ["package@version"]
  },
  "test_plan": {
    "unit_tests": [
      {
        "file": "src/...spec.ts",
        "scenarios": ["describe: when X, it should Y"]
      }
    ],
    "integration_tests": [
      {
        "file": "test/...e2e-spec.ts",
        "scenarios": ["describe: POST /v1/resource, it should return 201"]
      }
    ]
  },
  "observability": {
    "log_events": ["..."],
    "trace_spans": ["..."],
    "metrics": ["..."]
  },
  "security_review": {
    "auth_method": "...",
    "input_validation": "...",
    "secrets_management": "...",
    "owasp_checklist": ["..."]
  },
  "git_workflow": {
    "branch": "feat/<task-id>-<slug>",
    "commit_message": "feat(<scope>): <imperative description>",
    "pr_title": "...",
    "worktree": "worktrees/feat/<task-id>-<slug>"
  },
  "performance": {
    "latency_targets": {"p50": "...", "p95": "...", "p99": "..."},
    "caching_strategy": "...",
    "db_query_optimization": "..."
  },
  "confidence": 0.0
}
"""

# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

_REQUIRED_KEYS = {
    "implementation_summary",
    "api_design",
    "implementation",
    "test_plan",
}

_QUALITY_KEYS = {
    "observability",
    "security_review",
    "git_workflow",
    "performance",
}

_OWASP_TOP10 = [
    "injection",
    "broken_auth",
    "sensitive_data_exposure",
    "xml_external_entities",
    "broken_access_control",
    "security_misconfiguration",
    "xss",
    "insecure_deserialization",
    "vulnerable_components",
    "insufficient_logging",
]


def _score_implementation(result: dict[str, Any]) -> float:
    """Score 0–1 reflecting backend implementation quality."""
    present = sum(1 for k in _REQUIRED_KEYS if result.get(k))
    base = present / len(_REQUIRED_KEYS)

    qual_present = sum(1 for k in _QUALITY_KEYS if result.get(k))
    qual_bonus = (qual_present / len(_QUALITY_KEYS)) * 0.10

    # API completeness
    endpoints = result.get("api_design", {}).get("endpoints", [])
    with_schema = sum(1 for e in endpoints if e.get("request_schema") or e.get("response_schema"))
    api_bonus = (with_schema / max(len(endpoints), 1)) * 0.08

    # Implementation files
    files = result.get("implementation", {}).get("files", [])
    with_code = sum(1 for f in files if f.get("code"))
    file_bonus = (with_code / max(len(files), 1)) * 0.08

    # Test coverage
    unit_tests = result.get("test_plan", {}).get("unit_tests", [])
    integration_tests = result.get("test_plan", {}).get("integration_tests", [])
    test_bonus = min((len(unit_tests) + len(integration_tests)) * 0.02, 0.08)

    # Security
    owasp = result.get("security_review", {}).get("owasp_checklist", [])
    security_bonus = min(len(owasp) * 0.01, 0.06)

    return min(base + qual_bonus + api_bonus + file_bonus + test_bonus + security_bonus, 1.0)


# ---------------------------------------------------------------------------
# BackendEngineerAgent
# ---------------------------------------------------------------------------


class BackendEngineerAgent(BaseHiveAgent):
    """
    Backend Engineer — Senior Backend Engineer & Distributed Systems Developer.

    Capability tag: "BackendEngineer"
    """

    capability = "BackendEngineer"
    name = "Backend Engineer — Senior Backend Engineer & Distributed Systems Developer"

    # ------------------------------------------------------------------
    # plan(): decompose task into files, endpoints, schemas, tests
    # ------------------------------------------------------------------

    def plan(self, req: ExecuteRequest) -> dict[str, Any]:
        """
        Decompose the implementation task into:
        API design → file structure → data models → test plan → observability plan.

        API-first: endpoint contracts are defined before any code is produced.
        """
        prompt = (
            f"Task: {req.objective}\n\n"
            f"Context:\n{json.dumps(req.input, indent=2) if req.input else 'none'}\n\n"
            "Produce a complete backend implementation plan following the output format exactly.\n\n"
            "Step 1 — API Design first:\n"
            "  Define every endpoint: method, path, request schema, response schema, auth, rate limiting.\n"
            "  Define every event: NATS subject, direction (publish/consume), schema.\n\n"
            "Step 2 — Implementation plan:\n"
            "  List every file needed: controller, service, repository, domain, DTO, schema, migration, test.\n"
            "  Include Clean Architecture layer: domain | application | infrastructure | presentation.\n"
            "  Write complete implementation or a detailed stub with all method signatures.\n\n"
            "Step 3 — Test plan:\n"
            "  Unit test scenarios for every service method and domain rule.\n"
            "  Integration test scenarios for every API endpoint and event consumer.\n\n"
            "Step 4 — Observability:\n"
            "  Structured log events with correlation_id and trace_id fields.\n"
            "  OTel span names for every service call and DB query.\n"
            "  RED metrics: request rate, error rate, duration histograms per endpoint.\n\n"
            "Step 5 — Security review:\n"
            "  Auth method, input validation approach, secrets management, OWASP checklist.\n\n"
            "Enforce: NATS JetStream (not Kafka) for internal messaging, "
            "parameterised queries only, secrets from vault, async/await throughout, "
            "conventional commit message, Git worktree spec.\n"
            "Set confidence honestly — never inflate it."
        )

        raw = self._call_llm(_SYSTEM, prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "implementation_summary": raw[:500],
                "capability": req.input.get("capability", "unknown"),
                "architecture_reference": req.input.get("architecture_reference", "unknown"),
                "api_design": {"type": "REST", "endpoints": [], "events": []},
                "implementation": {"files": [], "database": {}, "dependencies": []},
                "test_plan": {"unit_tests": [], "integration_tests": []},
                "observability": {"log_events": [], "trace_spans": [], "metrics": []},
                "security_review": {
                    "auth_method": "JWT Bearer",
                    "input_validation": "class-validator / zod",
                    "secrets_management": "Vault / Secret Manager",
                    "owasp_checklist": [],
                },
                "git_workflow": {
                    "branch": "feat/unknown-task",
                    "commit_message": "feat: initial implementation",
                    "pr_title": "feat: implement backend service",
                    "worktree": "worktrees/feat/unknown-task",
                },
                "performance": {},
                "confidence": 0.3,
                "_parse_error": True,
            }

    # ------------------------------------------------------------------
    # execute(): produce the implementation output
    # ------------------------------------------------------------------

    def execute(self, req: ExecuteRequest, plan: dict[str, Any]) -> dict[str, Any]:
        """
        Backend Engineer produces code. Given the plan, the LLM generates
        implementation files, schemas, test suites, and configuration.
        """
        api_design = plan.get("api_design", {})
        endpoints = api_design.get("endpoints", [])
        events = api_design.get("events", [])
        impl = plan.get("implementation", {})
        files = impl.get("files", [])
        test_plan = plan.get("test_plan", {})
        observability = plan.get("observability", {})
        security = plan.get("security_review", {})

        # Security checks
        owasp_checklist = security.get("owasp_checklist", [])
        endpoints_without_auth = [e for e in endpoints if not e.get("auth_required")]
        endpoints_without_rate_limit = [e for e in endpoints if not e.get("rate_limited")]

        # API completeness
        endpoints_missing_schema = [
            e for e in endpoints
            if not e.get("request_schema") and e.get("method") in ("POST", "PUT", "PATCH")
        ]

        # File coverage checks
        has_tests = bool(test_plan.get("unit_tests")) or bool(test_plan.get("integration_tests"))
        has_observability = bool(observability.get("trace_spans")) and bool(observability.get("metrics"))
        has_migration = bool(impl.get("database", {}).get("schema_changes"))

        # Build coverage map
        layer_coverage = {
            "domain": any(f.get("type") == "domain" for f in files),
            "application": any(f.get("type") == "service" for f in files),
            "infrastructure": any(f.get("type") in ("repository", "schema") for f in files),
            "presentation": any(f.get("type") == "controller" for f in files),
        }

        # Production readiness
        production_ready = (
            has_tests
            and has_observability
            and len(endpoints_without_auth) == 0
            and len(owasp_checklist) >= 5
            and bool(files)
        )

        return {
            "implementation_plan": plan,
            "implementation_summary": plan.get("implementation_summary", ""),
            "capability": plan.get("capability", ""),
            "architecture_reference": plan.get("architecture_reference", ""),
            "api_design": api_design,
            "total_endpoints": len(endpoints),
            "total_events": len(events),
            "implementation_files": files,
            "total_files": len(files),
            "layer_coverage": layer_coverage,
            "test_plan": test_plan,
            "total_unit_tests": len(test_plan.get("unit_tests", [])),
            "total_integration_tests": len(test_plan.get("integration_tests", [])),
            "has_tests": has_tests,
            "observability": observability,
            "has_observability": has_observability,
            "security_review": security,
            "owasp_checklist_count": len(owasp_checklist),
            "endpoints_without_auth": [e.get("path") for e in endpoints_without_auth],
            "endpoints_without_rate_limit": [e.get("path") for e in endpoints_without_rate_limit],
            "endpoints_missing_schema": [e.get("path") for e in endpoints_missing_schema],
            "has_db_migration": has_migration,
            "dependencies": impl.get("dependencies", []),
            "git_workflow": plan.get("git_workflow", {}),
            "performance": plan.get("performance", {}),
            "confidence": plan.get("confidence", 0.0),
            "production_ready": production_ready,
        }

    # ------------------------------------------------------------------
    # observe(): quality scoring
    # ------------------------------------------------------------------

    def observe(self, req: ExecuteRequest, result: dict[str, Any]) -> dict[str, Any]:
        quality_score = _score_implementation(result.get("implementation_plan", {}))

        no_auth = result.get("endpoints_without_auth", [])
        no_rate_limit = result.get("endpoints_without_rate_limit", [])
        missing_schema = result.get("endpoints_missing_schema", [])
        owasp_count = result.get("owasp_checklist_count", 0)
        layer_coverage = result.get("layer_coverage", {})
        missing_layers = [k for k, v in layer_coverage.items() if not v]

        return {
            "hasOutput": bool(result.get("implementation_files")),
            "totalEndpoints": result.get("total_endpoints", 0),
            "totalEvents": result.get("total_events", 0),
            "totalFiles": result.get("total_files", 0),
            "unitTests": result.get("total_unit_tests", 0),
            "integrationTests": result.get("total_integration_tests", 0),
            "hasTests": result.get("has_tests", False),
            "hasObservability": result.get("has_observability", False),
            "hasDbMigration": result.get("has_db_migration", False),
            "endpointsWithoutAuth": len(no_auth),
            "endpointsWithoutRateLimit": len(no_rate_limit),
            "endpointsMissingSchema": len(missing_schema),
            "owaspChecklistCount": owasp_count,
            "missingArchLayers": missing_layers,
            "productionReady": result.get("production_ready", False),
            "qualityScore": quality_score,
            "notes": (
                f"Implementation with {result.get('total_files', 0)} file(s), "
                f"{result.get('total_endpoints', 0)} endpoint(s), "
                f"{result.get('total_events', 0)} event(s). "
                f"Tests: {result.get('total_unit_tests', 0)} unit + "
                f"{result.get('total_integration_tests', 0)} integration. "
                f"Auth gaps: {len(no_auth)}. OWASP items: {owasp_count}. "
                f"Missing arch layers: {missing_layers}. "
                f"{'✓ Production ready.' if result.get('production_ready') else '⚠ Not yet production ready.'}"
            ),
        }

    # ------------------------------------------------------------------
    # reflect(): improvement suggestions
    # ------------------------------------------------------------------

    def reflect(
        self,
        req: ExecuteRequest,
        result: dict[str, Any],
        observation: dict[str, Any],
    ) -> dict[str, Any]:
        suggestions: list[str] = []

        if observation.get("endpointsWithoutAuth", 0) > 0:
            suggestions.append(
                f"{observation['endpointsWithoutAuth']} endpoint(s) have no auth — "
                "every endpoint must require authentication. Add JWT Bearer guard or API key validation."
            )
        if observation.get("endpointsMissingSchema", 0) > 0:
            suggestions.append(
                f"{observation['endpointsMissingSchema']} POST/PUT/PATCH endpoint(s) missing request schema — "
                "all write endpoints need a validated DTO/Pydantic model. No untyped request bodies."
            )
        if not observation.get("hasTests"):
            suggestions.append(
                "No tests produced — unit tests (≥ 90% coverage) and integration tests "
                "(all critical paths) are mandatory before PR creation. Write tests first."
            )
        elif observation.get("unitTests", 0) == 0:
            suggestions.append(
                "No unit tests — add tests for every service method, domain rule, "
                "and validation logic. Target: ≥ 90% coverage."
            )
        elif observation.get("integrationTests", 0) == 0:
            suggestions.append(
                "No integration tests — add end-to-end tests for every API endpoint "
                "and event consumer using Testcontainers with a real database."
            )
        if not observation.get("hasObservability"):
            suggestions.append(
                "Observability incomplete — add OTel span names for every service call and DB query, "
                "and RED metrics (request rate, error rate, duration) per endpoint."
            )
        if observation.get("owaspChecklistCount", 0) < 5:
            suggestions.append(
                f"Security review incomplete — only {observation.get('owaspChecklistCount', 0)} OWASP items checked. "
                "Review all OWASP Top 10: injection, broken auth, sensitive data, access control, "
                "security misconfiguration, XSS, insecure deserialization, vulnerable components, logging."
            )
        if observation.get("missingArchLayers"):
            layers = observation["missingArchLayers"]
            suggestions.append(
                f"Missing Clean Architecture layer(s): {layers} — "
                "domain (entities, value objects), application (services), "
                "infrastructure (repositories, schemas), and presentation (controllers) "
                "are all required for enterprise backend services."
            )
        if not observation.get("hasDbMigration") and observation.get("totalFiles", 0) > 0:
            suggestions.append(
                "No database migration included — every schema change needs a "
                "zero-downtime migration script (Prisma migrate / Alembic / Flyway)."
            )
        if not result.get("git_workflow", {}).get("branch"):
            suggestions.append(
                "No Git workflow spec — specify: worktree name, branch name, "
                "conventional commit message (feat|fix|refactor), and PR title."
            )

        return {
            "objectiveClarity": (
                "clear" if observation.get("totalFiles", 0) > 0 else "ambiguous"
            ),
            "executionStrategy": "api_first_backend_implementation",
            "implementationRigour": (
                "high" if observation.get("qualityScore", 0) >= 0.8
                else "medium" if observation.get("qualityScore", 0) >= 0.6
                else "low"
            ),
            "qualityScore": observation.get("qualityScore", 0.0),
            "suggestions": suggestions,
            "productionChecklist": {
                "apiContractsDefined": observation.get("endpointsMissingSchema", 0) == 0,
                "allEndpointsAuthenticated": observation.get("endpointsWithoutAuth", 0) == 0,
                "unitTestsPresent": observation.get("unitTests", 0) > 0,
                "integrationTestsPresent": observation.get("integrationTests", 0) > 0,
                "observabilityInstrumented": observation.get("hasObservability", False),
                "securityReviewed": observation.get("owaspChecklistCount", 0) >= 5,
                "cleanArchitectureLayers": len(observation.get("missingArchLayers", [])) == 0,
                "dbMigrationPresent": observation.get("hasDbMigration", False),
                "productionReady": observation.get("productionReady", False),
            },
            "kpiTargets": {
                "codeQualityScore": "≥ 95%",
                "unitTestCoverage": "≥ 90%",
                "integrationTestCoverage": "≥ 100%",
                "apiAvailability": "≥ 99.9%",
                "criticalBugs": "= 0",
                "performanceSLACompliance": "≥ 99%",
                "architectureCompliance": "≥ 100%",
                "githubActionsSuccess": "≥ 99%",
                "meanTimeToBugResolutionHours": "< 24",
                "technicalDebtGrowth": "< 2%",
                "deploymentSuccessRate": "≥ 99%",
            },
        }
