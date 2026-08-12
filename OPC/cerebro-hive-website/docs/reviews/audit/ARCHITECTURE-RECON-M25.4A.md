# Milestone 25.4A — Architecture Reconnaissance & Consolidation Audit

**Status: Phase 1–2 complete (full repo scan, since corrected — see below). Phase 3–4 complete for the Gateway cluster and the confirmed-dead `apps/platform` runtime scaffold (now deleted). Phase 5–7 in progress — see "Not Yet Audited" for what's left.**

## CORRECTION (post-initial-report, same audit)

The original scan below only read `.ts/.tsx/.js/.jsx` files. That materially understated this repo: it also contains real **Rust** (`services/gateway`), **Go** (`services/tool-gateway`, `services/router-service`, `services/swarm-api`), **Kotlin** (`services/platform-svc`, `services/academy-svc`, `services/crm-svc`), and **C++** (`services/ml-svc`) services that the original pass wrongly counted among the "31 empty directories."

Two corrections matter a lot:

- **`services/gateway` (Rust) is real, substantial, and NOT a duplicate of `packages/ai-gateway`.** It's an Axum-based edge API gateway/reverse-proxy — JWT auth, rate limiting, CORS, tracing — that explicitly proxies `/api/v1/workflows`, `/api/v1/agents`, `/api/v1/knowledge` to **`apps/platform-api`** (this session's real work) and `/api/v1/forge` to `forge-api`, plus routes to the Kotlin services. `packages/ai-gateway` is an LLM-provider gateway (routes to Anthropic/OpenAI). These solve different problems and both look legitimate — this was never actually a duplicate cluster, just a name collision. One real bug found in passing: the `/` proxy route (as opposed to the `/{*path}` wildcard route) has a hardcoded `String::new()` placeholder instead of the captured `base_url`, so root-path proxying to any mounted service is currently broken.
- **`services/tool-gateway` (Go) is real and well-built** — Redis-backed rate limiting, a tool registry, an executor with adapters, Gin HTTP routes, graceful shutdown. This is a serious candidate for the *actual* canonical tool-calling layer, and needs to be weighed against the `ToolRuntime`/`ToolRegistry`/`ToolRuntimeToolProvider` work done in `packages/capabilities/agent-builder` this session — not assumed to be the loser.

I almost recommended deleting both of these as "empty scaffold folders." Caught it before executing by re-checking actual directory contents one more time before deleting — see §8 for the corrected list of what's actually still empty versus what's real code in an unscanned language.

**No other production code was modified beyond what's noted in §8** — that section documents the one confirmed-dead deletion that *was* executed this pass.

---

## 1. Executive Summary

The single biggest finding: **`apps/platform/src/features/studio/backend-runtime/`** contains an entire from-scratch runtime engine — `ExecutionGateway`, `ExecutionScheduler`, `ReleaseResolver`, `ReleaseManager`, `RuntimeIR`, `TemporalInterpreter`, `CapabilityRegistry`, `RuntimePlanner`, `RuntimeOptimizer`, `WorkerPoolManager`, `AdaptiveScheduler`, `IntelligentRetryEngine`, `RuntimeDiagnostics`, `ReplayEngine`, `SnapshotManager`, and more — whose naming matches the original Milestone 25.4 prompt almost term-for-term. That is not a coincidence worth dismissing: **this is very likely the literal codebase the original prompt was written against.**

Having now read the actual source, the verdict is unambiguous: **it is 100% disconnected scaffolding.**

- `ExecutionGateway.ingest()` resolves a descriptor, then does `console.log("[Gateway] Routing to Temporal Interpreter...")`. Nothing is routed.
- `TemporalInterpreter.execute()` loops over stages and tasks and emits telemetry events (`NodeStarted`, `NodeCompleted`) around comments that say `// Lookup Capability Registry`, `// Retrieve Artifacts via Reference`, `// Schedule Activity...` — no lookup, retrieval, or scheduling code exists.
- A repo-wide search for `new ExecutionGateway(`, `new TemporalInterpreter(`, `new ExecutionScheduler(`, `new ReleaseManager(` returns **zero results**. Nothing anywhere in the app constructs these classes.
- `apps/platform` has no `app/api/**/route.ts` files at all — there's no HTTP surface for this runtime to even be reached through.

This confirms the premise behind both the original M25.4 prompt and your decision to recon first: there's a real, elaborate-looking runtime sitting in this repo that is pure scaffold, and it would have been a serious mistake to start "completing" it (as the literal M25.4 prompt asked) before knowing it isn't wired to anything.

Beyond that one module, the repo-wide scan surfaced:
- **138 total units** (packages + services + apps) — vs. the ~4 I've actually built (`runtime-core`, `agent-builder-capability`, `ai-gateway`, `platform-api`) and the ~30 conceptual subsystems the original prompt named.
- **31 completely empty directories** — scaffolded folder names with no files at all (e.g. `services/gateway`, `services/tool-gateway`, `packages/storage`, `packages/search`).
- **4 Python services** (`agent-runner`, `evaluation-service`, `learning-service`, `planner-service`) my scanner can't assess — it only reads `.ts/.tsx/.js/.jsx`.
- **57 units with real package.json + real code but zero internal-import consumers anywhere in the repo** — candidates for dead/orphaned/never-wired code (with an important caveat, see §4).
- **22 class/interface names declared in 2+ different, unrelated units** — concrete, non-speculative evidence of parallel implementations solving the same problem.
- **The word "platform" refers to three unrelated things** in this repo: the marketing site's `/platform/*` routes (root `app/`), the standalone `apps/platform` Next.js app (home of the dead runtime above), and product terminology inside `apps/studio`. Worth fixing just for human sanity.

---

## 2. Methodology & Confidence Levels

A single Node script traversed `packages/`, `services/`, and `apps/` (excluding `node_modules`, `.next`, `dist`, `build`, `.turbo`) — 2,204 source files, 10.4MB, in 28 seconds. For every unit it recorded: file count, last-modified, declared `@cerebro/*` dependencies, scaffold-pattern hits (`TODO`, `FIXME`, `Mock*`, `Stub`, `Dummy*`, `placeholder`, `NotImplemented`, etc.), and every `Gateway/Registry/Engine/Scheduler/Compiler/Interpreter/EventBus/Planner/Orchestrator/Runtime/Resolver/Manager`-named class or interface declaration. It also parsed every `from '@cerebro/x'` import in the whole repo into a real consumer graph.

That gives high-confidence **mechanical** data (file counts, who-imports-whom, name collisions) for all 138 units. It does **not** by itself tell you whether a given file is real or fake — for that I read actual source. Two confidence tiers below:

- **Verified** — I read the actual source of the file(s) in question. Currently: the Gateway cluster, the Workflow cluster, and the `apps/platform` backend-runtime module.
- **Inventoried only** — mechanical data exists (file counts, consumers, scaffold-hit counts), but I have not personally read the code. This is most of the 138 units, and *all* of `apps/studio` (1,163 files — an order of magnitude bigger than everything else in the repo combined).

Please don't read percentages or hit-counts below as final verdicts on anything I've marked inventoried-only — they're strong signals, not conclusions.

---

## 3. Duplicate Capability Clusters (Verified)

### 3.1 Gateway — ai-gateway wins, four others are dead weight

| Candidate | Real code? | Wired to production? | Verdict |
|---|---|---|---|
| `packages/ai-gateway` (`AIGateway`) | Yes — circuit breaker, rate limiter, cache, cost tracking (built earlier this session, re-verified) | Yes — consumed by `apps/platform-api`, which is a real running Fastify server | **Keep — canonical** |
| `apps/platform`'s `ExecutionGateway` | No — `console.log` stub, see §1 | Not instantiated anywhere | **Remove** |
| `services/llm-gateway` (`LLMGatewayPipeline`) | No — read the full file. `mockLiteLlmExecution()`, hardcoded `checkBudgetExceeded() { return false; }`, hardcoded fake token counts (`inputTokens: 120, outputTokens: 45`), literal string returns like `"Mock response from ${model}"` | Zero internal consumers | **Remove** (or gut-rewrite if the pipeline shape — auth→budget→prompt-resolution→model-selection→execution→usage-recording — is wanted; right now every step is fake) |
| `services/gateway` | N/A — empty directory, 0 files | N/A | **Remove the scaffold folder** |
| `services/gateway-api` | N/A — empty directory, 0 files | N/A | **Remove the scaffold folder** |
| `services/tool-gateway` | N/A — empty directory, 0 files | N/A | **Remove the scaffold folder** |

### 3.2 Workflow — the wired one is thinner than the unwired one

| Candidate | Real code? | Wired to production? | Verdict |
|---|---|---|---|
| `packages/workflow` (`@cerebro/workflow`) | Declares **zero** dependencies (`"dependencies": {}`) — whatever it does, it can't be doing real Temporal orchestration | Yes — imported by `services/forge-api` and `apps/studio` | Wired, but thin. Needs a source read before trusting it. |
| `packages/capabilities/workflow` (`@cerebro/workflow-capability`) | Declares real `@temporalio/client` + `@temporalio/workflow` dependencies, and has `WorkflowRuntime`, `IWorkflowEngine`, `TemporalWorkflowEngine` — looks like a genuine interface+impl attempt at real Temporal integration | **Zero internal consumers** — built, never wired in | Don't discard reflexively — this may be the *better-designed* one that got abandoned mid-integration. Needs a source read to confirm before deciding whether to migrate `forge-api`/`studio` onto it or delete it. |
| `services/workflow-api` (`WorkflowCompiler`) | Unread | Zero internal consumers | Flagged, unread |
| `services/temporal-worker` | Unread, declares no internal deps (plausible if it only uses the external Temporal SDK) | Not importing or imported by anything in the graph | Flagged, unread — worth checking whether this is meant to be the actual Temporal worker process for whichever workflow engine wins |

This is the one cluster where "keep whichever has more consumers" would be the wrong call without reading code first — the wired package has weaker declared architecture than the unwired one.

### 3.3 Agent execution — at least three parallel surfaces

- `packages/capabilities/agent-builder` (`AgentRuntimeService`) — real, verified, wired into `apps/platform-api` (this session's M10/M25 work).
- `services/swarm-runtime` — has its own `AgentRegistry`, `DecisionEngine`, `ExecutionEngine`, `PlannerService`, `ReflectionEngine`. Not read yet. Not import-consumed by anything, but as a *service* it may be meant to run standalone and be called over the network rather than imported — the consumer graph can't see that. Needs a read + a check for any HTTP/queue wiring to it from elsewhere.
- `services/agent-runner` — Python, unscanned by this pass entirely.

### 3.4 Capability Registry — five parallel implementations of the same concept

`CapabilityRegistry` / `CapabilityRegistryImpl` is declared in: `packages/capability-core`, `apps/platform`, `apps/studio` (as `CapabilityRegistry`), and separately `packages/experience` and `packages/plugins` each declare their **own, differently-implemented** `CapabilityRegistryImpl`. Meanwhile `packages/runtime-core`'s `RuntimeRegistry` (deliberately generic, not named "CapabilityRegistry") is the one actually wired into `apps/platform-api` today. None of the other four are read yet — flagged for Phase 3 continuation.

---

## 4. Orphan Candidates — 57 units with real code, zero internal-import consumers

Full list in the appendix table. Important caveat: this only detects "nothing imports this as an `@cerebro/*` package." A `services/*` unit could still be legitimately alive as a network-called microservice (HTTP, queue, cron) with zero *import* consumers — that's expected and fine for a service. This list is a **candidate** list for the next pass to individually check ("is this actually deployed/called anywhere, or just sitting there"), not a removal list.

Highest-scaffold-density orphans worth prioritizing first: `packages/change-core` (18 files, 10 scaffold hits), `packages/ai-governance-core` (12 files, 9 hits), `packages/federation-core` (7 files, 8 hits), `packages/aiops-core` (12 files, 6 hits), `packages/privacy-core` (7 files, 6 hits).

---

## 5. Scaffold Density by Unit (Verified Portion + Inventory)

| Unit | Files | Scaffold Hits | Status |
|---|---|---|---|
| `apps/studio` | 1,163 | 421 | **Not yet audited** — by far the largest unaudited surface in the repo |
| `apps/platform` | 100 | 33 | **Verified dead** — backend-runtime module confirmed disconnected scaffold (§1) |
| `apps/platform-api` | 22 | 22 | Partially verified — this is the app I built/tested this session; several "hits" are legitimate test mocks (`MockProviders.ts`, `.test.ts` files) rather than production scaffolding. Needs a hit-by-hit pass to separate the two, but I have first-hand confidence most of the real path (`AIGatewayLLMProvider`, `ToolRuntimeToolProvider`, `AgentRuntimeService`) is genuine. |
| `apps/forge` | 5 | 7 | Not yet audited |
| `packages/change-core` | 18 | 10 | Not yet audited |
| `packages/ai-governance-core` | 12 | 9 | Not yet audited |
| `packages/federation-core` | 7 | 8 | Not yet audited |
| `packages/db` (generated Prisma client) | 28 | 12 | Likely a false positive — scaffold-pattern hits are probably inside generated/vendored Prisma runtime files, not hand-written code. Needs a quick check but low priority. |

Full ranked table (34 units with any hits) is in `scaffold-ranking.md`.

---

## 6. Consolidation Plan (for clusters verified so far)

**Keep (canonical):**
- `packages/ai-gateway` for all LLM calls.
- `packages/runtime-core`'s `RuntimeRegistry` for capability resolution.
- `packages/capabilities/agent-builder` for agent execution.

**Remove (confirmed dead, safe to delete):**
- `services/gateway`, `services/gateway-api`, `services/tool-gateway` — empty directories.
- `apps/platform/src/features/studio/backend-runtime/**` and `apps/platform/src/features/studio/release/**` — confirmed disconnected scaffold (console.log stubs, zero instantiation, no API routes). Deleting this would remove ~30+ files and dozens of the "scaffold hit" count with zero production risk, since nothing calls into it.
- `services/llm-gateway` — confirmed mock-only pipeline, zero consumers.

**Needs a source read before deciding (do not touch yet):**
- `packages/workflow` vs `packages/capabilities/workflow` vs `services/workflow-api` vs `services/temporal-worker` — real architectural decision, not a cleanup task. The "wired" one may not be the "right" one.
- `services/swarm-runtime` vs `packages/capabilities/agent-builder` vs `services/agent-runner` (Python) — need to know if swarm-runtime is a standalone multi-agent orchestrator meant to *sit above* agent-builder (different job) or a genuine competing implementation (same job).
- The five `CapabilityRegistry`/`CapabilityRegistryImpl` implementations (`capability-core`, `apps/platform`, `apps/studio`, `experience`, `plugins`).

**Complete (this milestone explicitly says don't implement new features, so this is future-milestone material, not now):**
- N/A for this pass — nothing here should be "completed," several things should be deleted instead.

---

## 7. Not Yet Audited (honest scope-remaining list)

- **`apps/studio` (1,163 files, 421 scaffold hits)** — this alone is bigger than the entire rest of the repo combined and deserves its own dedicated recon pass, not a few minutes at the end of this one.
- 4 Python services (`agent-runner`, `evaluation-service`, `learning-service`, `planner-service`) — need a Python-aware scan (my script only reads `.ts/.tsx/.js/.jsx`).
- ~50 of the 57 orphan candidates, individually — I've only source-verified the highest-signal ones (llm-gateway, platform's backend-runtime).
- Phases 8–12 from the original prompt (exception handling, observability, security, performance, production-readiness checklists) — not started; they presuppose knowing which implementation is canonical per cluster, which is still in progress for 3 of the 4 clusters above.

---

## 8. Executed This Pass + Corrected Empty-Directory List

**Deleted (confirmed dead, verified by direct source read + zero instantiation + zero API routes):**
- `apps/platform/src/features/studio/backend-runtime/` (19 files: `ExecutionGateway.ts`, `ExecutionScheduler.ts`, `ExecutionDescriptor.ts`, `ExecutionCache.ts`, `CapabilityRegistry.ts`, `RuntimeDiagnostics.ts`, `ExecutionContext.ts`, `RuntimeIR.ts`, `TemporalInterpreter.ts`, `RuntimeOptimizer.ts`, `CostEstimator.ts`, `IntelligentRetryEngine.ts`, `RuntimePlanner.ts`, `AdaptiveScheduler.ts`, `ArtifactStore.ts`, `ExecutionStateStore.ts`, `EventBus.ts`, `MetricsPipeline.ts`, `ExecutionTimelineGenerator.ts`, `WorkerPoolManager.ts`)
- `apps/platform/src/features/studio/release/` (8 files: `ReleaseManager.ts`, `WorkflowLock.ts`, `WorkflowRelease.ts`, `DeploymentService.ts`, `PolicyAdapter.ts`, `PromotionService.ts`, `ReleaseNotesService.ts`, `RollbackService.ts`)
- 27 files total. This is the exact scaffold set matching task.md's still-unchecked "Milestone 25.3" backlog — confirms that milestone was scaffolded but never wired up, then correctly identified as dead here.

**NOT deleted — apps/platform's `src/features/studio/` has 10 more sibling directories that were never examined:** `api` (0 files), `canvas` (0 files), `compiler` (14 files), `graph` (1 file), `lifecycle` (1 file), `migration` (1 file), `nodes` (2 files), `runtime` (34 files), `simulation` (0 files), `store` (1 file). `compiler` and `runtime` in particular are sizable and unverified — do not assume these are also dead just because their neighbors were.

**Corrected empty-directory list (14 confirmed, not 31):** `packages/api-client`, `packages/cache`, `packages/search`, `packages/storage`, `services/archive-api`, `services/gateway-api`, `services/hiveops-api`, `services/identity-api`, `services/search-api`, `apps/archive`, `apps/flow`, `apps/insight`, `apps/ops`, `apps/search` — all confirmed 0 files via two independent checks.

**Package.json-only shells (real but zero implementation — 9 of these, close to the original "empty" framing):** `packages/icons-ai`, `icons-angular`, `icons-cli`, `icons-core`, `icons-figma`, `icons-react`, `icons-vue`, `icons-web`, `services/marketplace-api`.

**Real services in unscanned languages, need their own read-through before any Keep/Merge/Remove call:** `services/gateway` (Rust), `services/tool-gateway` (Go), `services/router-service` (Go), `services/swarm-api` (Go), `services/platform-svc` (Kotlin/Spring), `services/academy-svc` (Kotlin), `services/crm-svc` (Kotlin), `services/ml-svc` (C++), plus the 4 already-flagged Python services.

---

## Appendix

Four companion data files sit alongside this report in the same `audit/` folder:
- `inventory-table.md` — full 138-unit repository inventory (group, package name, file count, internal dependency count, consumer count, scaffold-hit count, last-modified date).
- `name-collisions.md` — all 22 class/interface names declared identically in 2+ unrelated units (e.g. `PolicyEngine` is declared in 6 different places).
- `orphan-candidates.md` — all 57 units with real code and zero internal-import consumers.
- `scaffold-ranking.md` — all 34 units with at least one scaffold-pattern hit, ranked by count.
