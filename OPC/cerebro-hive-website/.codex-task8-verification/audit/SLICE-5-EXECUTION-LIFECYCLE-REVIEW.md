# HiveForge Slice 5 — Execution Lifecycle & Orchestration Review

**Status:** Review complete. This is an inventory-and-analysis slice, not a contract-building one (unlike Slices 1–4) — per the objective as scoped, it validates whether a coherent execution model exists today. **No code was written or changed.** Every claim below is backed by a real file path and, for load-bearing claims, a quoted excerpt — not inferred from names or assumed from documentation.

**Scope boundary:** this review covers the *application-and-persistence* execution model (agent/workflow execution as implemented in `packages/domain`, `apps/platform-api`, `packages/database`/`packages/db`, `packages/capabilities/agent-builder`, `packages/runtime-core`, `services/swarm-runtime`, `apps/platform`'s Studio simulator). It does not re-litigate `ADR-022`'s `ResourceLifecycleState` (`packages/domain-model`) — that is a different bounded context (infrastructure Resource provisioning, not agent/workflow execution) and is noted only where the two are at risk of being confused.

---

## 1. Execution lifecycle inventory

**Primary finding: there is no single canonical execution aggregate. At least six independent, non-communicating representations of "an execution" exist in this repository**, spanning three different persistence schemas and one client-only simulator. None of them share an ID space, a status vocabulary, or a persistence backend with any other.

| # | Representation | Where | Status field | Real, live consumer? |
|---|---|---|---|---|
| 1 | `Workflow` → `WorkflowExecution` → `WorkflowRun` → `WorkflowStepExecution` (a four-level chain) | `packages/database/prisma/schema.prisma` (lines 358–439) | Plain `String` on each of `WorkflowExecution`/`WorkflowRun` — **no Prisma enum, no DB-level constraint on valid values** | Partially — `apps/platform-api`'s `workflows.routes.ts` creates a `WorkflowExecution` row directly via Prisma (see §3), but never creates a `WorkflowRun` or `WorkflowStepExecution`, and never updates the `WorkflowExecution` row again after creation (no code path sets `completedAt` or transitions `status` away from `'RUNNING'`). |
| 2 | `AgentExecution` | `packages/database/prisma/schema.prisma` (lines 310–318) | Plain `String`, no enum | **No live writer at all.** Repo-wide search for `prisma.agentExecution.create` finds exactly one call site: `packages/database/prisma/seed.ts:162` (fixture data). `AgentRepository` (`packages/database/src/repositories/AgentRepository.ts`) has no `createExecution`-shaped method. The only real *readers* are `apps/platform-api/src/modules/telemetry/telemetry.routes.ts` (`prisma.agentExecution.findMany`/`findUnique`, three call sites) — meaning any telemetry dashboard built on this table only ever sees seed fixture rows, never a real execution. |
| 3 | `Workflow`/`WorkflowExecution`/`Agent`/`AgentRun`, backed by a real, well-designed `ExecutionStatus` enum (`QUEUED`/`RUNNING`/`WAITING_FOR_HUMAN`/`COMPLETED`/`FAILED`/`TIMEOUT`/`CANCELLED`) | `packages/db/prisma/schema.prisma` (lines 58–105, 241–337) | **Real enum**, DB-constrained | **Zero live consumers.** `packages/db` is the dependency of `services/platform-api` — the tree classified as an orphaned, never-wired parallel implementation in `audit/SERVICES-PLATFORM-API-CLASSIFICATION.md`. `apps/platform-api` (the actively-developed service) depends on `@cerebro/database` (representation #1/#2 above), not `@cerebro/db`. The more architecturally sound state model in this repository belongs to the one service that cannot run. |
| 4 | `AgentExecutionContext` (`packages/domain`) / `ExecutionContext` (`packages/runtime-core`) | Passed into `AgentRuntimeService.execute()` (`packages/capabilities/agent-builder/src/AgentRuntimeService.ts`) | No status field at all — it's a request-scoped parameter object, not a persisted entity. The method's return value has an ad hoc `status: 'completed' \| 'suspended'` string, discarded by the caller (see §5). | This is the **one real, live, end-to-end execution path** in the repository (chat message → `AgentRuntimeService.execute` → `AIGatewayLLMProvider`) — but it has no persisted aggregate at all, see §5. |
| 5 | `TaskDAG` nodes with a `status: 'PENDING'` field | `services/swarm-runtime/src/DecisionEngine.ts` | String literal, one value (`'PENDING'`) ever produced in the code read | Mock/scaffold — `DecisionEngine.handleReplanRequest()` returns a hardcoded, commented `// Generate successor DAG (mocked)` result and only `console.log`s. `services/swarm-runtime` has zero dependents anywhere in the repo (confirmed via `package.json` grep — only its own manifest matches). |
| 6 | `ExecutionKernel` / `ExecutionContext` / `ExecutionEventType` (a client-side "Simulator Runtime") | `apps/platform/src/features/studio/runtime/` (`SimulatorRuntime.ts`, `kernel/ExecutionKernel.ts`, `ExecutionEvents.ts`, `observability/EventDispatcher.ts`, `replay/Recording.ts`) | Its own event-type vocabulary (`ExecutionQueued`, `WorkerAllocated`, `SandboxCreated`, `ExecutionStarted`, `ExecutionCompleted`, `SandboxDestroyed`, `WorkerReleased`, tested in `apps/studio/tests/api/execution.test.ts`) | Explicitly a **simulator** — its own file header states "`SimulatorRuntime`... a thin public API shell over `ExecutionKernel`... Future runtimes (Streaming, Distributed, Replay) reuse the same kernel," and it's a plugin/executor pipeline (`LlmExecutor`, `MemoryExecutor`, `ToolExecutor`, `FallbackExecutor`) that runs entirely client-side in `apps/platform` (a different app from `apps/platform-api`). No backend/Prisma involvement found; not connected to any of representations #1–#4. |

**Answering the scoped questions directly:**
- **Is there one canonical aggregate? No.** Six, across three schemas and one client simulator, none sharing an ID space or status vocabulary.
- **Are lifecycle fields duplicated? Yes**, and inconsistently — `status` is a free-form string in representations #1/#2, a real enum in #3, absent entirely (a return value, not a field) in #4, a single hardcoded literal in #5, and a bespoke event-type enum in #6.
- **Are execution IDs stable?** Representations #1/#2/#3 use real DB-generated UUIDs (stable). Representation #4 (the one live path) uses `traceId` as the "execution id" (`toRuntimeExecutionContext()`: `executionId: context.traceId`) — stable per-request, but never persisted anywhere, so it identifies nothing after the HTTP response is sent. The `conversationId` in the same context is computed as the literal string `` `conv-${agentId}` `` (`conversations.routes.ts:66`) — not a real identifier at all, just an agent-id-derived string with no backing record.
- **Is cancellation represented?** Only partially, and inertly in the one live path: `AgentRuntimeService.execute()` checks `context.cancellationToken?.isCancellationRequested` inside its loop (line 57), but `conversations.routes.ts` — the only real caller — never constructs or passes a `cancellationToken`, so this field is always `undefined` and the cancellation branch is unreachable dead code in the live system. `services/db`'s `CANCELLED` enum value (representation #3) is real but unreachable (dead package). No cancellation exists anywhere in representations #1/#2/#5/#6 beyond the swarm-runtime mock's absence of the concept entirely.

## 2. Execution state machine — inventory vs. documentation

**No enforced state machine exists anywhere in the live system.** Findings, by representation:

- **Representation #1** (`WorkflowExecution`, live): `workflows.routes.ts`'s handler (quoted in full in §3) does exactly one write — `prisma.workflowExecution.create({ data: { workflowId: id, status: 'RUNNING' } })` — and nothing else. There is no second write anywhere in the codebase that ever transitions this row's `status` away from `'RUNNING'`, no code that sets `completedAt`. A `WorkflowExecution` row, once created, is architecturally frozen at `'RUNNING'` forever from the application's point of view. This is not "failure is terminal" or "retry is represented" — it's that **no transition of any kind is implemented**, legal or otherwise, past the initial insert.
- **Representation #2** (`AgentExecution`): no writer exists at all (per §1), so there is no transition logic to evaluate — the state machine question doesn't apply; the aggregate is never instantiated by real code.
- **Representation #3** (`packages/db`'s enum): the enum vocabulary is well-designed (`QUEUED → RUNNING → {COMPLETED | FAILED | TIMEOUT | CANCELLED}`, plus a `WAITING_FOR_HUMAN` state that would map naturally onto `policy-core`'s `HumanApproval` outcome) but exists only as a schema-level type — no application code in the (unwired) `services/platform-api` tree was found to actually perform a transition between these values either; the schema encodes a state machine the application layer never implements.
- **Representation #4** (`AgentRuntimeService`, the one live path): the closest thing to a state machine is the `while (!isComplete && iterations < maxIterations)` loop (lines 42–89) and its three possible exits: `isComplete = true` (final answer), an early `return { status: 'suspended', ... }` (async tool result), or a thrown `Error('Max iterations reached...')`. These are **function-local control-flow branches, not a persisted state machine** — none of the three outcomes is ever written to a database row, so "was this execution suspended, completed, or did it hit the iteration cap" is knowable only for the lifetime of one HTTP request/response cycle, never afterward.
- **Undocumented transitions found:** none, in the strict sense — there are almost no transitions *implemented* at all to be undocumented. The one arguable undocumented-transition risk is representation #1's permanent `'RUNNING'` freeze: nothing in `hiveforge/`'s docs or `packages/database`'s schema comments states that `WorkflowExecution.status` is expected to stay `'RUNNING'` forever; the freeze is an implementation gap (a missing completion-write), not a documented design choice.
- **Resumability:** `packages/database`'s schema defines `ExecutionCheckpoint` (line 1211, `contextSnapshot`/`variables`/`pendingActions`/`eventOffset` — a genuinely well-designed resumability shape) but repo-wide search for `prisma.executionCheckpoint` (any read or write) returns zero matches anywhere in application code. Resumability is schema-only, entirely aspirational.
- **Partial failure:** not modeled anywhere found. The `WorkflowRun`/`WorkflowStepExecution` chain in representation #1's schema *could* support per-step partial failure (each step has its own row), but since no code ever creates a `WorkflowRun` or `WorkflowStepExecution` row at all, this is unrealized schema potential, not a working feature.

## 3. Orchestration boundary — who owns orchestration?

**No real orchestrator or scheduler is wired into the live system.** The component that most resembles one, `apps/platform-api/src/modules/runtime/runtime.routes.ts` (`POST /execute`, `/pause`, `/resume`, `/cancel`), is **fully mocked** — every handler returns a hardcoded literal (e.g. `{ executionId: 'mock-uuid-execution-id', status: 'Queued' }`), confirmed directly in that file. There is no scheduler, no queue, no worker pool anywhere in the live path.

For the workflow "execute" route (`apps/platform-api/src/modules/workflows/workflows.routes.ts:74-99`, quoted from the earlier policy-interception pass):
```ts
fastify.post('/:id/execute', { preHandler: requirePermission('workflows:execute') }, async (request, reply) => {
  const workflow = await prisma.workflow.findUnique(...);
  const execution = await prisma.workflowExecution.create({ data: { workflowId: id, status: 'RUNNING' } });
  ...
});
```
this is a database row insert, not an invocation of any orchestration engine, scheduler, or provider. There is no orchestration boundary to evaluate here because there is no orchestration — the "execute" endpoint's entire effect is a single write.

For the one real execution path (chat message → agent), `AgentRuntimeService.execute()` (`packages/capabilities/agent-builder/src/AgentRuntimeService.ts`) **is** performing real coordination — its own `while` loop decides how many model-invocation rounds to run, whether to branch into tool execution, and when to stop — but it does this itself, synchronously, inline, rather than delegating to a separate orchestrator/scheduler component. This is a mild violation of the "providers execute, orchestrators coordinate" invariant only in the sense that `AgentRuntimeService` is *simultaneously* the orchestrator and the caller of providers — there is no third component named "orchestrator" doing the coordinating. It is not, however, a violation in the more serious sense the objective warns against (a *provider* becoming an orchestration engine): the actual provider implementations were checked directly —

- `AIGatewayLLMProvider` (`apps/platform-api/src/modules/runtime/providers/AIGatewayProviders.ts`) — a single `invokeModel()` call into `@cerebro/ai-gateway`, no loop, no branching, no sequencing of multiple steps.
- `ToolRuntimeToolProvider` (`apps/platform-api/src/modules/runtime/providers/ToolRuntimeProvider.ts`) — a single `invokeTool()` call, same shape.

Both providers are correctly execution-only. The orchestration/coordination logic (the while-loop, the tool-branch decision) lives entirely in `AgentRuntimeService`, which is the right *kind* of component to hold it (it is explicitly a runtime/orchestration-shaped class, not a provider), even though it isn't split out into a further-separated "orchestrator" abstraction the way `runtime.routes.ts`'s naming implies one should exist (and doesn't, since that file is mocked).

`services/swarm-runtime`'s `DecisionEngine`/`Planner` (flagged as "scaffold" in the earlier M25.4A audit, reconfirmed here) is a *real* orchestration-shaped design (replanning, DAG revision, event emission) but is entirely mocked and has zero consumers — it cannot be evaluated as a working orchestration boundary because nothing calls it.

**Answering the scoped question:** orchestration is not centralized — it exists in exactly one place (`AgentRuntimeService`'s internal loop, for the one live LLM-chat path), nowhere for workflow execution (a bare DB insert), and as mocked scaffolding everywhere else (`runtime.routes.ts`, `services/swarm-runtime`).

## 4. Context propagation

Traced through the one live execution path (`conversations.routes.ts` → `AgentRuntimeService.execute` → `toRuntimeExecutionContext` → provider):

```ts
// conversations.routes.ts constructs AgentExecutionContext from cerebroContext (the
// HTTP-layer identity/tenancy context set by requireAuthHook + requireWorkspaceAccessHook):
const executionContext: AgentExecutionContext = {
  conversationId: `conv-${agentId}`,       // NOT a real id — string-concatenated, no backing record
  tenantId: cerebroContext.tenantId,        // real, threaded from JWT-derived context
  workspaceId: cerebroContext.workspaceId,  // real, threaded from JWT-derived context
  userId: cerebroContext.userId ?? 'anonymous',
  traceId: cerebroContext.traceId,          // real
  correlationId: cerebroContext.correlationId,
  agentVersionId: version.id,
  promptVersionId: version.id,              // placeholder, per the file's own comment
  modelId: version.modelId,
  memory: { workingMemory: {}, conversationHistory: [] },  // always empty — no conversation store yet
  availableTools: [],
  tokenBudget: { maxTokens: 4096, tokensUsed: 0 },
  executionMode: 'sync',
};

// AgentRuntimeService.toRuntimeExecutionContext then maps this onto runtime-core's
// ExecutionContext, which is what the provider layer actually receives:
return new ExecutionContext({
  executionId: context.traceId,
  workspaceId: context.workspaceId,
  tenantId: context.tenantId,
  userId: context.userId,
  variables: context.memory.workingMemory,
  secretRefs: {},
  policies: [],                              // hardcoded empty — no policy ever reaches the provider layer
  modelSelection: { provider: 'auto', model: context.modelId },
  budget: { tokens: context.tokenBudget?.maxTokens },
});
```

**What genuinely flows through, end to end:** tenant id, workspace id, user id, trace/correlation id, model selection, and token budget. This part of context propagation is real and correctly threaded from the HTTP-layer identity/tenancy middleware through to the provider boundary.

**What does not flow through, despite existing as a field:**
- **Policy:** `policies: []` is a hardcoded literal in `toRuntimeExecutionContext()` — no policy reference of any kind (not `hiveshield-policy`, not `policy-core`, not even a policy *id*) ever reaches the provider layer. This is consistent with §6/the policy-interception pass: the real policy engines have no live callers anywhere, so there is nothing to propagate.
- **Cancellation:** `context.cancellationToken` is read inside `AgentRuntimeService`'s loop but never populated by the one real caller — present in the type, absent in practice (see §2).
- **Capability descriptors:** `availableTools: []` is hardcoded empty in the live route; `HiveCapabilityDescriptor` (HiveForge's Slice 2 contract) is never referenced anywhere in this call chain.
- **Execution metadata for persistence:** none of the above is written anywhere (see §5) — so "context propagation" in this system currently means "context propagation for the duration of one request," not "context propagation into a persisted, auditable record."

**This confirms the objective's own expectation** ("this is often where architectural drift appears") — the drift here is concrete and specific: the context *type* (`AgentExecutionContext`) was clearly designed with policy and capability-awareness in mind (the fields exist), but the one real call site populates them with empty stubs, not because a decision was made to omit them, but because (per `AgentRuntimeService`'s own comments) tool-calling and policy wiring are still-pending milestones (M10.2/M10.3, and no milestone reference for policy at all).

## 5. Persistence model

**Persistence is not authoritative anywhere in the live execution path.** Direct evidence, `conversations.routes.ts`'s own header comment:

> "M10.1 (Real Agent Execution): both handlers now do real work instead of returning hardcoded responses. Conversation persistence is explicitly deferred to M10.4... there is no Conversation/Message store behind this yet: POST / returns a transient handle; nothing is written to the DB."

Concretely: `POST /` (create a conversation) returns `id: conv-${Math.random().toString(36).slice(2)}` — a random string, not a database-backed id, and writes nothing. `POST /:id/messages` (the real, billed LLM-execution route) runs the full `AgentRuntimeService.execute()` loop and returns its result directly to the HTTP caller — no `AgentConversation` row, no `AgentMessage` row, no `AgentExecution` row, no event of any kind is written anywhere. The method's own comment confirms this is by design-in-progress, not oversight: `"4. Persistence & Event Publishing handled by caller (M10.4)"` — a caller that, as written today, does neither.

- **Is persistence authoritative? No** — for the one live execution path, there is currently no persistence at all; the HTTP response *is* the only record of what happened.
- **Are events reconstructable? No** — there is nothing to reconstruct from; per §6, no event is emitted for this path in the first place.
- **Are checkpoints consistent?** N/A — `ExecutionCheckpoint` (packages/database schema) has zero real writers or readers anywhere (confirmed by repo-wide search for `prisma.executionCheckpoint` — zero matches), so there is no checkpoint data to be consistent or inconsistent.
- **Workflow execution persistence (representation #1):** partially real — a `WorkflowExecution` row IS created with a real, DB-generated id, but per §2 it is never updated again, so even where persistence exists, it captures only "an execution started," never its outcome.

## 6. Event integration — Slice 3 vs. reality

HiveForge's Slice 3 (`packages/domain-model/src/events/`: `HiveDomainEvent`, `HiveIntegrationEvent`, `HiveEventBus`, `HiveEventPublisher`, `HiveEventSubscriber`, `HiveEventStore`, `HiveEventDispatcher`, `HiveEventSerializer`) has **zero consumers anywhere in the repository** outside its own package — confirmed by a repo-wide search for each type name; every match is inside `packages/domain-model/src/` itself (definitions, the barrel `index.ts`, or that package's own tests). This was already known from that package's README ("Consumers: None yet") and is reconfirmed here rather than assumed: no execution/workflow/agent code path imports anything from `@cerebro/domain-model`'s event contracts.

Separately, `packages/domain` (CerebroStudio's real Agent/Workflow bounded context) has its own, different, real event system (`DomainEvent`/`EventBus`/`InMemoryEventBus`/`OutboxPublisher`) and it **is used** — but only inside `WorkflowApplicationService` and `AgentApplicationService` (`packages/domain/src/services/`), both of which publish real domain events on workflow/agent state changes. The decisive finding: **both of these services are unreachable from any live HTTP route.** `AgentApplicationService.publishVersion()` is wired to a `CreateAgentCommand` on a command bus that nothing ever dispatches (confirmed in the policy-interception pass — checkpoint 4). `WorkflowApplicationService` has zero references anywhere under `apps/` at all (confirmed by a direct repo-wide search restricted to `apps/`). The real, live routes (`agents.routes.ts`, `workflows.routes.ts`, `conversations.routes.ts`) all bypass the domain/application-service layer entirely and call Prisma or `AgentRuntimeService` directly. **So the one place in this repository that actually emits real, well-formed domain events for execution-lifecycle changes is dead code — unreachable from any live request.**

`apps/platform`'s Studio simulator (`ExecutionEventType`: `ExecutionQueued → WorkerAllocated → SandboxCreated → ExecutionStarted → ExecutionProgress → ExecutionCompleted`/`ExecutionFailed`/`ExecutionCancelled` — the exact shape the Slice 5 objective describes as the expected pattern) does emit these events, faithfully, and a real test (`apps/studio/tests/api/execution.test.ts`) asserts the sequence — but entirely within a client-side simulator, disconnected from `apps/platform-api`, Prisma, or any backend execution.

**Net finding:** the *shape* of a correct lifecycle-event system (`ExecutionCreated → ...Scheduled → ...Started → ...Progress → ...Completed/Failed/Cancelled`) exists twice in this repository — once as unused interfaces (`domain-model`), once as a working implementation inside a disconnected client simulator (`apps/platform`) — and the one place with a real, working event-publishing implementation tied to real domain objects (`packages/domain`'s `WorkflowApplicationService`/`AgentApplicationService`) is entirely unreachable from the live system. Zero lifecycle events are emitted anywhere in the actual, running request path today.

## 7. Policy interception map

*(Completed via a dedicated research pass; summarized here, full detail preserved as the source of record.)*

Confirmed: **five separate, non-communicating authorization/policy mechanisms** exist in this repository, and the one real, live execution path (`conversations.routes.ts` → `AgentRuntimeService`) is gated **only** by the simplest of them:

1. **`@cerebro/auth` RBAC** (string-based permission-set membership — `requirePermission('ai:chat')`, `requirePermission('workflows:execute')`, etc.) — the **only** mechanism actually in the live request path.
2. **`packages/domain`'s own `PolicyEngine`** (a fourth, differently-shaped class from `policy-core`'s, despite the identical name) — wired into `AgentApplicationService.publishVersion()`, which is dead code (§6).
3. **`packages/policy-core`'s `PolicyEngine`** / **`packages/hiveshield-policy`'s `HierarchicalPolicyEngine`** (the real, ADR-038-governed system) — zero live call sites anywhere outside their own tests.
4. **`packages/engineering-review`'s `AIGovernanceEngine`** — a fifth mechanism, confined entirely to the AI code-review/copilot subsystem, structurally unconnected to the agent/workflow runtime.

**Checkpoint ordering for the one live path:** JWT verification → workspace-ownership check → `requirePermission('ai:chat')` — all three are Fastify `preHandler` hooks, i.e. **all occur before the route handler body runs at all**, which means before any scheduling, before any provider call, and before any state transition — there is no distinction available between "before scheduling" and "before provider execution" because there is no separate scheduling step in this path (execution is synchronous and inline). All three checks are fully provider-agnostic (JWT claims, RBAC permission strings, and a workspace-ownership DB lookup — none has any knowledge of which LLM/tool provider will eventually run).

**Answering the scoped question:** ADR-038 policy enforcement, if it were ever wired in, *would* be able to occur without provider-specific logic — `HierarchicalPolicyEngine.evaluate()` already takes an `IdentityContext`/action/resource triple with no provider awareness, consistent with the provider-agnostic pattern every other real checkpoint in this system already follows. The gap is not architectural unsoundness in the policy engine itself; it is that **nothing calls it**.

---

## Architecture impact matrix

| Finding | Governing ADR / doc | Implementation | Risk |
|---|---|---|---|
| No single canonical execution aggregate — 6 independent representations | `01-DOMAIN-MODEL.md` (HiveForge's own domain model doesn't define an Execution aggregate at all yet — only `Operation`/`Resource` for infrastructure, a different bounded context) | `packages/database` (×2 shapes), `packages/db`, `packages/domain`, `services/swarm-runtime`, `apps/platform` | **High** — any future capability (scheduling, retries, observability) has no stable foundation to build on until one canonical model is chosen. |
| `WorkflowExecution.status` never transitions past `'RUNNING'` | None — undocumented gap, not a deviation from a written design | `apps/platform-api/src/modules/workflows/workflows.routes.ts` | **High** — every workflow execution appears permanently in-progress; no completion/failure is ever recorded. |
| `AgentExecution` table has no live writer | None | `packages/database` schema + `AgentRepository` | **Medium** — a real-looking telemetry surface (`telemetry.routes.ts`) silently reports only seed data, which could mislead anyone reading it as production signal. |
| `ExecutionEvent`/`ExecutionCheckpoint` tables are fully aspirational (zero real reads/writes) | None | `packages/database` schema only | **Low** (schema cost only) / **Medium** (false confidence — a well-commented schema implies capability that doesn't exist) |
| `packages/db` has a materially better `ExecutionStatus` enum than the live `packages/database`, but belongs to the unreachable `services/platform-api` | `audit/SERVICES-PLATFORM-API-CLASSIFICATION.md` | `packages/db/prisma/schema.prisma` | **Medium** — good design work is stranded in an unwired tree; a future execution-aggregate consolidation should look here before designing from scratch. |
| No real orchestrator/scheduler wired anywhere; `runtime.routes.ts` fully mocked | `04-PROVIDER-FRAMEWORK.md` §5 (`ProviderSelector` — a different but conceptually adjacent HiveForge role, not yet implemented for this bounded context either) | `apps/platform-api/src/modules/runtime/runtime.routes.ts` | **High** — "orchestration is centralized" cannot be true when the one component named for that purpose is a stub. |
| `AgentRuntimeService` conflates orchestration (its while-loop) and execution-delegation (provider calls) in one class | None | `packages/capabilities/agent-builder/src/AgentRuntimeService.ts` | **Low** — providers themselves stay execution-only (verified directly); this is a naming/separation-of-concerns note, not a boundary violation with real consequences yet. |
| `policies: []` and `cancellationToken` are always empty/inert in the one live context-propagation path | `ADR-038` | `AgentRuntimeService.toRuntimeExecutionContext()`, `conversations.routes.ts` | **High** — this is the concrete mechanism by which "can ADR-038 enforcement occur" fails today: not because the engine can't do it, but because nothing populates or calls it along this path. |
| Persistence is not authoritative anywhere in the live path (explicitly deferred to "M10.4" per the code's own comment) | None (a stated, in-progress milestone, not a documented architectural decision) | `conversations.routes.ts` | **High** — nothing about a real chat execution survives past the HTTP response; no audit trail, no resumability, no history. |
| Slice 3's event contracts (`domain-model`) are unused; `packages/domain`'s real event-publishing code (`WorkflowApplicationService`/`AgentApplicationService`) is unreachable dead code; a working lifecycle-event implementation exists only inside a client-side simulator (`apps/platform`) | `03-CONTROL-PLANE.md` §5, `ADR-024` | `packages/domain-model/src/events/`, `packages/domain/src/services/`, `apps/platform/src/features/studio/runtime/` | **High** — "can every transition emit deterministic events" is false for the live system; the only place events genuinely flow is a disconnected demo. |
| Five separate, non-communicating policy/authorization mechanisms; only the simplest (string RBAC) is live | `ADR-038` | `packages/auth`, `packages/domain`, `packages/policy-core`/`hiveshield-policy`, `packages/engineering-review` | **High** (governance) — real, tested, ADR-governed policy logic exists and is completely unused in the live system; any security or compliance claim resting on "policy is enforced" would currently be false. |

---

## Answers to the primary architectural questions

- **Is there exactly one execution lifecycle? No.** Six independent representations, none unified, spanning three schemas and a client-only simulator.
- **Is orchestration centralized? No.** It exists in exactly one place for one path (`AgentRuntimeService`'s internal loop), is a bare DB insert for workflow execution, and is fully mocked or fully disconnected everywhere else.
- **Are providers execution-only? Yes, where checked directly** — `AIGatewayLLMProvider` and `ToolRuntimeToolProvider` are both single-call, no-branching implementations. This one invariant holds.
- **Is execution state authoritative? No.** Nowhere in the live path is state persisted past a single creation write (workflow) or not at all (agent chat).
- **Can every state transition be audited? No.** There is almost no state transition implemented to audit in the first place; the one real transition source (`packages/domain`'s application services) is unreachable.
- **Can every transition emit deterministic events? No.** Confirmed false for the live system; the only place this genuinely works is a disconnected client simulator.
- **Can ADR-038 policy enforcement occur without provider-specific logic? Architecturally, yes — the engine itself is provider-agnostic. Operationally, no — it is never invoked in the live path at all.**

## Success-criteria statement

The objective's target statement —

> "A request enters the execution engine, passes through policy evaluation, is scheduled by the orchestration layer, executed by a provider, persisted through the execution aggregate, and emits deterministic lifecycle events that fully reconstruct the execution history."

**cannot be backed by the current implementation.** The concrete, evidence-based gaps, in the order the statement describes them:

1. *"Passes through policy evaluation"* — false. Only string-based RBAC gates the live path; `ADR-038`'s real policy engine has zero live callers (§7).
2. *"Is scheduled by the orchestration layer"* — false, there is no orchestration layer in the live path; execution is synchronous and inline, and the one component named for this (`runtime.routes.ts`) is fully mocked (§3).
3. *"Executed by a provider"* — **true**, this is the one part of the statement the implementation actually satisfies (`AIGatewayLLMProvider`/`ToolRuntimeToolProvider`, correctly execution-only).
4. *"Persisted through the execution aggregate"* — false on two counts: there is no single execution aggregate (§1), and the one live path persists nothing at all (§5).
5. *"Emits deterministic lifecycle events that fully reconstruct the execution history"* — false; no events are emitted anywhere in the live path, and the one working implementation of this exact pattern is disconnected from the backend entirely (§6).

Of the five clauses in the target statement, **one holds today** (provider execution). The other four represent genuine, concrete architectural gaps — not undocumented ambiguity, but implemented-and-verifiable absence. This is a materially different outcome from Slices 1–4, where the primary finding was usually "no collision" or "a partial-but-real implementation exists somewhere." Slice 5's primary finding is that **the execution lifecycle this repository would need for scheduling, retries, distributed execution, or workflow composition to be built on top of does not yet exist as a coherent whole** — the pieces are present in isolation (a provider layer that works, a policy engine that works, an event-contract shape that's been designed twice, a resumability schema that's well thought out) but none of them are connected to each other in the live system.

## What this review does not do

It does not propose a target execution-aggregate design, does not choose between `packages/database` and `packages/db`'s schemas, does not decide whether `AgentRuntimeService` should be split into a separate orchestrator class, and does not wire policy evaluation into the live path. Per the same discipline as Slices 1–4, this is an inventory-and-classification exercise; closing any of the gaps above is deliberately left as a scoped follow-up decision, not resolved here.
