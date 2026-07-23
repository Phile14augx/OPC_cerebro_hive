<!-- refreshed: 2026-07-23 -->
# Architecture

**Analysis Date:** 2026-07-23

## System Overview

This repository is a pnpm/Turborepo monorepo (`cerebro-hive-os`) containing several Next.js marketing/product frontends and one real backend runtime: a Python/FastAPI service at `apps/studio/agentos`. Root-level docs (`PRODUCT_REGISTRY.md`, `CAPABILITY_ARCHITECTURE.md`, `CEREBROHIVE_CONSTITUTION.md`, `PRODUCT_SPECIFICATIONS/*.md`) describe a much larger target product family ("Cerebro" apps + "Hive" platform services) than what is actually implemented — see **Documented vs. Implemented Gap** below. `apps/studio/agentos` is the only subsystem with a working execution engine and is the integration point for the planned CerebroBuild capability (see `docs/superpowers/specs/2026-07-23-cerebrobuild-design.md`).

```text
┌───────────────────────────────────────────────────────────────────────────┐
│  Frontends (Next.js, apps/studio, apps/forge — others are empty stubs)     │
│  `apps/studio/app/**`, `apps/forge/app/**`                                  │
└───────────────────────────────┬───────────────────────────────────────────┘
                                 │ HTTP (fetch / lib/agentos client)
                                 ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                AgentOS — FastAPI Modular Monolith                          │
│                `apps/studio/agentos/app/main.py`                           │
├───────────────┬───────────────┬───────────────┬───────────────────────────┤
│ API Routers    │ Core Engines  │ Domain slices │ Platform infra            │
│ `app/api/      │ `app/core/    │ `app/finance/`│ `app/db.py`, `security.py`│
│  routers/*.py` │  *.py`        │ (real; other  │ `middleware.py`,          │
│                │               │  domain dirs  │ `config.py`               │
│                │               │  are stubs)   │                           │
└───────┬────────┴───────┬───────┴───────────────┴───────────────┬───────────┘
        │                │                                       │
        ▼                ▼                                       ▼
┌───────────────┐ ┌───────────────────┐                 ┌─────────────────────┐
│ SQLAlchemy ORM │ │ Cerebro X LLM      │                 │ Event / audit log    │
│ `app/models/*` │ │ Gateway (provider  │                 │ `app/models/         │
│                │ │ fallback chain)    │                 │  observability.py`   │
│                │ │ `app/core/         │                 │                      │
│                │ │  cerebro_x/*`      │                 │                      │
└───────┬────────┘ └────────────────────┘                 └─────────────────────┘
        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  SQLite (dev, `agentos.db`) / PostgreSQL (`DATABASE_URL`) — single store   │
│  for agents, runs, workflow_runs, memory, knowledge, governance, events    │
└───────────────────────────────────────────────────────────────────────────┘
```

A second, disconnected effort exists in `packages/domain`, `packages/database` (Prisma), and `packages/capabilities/*` — a TypeScript "domain services + outbox pattern" layer (recent commits: "introduce domain repository layer with tenant isolation", "introduce domain services layer with outbox pattern", "introduce capability services"). It is not wired into any running service (`services/*-api` directories other than `forge-api` and `contentops` are empty), and has no relationship to the Python AgentOS runtime today. Treat it as a separate, earlier-stage architecture track, not part of the request path described below.

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| FastAPI app / router mounting | Wires middleware, CORS, lifespan (DB init, optional NATS connect), mounts legacy + finance routers | `apps/studio/agentos/app/main.py` |
| Agent Runtime (kernel) | Boots an agent, runs governance pre-check, drives plan → execute → reflect → store state machine | `apps/studio/agentos/app/core/runtime.py` |
| Planner | Decomposes a goal into an ordered step list via the LLM gateway, with a deterministic 2-step fallback | `apps/studio/agentos/app/core/planner.py` |
| Workflow Engine | DAG executor for multi-node/multi-agent flows: `start/tool/condition/approval/loop/agent/agent_vote/finish` | `apps/studio/agentos/app/core/workflow_engine.py` |
| Tool Framework | Permissioned registry of built-in tools, invoked by both single-agent runtime and workflow `tool` nodes | `apps/studio/agentos/app/core/tools/registry.py`, `base.py`, `builtin.py` |
| Governance Engine | Policy-as-code evaluator (`if`/`then` YAML-shaped rules) returning block/require_approval decisions | `apps/studio/agentos/app/core/governance_engine.py` |
| Context Engine | Fuses Memory + Knowledge retrieval + in-scope governance policies into one ranked bundle for reasoning steps | `apps/studio/agentos/app/core/context_engine.py` |
| Memory Engine | Working/episodic/semantic/long-term memory tiers backed by SQL + vector similarity | `apps/studio/agentos/app/core/memory_engine.py` |
| Knowledge Engine (RAG) | Chunk/embed/retrieve/cite over uploaded documents | `apps/studio/agentos/app/core/knowledge_engine.py` |
| Cerebro X LLM Gateway | Multi-provider completion routing (Anthropic/OpenAI/Gemini/Ollama) with mock-provider fallback | `apps/studio/agentos/app/core/cerebro_x/gateway.py`, `router.py`, `providers/*.py` |
| Event Bus | In-process pub/sub + append-only event log; dual-publishes to NATS JetStream when `NATS_URL` is set | `apps/studio/agentos/app/core/event_bus.py`, `app/core/nats/bus.py` |
| Observability | Structured trace spans + metrics, `GET /observability/summary` rollups | `apps/studio/agentos/app/core/observability.py` |
| Cortex (decision engine) | Least-squares forecasting, 0/1-knapsack optimization | `apps/studio/agentos/app/core/cortex_engine.py` |
| Simulator (digital twin) | Seeded Monte Carlo queue simulation | `apps/studio/agentos/app/core/simulator_engine.py` |
| Agent Registry (data) | Agent identity, capabilities, tools, skills, lifecycle state, versioning | `apps/studio/agentos/app/models/registry.py` |
| Finance/ERP slice | Real double-entry ledger + invoice categorize/govern/post pipeline (only fully wired domain module besides legacy) | `apps/studio/agentos/app/finance/*.py` |
| Capability Registry (orphan) | IoC-container-style registry with health/latency metadata; defined but never imported by any router or engine | `apps/studio/agentos/app/core/capabilities/registry.py` |
| Aspirational SDK layer | Empty (0-line) module tree scaffolding a future agent SDK (ai/, memory/, planning/, governance/, evaluation/, simulation/, decision/, capabilities/) | `apps/studio/agentos/app/core/sdk/**` |
| Aspirational orchestrator layer | Empty (0-line) `engine.py`, `dispatcher.py`, `pipeline.py`, `workflow.py`; only `human.py` (34 lines) and `agents.py`/`runtime.py` (thin, unused by main.py) have content | `apps/studio/agentos/app/core/orchestrator/**` |
| CerebroHive Studio frontend | Next.js 14 App Router marketing + product-console site; the only frontend that talks to AgentOS | `apps/studio/app/**`, `apps/studio/lib/agentos/*` |
| CerebroForge frontend | Next.js 14 App Router site for the CerebroForge product | `apps/forge/app/**` |

## Pattern Overview

**Overall:** Modular monolith (FastAPI) for the backend runtime, with a Next.js "content platform" pattern for each frontend app in the monorepo. The backend explicitly documents itself (`app/main.py` docstring) as organized into future domain modules (`/api/platform`, `/api/archive`, `/api/runtime`, `/api/studio`, `/api/flow`, `/api/copilot`, `/api/insight`, `/api/shield`, `/api/ops`) reachable via clean prefixes for later service extraction — but **only the legacy flat routers and the finance module are actually mounted** in `app.include_router(...)` calls; the domain-module directories referenced in the docstring (`app/archive/`, `app/platform/`, `app/flow/`, `app/copilot/`, `app/insight/`, `app/hiveops/`, `app/hiveshield/`, `app/studio/`, `app/runtime/`) are either empty `__init__.py` stubs or contain routers that are never included by `main.py`.

**Key Characteristics:**
- Single FastAPI process, single SQLAlchemy `Base`/engine (SQLite dev, Postgres-ready via `DATABASE_URL`) — no service boundaries at runtime despite directory-level "domain module" framing.
- Every production infrastructure dependency named in the target architecture (Temporal, NATS JetStream, OpenSearch, MinIO, Keycloak, HashiCorp Vault, OPA, Kubernetes) is implemented as a lightweight in-process interface today (DAG executor in Python, in-process pub/sub, local vector similarity, API-key bearer auth, YAML/dict policy rules) with the production swap documented inline in code comments — see `apps/studio/agentos/README.md` "Roadmap to production".
- Routers are thin: each file in `app/api/routers/` does request validation (Pydantic) + auth dependency + a call into the matching `app/core/*_engine.py` module, then returns an ORM object via `response_model`.
- Core engines call each other directly by importing sibling modules (`runtime.py` imports `context_engine`, `governance_engine`, `memory_engine`, `planner`, `evaluation`, `observability`) — no message broker or DI container mediates between them in the working code path.
- Governance runs synchronously and first: `runtime.execute()` always evaluates policy before any tool/LLM call, so an agent that needs human approval never spends tokens or calls a tool before sign-off.

## Layers

**API layer (routers):**
- Purpose: HTTP surface — request/response validation, auth, thin delegation to core engines.
- Location: `apps/studio/agentos/app/api/routers/*.py` (mounted) plus unmounted domain routers in `app/archive/*/router.py`, `app/platform/prompts/api.py` (currently empty).
- Contains: FastAPI `APIRouter` instances, Pydantic request/response models.
- Depends on: `app/core/*`, `app/models/*`, `app/security.py`, `app/db.py`.
- Used by: `app/main.py` via `app.include_router(...)`.

**Core engine layer:**
- Purpose: All real business logic — planning, execution, governance, memory, knowledge, workflow DAG, tools, LLM routing, observability.
- Location: `apps/studio/agentos/app/core/*.py` (flat, "real" implementation) — distinct from `app/core/orchestrator/` and `app/core/sdk/` (mostly empty aspirational restructure).
- Contains: Plain Python modules/classes, no framework dependency (importable and testable without FastAPI running).
- Depends on: `app/models/*` (SQLAlchemy), each other (direct imports), `app/core/cerebro_x/*` for LLM calls.
- Used by: API routers, other core engines (e.g., `workflow_engine.py` calls back into `runtime.execute()` for `agent`/`agent_vote` nodes).

**Data/persistence layer:**
- Purpose: SQLAlchemy declarative models, one file per bounded context, plus the engine/session factory.
- Location: `apps/studio/agentos/app/models/*.py`, `apps/studio/agentos/app/db.py`.
- Contains: ORM table classes (`Agent`, `Run`, `WorkflowRun`, `Policy`, `Approval`, `AuditLog`, `MemoryItem`, `TraceSpan`, `MetricEvent`, `EventLogEntry`, `APIKey`, etc.).
- Depends on: SQLAlchemy, `app.config.get_settings().database_url`.
- Used by: Core engines and routers via `Depends(get_db)`.

**Platform infra (cross-cutting):**
- Purpose: Settings, auth, middleware, rate limiting.
- Location: `apps/studio/agentos/app/config.py`, `security.py`, `middleware.py`, `rate_limit.py`.
- Contains: `pydantic_settings.BaseSettings` (`Settings`), bearer-token API-key auth dependency, `SecurityHeadersMiddleware`/`RequestGuardMiddleware`/`AccessLogMiddleware`, `slowapi` limiter.
- Depends on: Nothing internal (leaf layer).
- Used by: Everything above.

**Domain modules (real vs. stub):**
- **Finance (real):** `apps/studio/agentos/app/finance/` — double-entry ledger, invoice categorizer, governance-integrated automation pipeline, mounted in `main.py`.
- **Archive (partially real, unmounted):** `apps/studio/agentos/app/archive/` — has real code for `pipeline/` (chunker, embedder, parser, indexer, rag — 46-171 lines each), `documents/router.py` (192 lines), `prompts/router.py` (109 lines), `search/router.py` (73 lines), `models.py`/`schemas.py` (270 lines each), but its top-level `router.py` (13 lines) is never imported by `main.py`, and `diff/`, `inference/`, `ontology/`, `rules/`, `validation/*` (minus `quality.py`/`conflict.py`) are all empty stubs.
- **Platform (mostly stub):** `apps/studio/agentos/app/platform/` — only `auth/keycloak.py` (149 lines, a documented future-swap adapter) and `prompts/{repository,compiler,registry}.py` (21-27 lines each) have content; `billing/`, `capabilities/`, `evaluation/`, `governance/`, `operators/`, `orgs/`, `runtime/`, `simulation/`, `tracing/` are empty `__init__.py` files (`simulation/runtime.py` has 60 lines).
- **Flow, Copilot, Insight, HiveOps, HiveShield, Studio (backend):** `apps/studio/agentos/app/{flow,copilot,insight,hiveops,hiveshield,studio}/__init__.py` — all zero-length. No implementation exists for these named modules despite being listed in `main.py`'s docstring and in the root `/` meta endpoint's `modules` dict.

## Data Flow

### Single-Agent Run (`runtime.execute`)

1. Client `POST /runtime/execute {agent_slug, goal}` (`apps/studio/agentos/app/api/routers/runtime.py`) — resolves the `Agent` row and calls `runtime_core.execute(db, agent, goal)`.
2. `runtime.execute()` creates a `Run` row (`status="thinking"`), publishes `run.started`, then calls `governance_engine.evaluate(db, context)` **before anything else runs** (`apps/studio/agentos/app/core/runtime.py:22-45`).
3. If any policy fires `block` → run fails immediately, audit-logged, no tool/LLM call ever happens.
4. If any policy fires `require_approval` → `Run.status = "pending_approval"`, an `Approval` row is created per policy, and control returns to the caller. A human resolves it via `POST /governance/approvals/{id}/decide`, which calls `runtime.resume_after_approval(db, run)` → `_execute_steps(...)`.
5. If no policy fires → `_execute_steps()` runs directly: `run.status = "planning"` → `planner.decompose(goal, strategy=agent.reasoning_profile, available_tools=agent.tools)` (LLM call through `cerebro_x.gateway`, JSON-parsed into `PlanStep`s, deterministic 2-step fallback if parsing fails).
6. `run.status = "executing"`; each `PlanStep` is either a `tool` step (→ `tool_registry.invoke()`, result stored to working memory via `memory_engine.remember()`) or a `reason` step (→ `context_engine.assemble()` fuses memory + knowledge + in-scope policies → `cerebro_x.gateway.complete()` → response stored to working memory, tokens/cost recorded via `observability.record_metric`).
7. `run.status = "reflecting"`: `evaluation.evaluate_run()` scores reasoning quality/groundedness from the collected trace spans and cost.
8. `run.status = "completed"`; `run.result` set; `run.completed` event published on the bus. Every state transition is also mirrored onto `agent.lifecycle_state` (`idle → thinking → planning → executing → calling_tool → reflecting → completed|failed`).

### Multi-Node Workflow Run (`workflow_engine.step`)

1. Client `POST /workflows {name, definition, context}` (`apps/studio/agentos/app/api/routers/workflows.py`) creates a `WorkflowRun` row and calls `workflow_engine.step(db, run)`.
2. `step()` walks `definition["nodes"]` starting at `definition["start"]`, tracking the current node in `run.node_states["_cursor"]`, bounded by `MAX_STEPS = 50` as a cycle guard (`apps/studio/agentos/app/core/workflow_engine.py:65-324`).
3. Node types and their effect on `context`/`run.status`:
   - `tool` → `tool_registry.invoke()`, result written to `context[f"{node_id}_result"]`.
   - `condition` → evaluates `_condition_matches()` (reuses `governance_engine._OPS` comparator table: `==`, `!=`, `in`, `contains`, `>`, `<`, `>=`, `<=`) and branches to `next_true`/`next_false`.
   - `approval` → creates/looks up an `Approval` row; if pending, sets `run.status = "paused"` and stores the cursor so `POST /workflows/{id}/resume` can pick up exactly here.
   - `loop` → repeats a fixed count, recording iteration markers (no real sub-DAG loop body yet).
   - `agent` → **Agent Mesh delegation**: resolves the target `Agent` by slug and calls `runtime_core.execute()` for it (full sub-run, including that agent's own governance/planning/tools); if the sub-run itself needs approval, the whole workflow pauses at this node (idempotent — re-checks the same sub-run on resume rather than re-dispatching).
   - `agent_vote` → **Agent Mesh consensus**: runs N agents concurrently (`ThreadPoolExecutor`, each in its own `SessionLocal()` for thread safety), embeds each agent's answer (`cerebro_x/embeddings.py`), scores each candidate by average cosine similarity to every other candidate, picks the highest-agreement winner, and records low-similarity outliers as `dissent`.
   - `finish` → terminal; sets `run.status` to the requested value and clears the cursor.
4. On loop exit without a `finish`/`approval` pause, `run.status = "failed"` with `"workflow exceeded MAX_STEPS"`.
5. Every meaningful transition publishes an event via `app/core/event_bus.py` (`workflow.paused_for_approval`, `mesh.delegate_pending_approval`, `mesh.delegated`, `mesh.consensus_reached`), which is persisted to `EventLogEntry` and dual-published to NATS if `NATS_URL` is configured.

**State Management:**
- All run/workflow state lives in SQL rows (`Run`, `WorkflowRun`) — `node_states` and `context` are JSON columns, so a paused workflow's exact resumption point is durable across process restarts, not held in memory.
- No distributed lock/queue: concurrent resume calls on the same paused run are not explicitly guarded beyond normal DB transaction semantics.

## Key Abstractions

**Agent (registry entity):**
- Purpose: First-class identity for every autonomous worker — capabilities, permissions, tools, skills, LLM config, lifecycle state — not a hardcoded script.
- Examples: `apps/studio/agentos/app/models/registry.py`, seeded via `apps/studio/agentos/agents_store/*.yaml` and `apps/studio/agentos/scripts/seed.py`.
- Pattern: SQLAlchemy row + CRUD router (`app/api/routers/agents.py`); `lifecycle_state` mirrors the runtime state machine (`idle|thinking|planning|executing|waiting|calling_tool|reflecting|learning|completed|failed`).

**PlanStep / Plan:**
- Purpose: The unit of work a planner produces and the runtime executes.
- Examples: `apps/studio/agentos/app/core/planner.py` (`PlanStep` dataclass: `id`, `description`, `kind` [`reason`|`tool`|`approval`], `tool`, `depends_on`).
- Pattern: LLM-produced JSON parsed into dataclasses, with a deterministic fallback plan when parsing fails (keeps mock-mode/tests fast and offline-safe).

**Workflow node (DAG):**
- Purpose: Declarative, serializable unit of a multi-step/multi-agent process.
- Examples: `apps/studio/agentos/app/core/workflow_engine.py` node shape `{"type": ..., ...config, "next": "node_id"}`.
- Pattern: 8 node types (`start`, `agent`, `agent_vote`, `tool`, `condition`, `approval`, `loop`, `finish`); explicitly documented as mapping 1:1 onto Temporal activities/workflow control flow for the eventual production swap.

**Tool (BaseTool):**
- Purpose: Permissioned, invocable capability an agent or workflow node can call.
- Examples: `apps/studio/agentos/app/core/tools/base.py` (interface + `ToolMetadata`), `builtin.py` (`FilesystemReadTool`, `HttpRequestTool`, `PythonEvalTool`, `WebSearchTool` stub), `registry.py` (`ToolRegistry`, module-level singleton `registry`).
- Pattern: Registry pattern — tools self-register in `ToolRegistry.__init__`; `invoke()` checks `tool.permissions_required` against a caller-supplied `permissions` list before executing.

**Policy (governance):**
- Purpose: Declarative, data-driven rule that can block or gate a run.
- Examples: `apps/studio/agentos/app/models/governance.py` (`Policy.rule` JSON: `{"if": {"field", "op", "value"}, "then": "require_approval"|"block"}`), evaluated by `apps/studio/agentos/app/core/governance_engine.py`.
- Pattern: Explicitly documented as a stand-in for Open Policy Agent (OPA)/Rego — same rule shape, different engine.

**ContextBundle:**
- Purpose: The single object a reasoning step consumes — fused memory + knowledge + in-scope-policy view.
- Examples: `apps/studio/agentos/app/core/context_engine.py` (`ContextSource`, `ContextBundle` dataclasses).
- Pattern: Fan-out to `memory_engine.retrieve()` and `knowledge_engine.retrieve()`, merge-sort by relevance score, no per-source special-casing downstream.

## Entry Points

**FastAPI app (`uvicorn app.main:app`):**
- Location: `apps/studio/agentos/app/main.py`.
- Triggers: `uvicorn app.main:app --reload --port 8088` (per README) or `apps/studio/agentos/Dockerfile` in containerized deploys; also `start-agentos-backend.bat` / `start-all.bat` at repo root.
- Responsibilities: Middleware stack (CORS → `SecurityHeadersMiddleware` → `RequestGuardMiddleware` → `AccessLogMiddleware`), lifespan-managed DB init (`init_db()`) and optional NATS connect, mounts 13 legacy routers + finance router, exposes `/`, `/health`, `/docs`, `/redoc`.

**`POST /runtime/execute`:**
- Location: `apps/studio/agentos/app/api/routers/runtime.py`.
- Triggers: External client or another agent's workflow `agent`/`agent_vote` node (internal recursive call into `runtime.execute()`).
- Responsibilities: Kick off a single-agent run against a goal; the canonical entry point into the Agent Runtime kernel.

**`POST /workflows`, `POST /workflows/{id}/resume`:**
- Location: `apps/studio/agentos/app/api/routers/workflows.py`.
- Triggers: External client creating/resuming a multi-node DAG execution.
- Responsibilities: Entry point into the Workflow Engine — the layer CerebroBuild is planned to compile capability graphs into (see `docs/superpowers/specs/2026-07-23-cerebrobuild-design.md` §2-3).

**`scripts/seed.py`:**
- Location: `apps/studio/agentos/scripts/seed.py`.
- Triggers: Manual (`python scripts/seed.py`), run once after fresh DB setup.
- Responsibilities: Loads YAML agent definitions from `agents_store/*.yaml`, creates example agents, skills, and a governance policy.

**Next.js frontends:**
- Location: `apps/studio/app/**` (App Router, root layout at `apps/studio/app/layout.tsx` if present), `apps/forge/app/**`.
- Triggers: `next dev` / `next start` via Turborepo (`turbo dev`, `turbo build` at repo root).
- Responsibilities: Marketing site + product console UI; `apps/studio/lib/agentos/*` is the only in-repo HTTP client code that talks to the AgentOS backend.

## Documented vs. Implemented Gap

Root-level docs describe a much larger system than exists in code. Concretely, when planning new work against `apps/studio/agentos`:

- **`CAPABILITY_ARCHITECTURE.md` / `PRODUCT_REGISTRY.md`** describe ~15 distinct "Cerebro" products (CerebroFlow, CerebroAgent, CerebroERP, CerebroCRM, CerebroSearch, CerebroInsight, CerebroArchive, CerebroStudio) and ~9 "Hive" platform services (HiveIdentity, HiveData, HiveShield, HiveOps, HiveForge, HiveCompute, HiveStorage, HiveAPI, HiveExchange) as if they are separate, GA-lifecycle products with independent tech stacks (e.g., "CerebroFlow: Next.js, LangGraph, PostgreSQL"). **None of this exists as separate services.** The only working backend is the single AgentOS FastAPI monolith described above; `apps/flow`, `apps/archive`, `apps/insight`, `apps/ops`, `apps/search` are empty directories with no `package.json`, and `services/archive-api`, `services/identity-api`, `services/gateway-api`, `services/hiveops-api`, `services/search-api` are likewise empty.
- **`app/main.py`'s own docstring** claims domain routers at `/api/archive`, `/api/runtime`, `/api/studio`, `/api/flow`, `/api/copilot`, `/api/insight`, `/api/shield`, `/api/ops`, `/api/platform` — none of these prefixes are actually mounted; only the legacy flat routers (`/agents`, `/runtime`, `/memory`, `/tools`, `/skills`, `/knowledge`, `/context`, `/workflows`, `/governance`, `/observability`, `/cortex`, `/simulator`, `/marketplace`, `/auth`) and `/finance` are live. The `/` meta endpoint's `modules` dict advertises these paths to API consumers even though calling them 404s.
- **`apps/studio/agentos/README.md`** is accurate and should be treated as the source of truth for what's implemented vs. what's a documented future swap-in (Temporal, NATS JetStream, OpenSearch, MinIO, Keycloak, Vault, OPA, Kubernetes) — cross-check any new design against it before trusting the root-level product docs.
- **Practical implication for CerebroBuild:** the design spec (`docs/superpowers/specs/2026-07-23-cerebrobuild-design.md`) correctly targets `apps/studio/agentos`'s real Workflow Engine, Agent Runtime, Tool Framework, and Agent Registry as the platform services to build on — not the aspirational `app/core/sdk/`, `app/core/orchestrator/`, or root-level Hive/Cerebro product docs, which have no corresponding code today.

## Architectural Constraints

- **Threading:** Primarily synchronous request-per-call FastAPI handlers over a SQLAlchemy `Session`. The one exception is `agent_vote` workflow nodes, which fan out via `ThreadPoolExecutor` (max 5 workers), each opening its own `SessionLocal()` — SQLAlchemy sessions are not thread-shared anywhere else in the codebase.
- **Global state:** Several module-level singletons: `tool_registry = ToolRegistry()` (`app/core/tools/registry.py`), `bus = EventBus()` (`app/core/event_bus.py`), `gateway = CerebroXGateway()` (`app/core/cerebro_x/gateway.py`), `get_settings()` is `@lru_cache`d (`app/config.py`). All are process-wide and not tenant/request-scoped.
- **Recursive execution depth:** Workflow `agent` nodes call back into `runtime.execute()`, which can itself be reached from another workflow — there is no explicit recursion-depth guard beyond each workflow's own `MAX_STEPS = 50`, so a workflow whose `agent` node points at a workflow-invoking agent is a possible runaway path to watch for when adding new capability graph logic.
- **No message broker in default config:** The event bus is in-process; NATS is optional and only engaged when `NATS_URL` is set. Any new capability that assumes durable cross-process pub/sub must account for the in-process-only default.
- **Single DB, JSON-heavy schema:** `WorkflowRun.definition`, `.node_states`, `.context` and `Run.plan`, `.steps_completed` are JSON columns, not normalized tables — querying/reporting across many workflow runs means scanning/deserializing JSON blobs, not SQL joins.

## Anti-Patterns

### Docstring-driven architecture that outran the code

**What happens:** `app/main.py`'s module docstring and the root-level product docs describe domain-module routing (`/api/archive`, `/api/flow`, etc.) and a wide product family that isn't implemented; corresponding directories exist as empty `__init__.py` stubs.
**Why it's wrong:** A reader (human or agent) trusting the docstring or root docs over the actual `app.include_router(...)` calls will design against endpoints that don't exist, or assume subsystems (HiveIdentity, OPA, NATS JetStream) are live when they're not.
**Do this instead:** Treat `apps/studio/agentos/README.md`'s "What's actually implemented" table and this document's Component Responsibilities table as ground truth; verify any subsystem claim by checking whether its router is in `main.py`'s `app.include_router(...)` list and whether its module file has non-zero line count.

### Orphaned parallel abstraction layers

**What happens:** `app/core/sdk/**` and `app/core/orchestrator/**` scaffold an alternate, more "enterprise SDK"-shaped version of the same concepts already implemented in the flat `app/core/*.py` files (e.g., `app/core/sdk/workflow.py` vs. the real `app/core/workflow_engine.py`; `app/core/orchestrator/engine.py` vs. `app/core/runtime.py`). Almost all files in these trees are 0 lines.
**Why it's wrong:** It is easy to import from or extend the empty/stub tree by mistake, or to assume a capability exists there when the real logic is in the flat files.
**Do this instead:** New engine-level code belongs in the flat `app/core/*.py` modules (or a new flat module following the same pattern) unless/until the `sdk`/`orchestrator` restructure is deliberately completed and `main.py`/routers are repointed at it.

## Error Handling

**Strategy:** Fail into recorded state, not exceptions bubbling to the client. Runtime and workflow steps catch domain errors (`ToolError`, missing agent/policy) and write `status = "failed"` plus `context["error"]`/`run.error` rather than raising past the router layer; routers themselves raise `HTTPException` for request-level problems (404 unknown run/agent, 409 conflicting state, 401/403 auth).

**Patterns:**
- Tool invocation errors are wrapped into `ToolError` at the registry boundary (`app/core/tools/registry.py:29-34`) so callers get one exception type regardless of the underlying tool's failure mode.
- Workflow node failures set `run.node_states[node_id] = "failed"` and `run.status = "failed"` in place, preserving the partial `context` for debugging (nothing is rolled back).
- `agent_vote` node failures are per-agent and non-fatal to the group: a failing agent is recorded in `excluded` with a reason; the vote only fails outright if zero candidates succeed.
- Every blocked/approval-required/failed transition is paired with an `bus.publish(...)` call and, for governance blocks, an `AuditLog` row — errors are observable, not silent.

## Cross-Cutting Concerns

**Logging:** `AccessLogMiddleware` (`app/middleware.py`) plus `configure_logging()` called at module import time in `main.py`; no structured/JSON logging framework beyond Python's standard logging as configured there.

**Validation:** Pydantic v2 models (`ConfigDict(extra="forbid")` on most request bodies) at the router boundary; slug/field validators (e.g., `agents.py`'s `_SLUG_RE`) enforce format constraints before hitting the DB.

**Authentication:** Bearer API-key auth only (`app/security.py`'s `get_current_api_key`), explicitly documented as standing in for the planned Keycloak/OIDC + JWT + RBAC/ABAC swap. Key issuance (`POST /auth/api-keys`) is gated by an optional `X-Admin-Secret` header (`require_admin_secret`) — open in local dev, required once `AGENTOS_ADMIN_SECRET` is set.

---

*Architecture analysis: 2026-07-23*
