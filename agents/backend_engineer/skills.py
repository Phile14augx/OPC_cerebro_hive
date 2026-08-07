"""Backend Engineer agent skills.

Each skill is a CrewAI-compatible BaseTool subclass. Unlike strategic agent skills
that return plans and schemas, Backend Engineer skills produce IMPLEMENTATION OUTPUT:
code snippets, SQL schemas, API specs, test files, Docker configs, and CI/CD workflows.
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
        name: str = ""
        description: str = ""

        def __init_subclass__(cls, **kwargs: Any) -> None:
            super().__init_subclass__(**kwargs)

        def run(self, **kwargs: Any) -> str:
            return self._run(**kwargs)

        def _run(self, **kwargs: Any) -> str:
            raise NotImplementedError


# ===========================================================================
# Input Schemas
# ===========================================================================

class ServiceInput(BaseModel):
    service_name: str = Field(..., description="Name of the service/module to implement.")
    description: str = Field(..., description="What this service does.")
    language: str = Field(default="TypeScript", description="Implementation language: TypeScript|Python|Go|Java.")
    framework: str = Field(default="NestJS", description="Framework: NestJS|FastAPI|Fastify|Express|Spring Boot|Go stdlib.")


class APIInput(BaseModel):
    resource: str = Field(..., description="REST resource name (e.g. 'tools', 'executions', 'agents').")
    operations: str = Field(..., description="CRUD operations to implement: list,get,create,update,delete.")
    auth_required: bool = Field(default=True, description="Whether endpoints require authentication.")
    versioned: bool = Field(default=True, description="Whether to version the API under /v1/.")


class SchemaInput(BaseModel):
    entity: str = Field(..., description="Database entity/table name.")
    fields: str = Field(..., description="Fields and types to include in the schema.")
    relations: Optional[str] = Field(None, description="Relations to other entities.")
    db: str = Field(default="postgresql", description="Database: postgresql|mysql|mongodb.")


class EventInput(BaseModel):
    domain: str = Field(..., description="Domain name (e.g. 'tool', 'execution', 'agent').")
    event_name: str = Field(..., description="Event name in past tense (e.g. 'created', 'completed', 'failed').")
    direction: str = Field(default="publish", description="Direction: publish|consume.")
    schema_fields: Optional[str] = Field(None, description="Event payload fields.")


class AuthInput(BaseModel):
    auth_type: str = Field(default="jwt", description="Auth type: jwt|oauth2|api_key|oidc.")
    scope: Optional[str] = Field(None, description="OAuth2 scope or RBAC role requirements.")
    resource: Optional[str] = Field(None, description="Resource being protected.")


class CacheInput(BaseModel):
    key_pattern: str = Field(..., description="Cache key pattern (e.g. 'user:{id}:profile').")
    ttl_seconds: int = Field(default=300, description="Cache TTL in seconds.")
    strategy: str = Field(default="cache-aside", description="Strategy: cache-aside|write-through|read-through.")


class TestInput(BaseModel):
    component: str = Field(..., description="Component to write tests for.")
    test_type: str = Field(default="unit", description="Test type: unit|integration|contract|performance.")
    scenarios: Optional[str] = Field(None, description="Test scenarios to cover.")


class MigrationInput(BaseModel):
    migration_name: str = Field(..., description="Migration name (snake_case).")
    change_description: str = Field(..., description="What this migration changes.")
    zero_downtime: bool = Field(default=True, description="Whether zero-downtime strategy is required.")


class ObservabilityInput(BaseModel):
    service_name: str = Field(..., description="Service to instrument.")
    endpoints: Optional[str] = Field(None, description="Endpoints to add RED metrics for.")
    span_operations: Optional[str] = Field(None, description="Operations to add OTel spans to.")


class DockerInput(BaseModel):
    service_name: str = Field(..., description="Service name to containerise.")
    runtime: str = Field(default="node", description="Runtime: node|python|go|java.")
    port: int = Field(default=3000, description="Port the service listens on.")


class CICDInput(BaseModel):
    service_name: str = Field(..., description="Service to configure CI/CD for.")
    test_command: str = Field(default="npm test", description="Test command.")
    build_command: str = Field(default="npm run build", description="Build command.")


class PerformanceInput(BaseModel):
    component: str = Field(..., description="Component or query to optimise.")
    current_latency_ms: Optional[int] = Field(None, description="Current p99 latency if known.")
    target_latency_ms: Optional[int] = Field(None, description="Target p99 latency.")


class SecurityInput(BaseModel):
    component: str = Field(..., description="Component to security-review.")
    threat_vectors: Optional[str] = Field(None, description="Known threats to check.")


class GitInput(BaseModel):
    task_id: str = Field(..., description="Task ID for branch naming.")
    feature_slug: str = Field(..., description="Feature slug (kebab-case).")
    change_type: str = Field(default="feat", description="Conventional commit type: feat|fix|refactor|chore|test|docs.")


# ===========================================================================
# Skill Implementations
# ===========================================================================

class BackendEngineeringSkill(BaseTool):
    name: str = "backend_engineering"
    description: str = (
        "Design and implement production-ready backend services. "
        "Produces service structure, implementation plan, and file scaffolding."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "backend_engineering",
            "service": service_name,
            "language": language,
            "framework": framework,
            "architecture": "Clean Architecture — domain → application → infrastructure → presentation",
            "file_structure": {
                f"src/{service_name}/domain/{service_name}.entity.ts": "Domain entity — no framework dependencies",
                f"src/{service_name}/domain/{service_name}.repository.interface.ts": "Repository interface — domain layer contract",
                f"src/{service_name}/application/{service_name}.service.ts": "Application service — use cases",
                f"src/{service_name}/application/dto/": "DTOs — request/response shapes with validation decorators",
                f"src/{service_name}/infrastructure/{service_name}.repository.ts": "Repository implementation — Prisma/TypeORM",
                f"src/{service_name}/presentation/{service_name}.controller.ts": "HTTP controller — routing, auth guards",
                f"src/{service_name}/{service_name}.module.ts": "NestJS module wiring",
                f"src/{service_name}/application/{service_name}.service.spec.ts": "Unit tests — service layer",
                f"test/{service_name}.e2e-spec.ts": "Integration tests — full HTTP stack",
            },
            "checklist": [
                "Domain entity has no framework imports",
                "Repository interface defined in domain layer",
                "Service depends on interface, not implementation",
                "Controller validates input via class-validator / zod",
                "All methods have OTel spans",
                "All errors produce structured RFC 9457 responses",
            ],
        }, indent=2)


class DistributedSystemsSkill(BaseTool):
    name: str = "distributed_systems"
    description: str = (
        "Implement distributed system patterns: leasing, circuit breakers, "
        "NATS event streaming, retries, DLQ, and ExecutionJournal."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "distributed_systems",
            "patterns": {
                "Lease Management": "Requested→Reserved→Active→Completed→Released state machine",
                "Circuit Breaker": "opossum (Node.js) / resilience4j (Java) — per upstream dependency",
                "Retry": "Exponential backoff + jitter via p-retry — max 3 attempts, idempotent handlers only",
                "DLQ": "NATS dead letter subject — MaxDeliver configured, monitored, alerted",
                "Journal": "ExecutionJournal — append-only event log for replay, audit, debug, resume",
                "Idempotency": "Idempotency key on every write — deduplication via Redis SET NX",
            },
            "nats_implementation": {
                "publish": "jetstream.publish(subject, data, { msgID: idempotencyKey })",
                "consume": "jetstream.subscribe(subject, { durable, deliverPolicy, ackPolicy: 'explicit' })",
                "dlq": "maxDeliver: 3 → nack → dead letter subject → alert",
            },
        }, indent=2)


class CloudNativeSkill(BaseTool):
    name: str = "cloud_native_development"
    description: str = (
        "Implement cloud-native 12-factor services with health probes, "
        "graceful shutdown, config from environment, and stateless design."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "cloud_native_development",
            "twelve_factor": {
                "Config": "process.env — never hardcoded. Validated with zod/joi on startup.",
                "Processes": "Stateless — all state in Redis/PostgreSQL, no in-memory sessions",
                "Logs": "Structured JSON to stdout — no log files",
                "Port Binding": "HTTP server binds to $PORT",
            },
            "health_probes": {
                "liveness": "GET /health/live — returns 200 if process is running",
                "readiness": "GET /health/ready — returns 200 only if DB/cache connections are healthy",
                "startup": "GET /health/startup — returns 200 once bootstrap complete",
            },
            "graceful_shutdown": [
                "Listen for SIGTERM",
                "Stop accepting new requests (http.close())",
                "Drain in-flight requests with timeout (30s)",
                "Close DB pool",
                "Close NATS connection",
                "Exit with code 0",
            ],
        }, indent=2)


class MicroservicesSkill(BaseTool):
    name: str = "microservices"
    description: str = (
        "Implement microservices with single-responsibility boundaries, "
        "API contracts, and independent data stores."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "microservices",
            "boundaries": f"{service_name} owns its data — no shared DB schema with other services",
            "contract": f"OpenAPI 3.1 spec at /api-docs — versioned at /v1/",
            "communication": {
                "sync": "REST (queries) — with circuit breaker",
                "async": "NATS JetStream (commands/events) — fire-and-forget or consume",
            },
            "reuse_check": "Check EIOS capability registry before creating new service",
        }, indent=2)


class TypeScriptSkill(BaseTool):
    name: str = "typescript"
    description: str = (
        "Write strictly typed TypeScript with interface-first design, "
        "no 'any', discriminated unions, and strict compiler settings."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "typescript",
            "tsconfig": {
                "strict": True,
                "noImplicitAny": True,
                "strictNullChecks": True,
                "noUncheckedIndexedAccess": True,
                "exactOptionalPropertyTypes": True,
            },
            "patterns": {
                "interfaces": "Define all domain contracts as interfaces",
                "discriminated_unions": "Use for sum types: type Result<T> = { success: true; data: T } | { success: false; error: AppError }",
                "readonly": "Readonly<T> for immutable domain objects",
                "branded_types": "Brand primitive IDs: type UserId = string & { _brand: 'UserId' }",
                "no_any": "Use 'unknown' with type guards instead of 'any'",
            },
        }, indent=2)


class NodeJSSkill(BaseTool):
    name: str = "nodejs"
    description: str = (
        "Build high-performance Node.js services: async/await patterns, "
        "worker threads for CPU work, connection pooling, and graceful shutdown."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "nodejs",
            "async_patterns": {
                "I/O": "Always async/await — never sync fs, crypto, or net calls on main thread",
                "CPU": "Worker threads for heavy computation — never block event loop",
                "Promises": "Promise.all for parallel I/O — not sequential await in loop",
                "Errors": "try/catch on every async boundary — unhandledRejection handler registered",
            },
            "connection_pooling": {
                "PostgreSQL": "pg Pool — max: 20, idleTimeoutMillis: 30000",
                "Redis": "ioredis — maxRetriesPerRequest: 3, lazyConnect: true",
                "NATS": "Single connection — multiplexed subjects",
            },
        }, indent=2)


class NestJSSkill(BaseTool):
    name: str = "nestjs"
    description: str = (
        "Implement enterprise NestJS applications: modules, controllers, "
        "services, guards, interceptors, pipes, and exception filters."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "nestjs",
            "module_structure": f"""
@Module({{
  imports: [TypeOrmModule.forFeature([{service_name}Entity]), CacheModule],
  controllers: [{service_name}Controller],
  providers: [
    {service_name}Service,
    {{ provide: I{service_name}Repository, useClass: {service_name}Repository }},
  ],
  exports: [{service_name}Service],
}})
export class {service_name}Module {{}}
""",
            "guards": ["JwtAuthGuard — validates JWT on every protected route", "RolesGuard — RBAC role check"],
            "interceptors": ["LoggingInterceptor — structured request/response log", "TracingInterceptor — OTel span per request"],
            "pipes": ["ValidationPipe — global, whitelist: true, forbidNonWhitelisted: true"],
            "exception_filter": "HttpExceptionFilter — maps to RFC 9457 ProblemDetail",
        }, indent=2)


class ExpressJSSkill(BaseTool):
    name: str = "expressjs"
    description: str = (
        "Build Express.js services with middleware chains, "
        "error handlers, and router-level organisation."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "Express") -> str:
        return json.dumps({
            "skill": "expressjs",
            "middleware_chain": [
                "helmet() — security headers",
                "cors(corsOptions) — explicit allow list",
                "express.json({ limit: '1mb' }) — body parsing with size limit",
                "requestId() — attach correlation ID",
                "requestLogger() — structured request log",
                "rateLimiter() — token bucket per IP",
                "authenticate() — JWT validation",
                "router — route handlers",
                "notFoundHandler() — 404 for unmatched routes",
                "errorHandler() — RFC 9457 ProblemDetail response",
            ],
        }, indent=2)


class FastifySkill(BaseTool):
    name: str = "fastify"
    description: str = (
        "Build high-performance Fastify services with schema validation, "
        "plugin architecture, and JSON serialisation optimisation."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "Fastify") -> str:
        return json.dumps({
            "skill": "fastify",
            "plugins": [
                "@fastify/helmet — security headers",
                "@fastify/cors — CORS with explicit origins",
                "@fastify/rate-limit — rate limiting",
                "@fastify/jwt — JWT validation",
                "@fastify/swagger — OpenAPI generation from schema",
            ],
            "schema_validation": "Fastify uses JSON Schema natively — define request/response schema on route",
            "serialisation": "Fast-json-stringify via schema — 2x faster than JSON.stringify",
            "performance": "Fastify benchmarks at 30K+ rps — use for high-throughput endpoints",
        }, indent=2)


class PythonSkill(BaseTool):
    name: str = "python"
    description: str = (
        "Implement Python backend services: type hints, async/await, "
        "Pydantic models, structured logging, and pytest test suites."
    )

    def _run(self, service_name: str, description: str, language: str = "Python", framework: str = "FastAPI") -> str:
        return json.dumps({
            "skill": "python",
            "code_template": f"""
from pydantic import BaseModel, Field
from typing import Annotated
import structlog

log = structlog.get_logger(__name__)

class {service_name}Request(BaseModel):
    # Define fields with validation
    pass

class {service_name}Response(BaseModel):
    # Define response shape
    pass

class {service_name}Service:
    def __init__(self, repository: I{service_name}Repository) -> None:
        self._repo = repository

    async def execute(self, request: {service_name}Request) -> {service_name}Response:
        log.info("{service_name.lower()}.execute.start", request_id=request.id)
        # Business logic here
        result = await self._repo.find_by_id(request.id)
        log.info("{service_name.lower()}.execute.done", request_id=request.id)
        return {service_name}Response.model_validate(result)
""",
            "tooling": "ruff (lint + format) + mypy (type check) — both in CI, block on errors",
        }, indent=2)


class FastAPISkill(BaseTool):
    name: str = "fastapi"
    description: str = (
        "Build production FastAPI services: Pydantic schemas, "
        "dependency injection, background tasks, and auto-generated OpenAPI."
    )

    def _run(self, service_name: str, description: str, language: str = "Python", framework: str = "FastAPI") -> str:
        return json.dumps({
            "skill": "fastapi",
            "app_template": f"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

app = FastAPI(title="{service_name} API", version="1.0.0", docs_url="/api-docs")
FastAPIInstrumentor.instrument_app(app)

@app.get("/health/live")
async def liveness() -> dict:
    return {{"status": "ok"}}

@app.get("/health/ready")
async def readiness(db=Depends(get_db)) -> dict:
    await db.execute("SELECT 1")
    return {{"status": "ready"}}
""",
            "dependency_injection": "FastAPI DI via Depends — inject repositories, services, auth context",
            "exception_handling": "HTTPException with RFC 9457 detail — global exception handler",
            "validation": "Pydantic v2 — validators, field constraints, custom types",
        }, indent=2)


class JavaSkill(BaseTool):
    name: str = "java"
    description: str = (
        "Implement Java/Spring Boot services: constructor injection, "
        "JPA, transactions, Spring Security, and JUnit 5 tests."
    )

    def _run(self, service_name: str, description: str, language: str = "Java", framework: str = "Spring Boot") -> str:
        return json.dumps({
            "skill": "java",
            "patterns": {
                "DI": "Constructor injection only — @Autowired on field is banned",
                "JPA": "@EntityGraph for eager loading — no lazy loading surprises in loops",
                "Transaction": "@Transactional at service layer — not repository",
                "Records": "Java Records for immutable value objects and DTOs",
                "Error": "ProblemDetail (RFC 9457) via @ControllerAdvice",
            },
        }, indent=2)


class SpringBootSkill(BaseTool):
    name: str = "spring_boot"
    description: str = (
        "Build enterprise Spring Boot applications: security config, "
        "actuator endpoints, config properties, and Testcontainers integration tests."
    )

    def _run(self, service_name: str, description: str, language: str = "Java", framework: str = "Spring Boot") -> str:
        return json.dumps({
            "skill": "spring_boot",
            "application_properties": {
                "server.port": "${PORT:8080}",
                "spring.datasource.url": "${DATABASE_URL}",
                "management.endpoints.web.exposure.include": "health,info,metrics,prometheus",
                "management.server.port": "8081",
            },
            "security": "@SecurityFilterChain — JWT filter, session stateless, CORS config",
            "actuator": "/actuator/health with liveness/readiness groups",
            "testing": "Testcontainers @SpringBootTest — PostgreSQL container per test class",
        }, indent=2)


class GoSkill(BaseTool):
    name: str = "go"
    description: str = (
        "Implement high-performance Go services: goroutine lifecycle management, "
        "context propagation, error wrapping, and benchmark tests."
    )

    def _run(self, service_name: str, description: str, language: str = "Go", framework: str = "Go stdlib") -> str:
        return json.dumps({
            "skill": "go",
            "code_patterns": {
                "Context": "context.Context as first arg on every function that does I/O",
                "Errors": "fmt.Errorf('operation %w', err) — wrap with context",
                "Goroutines": "Always with errgroup.WithContext — never naked go func()",
                "Interfaces": "Small interfaces in consumer package — not in provider",
                "Cleanup": "defer cancel() immediately after context.WithCancel()",
            },
            "http_server": "net/http + chi router — or stdlib mux for simple services",
            "testing": "testing package + testify/assert — table-driven tests",
            "tooling": "golangci-lint + govulncheck in CI",
        }, indent=2)


class RESTAPISkill(BaseTool):
    name: str = "rest_apis"
    description: str = (
        "Design and implement OpenAPI 3.1-compliant REST APIs: "
        "resource modeling, versioning, error format, and pagination."
    )

    def _run(self, resource: str, operations: str, auth_required: bool = True, versioned: bool = True) -> str:
        base = f"/v1/{resource}s" if versioned else f"/{resource}s"
        ops = [o.strip() for o in operations.split(",")]
        endpoints = []
        if "list" in ops:
            endpoints.append({"method": "GET", "path": base, "summary": f"List {resource}s", "auth": auth_required, "pagination": "cursor-based"})
        if "get" in ops:
            endpoints.append({"method": "GET", "path": f"{base}/{{id}}", "summary": f"Get {resource} by ID", "auth": auth_required})
        if "create" in ops:
            endpoints.append({"method": "POST", "path": base, "summary": f"Create {resource}", "auth": auth_required, "idempotency_key": True})
        if "update" in ops:
            endpoints.append({"method": "PATCH", "path": f"{base}/{{id}}", "summary": f"Update {resource}", "auth": auth_required})
        if "delete" in ops:
            endpoints.append({"method": "DELETE", "path": f"{base}/{{id}}", "summary": f"Delete {resource}", "auth": auth_required})

        return json.dumps({
            "skill": "rest_apis",
            "resource": resource,
            "base_path": base,
            "endpoints": endpoints,
            "error_format": "RFC 9457 ProblemDetail — type, title, status, detail, instance",
            "pagination": "Cursor-based — after:ID, limit:N — not OFFSET",
            "versioning": "/v1/ URL prefix with deprecation notice in response headers",
            "openapi": "Generate OpenAPI 3.1 spec — mount at /api-docs",
        }, indent=2)


class GraphQLSkill(BaseTool):
    name: str = "graphql"
    description: str = (
        "Build GraphQL schemas with type definitions, resolvers, "
        "DataLoader for N+1 prevention, and subscriptions."
    )

    def _run(self, resource: str, operations: str, auth_required: bool = True, versioned: bool = True) -> str:
        return json.dumps({
            "skill": "graphql",
            "schema": f"""
type {resource.capitalize()} {{
  id: ID!
  # add fields
  createdAt: DateTime!
  updatedAt: DateTime!
}}

type Query {{
  {resource}(id: ID!): {resource.capitalize()}
  {resource}s(after: String, limit: Int): {resource.capitalize()}Connection!
}}

type Mutation {{
  create{resource.capitalize()}(input: Create{resource.capitalize()}Input!): {resource.capitalize()}!
  update{resource.capitalize()}(id: ID!, input: Update{resource.capitalize()}Input!): {resource.capitalize()}!
  delete{resource.capitalize()}(id: ID!): Boolean!
}}
""",
            "dataloader": f"Create {resource}DataLoader — batch by IDs, cache per request",
            "auth": "@auth directive on every resolver — check context.user",
            "errors": "Error unions not generic GraphQL errors — typed error types",
        }, indent=2)


class GRPCSkill(BaseTool):
    name: str = "grpc"
    description: str = (
        "Implement gRPC services: proto3 definitions, server implementations, "
        "streaming patterns, and deadline propagation."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "gRPC") -> str:
        return json.dumps({
            "skill": "grpc",
            "proto_template": f"""
syntax = "proto3";
package cerebrohive.v1;

service {service_name}Service {{
  rpc Get{service_name} (Get{service_name}Request) returns ({service_name}Response);
  rpc List{service_name}s (List{service_name}sRequest) returns (stream {service_name}Response);
}}

message {service_name}Response {{
  string id = 1;
  // add fields
}}
""",
            "implementation": "Always propagate deadline from incoming context",
            "error_handling": "Use gRPC status codes — not HTTP codes",
            "note": "Use for external consumers only — NATS JetStream for internal messaging",
        }, indent=2)


class WebSocketsSkill(BaseTool):
    name: str = "websockets"
    description: str = (
        "Build real-time WebSocket services with connection lifecycle "
        "management, heartbeat, backpressure, and horizontal scaling via Redis pub/sub."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "websockets",
            "implementation": {
                "library": "@nestjs/websockets / ws / socket.io (Redis adapter for scale-out)",
                "heartbeat": "Ping/pong every 30s — close connection on missed pong",
                "auth": "JWT in connection query param or first message — close on invalid",
                "backpressure": "Pause producer if consumer buffer > threshold",
                "scaling": "Redis pub/sub adapter — any node handles any connection",
            },
        }, indent=2)


class EventDrivenArchSkill(BaseTool):
    name: str = "event_driven_architecture"
    description: str = (
        "Implement event-driven services with NATS JetStream: "
        "producers, durable consumers, schemas, and DLQ handling."
    )

    def _run(self, domain: str, event_name: str, direction: str = "publish", schema_fields: str = "") -> str:
        subject = f"{domain}.{event_name.replace(' ', '_').lower()}"
        return json.dumps({
            "skill": "event_driven_architecture",
            "subject": subject,
            "direction": direction,
            "schema": f"""
export interface {domain.capitalize()}{event_name.capitalize().replace(' ', '')}Event {{
  eventId: string;       // UUID v4 — idempotency key
  occurredAt: string;    // ISO 8601
  aggregateId: string;
  aggregateVersion: number;
  {schema_fields or '// add domain fields'}
}}
""",
            "producer": f"""
await jetstream.publish('{subject}', codec.encode(event), {{
  msgID: event.eventId,  // deduplication
  timeout: 5000,
}});
""",
            "consumer": f"""
const consumer = await jetstream.consumers.get(stream, '{domain}_consumer');
for await (const msg of consumer.messages()) {{
  try {{
    const event = codec.decode<{domain.capitalize()}{event_name.capitalize().replace(' ', '')}Event>(msg.data);
    await handler.handle(event);
    msg.ack();
  }} catch (err) {{
    msg.nak(5000); // retry after 5s
  }}
}}
""",
        }, indent=2)


class CQRSSkill(BaseTool):
    name: str = "cqrs"
    description: str = (
        "Implement CQRS: command handlers, event emission, "
        "read projections, and consistency contracts."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "cqrs",
            "write_side": f"""
// Command
export class Create{service_name}Command {{
  constructor(public readonly payload: Create{service_name}Dto) {{}}
}}

// Command Handler
@CommandHandler(Create{service_name}Command)
export class Create{service_name}Handler implements ICommandHandler<Create{service_name}Command> {{
  async execute(command: Create{service_name}Command) {{
    const aggregate = {service_name}Aggregate.create(command.payload);
    await this.repo.save(aggregate);
    await this.eventBus.publish(new {service_name}CreatedEvent(aggregate.id));
  }}
}}
""",
            "read_side": f"Separate {service_name}ReadRepository — denormalized view table, updated via event handlers",
        }, indent=2)


class EventSourcingSkill(BaseTool):
    name: str = "event_sourcing"
    description: str = (
        "Implement event-sourced aggregates: append-only event store, "
        "aggregate reconstruction, snapshots, and projection rebuilds."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "event_sourcing",
            "aggregate_template": f"""
export class {service_name}Aggregate extends AggregateRoot {{
  private _state: {service_name}State = initial{service_name}State();

  static create(id: string, payload: Create{service_name}Payload): {service_name}Aggregate {{
    const agg = new {service_name}Aggregate(id);
    agg.apply(new {service_name}CreatedEvent(id, payload));
    return agg;
  }}

  on{service_name}Created(event: {service_name}CreatedEvent) {{
    this._state = {{ ...this._state, ...event.payload, status: 'active' }};
  }}
}}
""",
            "event_store": "Append-only writes — never UPDATE or DELETE events",
            "snapshots": "Snapshot every 50 events — load snapshot + delta on reconstruct",
        }, indent=2)


class NATSSkill(BaseTool):
    name: str = "nats"
    description: str = (
        "Implement NATS JetStream producers, durable consumers, "
        "ack strategies, stream configuration, and DLQ handling."
    )

    def _run(self, domain: str, event_name: str, direction: str = "publish", schema_fields: str = "") -> str:
        return json.dumps({
            "skill": "nats",
            "stream_config": {
                "name": domain.upper(),
                "subjects": [f"{domain}.*"],
                "retention": "workqueue",
                "storage": "file",
                "replicas": 3,
                "maxAge": "72h",
            },
            "consumer_config": {
                "durable": f"{domain}-processor",
                "filterSubject": f"{domain}.{event_name}",
                "deliverPolicy": "all",
                "ackPolicy": "explicit",
                "maxDeliver": 3,
                "ackWait": "30s",
            },
            "dlq": {
                "subject": f"{domain}.dlq",
                "trigger": "maxDeliver exceeded",
                "action": "Alert + manual replay flow",
            },
        }, indent=2)


class KafkaSkill(BaseTool):
    name: str = "kafka"
    description: str = (
        "Implement Kafka producers and consumers with offset management, "
        "schema registry, and consumer group configuration. "
        "Use NATS JetStream for internal services; Kafka for external/legacy."
    )

    def _run(self, domain: str, event_name: str, direction: str = "publish", schema_fields: str = "") -> str:
        return json.dumps({
            "skill": "kafka",
            "producer_config": {
                "acks": "all",
                "retries": 3,
                "compressionType": "snappy",
                "idempotent": True,
            },
            "consumer_config": {
                "groupId": f"{domain}-consumer-group",
                "autoCommit": False,
                "sessionTimeout": 30000,
            },
            "schema": "Avro / Protobuf via Schema Registry — enforce backward compatibility",
            "note": "Prefer NATS JetStream for new internal services — Kafka for existing external integration",
        }, indent=2)


class RedisSkill(BaseTool):
    name: str = "redis"
    description: str = (
        "Implement Redis caching, pub/sub, sorted sets, streams, "
        "distributed locks, and rate limiting."
    )

    def _run(self, key_pattern: str, ttl_seconds: int = 300, strategy: str = "cache-aside") -> str:
        return json.dumps({
            "skill": "redis",
            "strategy": strategy,
            "key_pattern": key_pattern,
            "ttl_seconds": ttl_seconds,
            "implementation": {
                "cache-aside": f"""
async function getWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {{
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const value = await fetcher();
  await redis.setex(key, {ttl_seconds}, JSON.stringify(value));
  return value;
}}
""",
                "distributed_lock": """
const lock = await redis.set(lockKey, token, 'PX', ttlMs, 'NX');
if (!lock) throw new ConflictError('Resource locked');
try { await criticalSection(); }
finally { await releaseLock(lockKey, token); }  // Lua script atomic release
""",
            },
            "eviction_policy": "allkeys-lru for cache; noeviction for session/queue",
        }, indent=2)


class PostgreSQLSkill(BaseTool):
    name: str = "postgresql"
    description: str = (
        "Design and implement PostgreSQL schemas with Prisma migrations, "
        "composite indexes, and query optimization."
    )

    def _run(self, entity: str, fields: str, relations: str = "", db: str = "postgresql") -> str:
        return json.dumps({
            "skill": "postgresql",
            "prisma_schema": f"""
model {entity.capitalize()} {{
  id          String    @id @default(uuid()) @db.Uuid
  {fields}
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")  // soft delete

  @@map("{entity.lower()}s")
  @@index([createdAt])
}}
""",
            "migration_notes": "Zero-downtime: add nullable column → backfill → add NOT NULL constraint → deploy",
            "index_strategy": "Composite index: (tenant_id, created_at) for multi-tenant time-range queries",
        }, indent=2)


class MySQLSkill(BaseTool):
    name: str = "mysql"
    description: str = (
        "Implement MySQL schemas, indexes, and optimized queries "
        "with zero-downtime migration strategies."
    )

    def _run(self, entity: str, fields: str, relations: str = "", db: str = "mysql") -> str:
        return json.dumps({
            "skill": "mysql",
            "table_template": f"""
CREATE TABLE {entity.lower()}s (
  id          CHAR(36)     NOT NULL,
  {fields}
  created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
""",
            "migration": "gh-ost or pt-online-schema-change for zero-downtime large table alterations",
        }, indent=2)


class MongoDBSkill(BaseTool):
    name: str = "mongodb"
    description: str = (
        "Design MongoDB schemas optimised for access patterns, "
        "with aggregation pipelines, change streams, and indexes."
    )

    def _run(self, entity: str, fields: str, relations: str = "", db: str = "mongodb") -> str:
        return json.dumps({
            "skill": "mongodb",
            "schema_design": {
                "pattern": "Design for access pattern — embed vs reference per query frequency",
                "index": "Compound index: { tenantId: 1, createdAt: -1 } for multi-tenant time queries",
                "ttl_index": "TTL index for ephemeral documents: { expiresAt: 1 }, expireAfterSeconds: 0",
                "change_streams": "Use for event-driven reactions to document changes",
            },
        }, indent=2)


class PrismaORMSkill(BaseTool):
    name: str = "prisma_orm"
    description: str = (
        "Implement Prisma schemas, type-safe queries, transactions, "
        "batch operations, and zero-downtime migrations."
    )

    def _run(self, entity: str, fields: str, relations: str = "", db: str = "postgresql") -> str:
        return json.dumps({
            "skill": "prisma_orm",
            "client_usage": f"""
// Repository pattern — wrap Prisma in domain repository
export class Prisma{entity.capitalize()}Repository implements I{entity.capitalize()}Repository {{
  constructor(private readonly db: PrismaClient) {{}}

  async findById(id: string): Promise<{entity.capitalize()} | null> {{
    return this.db.{entity.lower()}.findUnique({{
      where: {{ id }},
      include: {{ /* only required relations */ }},
    }});
  }}

  async create(data: Create{entity.capitalize()}Data): Promise<{entity.capitalize()}> {{
    return this.db.{entity.lower()}.create({{ data }});
  }}
}}
""",
            "transaction": f"prisma.$transaction([op1, op2]) — or interactive transaction with prisma.$transaction(async (tx) => {{ ... }})",
            "migration": "prisma migrate deploy — idempotent, tracked in _prisma_migrations table",
        }, indent=2)


class DrizzleORMSkill(BaseTool):
    name: str = "drizzle_orm"
    description: str = (
        "Use Drizzle ORM for type-safe SQL: schema-first design, "
        "join queries, and type-inferred results."
    )

    def _run(self, entity: str, fields: str, relations: str = "", db: str = "postgresql") -> str:
        return json.dumps({
            "skill": "drizzle_orm",
            "schema": f"""
import {{ pgTable, uuid, text, timestamp }} from 'drizzle-orm/pg-core';

export const {entity.lower()}s = pgTable('{entity.lower()}s', {{
  id:        uuid('id').primaryKey().defaultRandom(),
  {fields}
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}});

export type {entity.capitalize()} = typeof {entity.lower()}s.$inferSelect;
export type New{entity.capitalize()} = typeof {entity.lower()}s.$inferInsert;
""",
        }, indent=2)


class SQLOptimisationSkill(BaseTool):
    name: str = "sql_optimization"
    description: str = (
        "Optimise SQL queries: EXPLAIN ANALYZE, covering indexes, "
        "query rewriting, and partition pruning."
    )

    def _run(self, component: str, current_latency_ms: int = None, target_latency_ms: int = None) -> str:
        return json.dumps({
            "skill": "sql_optimization",
            "steps": [
                "1. Run EXPLAIN (ANALYZE, BUFFERS) on the slow query",
                "2. Identify Seq Scan on large table → add index",
                "3. Check index usage — verify planner uses it (Index Scan vs Seq Scan)",
                "4. Add covering index: include frequently projected columns",
                "5. Check join order — force with explicit JOIN if planner makes wrong choice",
                "6. Check N+1: ORM generated N+1 queries? Add eager loading or DataLoader",
                "7. Partition large tables by time range — prune via partition key in WHERE",
                "8. Check connection pool — exhausted pool causes query queuing",
            ],
            "current_latency_ms": current_latency_ms,
            "target_latency_ms": target_latency_ms,
        }, indent=2)


class CachingSkill(BaseTool):
    name: str = "caching"
    description: str = (
        "Implement multi-layer caching strategies: Redis cache-aside, "
        "write-through, TTL with jitter, and cache invalidation on events."
    )

    def _run(self, key_pattern: str, ttl_seconds: int = 300, strategy: str = "cache-aside") -> str:
        jitter = max(ttl_seconds // 10, 5)
        return json.dumps({
            "skill": "caching",
            "key_pattern": key_pattern,
            "strategy": strategy,
            "ttl_with_jitter": f"TTL = {ttl_seconds} + random(0, {jitter}) — prevents thundering herd",
            "invalidation": "Event-driven: on write event → delete or update cache entry",
            "warming": "Cache warm-up on service start for hot keys",
            "l1_l2": "L1: in-process Map (1min TTL) → L2: Redis (5min TTL) — reduces Redis round-trips",
        }, indent=2)


class AuthenticationSkill(BaseTool):
    name: str = "authentication"
    description: str = (
        "Implement authentication: JWT validation, OAuth2/OIDC flows, "
        "session management, and token rotation."
    )

    def _run(self, auth_type: str = "jwt", scope: str = "", resource: str = "") -> str:
        return json.dumps({
            "skill": "authentication",
            "jwt_validation": """
const payload = jwt.verify(token, jwtSecret, {
  algorithms: ['RS256'],
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.JWT_ISSUER,
});
""",
            "token_lifecycle": {
                "access_token": "15 min — short-lived, no server-side state",
                "refresh_token": "7 days — rotate on use, stored hashed in DB",
                "revocation": "Blacklist refresh token on logout — check on every refresh",
            },
            "oauth2_flow": "Authorization Code + PKCE for user auth; Client Credentials for service-to-service",
        }, indent=2)


class AuthorizationSkill(BaseTool):
    name: str = "authorization"
    description: str = (
        "Implement RBAC and ABAC authorization: role checking, "
        "policy enforcement, and resource-level permission scoping."
    )

    def _run(self, auth_type: str = "rbac", scope: str = "", resource: str = "") -> str:
        return json.dumps({
            "skill": "authorization",
            "rbac": f"""
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
@Get('{resource or 'resource'}/:id')
async findOne(@Param('id') id: string, @CurrentUser() user: User) {{
  // Role already checked by guard
  return this.service.findById(id);
}}
""",
            "abac": "Check resource ownership: user.tenantId === resource.tenantId — at service layer",
            "least_privilege": "Minimum scope per endpoint — no catch-all admin roles in production",
        }, indent=2)


class OAuth2Skill(BaseTool):
    name: str = "oauth2"
    description: str = (
        "Implement OAuth2 flows: authorization code + PKCE, "
        "client credentials, token introspection, and PKCE state validation."
    )

    def _run(self, auth_type: str = "oauth2", scope: str = "", resource: str = "") -> str:
        return json.dumps({
            "skill": "oauth2",
            "authorization_code_pkce": {
                "step1": "Generate code_verifier (random 32 bytes base64url) and code_challenge (SHA256 hash)",
                "step2": "Redirect to /authorize with code_challenge, response_type=code, state (CSRF token)",
                "step3": "Exchange code at /token with code_verifier",
                "step4": "Validate state matches stored value — reject if mismatch",
            },
            "client_credentials": "POST /token with client_id, client_secret, grant_type=client_credentials",
        }, indent=2)


class OIDCSkill(BaseTool):
    name: str = "oidc"
    description: str = (
        "Implement OIDC identity federation: token validation, "
        "JWKS endpoint, userinfo, and ID token claims extraction."
    )

    def _run(self, auth_type: str = "oidc", scope: str = "", resource: str = "") -> str:
        return json.dumps({
            "skill": "oidc",
            "id_token_validation": [
                "Verify signature using JWKS endpoint keys",
                "Verify iss matches known issuer",
                "Verify aud contains our client_id",
                "Verify exp is in the future",
                "Verify iat is not in the future (clock skew < 5min)",
                "Verify nonce matches (for code flow)",
            ],
        }, indent=2)


class JWTSkill(BaseTool):
    name: str = "jwt"
    description: str = (
        "Implement JWT issuance and validation: RS256 signing, "
        "short-lived access tokens, and refresh token rotation."
    )

    def _run(self, auth_type: str = "jwt", scope: str = "", resource: str = "") -> str:
        return json.dumps({
            "skill": "jwt",
            "signing": "RS256 — asymmetric signing. Private key in Vault. Public key at JWKS endpoint.",
            "payload": {
                "sub": "user ID",
                "iss": "service URL",
                "aud": "target service",
                "exp": "now + 15min",
                "iat": "now",
                "jti": "UUID — for revocation",
                "roles": ["role1"],
                "tenant": "tenant ID",
            },
            "validation": "Verify signature, exp, iss, aud on every request — no exceptions",
        }, indent=2)


class RBACSkill(BaseTool):
    name: str = "rbac"
    description: str = (
        "Design and implement role-based access control with "
        "least-privilege roles and NestJS guard integration."
    )

    def _run(self, auth_type: str = "rbac", scope: str = "", resource: str = "") -> str:
        return json.dumps({
            "skill": "rbac",
            "roles": {
                "OWNER": "Full access — tenant admin",
                "EDITOR": "Create + update resources — no delete",
                "VIEWER": "Read-only access",
                "SERVICE": "Service-to-service — API scope only",
            },
            "guard": "RolesGuard reads @Roles() decorator — rejects 403 if role insufficient",
            "principle": "Least privilege — grant minimum role needed per endpoint",
        }, indent=2)


class ABACSkill(BaseTool):
    name: str = "abac"
    description: str = (
        "Implement attribute-based access control for fine-grained "
        "tenant and resource-level permission scoping."
    )

    def _run(self, auth_type: str = "abac", scope: str = "", resource: str = "") -> str:
        return json.dumps({
            "skill": "abac",
            "policy": """
function canAccess(user: User, resource: Resource, action: Action): boolean {
  // Tenant isolation — hardest requirement
  if (user.tenantId !== resource.tenantId) return false;
  // Owner can always access their own resources
  if (resource.ownerId === user.id) return true;
  // Role-based fallback
  return user.roles.includes(Role.ADMIN);
}
""",
            "enforcement": "Enforce at service layer — after DB fetch, before returning data",
        }, indent=2)


class SecretsManagementSkill(BaseTool):
    name: str = "secrets_management"
    description: str = (
        "Integrate Vault/Secret Manager for runtime secrets: "
        "dynamic credentials, rotation, and audit trails."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "secrets_management",
            "rules": [
                "Zero secrets in code, git, or env files — all from Vault/Secret Manager at runtime",
                "Database credentials: dynamic — Vault Database secrets engine, TTL 1h, auto-renew",
                "API keys: stored in Vault KV — rotated quarterly",
                "JWT private key: Vault Transit — never exported to application memory",
            ],
            "implementation": f"""
// On startup — fetch secrets from Vault
const secrets = await vaultClient.read('secret/{service_name}/config');
const dbUrl = secrets.data.database_url;
""",
        }, indent=2)


class DockerSkill(BaseTool):
    name: str = "docker"
    description: str = (
        "Build multi-stage distroless Docker images: "
        "build stage, runtime stage, non-root user, and security scanning."
    )

    def _run(self, service_name: str, runtime: str = "node", port: int = 3000) -> str:
        if runtime == "node":
            dockerfile = f"""
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM gcr.io/distroless/nodejs22-debian12 AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
USER 1000:1000
EXPOSE {port}
ENTRYPOINT ["node", "dist/main.js"]
"""
        elif runtime == "python":
            dockerfile = f"""
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --target /app/deps

FROM gcr.io/distroless/python3-debian12 AS runtime
WORKDIR /app
COPY --from=builder /app/deps /app/deps
COPY . .
ENV PYTHONPATH=/app/deps
USER 1000:1000
EXPOSE {port}
ENTRYPOINT ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "{port}"]
"""
        else:
            dockerfile = f"""
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-w -s" -o server ./cmd/server

FROM gcr.io/distroless/static-debian12 AS runtime
COPY --from=builder /app/server /server
USER 1000:1000
EXPOSE {port}
ENTRYPOINT ["/server"]
"""
        return json.dumps({
            "skill": "docker",
            "service": service_name,
            "runtime": runtime,
            "dockerfile": dockerfile.strip(),
            "security": [
                "Distroless runtime image — no shell, no package manager",
                "Non-root user (UID 1000)",
                "Trivy scan: trivy image --exit-code 1 --severity CRITICAL,HIGH",
                ".dockerignore: node_modules, .git, *.env, __pycache__, .pytest_cache",
            ],
        }, indent=2)


class KubernetesSkill(BaseTool):
    name: str = "kubernetes"
    description: str = (
        "Write Kubernetes manifests: Deployment, Service, ConfigMap, "
        "HPA, PDB, and NetworkPolicy for production workloads."
    )

    def _run(self, service_name: str, runtime: str = "node", port: int = 3000) -> str:
        return json.dumps({
            "skill": "kubernetes",
            "deployment": f"""
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {service_name}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: {service_name}
  template:
    metadata:
      labels:
        app: {service_name}
    spec:
      serviceAccountName: {service_name}
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
      containers:
        - name: {service_name}
          image: ghcr.io/cerebrohive/{service_name}:latest
          ports:
            - containerPort: {port}
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          readinessProbe:
            httpGet:
              path: /health/ready
              port: {port}
            initialDelaySeconds: 10
          livenessProbe:
            httpGet:
              path: /health/live
              port: {port}
""",
            "hpa": f"HPA: minReplicas=2, maxReplicas=10, CPU target=70%",
            "pdb": f"PDB: minAvailable=1",
            "network_policy": "Default-deny ingress — explicit allow from api-gateway and monitoring namespaces",
        }, indent=2)


class OpenTelemetrySkill(BaseTool):
    name: str = "opentelemetry"
    description: str = (
        "Instrument services with OpenTelemetry SDK: spans, "
        "metrics, W3C trace context propagation, and OTLP export."
    )

    def _run(self, service_name: str, endpoints: str = "", span_operations: str = "") -> str:
        return json.dumps({
            "skill": "opentelemetry",
            "setup": f"""
// src/telemetry.ts
import {{ NodeSDK }} from '@opentelemetry/sdk-node';
import {{ OTLPTraceExporter }} from '@opentelemetry/exporter-trace-otlp-grpc';
import {{ PrometheusExporter }} from '@opentelemetry/exporter-prometheus';

const sdk = new NodeSDK({{
  serviceName: '{service_name}',
  traceExporter: new OTLPTraceExporter({{ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }}),
  metricReader: new PrometheusExporter({{ port: 9464 }}),
}});
sdk.start();
""",
            "manual_span": f"""
const span = tracer.startSpan('{service_name}.operation');
try {{
  const result = await operation();
  span.setStatus({{ code: SpanStatusCode.OK }});
  return result;
}} catch (err) {{
  span.recordException(err);
  span.setStatus({{ code: SpanStatusCode.ERROR }});
  throw err;
}} finally {{
  span.end();
}}
""",
            "metrics": f"""
const requestDuration = meter.createHistogram('{service_name}.request.duration', {{
  description: 'HTTP request duration in milliseconds',
  unit: 'ms',
}});
""",
        }, indent=2)


class PrometheusSkill(BaseTool):
    name: str = "prometheus"
    description: str = (
        "Expose Prometheus metrics: RED metrics per endpoint, "
        "business metrics, custom gauges, and alert rules."
    )

    def _run(self, service_name: str, endpoints: str = "", span_operations: str = "") -> str:
        return json.dumps({
            "skill": "prometheus",
            "metrics": {
                "http_requests_total": f'counter — labels: method, path, status — {service_name}',
                "http_request_duration_seconds": f'histogram — labels: method, path — {service_name}',
                "active_connections": f'gauge — {service_name} active WebSocket connections',
                "db_query_duration_seconds": f'histogram — labels: query_name — {service_name}',
            },
            "alert_rules": [
                f'alert: {service_name}HighErrorRate — expr: rate(http_requests_total{{job="{service_name}",status=~"5.."}}[5m]) / rate(http_requests_total{{job="{service_name}"}}[5m]) > 0.01',
                f'alert: {service_name}HighLatency — expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{{job="{service_name}"}}[5m])) > 0.5',
            ],
        }, indent=2)


class GrafanaSkill(BaseTool):
    name: str = "grafana"
    description: str = (
        "Build Grafana dashboards: SLO panels, error budget burn rate, "
        "RED metrics, and saturation indicators."
    )

    def _run(self, service_name: str, endpoints: str = "", span_operations: str = "") -> str:
        return json.dumps({
            "skill": "grafana",
            "dashboard_panels": [
                f"Request Rate — rate(http_requests_total{{job='{service_name}'}}[1m])",
                f"Error Rate % — 100 * rate(http_requests_total{{job='{service_name}',status=~'5..'}}[1m]) / rate(http_requests_total{{job='{service_name}'}}[1m])",
                f"p99 Latency — histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{{job='{service_name}'}}[5m]))",
                "SLO Compliance — error budget remaining %",
                "DB Query Duration — p99 per query type",
                "Cache Hit Rate — Redis hits / (hits + misses)",
            ],
        }, indent=2)


class LoggingSkill(BaseTool):
    name: str = "logging"
    description: str = (
        "Implement structured JSON logging with correlation IDs, "
        "trace IDs, log levels, and PII masking."
    )

    def _run(self, service_name: str, endpoints: str = "", span_operations: str = "") -> str:
        return json.dumps({
            "skill": "logging",
            "setup": f"""
// Node.js — pino
import pino from 'pino';
export const logger = pino({{
  name: '{service_name}',
  level: process.env.LOG_LEVEL ?? 'info',
  formatters: {{ level: (label) => ({{ level: label }}) }},
  redact: ['req.headers.authorization', 'body.password', 'body.token'],
}});
""",
            "log_event": f"""
logger.info({{
  msg: '{service_name}.request.received',
  traceId: span.spanContext().traceId,
  correlationId: req.headers['x-correlation-id'],
  userId: user?.id,  // never log PII — only IDs
  path: req.path,
  method: req.method,
}});
""",
            "levels": "ERROR=actionable/alertable, WARN=investigate, INFO=audit trail, DEBUG=dev-only",
        }, indent=2)


class TracingSkill(BaseTool):
    name: str = "tracing"
    description: str = (
        "Implement distributed tracing with W3C trace context propagation "
        "across HTTP, NATS, and gRPC boundaries."
    )

    def _run(self, service_name: str, endpoints: str = "", span_operations: str = "") -> str:
        return json.dumps({
            "skill": "tracing",
            "http_propagation": "W3C TraceContext (traceparent/tracestate) — auto-instrumented via OTel HTTP middleware",
            "nats_propagation": f"""
// Publisher — inject trace context into NATS message headers
const ctx = context.active();
const headers = nats.headers();
propagator.inject(ctx, headers, {{ set: (h, k, v) => h.append(k, v) }});
await jetstream.publish(subject, data, {{ headers }});

// Consumer — extract trace context from NATS message headers
const parentCtx = propagator.extract(ROOT_CONTEXT, msg.headers, {{
  get: (h, k) => h.get(k)?.[0] ?? undefined,
}});
""",
            "span_attributes": [
                "service.name, service.version",
                "http.method, http.url, http.status_code",
                "db.system, db.statement (truncated), db.name",
                "messaging.system='nats', messaging.destination=subject",
            ],
        }, indent=2)


class PerformanceOptimisationSkill(BaseTool):
    name: str = "performance_optimization"
    description: str = (
        "Profile and optimise backend services: N+1 queries, "
        "serialisation overhead, connection pool tuning, and async optimisation."
    )

    def _run(self, component: str, current_latency_ms: int = None, target_latency_ms: int = None) -> str:
        return json.dumps({
            "skill": "performance_optimization",
            "profiling_workflow": [
                "Instrument with OTel — identify slowest spans in Jaeger/Tempo",
                "EXPLAIN ANALYZE on DB queries in slow spans",
                "Check N+1: count DB queries per HTTP request",
                "Heap snapshot — identify memory allocation hot spots",
                "CPU flamegraph — identify compute bottlenecks",
            ],
            "optimisations": {
                "N+1": "DataLoader for GraphQL, eager loading for ORM, batch queries",
                "Serialisation": "Fast-json-stringify with JSON schema, avoid circular references",
                "Caching": "Cache results at Redis for repeated identical queries",
                "Concurrency": "Promise.all for independent async operations",
                "Connection Pool": "pg Pool max=20, Redis cluster mode, NATS single connection",
            },
            "current_latency_ms": current_latency_ms,
            "target_latency_ms": target_latency_ms,
        }, indent=2)


class ConcurrencySkill(BaseTool):
    name: str = "concurrency"
    description: str = (
        "Implement safe concurrent systems: async I/O, "
        "worker thread pools, mutex locks, and lock-free patterns."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "concurrency",
            "patterns": {
                "Parallel I/O": "Promise.all([taskA, taskB]) — not sequential await",
                "Worker Threads": "worker_threads module for CPU-bound work — never block event loop",
                "Mutex": "async-mutex — protect shared mutable state in async context",
                "Rate Limiting": "p-limit — control concurrency for external API calls",
                "Semaphore": "Limit concurrent DB connections or API calls",
            },
            "anti_patterns": [
                "await in a loop — use Promise.all or batch instead",
                "fs.readFileSync in async handler — always use async fs",
                "CPU work on main thread — use worker threads or queue",
            ],
        }, indent=2)


class AsyncProgrammingSkill(BaseTool):
    name: str = "async_programming"
    description: str = (
        "Write correct async/await code: error propagation, "
        "context cancellation, AbortController, and AsyncGenerator streaming."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "async_programming",
            "patterns": {
                "Error Propagation": "Every async function has try/catch at boundary — no swallowed rejections",
                "Cancellation": "AbortController / AbortSignal for timeout and user cancellation",
                "Streaming": "AsyncGenerator — yield chunks, handle AbortSignal in loop",
                "Cleanup": "try/finally for resource cleanup — connections, file handles, timers",
            },
            "streaming_example": """
async function* streamChunks(signal: AbortSignal): AsyncGenerator<Chunk> {
  for await (const chunk of source) {
    if (signal.aborted) break;
    yield processChunk(chunk);
  }
}
""",
        }, indent=2)


class TestingSkill(BaseTool):
    name: str = "testing"
    description: str = (
        "Implement comprehensive backend test suites: unit, integration, "
        "contract, and performance tests."
    )

    def _run(self, component: str, test_type: str = "unit", scenarios: str = "") -> str:
        return json.dumps({
            "skill": "testing",
            "strategy": {
                "unit": "≥ 90% coverage — isolated, fast, deterministic — FIRST principles",
                "integration": "100% critical paths — Testcontainers with real DB + NATS + Redis",
                "contract": "Consumer-driven contracts at service boundaries via Pact",
                "performance": "k6 load tests — validate SLOs under 100% and 200% expected load",
            },
        }, indent=2)


class UnitTestingSkill(BaseTool):
    name: str = "unit_testing"
    description: str = (
        "Write isolated unit tests with mocks: ≥ 90% coverage, "
        "Vitest/Jest (TS), pytest (Python), or Go testing package."
    )

    def _run(self, component: str, test_type: str = "unit", scenarios: str = "") -> str:
        return json.dumps({
            "skill": "unit_testing",
            "template": f"""
describe('{component}', () => {{
  let service: {component}Service;
  let mockRepo: jest.Mocked<I{component}Repository>;

  beforeEach(() => {{
    mockRepo = createMock<I{component}Repository>();
    service = new {component}Service(mockRepo);
  }});

  describe('when creating a {component.lower()}', () => {{
    it('should save the entity and return it', async () => {{
      const input = create{component}Fixture();
      mockRepo.create.mockResolvedValue({{ ...input, id: 'test-id' }});

      const result = await service.create(input);

      expect(mockRepo.create).toHaveBeenCalledWith(input);
      expect(result.id).toBe('test-id');
    }});

    it('should throw ValidationError when input is invalid', async () => {{
      await expect(service.create({{ invalid: true }} as any))
        .rejects.toThrow(ValidationError);
    }});
  }});
}});
""",
            "coverage_target": "90% lines, branches, functions — report in CI, fail below threshold",
        }, indent=2)


class IntegrationTestingSkill(BaseTool):
    name: str = "integration_testing"
    description: str = (
        "Write integration tests with Testcontainers: real PostgreSQL, "
        "real Redis, real NATS — test complete HTTP stack."
    )

    def _run(self, component: str, test_type: str = "integration", scenarios: str = "") -> str:
        return json.dumps({
            "skill": "integration_testing",
            "template": f"""
describe('{component} API (e2e)', () => {{
  let app: INestApplication;
  let pgContainer: StartedPostgreSqlContainer;

  beforeAll(async () => {{
    pgContainer = await new PostgreSqlContainer('postgres:16').start();
    app = await createTestApp({{ databaseUrl: pgContainer.getConnectionUri() }});
  }});

  afterAll(async () => {{
    await app.close();
    await pgContainer.stop();
  }});

  describe('POST /v1/{component.lower()}s', () => {{
    it('should return 201 and created resource', async () => {{
      const response = await request(app.getHttpServer())
        .post('/v1/{component.lower()}s')
        .set('Authorization', `Bearer ${{await getTestJwt()}}`)
        .send(create{component}Fixture())
        .expect(201);

      expect(response.body.id).toBeDefined();
    }});

    it('should return 400 for invalid input', async () => {{
      await request(app.getHttpServer())
        .post('/v1/{component.lower()}s')
        .set('Authorization', `Bearer ${{await getTestJwt()}}`)
        .send({{}})
        .expect(400);
    }});
  }});
}});
""",
        }, indent=2)


class ContractTestingSkill(BaseTool):
    name: str = "contract_testing"
    description: str = (
        "Implement consumer-driven contract tests with Pact: "
        "consumer defines expectations, provider verifies them."
    )

    def _run(self, component: str, test_type: str = "contract", scenarios: str = "") -> str:
        return json.dumps({
            "skill": "contract_testing",
            "framework": "Pact (consumer-driven contracts)",
            "consumer_test": f"""
// Consumer — defines the contract it expects from {component} API
const pact = new PactV3({{ consumer: 'frontend', provider: '{component}-service' }});

pact.addInteraction({{
  given: 'a {component.lower()} exists with id 123',
  uponReceiving: 'a GET request for {component.lower()} 123',
  withRequest: {{ method: 'GET', path: '/v1/{component.lower()}s/123' }},
  willRespondWith: {{ status: 200, body: like({{ id: '123' }}) }},
}});
""",
            "provider_verification": f"npm run pact:verify -- --provider '{component}-service' --provider-base-url http://localhost:3000",
        }, indent=2)


class APIVersioningSkill(BaseTool):
    name: str = "api_versioning"
    description: str = (
        "Implement URL-based API versioning (/v1/) with backward-compatible "
        "evolution, deprecation headers, and migration guides."
    )

    def _run(self, resource: str, operations: str, auth_required: bool = True, versioned: bool = True) -> str:
        return json.dumps({
            "skill": "api_versioning",
            "strategy": "URL versioning — /v1/ prefix on all routes",
            "evolution": {
                "backward_compatible": "Add optional fields, new endpoints — no breaking changes in /v1/",
                "breaking_change": "Release /v2/ — run /v1/ and /v2/ in parallel for 3 months",
                "deprecation": "Deprecation: true + Sunset: date headers on deprecated endpoints",
                "migration_guide": "Publish migration guide in API docs before deprecating",
            },
            "nestjs_versioning": """
app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
// Routes: @Controller({ version: '1', path: 'resource' })
""",
        }, indent=2)


class CICDSkill(BaseTool):
    name: str = "cicd"
    description: str = (
        "Configure GitHub Actions CI/CD: parallel jobs, "
        "caching, SAST scan, container build, and deployment."
    )

    def _run(self, service_name: str, test_command: str = "npm test", build_command: str = "npm run build") -> str:
        return json.dumps({
            "skill": "cicd",
            "github_actions_workflow": f"""
name: {service_name} CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {{ node-version: '22', cache: 'npm' }}
      - run: npm ci
      - run: npm run lint && npm run type-check

  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:16
        env: {{ POSTGRES_PASSWORD: test }}
        options: --health-cmd pg_isready
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {{ node-version: '22', cache: 'npm' }}
      - run: npm ci
      - run: {test_command} --coverage
      - uses: codecov/codecov-action@v4

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t ghcr.io/cerebrohive/{service_name}:${{{{ github.sha }}}} .
      - run: trivy image --exit-code 1 --severity CRITICAL,HIGH ghcr.io/cerebrohive/{service_name}:${{{{ github.sha }}}}
      - run: docker push ghcr.io/cerebrohive/{service_name}:${{{{ github.sha }}}}
""",
        }, indent=2)


class GitSkill(BaseTool):
    name: str = "git"
    description: str = (
        "Generate Git workflow spec: worktree, branch name, "
        "conventional commit message, and PR title."
    )

    def _run(self, task_id: str, feature_slug: str, change_type: str = "feat") -> str:
        branch = f"{change_type}/{task_id}-{feature_slug}"
        return json.dumps({
            "skill": "git",
            "worktree": f"worktrees/{branch}",
            "branch": branch,
            "setup_commands": [
                f"git worktree add worktrees/{branch} -b {branch}",
                f"cd worktrees/{branch}",
            ],
            "commit_convention": f"{change_type}({feature_slug}): <imperative description in present tense>",
            "pr_title": f"{change_type}({feature_slug}): <description>",
            "pr_checklist": [
                "Tests passing (unit ≥ 90%, integration ✓)",
                "GitHub Actions green",
                "Architecture compliance verified",
                "Security review done",
                "Documentation updated",
                "No debug code or console.log",
            ],
            "merge": [
                "git rebase origin/main",
                "Squash fixup commits",
                "Merge PR — delete branch",
                "git worktree remove worktrees/{branch}",
            ],
        }, indent=2)


class GitHubActionsSkill(BaseTool):
    name: str = "github_actions"
    description: str = (
        "Write GitHub Actions workflows for backend services: "
        "test, SAST, container build, and deployment pipelines."
    )

    def _run(self, service_name: str, test_command: str = "npm test", build_command: str = "npm run build") -> str:
        return json.dumps({
            "skill": "github_actions",
            "jobs": ["lint", "type-check", "unit-test", "integration-test", "sast", "build", "container-scan", "push"],
            "caching": "actions/cache for node_modules, pip packages, Go module cache",
            "parallelism": "lint + type-check run in parallel; test runs after; build runs after test",
            "sast": "CodeQL analysis on every PR — blocks merge on HIGH+ findings",
        }, indent=2)


class SecurityBestPracticesSkill(BaseTool):
    name: str = "security_best_practices"
    description: str = (
        "Apply security to backend implementations: OWASP Top 10, "
        "input validation, auth on every route, secrets from vault."
    )

    def _run(self, component: str, threat_vectors: str = "") -> str:
        return json.dumps({
            "skill": "security_best_practices",
            "owasp_checklist": {
                "A01_Broken_Access_Control": "Auth guard on every route, RBAC/ABAC at service layer",
                "A02_Cryptographic_Failures": "TLS everywhere, secrets in Vault, bcrypt for passwords",
                "A03_Injection": "Parameterised queries only, input validation with class-validator/Pydantic",
                "A04_Insecure_Design": "Threat modelling per feature, secure-by-default configs",
                "A05_Security_Misconfiguration": "Helmet.js, CORS allow-list, no debug in prod",
                "A06_Vulnerable_Components": "Dependabot + Snyk, lock file pinning, SBOM",
                "A07_Auth_Failures": "JWT RS256, short-lived tokens, refresh rotation, rate limit /auth/*",
                "A08_Data_Integrity": "Signed packages, verified docker images, immutable infra",
                "A09_Logging_Failures": "All auth events logged, no PII in logs, alerts on suspicious activity",
                "A10_SSRF": "Allow-list for external HTTP calls, no user-controlled URLs",
            },
        }, indent=2)


class OWASPSkill(BaseTool):
    name: str = "owasp"
    description: str = (
        "Review implementations against OWASP Top 10 and produce "
        "security finding reports with remediation recommendations."
    )

    def _run(self, component: str, threat_vectors: str = "") -> str:
        return json.dumps({
            "skill": "owasp",
            "review_process": [
                "Check all endpoints have authentication (A01)",
                "Verify no hardcoded secrets or weak cryptography (A02)",
                "Confirm parameterised queries throughout (A03)",
                "Review error messages — no stack traces to client (A04)",
                "Check all dependency CVEs via Dependabot (A06)",
                "Verify JWT validation: exp, iss, aud, sig (A07)",
                "Confirm logging captures auth events without PII (A09)",
                "Test SSRF: can user supply URLs that hit internal services? (A10)",
            ],
        }, indent=2)


class CleanArchitectureSkill(BaseTool):
    name: str = "clean_architecture"
    description: str = (
        "Implement Clean Architecture: domain core with no framework dependencies, "
        "application layer for use cases, infrastructure for IO, presentation for HTTP."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "clean_architecture",
            "layers": {
                "domain": "Entities, value objects, domain events, repository interfaces — ZERO framework imports",
                "application": "Use cases / services, DTOs, command/query handlers — depends on domain only",
                "infrastructure": "Repository implementations, ORM adapters, NATS publishers, HTTP clients — depends on domain interfaces",
                "presentation": "Controllers, resolvers, event consumers — depends on application layer only",
            },
            "dependency_rule": "Dependencies point inward only — domain never imports infrastructure",
            "di": "Dependency injection inverts control — infrastructure implements domain interfaces",
        }, indent=2)


class SOLIDSkill(BaseTool):
    name: str = "solid_principles"
    description: str = (
        "Apply SOLID principles in every module: SRP, OCP, LSP, ISP, DIP "
        "with concrete backend examples and code review checklist."
    )

    def _run(self, service_name: str, description: str, language: str = "TypeScript", framework: str = "NestJS") -> str:
        return json.dumps({
            "skill": "solid_principles",
            "principles": {
                "SRP": f"{service_name}Service does ONE thing — split if it has multiple reasons to change",
                "OCP": "Open for extension (new implementations), closed for modification (stable interface)",
                "LSP": "Subclasses must honour the contract of the interface they implement",
                "ISP": "Small, focused interfaces — not one God interface with 20 methods",
                "DIP": f"{service_name}Service depends on I{service_name}Repository interface — not Prisma{service_name}Repository directly",
            },
            "review_checklist": [
                "Class has one reason to change (SRP)",
                "New behaviour added via extension, not modification (OCP)",
                "All interface methods used by every implementor (ISP)",
                "Service depends on interface, not concrete class (DIP)",
            ],
        }, indent=2)


class MigrationSkill(BaseTool):
    name: str = "migrations"
    description: str = (
        "Write zero-downtime database migrations: "
        "expand-contract pattern, backfill scripts, and rollback steps."
    )

    def _run(self, migration_name: str, change_description: str, zero_downtime: bool = True) -> str:
        return json.dumps({
            "skill": "migrations",
            "migration_name": migration_name,
            "change": change_description,
            "zero_downtime_strategy": {
                "add_column": "Add nullable → deploy → backfill → add NOT NULL → next deploy",
                "rename_column": "Add new column → dual-write old+new → migrate reads → drop old — 3 deploys",
                "drop_column": "Mark as deprecated → stop writing → backfill nulls → drop — 2 deploys",
                "add_index": "CREATE INDEX CONCURRENTLY — does not lock table",
                "rename_table": "Add new table → dual-write → migrate reads → drop old — 3 deploys",
            },
            "rollback": "Every migration has a matching down() that restores previous state",
        }, indent=2)


# ===========================================================================
# Skill Registry
# ===========================================================================

BACKEND_ENGINEER_SKILLS = [
    BackendEngineeringSkill(),
    DistributedSystemsSkill(),
    CloudNativeSkill(),
    MicroservicesSkill(),
    TypeScriptSkill(),
    NodeJSSkill(),
    NestJSSkill(),
    ExpressJSSkill(),
    FastifySkill(),
    PythonSkill(),
    FastAPISkill(),
    JavaSkill(),
    SpringBootSkill(),
    GoSkill(),
    RESTAPISkill(),
    GraphQLSkill(),
    GRPCSkill(),
    WebSocketsSkill(),
    EventDrivenArchSkill(),
    CQRSSkill(),
    EventSourcingSkill(),
    NATSSkill(),
    KafkaSkill(),
    RedisSkill(),
    PostgreSQLSkill(),
    MySQLSkill(),
    MongoDBSkill(),
    PrismaORMSkill(),
    DrizzleORMSkill(),
    SQLOptimisationSkill(),
    CachingSkill(),
    AuthenticationSkill(),
    AuthorizationSkill(),
    OAuth2Skill(),
    OIDCSkill(),
    JWTSkill(),
    RBACSkill(),
    ABACSkill(),
    SecretsManagementSkill(),
    DockerSkill(),
    KubernetesSkill(),
    OpenTelemetrySkill(),
    PrometheusSkill(),
    GrafanaSkill(),
    LoggingSkill(),
    TracingSkill(),
    PerformanceOptimisationSkill(),
    ConcurrencySkill(),
    AsyncProgrammingSkill(),
    TestingSkill(),
    UnitTestingSkill(),
    IntegrationTestingSkill(),
    ContractTestingSkill(),
    APIVersioningSkill(),
    CICDSkill(),
    GitSkill(),
    GitHubActionsSkill(),
    SecurityBestPracticesSkill(),
    OWASPSkill(),
    CleanArchitectureSkill(),
    SOLIDSkill(),
    MigrationSkill(),
]

__all__ = ["BACKEND_ENGINEER_SKILLS"]
