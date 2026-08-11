# ADR-041: Standalone production orchestrator

**Status:** Proposed (Phase 9c of `09-EXECUTION-LIFECYCLE-RUNTIME.md`; builds on `ADR-039`'s aggregate and `ADR-040`'s transition graph)

## Context

`09-EXECUTION-LIFECYCLE-RUNTIME.md` §9c scopes "production orchestrator, built around the 9a/9b aggregate... replaces `runtime.routes.ts`'s mocked handlers with a real component that coordinates execution and invokes providers." Before building it, the same question that shaped every prior sub-phase was asked explicitly: should this pass build the orchestrator standalone (new, unwired code — the same zero-risk pattern 9a/9b/the event-contract suite already used) or wire it directly into the live system (replacing `runtime.routes.ts`'s mocks, touching `AgentRuntimeService`)? Per explicit direction: **standalone.** Live wiring is deferred to a future, separately-reviewable milestone, once `ExecutionRepository` has a real persistence implementation (Phase 9d) to inject instead of an in-memory test double.

## Decision

**1. `ExecutionOrchestrator` (`packages/domain/src/execution/ExecutionOrchestrator.ts`) is built standalone, with zero wiring into `apps/platform-api`'s `runtime.routes.ts` or `AgentRuntimeService`.** Nothing in the live system constructs or calls it. This mirrors 9a/9b's own additive pattern exactly, rather than mixing "build the orchestrator" with "make it load-bearing in production" as one change.

**2. The orchestrator coordinates; it never executes.** This re-affirms, rather than re-litigates, the invariant the Slice 5 review already confirmed holding (`AIGatewayLLMProvider`/`ToolRuntimeToolProvider` are correctly execution-only). `ExecutionOrchestrator` depends on an injected `ExecutionProviderPort` (one method: `execute(execution): Promise<ExecutionProviderResult>`) for all actual work — the orchestrator's own three public methods (`run`, `retry`, `resume`) do nothing but sequence legal transitions (via `Execution.transitionTo()`, which itself enforces `ADR-040`'s graph), persist through `ExecutionRepository` (contract only, still no real implementation), and hand the resulting canonical event to an injected `ExecutionEventSink`.

**3. `ExecutionProviderPort` is a new, minimal, local interface — not `packages/domain-model`'s `HiveProviderExecutor`.** Same bounded-context-separation reasoning as `ExecutionId` staying off `Identifier<Brand>` (`ADR-039` decision 5): `packages/domain` does not depend on `packages/domain-model` today, and importing `HiveProviderExecutor` for this one seam would be a bigger dependency decision than this sub-phase should make unilaterally. A future adapter implementing `ExecutionProviderPort` by delegating to a real `HiveProviderExecutor` is a reasonable next step, but is not built here.

**4. `retry()` reuses `Execution.createRetryOf()` (`ADR-040` decision 6) rather than re-deriving retry logic.** The orchestrator's `retry()` throws if the target Execution has not reached a terminal status, creates the child via the aggregate's own method, persists both the mutated parent (new `childExecutionIds` entry) and the new child, then drives the child through the identical pipeline `run()` uses.

**5. `resume()` is a thin, explicit re-entry point for `WAITING → RUNNING`.** It throws if called on a non-`WAITING` Execution (a structural precondition of the method, in addition to — not instead of — `transitionTo()`'s own graph-legality check), then re-invokes the provider exactly as `run()`'s tail does.

**6. Explicitly not covered by this ADR, named rather than silently absent:**
- **Idempotency** — `ExecutionRepository` has no idempotency-key lookup; adding one would extend 9a's aggregate/repository contract, which this sub-phase does not do on its own authority. A duplicate `run()` call today creates a second, independent Execution.
- **Authorization/policy enforcement** of who may call `run()`/`retry()`/`resume()` — Phase 9f's.
- **Cancellation** — `CANCELLING`/`CANCELLED` are legal states per `ADR-040`'s graph, but nothing in this orchestrator drives a transition into them; a real cancellation-token mechanism is Phase 9f's.
- **Timeout detection** — nothing here races the provider call against a clock; a real `TIMED_OUT` transition requires an external timer, out of this class's scope.
- **Live wiring** — see Decision 1.

## Consequences

- No live behavior changes as a result of this ADR. `runtime.routes.ts` remains mocked; `AgentRuntimeService` is untouched.
- A future live-wiring milestone has a concrete, tested unit to wire against, rather than needing to design the orchestrator and integrate it in one combined, higher-risk change.
- `ExecutionRepository` still has no real implementation; this ADR's own tests use an in-memory fake, which is appropriate for testing coordination logic in isolation but is not evidence that persistence works end-to-end — that remains Phase 9d's evidence to produce.
- Real event publication still does not happen anywhere; `ExecutionEventSink` in this ADR's tests is a recording fake, not `OutboxPublisher`.

## Implementation status — Complete for 9c's own (standalone) scope; not wired into any live system

`packages/domain/src/execution/ExecutionOrchestrator.ts` (new) implements `run()`, `retry()`, `resume()`, backed by `ExecutionProviderPort`/`ExecutionEventSink` (both new, minimal interfaces). Exported from `packages/domain`'s root `index.ts` alongside `ExecutionTransitions.ts` (previously implemented in 9b but not yet added to the barrel — added now). Verified, not assumed:

- Real `tsc --strict` typecheck (scratch-toolchain pattern) — clean across the whole `execution/` package.
- Real `vitest` run — 80/80 tests passing across the package, 9 of them new in `ExecutionOrchestrator.test.ts`: happy-path completion (asserting the provider is called exactly once, transition/event sequence is `Validated→Queued→Started→Completed`), failure paths (provider-reported failure with and without a reason; provider throwing an exception, captured as the failure reason), WAITING + `resume()` (including `resume()` rejecting a non-`WAITING` Execution), and `retry()` (child-execution creation, parent left unmutated in status/history, `retry()` rejecting a non-terminal Execution). All tests use an in-memory `ExecutionRepository` fake and a configurable fake `ExecutionProviderPort` — real persistence and real provider integration remain unbuilt.
- Scratch verification artifacts removed after the run.
- Not yet done, and not claimed as done: any live call site; a real `ExecutionRepository` implementation; a real `ExecutionProviderPort` adapter (e.g. one delegating to `HiveProviderExecutor` or to `AgentRuntimeService`'s existing provider resolution); idempotency; authorization; cancellation; timeout detection.
