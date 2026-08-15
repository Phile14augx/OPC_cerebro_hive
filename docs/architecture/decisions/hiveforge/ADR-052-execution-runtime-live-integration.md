# ADR-052: Execution Runtime Live Integration — First Real Caller (Phase 10.1/10.2)

**Status:** Proposed (Phase 10.1/10.2, `apps/platform-api`; builds on `ADR-039` through `ADR-051`)

## Context

Phase 9 (`ADR-039` through `ADR-051`) built a complete, standalone, honestly-verified execution runtime — but, per the Phase 9 retrospective's own risk list, "the runtime is not yet wired into any live caller." `apps/platform-api/src/modules/runtime/runtime.routes.ts` has existed since before Phase 9 as a fully mocked module (`mock-uuid-execution-id`, `{ success: true }` regardless of what was asked, an empty `executions` array, a `setInterval`-driven fake SSE stream) — the first candidate for a real caller, since the REST surface was already scaffolded and referenced in `bootstrap.ts`.

Two constraints were established before writing any code, per explicit direction: (1) apply the same verification discipline Phase 9 used throughout — write real code, disclose what can and cannot be verified, never claim more than what was actually checked; (2) this sandbox has no generated `@prisma/client` anywhere, and `apps/platform-api` depends on `@cerebro/database` throughout, so the same infrastructure ceiling that limited `ADR-046`'s `NatsExecutionEventPublisher.ts` applies here, to the whole app, not just the new files.

**A finding made before claiming any verification boundary, not assumed:** a full `tsc -p tsconfig.json --noEmit` run against `apps/platform-api` was attempted. It failed with `Cannot find module` errors — but critically, on EVERY file in the app, not just the three new/modified ones: `bootstrap.ts` itself, `conversations.routes.ts`, `agents.handlers.ts`, `health.routes.ts`, `middleware/*.ts`, and every other pre-existing route module all hit the identical `fastify`/`@sinclair/typebox`/`@cerebro/*` resolution failures. Stated precisely: **a full typecheck could not be completed in this environment because the application has pre-existing dependency-resolution failures (including missing generated Prisma client artifacts); consequently, this integration's runtime behavior could not be fully verified here.** This confirms the new files (`ExecutionRuntimeService.ts`, `AgentExecutionProvider.ts`, the rewritten `runtime.routes.ts`) are held to exactly the same verification ceiling as every already-shipped file in this app — not a gap this phase introduced, but a pre-existing environmental constraint being disclosed for the first time in this ADR series because this is the first phase to touch this app.

## Decision

**1. `ExecutionRuntimeService` (`apps/platform-api/src/modules/runtime/ExecutionRuntimeService.ts`) is the application-level facade translating REST-shaped requests into `ExecutionOrchestrator` calls.** It owns a single, process-lifetime `InMemoryExecutionRepository` + `ExecutionOrchestrator` pair, constructed once in `bootstrap.ts` — there is no database-backed `ExecutionRepository` yet, so every Execution created through this wiring does not survive a process restart. This is the same standalone `InMemoryExecutionRepository` Phase 9d built and the whole of Phase 9 verified against; no new persistence code was written.

**2. `AgentExecutionProvider` (`AgentExecutionProvider.ts`) is the one real `ExecutionProviderPort` implementation this engagement has — a thin bridge to the already-real `AgentRuntimeService`** (built in an earlier epic, unrelated to Phase 9), following the orchestrator's own "providers execute, orchestrators coordinate" invariant: this class does no work itself, only translates `Execution`/`AgentExecutionContext` shapes both ways. It handles `execution.kind === 'Agent'` only, by design — no real provider exists yet for `'Workflow'`/`'Tool'`/`'Evaluation'`, and this class fails explicitly and honestly for those kinds rather than pretending to execute them.

**Dependency direction, stated explicitly (this was a real point of confusion in an earlier review pass, worth pinning down precisely):** `ExecutionOrchestrator`'s constructor signature (unchanged since 9c, `ADR-041`) is `constructor(repository: ExecutionRepository, provider: ExecutionProviderPort, events?: ExecutionEventSink, opts?: {...})` — it has never depended on `AgentExecutionProvider`, `AgentRuntimeService`, or anything agent-specific; it only knows the `ExecutionProviderPort` interface. `AgentExecutionProvider implements ExecutionProviderPort` and is handed to the orchestrator's constructor in `bootstrap.ts` as that interface parameter — the orchestrator has no compile-time or runtime knowledge that "agents" are the implementation behind it. This means the actual dependency graph already is:

```
runtime.routes.ts -> ExecutionRuntimeService -> ExecutionOrchestrator -> ExecutionProviderPort (interface)
                                                                              ^
                                                              AgentExecutionProvider (implements it)
                                                                              |
                                                                       AgentRuntimeService
```

not a direct `ExecutionOrchestrator -> AgentExecutionProvider -> AgentRuntimeService` chain. Adding `WorkflowExecutionProvider`/`ToolExecutionProvider`/`EvaluationExecutionProvider` later requires zero orchestration-logic changes — exactly the extensibility a reviewer would want confirmed, and it was already true as of 9c, not something this phase needed to introduce.

**3. `runtime.routes.ts` was rewritten with real handlers for `/execute`, `/resume`, `/cancel`, `/executions`, `/executions/:id`**, all backed by `ExecutionRuntimeService`. Errors (`NotFoundError`, `InvariantViolationError`, `AuthorizationError`, `ConcurrencyError` — all real `DomainError` subclasses `ExecutionOrchestrator`/`ExecutionRuntimeService` can throw) are left to propagate to `bootstrap.ts`'s existing global error handler (`ErrorMapper.mapToProblemDetails()`), which already maps every `DomainError` code to a correct HTTP status — no new error-mapping code was needed.

**4. `/pause` is honestly NOT implemented as a real pause.** `ExecutionTransitions.ts`'s graph has no user-requested `RUNNING -> WAITING` edge — `WAITING` is only ever reached because a *provider* reports `'waiting'` (e.g. an in-flight async tool call). Rather than silently treating "pause" as "cancel" (semantically wrong) or keeping the previous mock's fake `{ success: true }`, the route now returns a real `501 Not Implemented` with a clear reason (`PauseNotSupportedError`). Building a real pause capability is future work requiring a new `ExecutionOrchestrator` method and a new transition-graph edge — a `packages/domain` change, correctly out of this application-level integration's scope to invent unilaterally.

**5. `/events/stream` (SSE) was NOT wired to real events in this pass.** The previous mock's `setInterval`-driven fake token stream was removed (a real regression risk if left in — it would have looked more "real" than the honest gap actually wired), replaced with a single `NotYetWired` event and an honest doc comment pointing at this ADR. Real SSE delivery would subscribe to an Execution's real event sink (the `InMemoryEventBus` reuse pattern `ADR-049` decision 5 already proved works) and stream those events to the connected client — a real, buildable next step, just not built in this pass.

**6. `InMemoryExecutionRepository.listByTenant()` is a new, additive method** (not part of the shared `ExecutionRepository` contract, which was deliberately scoped to per-id operations only) added because a real live caller — this REST "list executions" endpoint — genuinely needed a query capability nothing in Phase 9 had built yet. Documented in-line as O(n) and explicitly not a claim about database-backed query performance.

## Consequences — Implemented / Statically reviewed / Runtime-verification blocked

**Implemented:**
- `ExecutionRuntimeService.ts`, `AgentExecutionProvider.ts` (new files).
- `runtime.routes.ts` rewritten with real handlers for 5 of 7 endpoints; the 6th (`/pause`) now returns an honest 501; the 7th (`/events/stream`) sends one honest "not wired" event instead of a fake stream.
- `bootstrap.ts` wired to construct the `InMemoryExecutionRepository`/`ExecutionOrchestrator`/`AgentExecutionProvider`/`ExecutionRuntimeService` chain and pass it to `runtimeRoutes` as a plugin option, following the exact DI pattern `conversationsRoutes`/`agentRoutes` already established (dependencies passed as typed plugin options, not a global singleton).
- `InMemoryExecutionRepository.listByTenant()` — a new, additive query method.

**Statically reviewed (in this sandbox, no compiler available for this app):**
- Every new/changed file was read back in full and cross-checked by hand against the real signatures of `ExecutionOrchestrator`, `AgentRuntimeService`, `AgentRepository.getLatestVersion()`, and `AgentExecutionContext` (the same shape `conversations.routes.ts` already builds, confirmed by direct comparison) — not guessed at.
- Confirmed, by direct inspection, that `bootstrap.ts`'s global error handler already maps every `DomainError` subclass this new code can throw to a correct HTTP status, so no new error-mapping code was needed or added.

**Runtime-verification blocked (a pre-existing, total constraint of this sandbox, not new to this phase):**
- A full typecheck could not be completed in this environment because the application has pre-existing dependency-resolution failures (including missing generated Prisma client artifacts) — confirmed directly, not assumed: the identical `Cannot find module 'fastify'`/`'@sinclair/typebox'`/`'@cerebro/*'` error signature appears on `bootstrap.ts` itself and on `conversations.routes.ts`, a file that predates this phase and is presumably already working in a real environment. Consequently, this integration's runtime behavior could not be fully verified here.
- No live HTTP request has been sent to any of these routes. No real `AgentRuntimeService.execute()` call has been observed to succeed end-to-end through this new wiring.
- `Execution` persistence across a process restart is not just unverified but genuinely absent — `InMemoryExecutionRepository` has no durability by design (see `TECHNICAL-DEBT.md` §2, unchanged by this phase).
- Real SSE event delivery, a real user-facing pause capability, and any execution kind other than `'Agent'` remain unbuilt, not merely unverified.

## Implementation status — Complete for Phase 10.1/10.2's own scope (wiring the first live caller); no live server started, no request sent, no full-app compile achieved in this sandbox

Modified: `apps/platform-api/src/{bootstrap.ts, modules/runtime/runtime.routes.ts}`, `packages/domain/src/execution/InMemoryExecutionRepository.ts` (additive `listByTenant()` method only). New: `apps/platform-api/src/modules/runtime/{ExecutionRuntimeService.ts, AgentExecutionProvider.ts}`. No changes to `packages/domain`'s frozen contracts (`ExecutionRepository`, `ExecutionOrchestrator`, `ExecutionProviderPort` interfaces are all unchanged) — this phase is purely additive composition, the same discipline every 9g sub-phase held. Not yet done, and not claimed as done: any database-backed persistence, real pause support, real SSE wiring, non-'Agent' execution kinds, or any verification beyond static/by-hand review, per the constraints disclosed above.
