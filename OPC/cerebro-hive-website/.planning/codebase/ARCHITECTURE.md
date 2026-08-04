<!-- refreshed: 2026-08-04 -->
# Architecture

**Analysis Date:** 2026-08-04

## System Overview

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                    Enterprise Intelligence OS (EIOS)                      │
│                          Studio + Platform Layer                          │
│  `apps/studio` (Next.js)         `apps/platform-api` (Fastify)            │
└────────────┬─────────────────────────────┬──────────────────────────────┘
             │                             │
             ▼                             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      Core Capability & Business Logic Layer               │
│  Agent Runtime | Knowledge | Workflows | Data Processing                 │
│  `packages/runtime-core`, `packages/domain`, `packages/*-capability`     │
└────────┬─────────────────────────────────┬──────────────────────────────┘
         │                                 │
         ▼                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    Infrastructure & Gateway Layer                         │
│  AI Gateway | Database | Cache | Queue | Auth | Observability            │
│  `packages/ai-gateway`, `packages/database`, `packages/auth`             │
└──────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      External Services & Data Stores                      │
│  PostgreSQL | Redis | NATS | Anthropic/OpenAI APIs | S3                 │
│  `prisma/` config | Environment Configuration                            │
└──────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Studio (UI) | Marketing site, dashboard, builder interfaces | `apps/studio/` |
| Platform API | Core backend API, route handling, DDD orchestration | `apps/platform-api/src/` |
| AI Gateway | Unified AI provider abstraction (Anthropic, OpenAI, etc.) | `packages/ai-gateway/` |
| Runtime Core | Execution kernel, durable execution, state machines | `packages/runtime-core/src/execution/` |
| Domain | Business logic, aggregates, use cases | `packages/domain/` |
| Database | Prisma client, repositories, transactions | `packages/database/src/repositories/` |
| Agent Builder | Agent construction, tool registration, execution | `packages/capabilities/agent-builder/` |
| Workflow | Workflow orchestration, DAG execution | `packages/workflow/` |
| Core Bus | Command/Event bus, CQRS dispatch | `packages/core-bus/` |
| Auth | Authentication, JWT, workspace access control | `packages/auth/` |
| Telemetry | Observability, tracing, metrics | `packages/telemetry/` |

## Pattern Overview

**Overall:** Layered Architecture with Domain-Driven Design (DDD) + Command Query Responsibility Segregation (CQRS)

**Key Characteristics:**
- **Pnpm Monorepo:** Single dependency tree, workspace-local scoping via `@cerebro/*` namespace
- **Turborepo Build:** Incremental builds, cached task execution, dependency graph optimization
- **DDD + CQRS:** Command bus dispatches domain commands; repositories manage aggregates
- **Event-Driven:** Outbox pattern for event sourcing, async command handling
- **Capability Model:** Features encapsulated as `@cerebro/*-capability` packages
- **Provider Abstraction:** AI Gateway pattern masks heterogeneous LLM providers (Anthropic, OpenAI, etc.)
- **Middleware-Heavy Backend:** Fastify hooks for auth, context, logging, workspace isolation

## Layers

### Layer 1: Presentation (User-Facing)

**Purpose:** UI delivery, API documentation, client interaction

**Location:** 
- `apps/studio/` (Next.js frontend)
- `apps/studio/app/` (Next.js App Router pages)
- `apps/studio/components/` (React components)

**Contains:** 
- React Server Components and Client Components
- Next.js route handlers
- TailwindCSS styling
- 3D graphics (Three.js, React Three Fiber)
- Workflow visualizations (Xyflow, Dagre)

**Depends on:** 
- API client (`@cerebro/api-client`)
- Workflow SDK (`@cerebro/workflow`)
- Agent SDK (`@cerebro/agent-sdk`)
- Shared types

**Used by:** Browser clients, Playwright E2E tests

### Layer 2: API Gateway (Route Handling)

**Purpose:** HTTP/REST contract, request validation, route dispatch

**Location:** `apps/platform-api/src/`

**Contains:**
- Fastify server bootstrap (`src/bootstrap.ts`)
- Route modules (`src/modules/*/routes.ts`)
- Global middleware (`src/middleware/`)
- Error mapping (`src/errors/ErrorMapper.ts`)

**Middleware Stack (order matters):**
1. **RequestContextHook** — Extracts/creates trace ID, sets up request context
2. **onRequestLog** — Logs incoming requests (method, path, headers)
3. **onSendLog** — Logs outgoing responses (status, duration)
4. **requireAuthHook** — Validates JWT, extracts tenantId, sets auth context (protected routes only)
5. **requireWorkspaceAccessHook** — Verifies tenant owns requested workspaceId (protected routes only)

**Depends on:** 
- Domain layer (Command Bus, repositories)
- Database (Prisma)
- Auth (`@cerebro/auth`)

**Used by:** HTTP clients, browsers, mobile apps

### Layer 3: Domain Logic (CQRS)

**Purpose:** Orchestration of commands, execution strategy, business rules

**Location:** `packages/domain/`, `packages/core-bus/`

**Contains:**
- **CommandBus** (`@cerebro/core-bus`) — Dispatches commands to handlers
- **AgentExecutionProvider** (`apps/platform-api/src/modules/runtime/AgentExecutionProvider.ts`) — Executes agents via runtime
- **ExecutionOrchestrator** (`packages/domain/`) — Coordinates execution lifecycle
- **Repositories** — Agent, Workflow, Knowledge repositories (Prisma-backed)

**Data Flow for Agent Execution:**
1. API route receives `POST /api/v1/runtime/agents/execute`
2. Command Bus dispatches `ExecuteAgentCommand`
3. **ExecutionRuntimeService** receives command
4. **ExecutionOrchestrator** creates Execution aggregate
5. **AgentExecutionProvider** invokes **AgentRuntimeService**
6. Agent runs with AI Gateway, Tool Registry, Memory Engine
7. Execution state stored in **InMemoryExecutionRepository** (Phase 10.1/10.2 limitation)
8. Response returned to client

**Depends on:** 
- Database (repositories, Prisma)
- AI Gateway (LLM inference)
- Capability packages (Agent Runtime, Tool Registry)
- Core Bus (command dispatch)

**Used by:** API routes, other domain services

### Layer 4: Capability Services (Business Domains)

**Purpose:** Encapsulated domain features—agents, workflows, knowledge, evaluation

**Location:** `packages/capabilities/*/`

**Key Capabilities:**
- **agent-builder** (`@cerebro/agent-builder-capability`) — Agent construction, runtime, tool registry
- **workflow** (`@cerebro/workflow`) — DAG-based workflow execution
- **knowledge** (`@cerebro/knowledge`) — Knowledge graph, semantic search, embeddings
- **deployment** (`@cerebro/deployment`) — Deployment orchestration
- **evaluation** (`@cerebro/evaluation`) — Model evaluation, benchmark

**Architecture (per capability):**
- `src/types.ts` — Domain types, contracts
- `src/services/` — Service implementations
- `src/ports/` — Interface definitions (provider pattern)
- `src/adapters/` — Concrete implementations (Anthropic, OpenAI, etc.)
- `index.ts` — Public API barrel export

**Depends on:** 
- Database
- Other capabilities
- Core bus

**Used by:** Domain orchestrator, API routes

### Layer 5: Infrastructure & Abstraction Layer

**Purpose:** External service integration, cross-cutting concerns, provider abstraction

**Location:** `packages/{ai-gateway,database,auth,cache,queue,telemetry}/`

#### AI Gateway (`packages/ai-gateway/src/`)
- **Unified interface** for Anthropic, OpenAI, custom providers
- **Circuit breaker** for resilience
- **Rate limiter** for cost control
- **Response cache** for performance
- **Provider translation** (tool definitions, streaming, cost calculation)

Structure:
```
src/
├── gateway.ts                 # Main AIGateway class
├── types.ts                   # ChatRequest, ChatResponse, ProviderConfig
├── providers/
│   ├── anthropic.provider.ts  # Anthropic SDK integration
│   ├── openai.provider.ts     # OpenAI SDK integration
│   └── base.provider.ts       # AIProvider interface
├── circuit-breaker.ts         # Fault tolerance
├── rate-limiter.ts            # Usage limits
├── cache.ts                   # Response memoization
└── routing/
    └── ModelRouter.ts         # Provider selection logic
```

#### Database (`packages/database/`)
- **Prisma ORM** for PostgreSQL access
- **Repository pattern** for aggregate access
- **Unit of Work pattern** for transactions
- **Outbox pattern** for event sourcing

Key repositories:
- `AgentRepository` — Agent aggregate root
- `WorkflowRepository` — Workflow aggregate
- `KnowledgeRepository` — Knowledge entities
- `WorkspaceRepository` — Workspace/tenant isolation
- `PrismaUnitOfWork` — Transaction coordination

#### Auth (`packages/auth/`)
- **JWT validation** (RS256, HS256)
- **Tenant extraction** from token claims
- **Workspace access control** via repository query

**Depends on:** External services (PostgreSQL, Redis, etc.)

**Used by:** All application layers

### Layer 6: Data Store & External Services

**Purpose:** Persistence, caching, async messaging, external APIs

**Services:**
- **PostgreSQL** (primary data store via Prisma)
- **Redis** (caching, session, queue backing)
- **NATS JetStream** (event bus, message streaming)
- **Anthropic/OpenAI APIs** (LLM inference)
- **Embedding providers** (Voyage, Cohere)
- **S3/MinIO** (object storage)

**Configuration:** 
- `.env`, `.env.local`, `.env.production` — Runtime config
- `prisma/schema.prisma` — Database schema definition
- Secrets managed via environment (See forbidden_files note)

**Depends on:** Cloud infrastructure (AWS, GCP, etc.)

## Data Flow

### Primary Request Path: Agent Execution

1. **Browser/Client** sends `POST /api/v1/runtime/agents/execute` with agent ID, input
2. **Studio App** calls via `@cerebro/api-client`
3. **Platform API Route** (`apps/platform-api/src/modules/runtime/runtime.routes.ts`)
   - Validates request against TypeBox schema
   - Extracts context (trace ID, JWT, workspace)
4. **Middleware Chain:**
   - `requestContextHook` — Creates tracing context
   - `requireAuthHook` — Validates JWT, sets `cerebroContext.tenantId`
   - `requireWorkspaceAccessHook` — Checks workspace ownership
5. **Handler invokes** `executionRuntimeService.execute()`
6. **ExecutionOrchestrator** creates `Execution` aggregate:
   - Sets state = PENDING
   - Generates execution ID
7. **AgentExecutionProvider** calls `agentRuntimeService.runAgent()`
8. **AgentRuntimeService**:
   - Resolves agent from repository
   - Loads memory (short-term, long-term)
   - Initializes tool registry
9. **Agent Runtime Loop:**
   - Builds chat messages from conversation + memory
   - Calls **AI Gateway** (`AIGateway.chat()`)
   - Gateway selects provider (Anthropic, OpenAI, mock)
   - Provider returns completion + tool calls
   - If tool calls present, invoke **Tool Runtime**
   - Tool Runtime resolves and executes tools
   - Loop continues until no more tool calls
10. **Memory Update:**
    - Stores conversation turns in short-term memory
    - Periodic flush to long-term memory (via Outbox)
11. **Execution Complete:**
    - State = SUCCESS/FAILED
    - Result stored in `InMemoryExecutionRepository`
    - Response returned to client (with trace ID for debugging)

### Secondary Flow: Workflow Execution

1. Client calls `POST /api/v1/workflows/execute`
2. **Workflow Service** loads DAG from repository
3. **Workflow Engine** topologically sorts stages
4. **For each stage:**
   - Resolve stage inputs from previous outputs + workspace data
   - Dispatch execution (currently agent-only; workflow/tool kinds rejected)
   - Wait for completion
5. Accumulate results, return final output

### Event Sourcing (Async Outbox Pattern)

1. **Domain event** created during execution (e.g., `AgentExecutedEvent`)
2. Event stored in Outbox table (atomic with command transaction)
3. **Background worker** (not yet implemented) polls Outbox
4. Publishes to NATS JetStream
5. Subscribers (telemetry, knowledge indexing) react

**State Management:**
- **Execution State:** In-memory (process-lifetime)
- **Agent/Workflow State:** PostgreSQL (persistent)
- **Conversation History:** PostgreSQL (via AgentConversationRepository)
- **Long-term Memory:** PostgreSQL (via memory engine)
- **Cache:** Redis (session, response cache)

## Key Abstractions

### AIProvider Interface

**Purpose:** Decouple application from specific LLM vendor

**Examples:** 
- `packages/ai-gateway/src/providers/anthropic.provider.ts`
- `packages/ai-gateway/src/providers/openai.provider.ts`
- `packages/ai-gateway/src/providers/mock.provider.ts`

**Pattern:**
```typescript
interface AIProvider {
  chat(request: ChatRequest): Promise<ChatResponse>;
  streamChat(request: ChatRequest): AsyncIterable<StreamChunk>;
}
```

### Agent Runtime Service

**Purpose:** Orchestrate agent execution loop (conversation → tools → memory)

**Location:** `packages/capabilities/agent-builder/src/services/AgentRuntimeService.ts`

**Responsibilities:**
- Load agent definition
- Manage conversation context
- Invoke AI Gateway
- Coordinate tool execution
- Update memory

### ExecutionOrchestrator

**Purpose:** Coordinate lifecycle of all execution types (Agent, Workflow, Tool, Evaluation)

**Location:** `packages/domain/`

**Responsibilities:**
- Create Execution aggregate
- Dispatch to execution provider
- Track state transitions
- Handle cancellation

### Command Bus

**Purpose:** Decouple command issuers from handlers via dispatch table

**Location:** `packages/core-bus/`

**Commands dispatched:**
- `ExecuteAgentCommand` → `AgentExecutionProvider`
- `ExecuteWorkflowCommand` → `WorkflowService`
- Others (not yet wired)

## Entry Points

### Frontend Entry

**Location:** `apps/studio/app/page.tsx`

**Triggers:** Browser navigation to `/`

**Responsibilities:** 
- Render marketing site
- Compose hero, architecture, FAQ sections
- Link to dashboard/builder

### API Entry

**Location:** `apps/platform-api/src/server.ts`

**Triggers:** `npm run dev` or container startup

**Responsibilities:**
- Instantiate Fastify server
- Load bootstrap dependencies
- Register routes
- Start listening on port (default 3000)

### Bootstrap/DI

**Location:** `apps/platform-api/src/bootstrap.ts`

**Wiring:**
1. Create MockProviders (fallback LLM)
2. Create AIGatewayProvider (real inference)
3. Create ToolRuntimeProvider (real tool execution)
4. Create ExecutionRuntimeService (orchestration)
5. Create Fastify server with middleware stack
6. Register route handlers

## Architectural Constraints

- **Threading:** Single-threaded event loop (Node.js). CPU-bound operations (crypto, compression) use worker threads via `tsx`. I/O is async.

- **Global state:** 
  - Singleton Prisma client (`packages/database/index.ts`) — reused across requests
  - RuntimeRegistry (providers) — registered once at bootstrap, no teardown
  - In-memory execution repository — process-lifetime only (Phase 10.1 limitation)

- **Circular imports:** 
  - `@cerebro/database` ← → `@cerebro/domain` — database imports domain types for repositories
  - Mitigated via interface-based design (e.g., `AgentRepository` contract defined in domain)

- **Execution State Lifetime:** 
  - Executions stored in `InMemoryExecutionRepository` — lost on process restart
  - **Not production-ready for stateful workflows**
  - PR in progress (hiveforge branch) to add persistent `PrismaExecutionStore`

- **Authentication Boundary:**
  - Health routes (GET /) bypass JWT requirement (Kubernetes probes)
  - All other routes require valid JWT
  - Workspace access gated per tenantId

## Anti-Patterns

### Pattern: Using Mock Providers in Production

**What happens:** MockProviders are registered at bootstrap, always available as fallback

**Why it's wrong:** Executions silently degrade to mock LLM, producing useless outputs without alerting operators

**Do this instead:** Ensure AIGatewayProvider and ToolRuntimeProvider are registered and healthy before marking pod as Ready. Use Circuit Breaker state in readiness probe (see `packages/ai-gateway/src/circuit-breaker.ts`)

### Pattern: Trusting workspaceId Header Without Validation

**What happens:** Previous code accepted `workspaceId` from request header without verifying tenant owns it

**Why it's wrong:** Tenant A could read/write Tenant B's workspace with a crafted header

**Do this instead:** After extracting `tenantId` from JWT in `requireAuthHook`, validate workspaceId via `WorkspaceRepository.getByIdAndTenantId()` in `requireWorkspaceAccessHook` (see `apps/platform-api/src/bootstrap.ts` line 126 — **this is now enforced**)

## Error Handling

**Strategy:** Problem Details (RFC 7807) for API errors

**Implementation:** 
- Global error handler in Fastify (`src/bootstrap.ts` line 94)
- `ErrorMapper.mapToProblemDetails()` normalizes exceptions to:
  ```json
  {
    "type": "https://api.cerebrohive.com/errors/...",
    "title": "Human-readable error",
    "status": 400,
    "detail": "Detailed explanation",
    "traceId": "..." 
  }
  ```

**Patterns:**
- **Validation Errors** (400) — TypeBox schema violations
- **Auth Errors** (401) — Invalid/missing JWT
- **Authorization Errors** (403) — Insufficient workspace access
- **Not Found** (404) — Resource doesn't exist
- **Server Errors** (500) — Unexpected exceptions (logged with trace ID)

**Tracing:** All errors include `traceId` from request context for debugging

## Cross-Cutting Concerns

**Logging:** 
- Fastify logger plugin (enabled by default)
- `onRequestLog` / `onSendLog` middleware hooks
- Trace ID propagated via `cerebroContext.traceId`

**Validation:**
- TypeBox schemas on route definitions (`@fastify/type-provider-typebox`)
- Automatic 400 response on schema mismatch
- No manual validation needed in handlers

**Authentication:**
- JWT validation via `requireAuthHook`
- Token extracted from `Authorization: Bearer <token>`
- `tenantId` set in `cerebroContext` for downstream use

**Authorization:**
- Workspace access checked via `requireWorkspaceAccessHook`
- Prevents cross-tenant data access
- Query filters in repositories (e.g., `agentRepository.findByWorkspaceId()`)

---

*Architecture analysis: 2026-08-04*
