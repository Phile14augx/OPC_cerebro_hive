# Codebase Structure

**Analysis Date:** 2026-07-23

## Directory Layout

```
cerebro-hive-website/                    # pnpm/Turborepo monorepo root
├── apps/
│   ├── studio/                          # Main Next.js 14 site (marketing + product console)
│   │   ├── app/                         # App Router routes (route groups: (auth), (internal), (platform))
│   │   ├── components/                  # Studio-specific React components
│   │   ├── lib/                         # Studio-specific libs, incl. lib/agentos/ (AgentOS HTTP client)
│   │   ├── platform/                    # Separate TS "kernel" scaffold (src/{ai,app,dev,domains,kernel,sdk})
│   │   ├── public/, stories/, tests/    # Static assets, Storybook stories, Playwright/Vitest tests
│   │   └── agentos/                     # THE BACKEND — Python/FastAPI AgentOS runtime (see below)
│   ├── forge/                           # Next.js 14 site for CerebroForge product (has real content)
│   ├── archive/, flow/, insight/,       # Empty directories — no package.json, no source files.
│   │   ops/, search/                    # Placeholders for products described in root docs, not built.
├── apps/studio/agentos/                 # AgentOS FastAPI backend (Python) — full breakdown below
├── packages/                            # Shared TS packages (pnpm workspace `packages/*`)
│   ├── ui/                              # Shared React component library (largest package, 74 files)
│   ├── domain/, database/, capabilities/*  # Newer, mostly-unwired TS "domain services + Prisma"
│   │                                        # scaffold (outbox pattern, repositories) — parallel/early-
│   │                                        # stage effort, not connected to apps/studio/agentos.
│   ├── ai/, ai-gateway/, auth/, events/, policy/, workflow/, sdk/, telemetry/, contracts/, ...
│   └── icons-*/                         # Per-framework icon packages (react/vue/angular/cli/figma/web)
├── services/                            # pnpm workspace `services/*` — mostly empty scaffolds
│   ├── forge-api/                       # NestJS service, real content ("AI Software Factory backend")
│   ├── contentops/                      # tsx-based Markdown-to-platform publishing pipeline, real content
│   └── archive-api/, identity-api/,     # Empty directories — no package.json.
│       gateway-api/, hiveops-api/, search-api/
├── docs/                                # Long-form internal docs (playbooks, ADRs, superpowers specs)
│   └── superpowers/specs/               # Design specs incl. CerebroBuild target architecture
├── PRODUCT_SPECIFICATIONS/              # Per-product markdown specs (aspirational, not all implemented)
├── .planning/                           # GSD planning artifacts (this document lives in codebase/)
├── .github/workflows/                   # CI workflow definitions
├── PRODUCT_REGISTRY.md                  # Canonical product catalog (aspirational — see ARCHITECTURE.md gap)
├── CAPABILITY_ARCHITECTURE.md           # Canonical capability/layering doc (aspirational)
├── CEREBROHIVE_CONSTITUTION.md          # Governing principles doc
├── pnpm-workspace.yaml, turbo.json      # Monorepo tooling config
└── package.json                         # Root workspace scripts (turbo build/dev/lint/test)
```

### `apps/studio/agentos/` (AgentOS backend — detailed)

```
agentos/
├── app/
│   ├── main.py                 FastAPI app + router mounting (entry point: uvicorn app.main:app)
│   ├── config.py                pydantic-settings Settings (env-driven, .env)
│   ├── db.py                    SQLAlchemy engine/session/Base, init_db()
│   ├── security.py              API-key bearer auth dependency
│   ├── middleware.py            SecurityHeaders / RequestGuard / AccessLog middleware
│   ├── rate_limit.py            slowapi limiter config
│   ├── models/                  SQLAlchemy models, one file per bounded context
│   │   ├── registry.py            Agent
│   │   ├── execution.py           Run, WorkflowRun
│   │   ├── governance.py          Policy, Approval, AuditLog
│   │   ├── memory.py, knowledge.py, conversation.py, tools.py, marketplace.py, observability.py, identity.py
│   ├── core/                    THE REAL ENGINES — flat modules, framework-agnostic
│   │   ├── runtime.py             Agent Runtime kernel (boot→plan→execute→reflect)
│   │   ├── planner.py             Goal → PlanStep decomposition
│   │   ├── workflow_engine.py     DAG executor (8 node types, Agent Mesh delegation/consensus)
│   │   ├── governance_engine.py   Policy-as-code evaluator
│   │   ├── context_engine.py      Memory + Knowledge + Policy fusion for reasoning steps
│   │   ├── memory_engine.py       Working/episodic/semantic/long-term memory
│   │   ├── knowledge_engine.py    RAG: chunk/embed/retrieve/cite
│   │   ├── event_bus.py           In-process pub/sub + event log, optional NATS dual-publish
│   │   ├── observability.py       Trace spans + metrics
│   │   ├── evaluation.py          Post-run quality/groundedness scoring
│   │   ├── cortex_engine.py       Forecasting (least-squares) + optimization (0/1-knapsack)
│   │   ├── simulator_engine.py    Monte Carlo queue simulation
│   │   ├── prompt_manager.py      Versioned prompt templates
│   │   ├── skills.py              Skill package install/versioning
│   │   ├── tool_framework.py      (legacy/alternate tool framework entry point)
│   │   ├── tools/                 base.py (BaseTool/ToolError), builtin.py (4 built-in tools), registry.py
│   │   ├── cerebro_x/              LLM Gateway: gateway.py, router.py, base.py, embeddings.py,
│   │   │                          providers/{anthropic,openai,gemini,ollama,mock}.py
│   │   ├── nats/                  NATSEventBus adapter (optional, engaged via NATS_URL)
│   │   ├── retrieval/, search/    hybrid_search.py, fusion.py, engine.py — retrieval helpers
│   │   ├── telemetry/             metrics.py, profiler.py, spans.py, trace.py
│   │   ├── storage/                file_service.py
│   │   ├── events/                bus.py, schemas.py (alternate event abstraction, check usage before extending)
│   │   ├── sdk/                   ⚠ MOSTLY EMPTY (0-line files) — aspirational agent SDK restructure
│   │   │                          of runtime/memory/planning/governance/evaluation/simulation/decision.
│   │   │                          Do not build on this tree; it is not wired into any router.
│   │   └── orchestrator/          ⚠ MOSTLY EMPTY (0-line files) — aspirational alt. to runtime.py/
│   │                              workflow_engine.py. Only human.py (34 lines) has real content.
│   ├── api/routers/              Thin FastAPI routers over app/core (THE MOUNTED, WORKING ROUTES)
│   │   ├── agents.py, auth.py, runtime.py, memory.py, tools.py, skills.py, knowledge.py,
│   │   │   context.py, workflows.py, governance.py, observability.py, cortex.py, simulator.py,
│   │   │   marketplace.py   — all included in app/main.py
│   ├── finance/                  Domain module: real double-entry ledger + invoice pipeline (mounted)
│   ├── archive/                  Domain module: PARTIALLY real (pipeline/, documents/, prompts/, search/
│   │                             have content) but NOT mounted in main.py — router.py is dead code path
│   ├── platform/                 Domain module: mostly stubs; auth/keycloak.py and prompts/*.py (repository/
│   │                             compiler/registry, 21-27 lines) have minor content, NOT mounted
│   ├── flow/, copilot/, insight/, hiveops/, hiveshield/, studio/, runtime/
│   │                             ⚠ ALL EMPTY (__init__.py only) — named in main.py docstring, no code
│   ├── copilot/                  Empty — CerebroCopilot conversations/streaming, not implemented
├── agents_store/                YAML agent definitions ("Agent Store") — finance_agent.yaml,
│                                 research_agent.yaml, support_agent.yaml
├── scripts/seed.py               Demo data loader (agents, skills, a governance policy)
├── tests/                        pytest suite, fully offline via mock LLM provider
│   ├── conftest.py, test_smoke.py, test_mesh.py, test_finance.py,
│   │   test_cortex_simulator.py, test_context_governance_observability.py, test_production_gates.py
├── docs/agentos-spec/            01-vision-and-architecture.md, 02-domain-driven-design.md,
│                                 03-postgresql-schema.md — the target spec this MVP implements a slice of
├── requirements.txt, Dockerfile, docker-compose.yml, DEPLOY.md, .env.example
└── README.md                     Ground-truth "what's actually implemented" doc — read first
```

## Directory Purposes

**`apps/studio/agentos/app/core/` (flat files, not the `sdk/`/`orchestrator/` subtrees):**
- Purpose: All working business logic for the AgentOS runtime.
- Contains: One module per engine (runtime, planner, workflow, governance, context, memory, knowledge, event bus, observability, cortex, simulator, prompts, skills), each importable/testable standalone.
- Key files: `runtime.py` (kernel), `workflow_engine.py` (DAG executor + Agent Mesh).

**`apps/studio/agentos/app/api/routers/`:**
- Purpose: HTTP surface for the mounted (working) routes.
- Contains: FastAPI `APIRouter`s, Pydantic request/response models, thin delegation to `app/core/*`.
- Key files: `runtime.py` (agent execution entry point), `workflows.py` (DAG entry point), `agents.py` (registry CRUD), `governance.py` (approvals).

**`apps/studio/agentos/app/models/`:**
- Purpose: SQLAlchemy ORM schema, one file per bounded context.
- Contains: Declarative model classes only — no business logic.

**`apps/studio/agentos/app/core/sdk/` and `app/core/orchestrator/`:**
- Purpose (aspirational): A cleaner, SDK-shaped restructure of the same runtime concepts.
- Actual state: Nearly all files are 0 lines. Not imported by any router or the flat `app/core/*.py` engines.
- Guidance: Do not add new logic here unless explicitly completing this restructure and repointing `main.py`/routers at it.

**`apps/studio/agentos/app/{archive,platform,finance,flow,copilot,insight,hiveops,hiveshield,studio,runtime}/` (top-level domain module dirs):**
- Purpose (per `main.py` docstring): Future `/api/<domain>` service boundaries.
- Actual state: Only `finance/` is complete and mounted. `archive/` has real pipeline/router code but is unmounted (dead code — verify before assuming it runs). Everything else is an empty `__init__.py`.

**`packages/` (root-level pnpm workspace):**
- Purpose: Shared TypeScript code across Next.js apps.
- Contains: `ui/` (component library, most mature), `ai/`, `ai-gateway/`, `auth/`, `events/`, `policy/`, `workflow/`, `sdk/`, `telemetry/`, `contracts/`, icon packages (`icons-*`).
- Special note: `domain/`, `database/` (Prisma schema + migrations), and `capabilities/*` are a newer, separate "domain services + outbox pattern" effort (recent commits), largely unconnected to any running app — treat as early-stage, not production request path.

**`services/` (root-level pnpm workspace):**
- Purpose: Standalone backend services separate from `apps/studio/agentos`.
- Contains: `forge-api/` (NestJS, real), `contentops/` (tsx pipeline, real); `archive-api/`, `identity-api/`, `gateway-api/`, `hiveops-api/`, `search-api/` are empty placeholder directories.

**`docs/superpowers/specs/`:**
- Purpose: Design specs for new capabilities, written before implementation.
- Key file: `2026-07-23-cerebrobuild-design.md` — target architecture for CerebroBuild, explicitly designed to layer on `apps/studio/agentos`'s existing Workflow Engine/Agent Runtime/Tool Framework/Agent Registry (not a parallel stack).

**Root-level product docs (`PRODUCT_REGISTRY.md`, `CAPABILITY_ARCHITECTURE.md`, `PRODUCT_SPECIFICATIONS/*.md`):**
- Purpose: Canonical, aspirational description of the full CerebroHive product family and platform layering.
- Caution: Describes ~15 Cerebro products and ~9 Hive platform services as if independently built; only `apps/studio/agentos` + `apps/studio` (frontend) + `apps/forge` + `services/forge-api` + `services/contentops` have real code. Cross-check any claim here against actual directory contents before relying on it for planning.

## Key File Locations

**Entry Points:**
- `apps/studio/agentos/app/main.py`: FastAPI app definition, middleware, router mounting.
- `apps/studio/app/` (Next.js App Router root): Studio frontend routes.
- `apps/forge/app/`: Forge frontend routes.
- `apps/studio/agentos/scripts/seed.py`: Demo data bootstrap.

**Configuration:**
- `apps/studio/agentos/app/config.py`: Backend settings (`Settings` class, env-driven via `.env`).
- `apps/studio/agentos/.env.example`: Documents every backend env var (DB, LLM keys, Keycloak, NATS, MinIO, OpenSearch, Redis).
- `pnpm-workspace.yaml`, `turbo.json`: Monorepo workspace + task graph config.
- `.env` / `.env.example` (repo root): Frontend/monorepo-level env vars.

**Core Logic:**
- `apps/studio/agentos/app/core/runtime.py`: Agent Runtime kernel — start here for anything touching agent execution.
- `apps/studio/agentos/app/core/workflow_engine.py`: Workflow DAG executor — start here for anything touching multi-step/multi-agent orchestration (including CerebroBuild's planned workflow compiler target).
- `apps/studio/agentos/app/core/governance_engine.py`: Policy evaluation.

**Testing:**
- `apps/studio/agentos/tests/`: pytest suite (backend). Run via `pytest` from `apps/studio/agentos/`.
- `apps/studio/tests/`: `api/`, `e2e/` (Playwright), `visual/` — frontend tests.

## Naming Conventions

**Files (Python, `apps/studio/agentos`):**
- `snake_case.py` throughout; one engine per file named `<domain>_engine.py` for standalone engines (`memory_engine.py`, `knowledge_engine.py`, `governance_engine.py`, `context_engine.py`, `cortex_engine.py`, `simulator_engine.py`) or bare `<domain>.py` when the domain is a single concept (`planner.py`, `skills.py`, `evaluation.py`).
- Routers named after their resource, plural where the resource is a collection: `agents.py`, `workflows.py`, `tools.py`, `skills.py`; singular for cross-cutting concerns: `context.py`, `cortex.py`, `governance.py`.
- Multi-file subsystems get their own package directory with `base.py` (interfaces), `registry.py` (registry pattern), and implementation files: `tools/`, `cerebro_x/`.

**Files (TypeScript, `apps/studio`, `apps/forge`, `packages/*`):**
- Next.js App Router conventions: `page.tsx`, `layout.tsx`, route-group folders in parens (`(auth)`, `(platform)`, `(internal)`).
- Components in `PascalCase.tsx`; grouped by feature under `components/<feature>/`.

**Directories:**
- Backend bounded-context grouping: one directory per domain under `app/models/`, `app/api/routers/`, and (aspirationally) `app/<domain>/`.
- Frontend feature grouping: `components/<feature>/`, `lib/<feature>/`, mirrored by route folders under `app/`.

## Where to Add New Code

**New AgentOS engine/capability (e.g., CerebroBuild's Capability Graph Engine):**
- Primary code: New flat module in `apps/studio/agentos/app/core/`, following the existing `<domain>_engine.py` pattern (see `context_engine.py` for a good template — dataclasses + a single `assemble()`/entry function, importing sibling engines directly rather than through the empty `sdk`/`orchestrator` trees).
- Router: New file in `apps/studio/agentos/app/api/routers/`, mounted explicitly in `apps/studio/agentos/app/main.py`'s router-include block.
- Models: New file in `apps/studio/agentos/app/models/` if new tables are needed; register any new SQLAlchemy model so `init_db()` (`app/db.py`) creates its table.
- Tests: `apps/studio/agentos/tests/test_<feature>.py`, using `conftest.py`'s `client`/`auth_headers` fixtures (mock LLM provider, fully offline).

**New workflow node type (extending the DAG for capability graphs):**
- Add a new `if node_type == "...":` branch in `apps/studio/agentos/app/core/workflow_engine.py::step()`, following the existing pattern of mutating `context`, `run.node_states[current_id]`, and publishing a `bus.publish(...)` event on completion/failure.

**New tool:**
- Implementation: `apps/studio/agentos/app/core/tools/builtin.py` (or a new file, imported into `registry.py`), subclassing `BaseTool` (`app/core/tools/base.py`).
- Register: Add `self.register(YourTool())` in `ToolRegistry.__init__` (`apps/studio/agentos/app/core/tools/registry.py`).

**New governance policy shape / operator:**
- Add to `_OPS` dict in `apps/studio/agentos/app/core/governance_engine.py` (also reused by `workflow_engine._condition_matches`).

**New frontend feature (Studio):**
- Route: `apps/studio/app/<feature>/page.tsx` (or under an existing route group).
- Components: `apps/studio/components/<feature>/`.
- Data/client logic: `apps/studio/lib/<feature>/`; use `apps/studio/lib/agentos/*` as the pattern for talking to the backend.

**Utilities:**
- Backend: no dedicated `utils/` — small helpers live inline in the consuming engine module; shared cross-cutting helpers (JSON-safety, etc.) live in the module that owns the concept (e.g., `to_json_safe` in `app/core/tools/__init__.py`).
- Frontend: `apps/studio/lib/` subfolders per concern (`analytics/`, `security/`, `metrics/`, `queue/`, `repositories/`).

## Special Directories

**`apps/studio/agentos/app/core/sdk/` and `app/core/orchestrator/`:**
- Purpose: Aspirational SDK/orchestrator restructure.
- Generated: No (hand-authored scaffolding, mostly empty).
- Committed: Yes.
- Guidance: Do not build new features here; verify actual usage (import graph) before trusting any file in these trees.

**`apps/studio/agentos/agents_store/`:**
- Purpose: YAML agent template definitions loaded by `scripts/seed.py`.
- Generated: No.
- Committed: Yes.

**`apps/studio/agentos/.venv/`, `**/node_modules/`, `**/.next/`, `**/.turbo/`, `**/dist/`:**
- Purpose: Build/dependency artifacts.
- Generated: Yes.
- Committed: No (should be gitignored; note repo root has some stray build artifacts like `tsconfig.tsbuildinfo`, `out.zip`, `diff.txt`, `ts-errors.log` checked into the working tree — verify `.gitignore` coverage before assuming these are ignored).

**`apps/studio/platform/` (TS, inside the Next.js app) vs. `apps/studio/agentos/` (Python backend):**
- Purpose: Easy to confuse — `apps/studio/platform/` is a small TypeScript `src/{ai,app,dev,domains,kernel,sdk}` scaffold living inside the frontend app; `apps/studio/agentos/` is the real Python backend. They are unrelated codebases despite similar naming; always disambiguate by language/file extension when navigating.

---

*Structure analysis: 2026-07-23*
