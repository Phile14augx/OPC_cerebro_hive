# Codebase Concerns

**Analysis Date:** 2026-07-23

This document covers the whole `cerebro-hive-website` monorepo, with a deep focus on
`apps/studio/agentos` (the Python/FastAPI "AgentOS" runtime) since a new capability
(**CerebroBuild**) is about to be built directly on top of it. AgentOS's own
`apps/studio/agentos/README.md` already documents its MVP simplifications honestly (SQLite by
default, in-process pub/sub instead of NATS, local vector similarity instead of OpenSearch, API
keys instead of Keycloak/Vault, YAML rules instead of OPA). This document does not repeat that
list verbatim — it adds the risks *underneath* those documented tradeoffs, plus everything the
README doesn't mention: dead/duplicate code, git hygiene, and cross-repo scratch cruft.

## Tech Debt

**Two parallel, mostly-dead module trees inside AgentOS (`apps/studio/agentos/app/core/`):**
- Issue: `app/core/` contains both the *live* flat modules that `app/main.py` actually imports
  (`runtime.py`, `planner.py`, `memory_engine.py`, `knowledge_engine.py`, `workflow_engine.py`,
  `governance_engine.py`, `tool_framework.py`, `event_bus.py`, `observability.py`, `cortex.py` /
  `cortex_engine.py`, `simulator_engine.py`) **and** a second, larger, nested tree that
  reimplements the same concepts under different names: `core/sdk/planning/*`,
  `core/sdk/memory/*`, `core/sdk/governance/*`, `core/sdk/decision/*`, `core/sdk/evaluation/*`,
  `core/sdk/capabilities/*`, `core/sdk/ai/*`, `core/orchestrator/{runtime,engine,dispatcher,
  agents,pipeline,workflow,human}.py`, `core/planning/{planner,executor}.py`,
  `core/events/{bus,schemas}.py`, `core/context/{builder,models}.py`, `core/retrieval/
  {engine,fusion}.py`, `core/search/hybrid_search.py`, `core/storage/file_service.py`,
  `core/telemetry/{metrics,profiler,spans,trace}.py`, `core/tools/{base,builtin,registry}.py`,
  `core/cerebro_x/{base,gateway,router}.py` + `providers/*`, `core/nats/bus.py`,
  `core/capabilities/registry.py`.
- Files: `apps/studio/agentos/app/core/` (verify via `grep -rn "include_router"` in
  `apps/studio/agentos/app` — only `app/main.py` and `app/archive/router.py` define any, and
  `app/main.py` never imports `app/archive`).
- Impact: `app/main.py` only imports the flat legacy modules, `app.finance`, and the legacy
  routers in `app/api/routers/`. Everything under `core/sdk/`, `core/orchestrator/`,
  `core/planning/`, `core/events/`, `core/context/`, `core/retrieval/`, `core/search/`,
  `core/storage/`, `core/telemetry/`, `core/tools/`, `core/cerebro_x/` (beyond `embeddings.py`
  and the provider used by the live gateway), and `core/capabilities/` is unreachable at runtime
  — dead code with no test coverage. A contributor (human or an autonomous CerebroBuild agent)
  editing "the planner" or "the memory engine" has a 50/50 chance of editing the unused copy and
  seeing no effect, or worse, wiring CerebroBuild against the dead copy by mistake.
- Fix approach: Before building CerebroBuild on this runtime, either (a) delete the unused trees
  and their sibling model/schema files, or (b) rename them clearly (e.g. `core/_wip_sdk/`) and
  add a top-of-file docstring noting they are not mounted, or (c) if they represent the intended
  v2 direction, finish wiring one path and delete the other. Do not build new functionality by
  extending the dead tree.

**`app/main.py`'s own docstring describes routes that mostly don't exist yet:**
- Issue: The module docstring in `app/main.py` advertises a full modular-monolith API surface —
  `/api/platform`, `/api/archive`, `/api/runtime`, `/api/studio`, `/api/flow`, `/api/copilot`,
  `/api/insight`, `/api/shield`, `/api/ops` — but the code below only mounts the legacy
  `app/api/routers/*` routers (unprefixed, original paths) and `app.finance.router` (`/finance`).
  `app/archive/router.py` defines its own `include_router` calls but is orphaned (never imported
  by `main.py`), and the sibling `app/copilot/`, `app/flow/`, `app/hiveops/`, `app/hiveshield/`,
  `app/insight/`, `app/platform/`, `app/studio/` packages contain only `__init__.py` files or
  partial implementations (e.g. `app/platform/prompts/*` is fairly built out) with no router
  wiring at all.
- Files: `apps/studio/agentos/app/main.py`, `apps/studio/agentos/app/archive/`,
  `apps/studio/agentos/app/copilot/`, `apps/studio/agentos/app/flow/`,
  `apps/studio/agentos/app/hiveops/`, `apps/studio/agentos/app/hiveshield/`,
  `apps/studio/agentos/app/insight/`, `apps/studio/agentos/app/platform/`,
  `apps/studio/agentos/app/studio/`.
- Impact: Reading `main.py`'s docstring or the root `/` payload (`app.get("/")`) gives a false
  impression of what's actually live. Anyone (including an AI planning agent) using the docstring
  as ground truth for "what AgentOS exposes today" will plan against endpoints that 404.
- Fix approach: Either finish wiring these domain packages or strip the aspirational docstring
  down to what's actually mounted, with a clearly separate "planned" section.

**Two independent Next.js trees both implementing "platform" pages:**
- Issue: The repo has a root-level `/app` directory (`app/(platform)/archive`,
  `app/platform/{archive,copilot,flow,pulse,shield,x}`) that is a second, separate Next.js app
  tree alongside `apps/studio/app` (which independently has `app/(platform)/`, `app/platform/`,
  `app/agents`, `app/workflows`, `app/knowledge`, `app/evaluation(s)`, `app/insights`, etc. — a
  much larger ~45-route tree). Root `package.json` (`cerebro-hive-os`) has its own build/dev/lint
  scripts separate from the `apps/*` pnpm workspace packages.
- Files: `app/` (repo root), `apps/studio/app/`.
- Impact: Unclear which tree is canonical for the "platform" surface described in
  `CAPABILITY_ARCHITECTURE.md` / `PRODUCT_REGISTRY.md`. Risk of the two diverging further, or of
  a change being applied to one and not the other.
- Fix approach: Confirm with the product docs which tree is the deployed marketing/platform site
  and either delete or clearly document the other as legacy/scratch.

**`apps/*` workspace members are wildly uneven in maturity — several don't exist at all:**
- Issue: `pnpm-workspace.yaml` globs `apps/*`, and seven directories exist under `apps/`:
  `archive`, `flow`, `forge`, `insight`, `ops`, `search`, `studio`. Of these, `apps/archive`,
  `apps/flow`, `apps/insight`, `apps/ops`, and `apps/search` are **completely empty** directories
  — no `package.json`, no source files, nothing (verified via `find apps/<name> -maxdepth 3`).
  `apps/forge` is a minimal skeleton: `package.json` + `app/{layout.tsx,page.tsx,components,
  globals.css}` only. `apps/studio` is the only fully built-out app (~45 route segments under
  `app/`, its own `components/`, `lib/`, `platform/` subpackage with its own `migrations` and
  `dist`, `stories/`, `tests/{api,e2e,visual}`, plus the entire `agentos/` backend nested inside
  it).
- Files: `apps/archive/`, `apps/flow/`, `apps/insight/`, `apps/ops/`, `apps/search/`,
  `apps/forge/`, `apps/studio/`.
- Impact: Anything that assumes "the five other apps are Next.js frontends of varying maturity"
  is incorrect — five of the seven are empty placeholders, not partially-built frontends. `turbo
  build` / `turbo dev` across the workspace will simply have nothing to do for those five.
- Fix approach: Either scaffold them or remove the empty directories/workspace glob entries until
  there's real content, so `apps/*` accurately reflects what's built.

**AgentOS `agentos.db`, `test_agentos.db`, and `agentos.db-journal` are tracked in git:**
- Issue: `git ls-files` confirms these binary SQLite files are committed:
  `apps/studio/agentos/agentos.db` (~16 KB), `apps/studio/agentos/agentos.db-journal`,
  `apps/studio/agentos/test_agentos.db` (~352 KB). These are runtime/test artifacts regenerated
  by `scripts/seed.py` and the pytest suite, not source.
- Impact: Every edit to local dev/test data creates a noisy binary diff in git history; repo
  bloats over time; a local `agentos.db` could accidentally leak seeded-but-realistic-looking
  data or diverge from what `scripts/seed.py` actually produces, confusing anyone who inspects it
  as if it were fixture data.
- Fix approach: Add `apps/studio/agentos/*.db` and `*.db-journal` to `.gitignore`, then
  `git rm --cached` the three tracked files (they'll regenerate locally via `seed.py`/pytest).

**Root-level scratch/debug files committed to git:**
- Issue: The repo root has a large number of one-off scratch files that are tracked in git (not
  just present locally): `check.html` (0 bytes), `error.html` (0 bytes), `_shot.js` through
  `_shot6.js` and `__shot_services.js` (screenshot/debug scripts), `diff.txt` (~20 KB), `populate.py`,
  `proxy.ts`, `refactor_theme.ts`, `roadmap.csv`, `scaffold_company_v3.ps1`,
  `scaffold_home_v3.ps1`, `scaffold_insights.ps1`, `scaffold_research.ps1`,
  `start-agentos-backend.bat`, `start-all.bat`, `start-website.bat`, `tsconfig.sitemap.json`, and
  `si_keys.txt` (~41 KB, 3445 lines — verified content is a list of simple-icons slugs like
  `SiZoom`/`SiZoho`, **not** real secrets, despite the alarming filename).
  `build_output.log`, `ts-errors.log`, `out.zip` (12.6 MB), and the `tsconfig*.tsbuildinfo` files
  exist on disk but are **not** tracked in git (confirmed via `git ls-files`) — so those are pure
  local cruft, not a repo-hygiene problem, but still worth a cleanup pass.
- Files: repo root (see list above).
- Impact: Repo root reads as a workspace mid-debugging rather than a clean monorepo root; makes
  it harder for a new contributor (or an AI agent scanning the root for "what matters here") to
  distinguish real project config from one-off scripts. `si_keys.txt`'s name is actively
  misleading and should be renamed even though its contents are benign.
- Fix approach: Move `_shot*.js`, `scaffold_*.ps1`, `populate.py`, `proxy.ts`,
  `refactor_theme.ts` into a `scripts/` or `tools/` directory (or delete if truly one-off and
  no longer needed), delete the two 0-byte HTML files, rename or remove `si_keys.txt`, and
  gitignore the already-untracked `*.log`, `*.tsbuildinfo`, and `out.zip`/`out/` patterns
  explicitly so they can't accidentally get `git add -A`'d later.

**`.next/` build artifacts are tracked in git despite being gitignored:**
- Issue: The root `.gitignore` includes `.next/` and `out/`, yet `git ls-files | grep '\.next/'`
  returns **5,486 tracked files**, all under `apps/forge/.next/` and `apps/studio/.next/`
  (webpack cache `.pack`/`.pack.gz` files, manifests, prerendered HTML, etc. — `apps/forge/.next`
  alone is ~85 MB on disk). This matches the parent conversation's observation that
  `apps/forge/.next/*` shows as modified in `git status`.
- Files: `apps/forge/.next/*`, `apps/studio/.next/*`.
- Impact: `.gitignore` only prevents *new* untracked files from being added — it does not
  untrack files that were already committed before the ignore rule existed (or before these apps
  moved under a path the rule covers). Every local `next build`/`next dev` run now produces a
  large, noisy diff in `git status` and risks someone committing regenerated build output,
  bloating the repository and clogging PRs with binary-ish webpack cache diffs.
- Fix approach: Run `git rm -r --cached apps/forge/.next apps/studio/.next` (and any other
  tracked `.next` paths found via `git ls-files | grep '\.next/'`) in a dedicated cleanup commit,
  then verify `git status` is clean after a fresh build. Consider `git gc`/history rewrite later
  if repo size is a concern, but that's a separate, higher-risk operation.

**Loosely pinned Python dependencies in AgentOS:**
- Issue: `apps/studio/agentos/requirements.txt` pins every dependency with `>=` only (e.g.
  `fastapi>=0.115`, `sqlalchemy>=2.0`, `anthropic>=0.34`, `openai>=1.52`) with no upper bounds and
  no lockfile (no `requirements.lock`/`poetry.lock`/`pip-compile` output checked in).
- Files: `apps/studio/agentos/requirements.txt`.
- Impact: A fresh `pip install -r requirements.txt` today vs. in three months can silently pull
  different major versions of FastAPI/SQLAlchemy/the LLM SDKs, causing environment drift between
  dev machines and CI, or a CerebroBuild deployment picking up a breaking change unexpectedly.
- Fix approach: Generate and commit a lockfile (`pip-compile`, `uv pip compile`, or switch to
  `poetry`/`pdm`) so installs are reproducible; keep `requirements.txt`'s loose bounds as the
  "compatible range" input if desired.

## Known Bugs

No `TODO`/`FIXME`/`HACK`/`XXX` markers were found anywhere in `apps/studio/agentos/app`
(confirmed via repo-wide grep) — the codebase is unusually clean of inline "this is broken"
markers, consistent with the README's practice of documenting simplifications explicitly rather
than leaving scattered stubs. No confirmed functional bugs were identified in the areas explored
(workflow engine, event bus, auth, middleware, routers). The items below are latent-risk patterns
rather than reproducible bugs today.

**SQLite concurrent-write contention under the `agent_vote` workflow node:**
- Symptoms: `agent_vote` (`apps/studio/agentos/app/core/workflow_engine.py:200-304`) spins up a
  `ThreadPoolExecutor` (up to 5 workers) and gives each thread its own `SessionLocal()`, each of
  which calls `runtime_core.execute(...)`, which itself calls `db.commit()` at multiple points
  (run creation, event bus publishes, trace/span writes). Under the default SQLite backend
  (`connect_args={"check_same_thread": False}`, no WAL mode configured in
  `apps/studio/agentos/app/db.py`), concurrent commits from multiple threads against the same
  SQLite file can raise `sqlite3.OperationalError: database is locked`.
- Files: `apps/studio/agentos/app/core/workflow_engine.py` (lines 200-304),
  `apps/studio/agentos/app/db.py`.
- Trigger: Run a workflow with an `agent_vote` node targeting 3+ agents against the default
  SQLite database, especially under any concurrent load (multiple workflow runs at once).
- Workaround: None built in. Switching `DATABASE_URL` to Postgres (already supported via
  `_normalize_database_url` in `db.py`) removes this class of failure; SQLite's single-writer
  model does not.

## Security Considerations

**Admin-secret gate on API-key issuance is a silent no-op by default:**
- Risk: `require_admin_secret` in `apps/studio/agentos/app/security.py` explicitly does nothing
  ("anyone can bootstrap a key") when `AGENTOS_ADMIN_SECRET` is unset — which is the default in
  `apps/studio/agentos/app/config.py` (`agentos_admin_secret: str | None = None`). Anyone who can
  reach `POST /auth/api-keys` on an unconfigured deployment can mint a valid bearer token and
  call every other endpoint.
- Files: `apps/studio/agentos/app/security.py`, `apps/studio/agentos/app/config.py`.
- Current mitigation: The docstring on `require_admin_secret` explicitly calls out that
  `AGENTOS_ADMIN_SECRET` "is required before deploying anywhere public," and comparison uses
  `hmac.compare_digest` once set (no timing side-channel). This is a documented, intentional MVP
  default, not an oversight — but it is a hard requirement that's easy to forget under deadline
  pressure.
- Recommendation: Before CerebroBuild (or anything else) exposes this service beyond localhost,
  confirm `AGENTOS_ADMIN_SECRET` is set in every non-local environment, and consider failing
  startup loudly (not just silently allowing open key issuance) when `agentos_environment ==
  "production"` and the secret is unset — `Settings.is_production` already exists as a hook for
  this check but isn't currently used to gate anything at startup.

**Hardcoded default credentials in `docker-compose.yml`:**
- Risk: The repo-root `docker-compose.yml` (not `apps/studio/agentos/docker-compose.yml`, which
  is smaller and Postgres/Redis-only) sets fallback default passwords for every service if the
  corresponding env var isn't set: `POSTGRES_PASSWORD:-supersecretpassword123`,
  `REDIS_PASSWORD:-redispassword123` (used both as the Redis server password and in the
  healthcheck), `OPENSEARCH_PASSWORD:-Opensearch@123!`, `MINIO_SECRET_KEY:-minioadmin123`,
  `KEYCLOAK_ADMIN_PASSWORD:-admin123`, `PGADMIN_DEFAULT_PASSWORD:-admin123`, and a hardcoded
  Cassandra password `temporal` (no env-var override at all for that one).
- Files: `docker-compose.yml` (repo root).
- Current mitigation: All are overridable via env vars, and this is clearly a local-dev compose
  file rather than a deployment manifest.
- Recommendation: If this compose file is ever used as a starting point for a real deployment
  (directly or via copy-paste), these defaults will be silently active unless every env var is
  explicitly set. Consider removing the fallback defaults entirely (forcing `docker compose up`
  to fail loudly if the env vars aren't set) for any compose file that could plausibly reach a
  non-local environment.

**`agentos_jwt_secret` default value is a classic placeholder string:**
- Risk: `apps/studio/agentos/app/config.py` defines `agentos_jwt_secret: str =
  "change-me-in-production"`. A grep across the AgentOS app tree shows this setting is currently
  **not read anywhere** outside its own definition — so today it's inert, not an active
  vulnerability. But it's exactly the kind of default that gets wired up later (e.g. by a
  Keycloak/JWT integration) without anyone renaming the placeholder.
- Files: `apps/studio/agentos/app/config.py`.
- Recommendation: If/when JWT-based auth is implemented (per the README's roadmap item 4),
  require this to be set via env var with no usable default, rather than shipping a well-known
  placeholder string that could be used to forge tokens if someone forgets to override it.

**Rate limiting is in-memory / per-process only:**
- Risk: `apps/studio/agentos/app/rate_limit.py` uses `slowapi` with the default in-memory
  backend. The module's own docstring already flags this: "correct for a single instance, needs
  a shared backend (Redis) once this is horizontally scaled to multiple processes/replicas."
  Limits are keyed by `get_remote_address` (IP, respecting `X-Forwarded-For`), so any caller
  behind a shared NAT/proxy can be starved by a noisy neighbor, and horizontally scaling AgentOS
  (multiple uvicorn workers/replicas) makes the "100/minute" global limit effectively
  "100/minute per process," not per deployment.
- Files: `apps/studio/agentos/app/rate_limit.py`.
- Recommendation: If CerebroBuild drives enough load to warrant multiple AgentOS replicas, swap
  to a Redis-backed `slowapi` storage before relying on these limits for abuse protection.

**Request timeout wraps the entire request, including long-running LLM/optimization calls:**
- Risk: `RequestGuardMiddleware` (`apps/studio/agentos/app/middleware.py`) wraps every request in
  `asyncio.wait_for(..., timeout=settings.agentos_request_timeout_seconds)`, defaulting to 30
  seconds. This is a reasonable defense against a hung handler, but `POST /runtime/execute`
  (agent runtime, which can itself call other agents via workflow delegation), `POST
  /cortex/optimize` (0/1-knapsack), and `POST /simulator/run` (Monte Carlo simulation) can all
  legitimately take longer than 30s for non-trivial inputs, especially when a real LLM provider
  (not the mock) is in the loop and/or a workflow delegates to multiple sub-agents.
- Files: `apps/studio/agentos/app/middleware.py`, `apps/studio/agentos/app/config.py`
  (`agentos_request_timeout_seconds`).
- Recommendation: For CerebroBuild specifically, if it plans to drive multi-step or multi-agent
  workflows synchronously through `/runtime/execute` or `/workflows/*`, either raise this timeout
  for those routes or move to an async job-submission + polling pattern rather than expecting a
  single HTTP request/response to hold open for the full duration of a workflow.

## Performance Bottlenecks

**Knowledge retrieval is brute-force, unindexed, all-in-memory:**
- Problem: `retrieve()` in `apps/studio/agentos/app/core/knowledge_engine.py` runs
  `db.query(Chunk).all()` — loading every chunk row for every retrieval call — then computes
  cosine similarity in a Python list comprehension against every chunk before sorting and slicing
  the top-k.
- Files: `apps/studio/agentos/app/core/knowledge_engine.py` (line ~44-61),
  `apps/studio/agentos/app/core/cerebro_x/embeddings.py`.
- Cause: No vector index (this is exactly what the README's "local vector similarity instead of
  OpenSearch"/pgvector roadmap item addresses) and no pagination/limit on the initial `.all()`
  query — every call pulls the entire `chunks` table into process memory regardless of corpus
  size.
- Improvement path: This is fine at demo/seed-data scale. Before CerebroBuild ingests any
  nontrivial document/knowledge volume through this engine, prioritize the README's own roadmap
  item 1 (Postgres + pgvector) — the brute-force scan will get linearly slower and eventually
  memory-bound as the `chunks` table grows, with no warning signal before it happens (no query
  limit, no timeout specific to this path beyond the global request timeout).

**SQLite as the default datastore for a system designed around concurrent agent execution:**
- Problem: Every write path (run creation, event log appends, trace/span writes, workflow state
  transitions, governance audit log entries) goes through the same single SQLite file by default,
  with SQLite's single-writer model.
- Files: `apps/studio/agentos/app/db.py`.
- Cause: `connect_args = {"check_same_thread": False}` is set for SQLite, but no `PRAGMA
  journal_mode=WAL` or busy-timeout configuration is applied to reduce write-lock contention —
  it's the out-of-the-box SQLite default.
- Improvement path: Already covered by the README's roadmap item 1 (Postgres 17 + pgvector). Flag
  this specifically for CerebroBuild: if CerebroBuild's workload involves parallel agent runs,
  parallel workflow executions, or the `agent_vote` node under real load, plan to run against
  Postgres from the start rather than discovering "database is locked" errors after the fact.

**In-process event bus executes subscriber handlers synchronously, inline with the request:**
- Problem: `EventBus.publish()` (`apps/studio/agentos/app/core/event_bus.py`) writes the event
  row, commits, then calls every subscriber handler for that event type (and every `"*"`
  wildcard subscriber) synchronously, in the same call stack as the original request/workflow
  step, before returning.
- Files: `apps/studio/agentos/app/core/event_bus.py`.
- Cause: This is the documented MVP tradeoff for "in-process pub/sub instead of NATS" — there is
  no queue, no worker pool, no backpressure; a slow or blocking subscriber directly slows every
  request that publishes that event type.
- Improvement path: Fine today because the only in-process subscribers are lightweight
  (WebSocket streaming, test assertions per the module's own docstring). If CerebroBuild adds a
  new subscriber that does meaningful work (e.g. calling out to another service), either make
  that handler itself async/non-blocking or move to the documented NATS JetStream swap-in before
  chaining slow work onto the publish path.

## Fragile Areas

**Workflow engine's `agent`/`agent_vote` delegation resumption logic:**
- Files: `apps/studio/agentos/app/core/workflow_engine.py` (lines 144-304).
- Why fragile: Sub-agent delegation resumption depends on the workflow's `context` dict carrying
  forward keys like `{node_id}_run_id` across pause/resume cycles (so a re-entered `agent` node
  re-checks the same sub-run instead of re-dispatching and re-triggering the sub-agent's own
  governance approval indefinitely — the code comment on lines 151-155 explains this explicitly).
  Any change to how `run.context` is persisted/serialized, or a change that clears/rekeys context
  between steps, would silently break delegation resumption in a way that likely wouldn't
  surface until a governance-gated sub-agent run needed to be resumed.
- Safe modification: Treat `context[f"{current_id}_*"]` keys as part of the workflow run's
  persisted contract; add a test in `tests/test_mesh.py` for any change that touches
  `run.context` handling, node-state transitions, or the approval pause/resume path.
- Test coverage: `apps/studio/agentos/tests/test_mesh.py` exists and appears to cover this area
  directly — verify it covers the specific pause-then-resume-with-existing-sub-run branch (lines
  156-163) before relying on it as a regression guard for CerebroBuild changes.

**`MAX_STEPS = 50` hard cap on workflow execution:**
- Files: `apps/studio/agentos/app/core/workflow_engine.py` (line 46).
- Why fragile: This is the only runaway-loop guard for the DAG executor — any workflow definition
  that legitimately needs more than 50 node transitions (e.g. a `loop` node with a high count
  combined with several other nodes, or a larger DAG that CerebroBuild might generate
  programmatically) will hard-fail with `"workflow exceeded MAX_STEPS (possible cycle)"` rather
  than completing, with no way to raise the limit per-workflow today.
- Safe modification: If CerebroBuild generates workflows with more than a handful of nodes, either
  make `MAX_STEPS` configurable per workflow/run or confirm generated workflows always stay well
  under this ceiling before relying on this engine for larger DAGs.

**Duplicate module trees increase the chance of editing dead code (see Tech Debt above):**
- Files: `apps/studio/agentos/app/core/sdk/*`, `apps/studio/agentos/app/core/orchestrator/*`,
  and siblings listed in the Tech Debt section.
- Why fragile: Because `app/main.py`'s import graph is the only reliable signal for "is this code
  live," any AI-driven or fast-moving human edit to "the planner"/"the memory engine"/"the tool
  registry" risks landing in the unmounted copy. This is a process risk more than a runtime bug,
  but it's the single highest-leverage thing to fix before CerebroBuild starts making changes in
  this directory, since an agent doing autonomous edits has no way to know which copy is real
  without tracing the import graph first.
- Safe modification: Before extending any `core/*` engine, `grep -rn "include_router\|from
  app.core\.<module> import"` from `app/main.py` and `app/api/routers/` to confirm the module is
  actually reachable.

## Scaling Limits

**Single-node, zero-external-infrastructure MVP (by design, per AgentOS's own README):**
- Current capacity: Runs entirely on SQLite + in-process pub/sub + local vector similarity on a
  single machine with zero external services — this is the explicit, documented design goal for
  the MVP ("so the whole platform runs with zero external infrastructure on a laptop").
- Limit: Knowledge retrieval (brute-force scan, see Performance Bottlenecks), SQLite writes under
  concurrency, and in-process pub/sub (no cross-process fan-out, no durability across restarts —
  in-flight subscriber state is lost on process crash/restart, though the event log itself is
  durable in the database) all cap out well before any real production load.
- Scaling path: The README's own "Roadmap to production" section (8 steps: Postgres+pgvector,
  NATS JetStream, Temporal, Keycloak/OIDC, OPA, OpenSearch, MinIO, Kubernetes+Helm+Argo CD) is
  the correct and already-documented path — nothing to add here except: do the Postgres swap
  *first* if CerebroBuild is going to add write/read load, since that's the dependency most other
  scaling steps sit on top of (workflow state, event log, memory/knowledge tables all live there).

## Dependencies at Risk

**Unpinned (`>=`-only) Python dependencies with no lockfile:**
- Risk: See Tech Debt section above (`apps/studio/agentos/requirements.txt`).
- Impact: Reproducibility risk for CI and for anyone standing up a fresh CerebroBuild dev
  environment against this backend.
- Migration plan: Introduce a lockfile (`pip-compile`/`uv`/`poetry`) as a low-effort, high-value
  fix before CerebroBuild work ramps up, so the two efforts don't end up debugging environment
  drift instead of actual code issues.

## Missing Critical Features

**Everything AgentOS's own README already flags as "intentionally not built":**
Temporal (workflow engine is a custom DAG executor instead), NATS JetStream (in-process pub/sub
instead), OpenSearch (local vector similarity instead), MinIO (local disk instead), Keycloak
(API-key bearer auth instead), HashiCorp Vault (env vars instead), OPA (YAML policy rules
instead), and Kubernetes/Helm (Dockerfile + docker-compose only). These are documented,
intentional MVP scope cuts, not oversights — restated here only so this concerns document is a
complete single reference. See `apps/studio/agentos/README.md` for the full rationale and the
8-step roadmap to close each gap.

**No production startup guard for insecure defaults:**
- Problem: `Settings.is_production` (`apps/studio/agentos/app/config.py`) exists but nothing at
  app startup actually checks it against `agentos_admin_secret` being unset, `agentos_jwt_secret`
  still being the placeholder value, or the CORS allowlist still being `localhost:3000`. The app
  will start and serve traffic in a production-labeled environment with every MVP default still
  active.
- Blocks: Safe promotion of this service to a shared/staging/production environment without a
  manual pre-flight checklist.
- Recommendation: Add a startup check in the `lifespan` handler (`apps/studio/agentos/app/
  main.py`) that raises if `settings.is_production` is true and any of the known-unsafe defaults
  are still in place (unset admin secret, placeholder JWT secret, default CORS origin).

## Test Coverage Gaps

**Large unmounted/duplicate module trees have no test coverage:**
- What's not tested: `app/core/sdk/*`, `app/core/orchestrator/*`, `app/core/planning/*`,
  `app/core/events/*`, `app/core/context/*`, `app/core/retrieval/*`, `app/core/search/*`,
  `app/core/storage/*`, `app/core/telemetry/*`, `app/core/tools/*` (the newer registry under
  `core/tools/`, distinct from the live `app/core/tool_framework.py`), `app/core/cerebro_x/*`
  (beyond `embeddings.py`, which is used by the live workflow engine), `app/archive/*`,
  `app/copilot/`, `app/flow/`, `app/hiveops/`, `app/hiveshield/`, `app/insight/`,
  `app/platform/*`, `app/studio/`.
- Files: See Tech Debt section for the full module list.
- Risk: Low direct risk today since none of this is reachable via `main.py` — but if CerebroBuild
  (or any future work) starts wiring any of these modules in, they'd be going live with zero
  existing test coverage, unlike the legacy path which has `tests/test_smoke.py`,
  `tests/test_mesh.py`, `tests/test_cortex_simulator.py`,
  `tests/test_context_governance_observability.py`, `tests/test_production_gates.py`, and
  `tests/test_finance.py` behind it.
- Priority: Medium — not urgent while the code stays dead, but should block any decision to
  "just wire up the existing `core/sdk/planning` module instead of writing a new one" without
  first writing tests for it.

**AgentOS test suite is smoke/integration-level, not exhaustive per-engine unit coverage:**
- What's not tested: The six test files in `apps/studio/agentos/tests/` are scoped by feature
  area (mesh/delegation, cortex+simulator, context+governance+observability, production gates,
  finance, general smoke) rather than one file per engine module — there's no dedicated test file
  visible for `knowledge_engine.py`, `memory_engine.py`, or `event_bus.py` in isolation (they may
  be exercised indirectly via the smoke/mesh tests, but not verified here in detail).
- Files: `apps/studio/agentos/tests/`.
- Risk: Regressions in knowledge retrieval scoring, memory tier promotion/demotion logic, or
  event bus fan-out behavior could pass CI without a dedicated test catching them.
- Priority: Medium — worth a quick audit of what each existing test file actually exercises
  before CerebroBuild starts depending on these engines' exact behavior.

---

*Concerns audit: 2026-07-23*
