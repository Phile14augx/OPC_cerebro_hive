# ADR-040: Execution lifecycle state machine

**Status:** Proposed (Phase 9b of `09-EXECUTION-LIFECYCLE-RUNTIME.md`; builds directly on `ADR-039`'s canonical `Execution` aggregate)

## Context

`ADR-039` fixed what an `Execution` *is* — identity, status vocabulary, structural shape — but deliberately left transition legality undecided, deferring it to this sub-phase. `audit/SLICE-5-EXECUTION-LIFECYCLE-REVIEW.md`'s specific, concrete gap motivating this ADR: the one live write to an execution-status field in this repository (`WorkflowExecution.status = 'RUNNING'`) is never transitioned again by any code path, because nothing anywhere enforces or even describes what a legal next state is. 9a's own `Execution.recordStatus()` (now replaced, see Decision 1) inherited that same gap by design, on record, pending this ADR.

Before drafting this ADR, the premise that Phase 9b should reference three prior "M26.7–9" sub-phases as part of the same lineage was checked directly against the code and found not to hold: `SandboxSession`/`SandboxStateMachine` (M26.7) and `ExecutionBatch`/`ExecutionPlan`/`ExecutionPlanner` (M26.8/M26.9) are real, but they belong entirely to `packages/engineering-review`'s sandboxed analyzer-execution runtime — a separate bounded context, with its own status vocabulary (`RuntimeState`, `CoordinatorState`) that ADR-039 did not adopt. Per explicit direction after that finding was raised: this ADR treats that runtime as a separate bounded context. It does not absorb, refactor, or migrate it, and does not share this transition graph with it. `SandboxStateMachine`'s enforced-transition-graph shape (a plain `Record<State, State[]>` map plus a reject-if-not-listed check) is read here as real, working prior art for that shape — the one place in this repository someone already built the kind of mechanism this ADR needs — not as evidence that the two systems are, or should become, one.

## Decision

**1. `Execution.transitionTo()` replaces `Execution.recordStatus()`, and enforces the canonical transition graph.** `recordStatus()` (9a) performed no legality check by design; per `ADR-039`'s own Consequences section, nothing in the live system called it, so removing it is not a breaking change to any real caller. `transitionTo()` looks up legality in `ExecutionTransitions.ts`'s `EXECUTION_TRANSITIONS` map and throws `InvariantViolationError` on an illegal move — this is what makes "illegal transitions are impossible through the public API" a checked fact, not a convention documented in a comment.

**2. The canonical transition graph, over `ADR-039`'s existing ten-value `ExecutionStatus` vocabulary** (no new status values are introduced by this ADR — vocabulary changes are `ADR-039`'s to make, not this one's):

```
CREATED      → VALIDATING, CANCELLED
VALIDATING   → QUEUED, FAILED, CANCELLED
QUEUED       → RUNNING, CANCELLED
RUNNING      → WAITING, COMPLETED, FAILED, CANCELLING, TIMED_OUT
WAITING      → RUNNING, CANCELLING, TIMED_OUT
CANCELLING   → CANCELLED, FAILED
COMPLETED    → (terminal — no outgoing transitions)
FAILED       → (terminal)
CANCELLED    → (terminal)
TIMED_OUT    → (terminal)
```

Every non-terminal status can reach a terminal one (checked by a real test, not merely asserted — see Implementation status). Every terminal status has zero legal outgoing transitions, which is the single mechanism that makes "completed executions are immutable" and "terminal states cannot transition" hold, rather than needing a separate special case for each.

**3. Every transition records metadata, and that metadata is retained as an ordered history, not a single last-transition snapshot.** `Execution.transitionHistory: readonly ExecutionTransitionRecord[]` accumulates one record per `transitionTo()` call: `from`, `to`, `at` (timestamp), `actor` (optional — who or what triggered it), `reason` (optional), `correlationId` (carried from the aggregate). This is what makes deterministic replay and auditing possible from the aggregate alone, without a separate event store being load-bearing for history reconstruction (the event stream, once 9e wires real publishing, becomes a second, independently useful way to reconstruct the same history — not the only way).

**4. Transition timestamps must be monotonic.** `transitionTo()` rejects an `at` earlier than the Execution's current `updatedAt`. Without this, `transitionHistory` could not be trusted to represent a real causal order, which would undermine the replay/audit guarantee decision 3 is for.

**5. A `FAILED` transition must supply a reason; it is enforced, not merely conventional.** `transitionTo(FAILED)` without `opts.reason` throws — an Execution cannot be marked failed silently.

**6. A retry creates a new child `Execution`; it does not rewind the original.** `Execution.createRetryOf(original)` constructs a fresh `Execution` (fresh `ExecutionId`, `CREATED` status, its own independent `transitionHistory`), registers it as `original`'s child via the parent/child mechanism `ADR-039` already defined, and does not alter `original`'s own terminal status or history. Rationale: rewinding `original` back to `QUEUED` would destroy or overwrite the record of why the first attempt failed, and would make "how many times was this retried" a derived, error-prone count instead of `original.childExecutionIds.length`, a direct one. This reuses `ADR-039`'s existing parent/child relationship rather than inventing a second "retry link" field — a retry is simply a child Execution whose purpose happens to be re-attempting its parent's work.

**7. Every legal transition has exactly one canonical event, and `transitionTo()` returns it — it does not publish it.** `transitionTo()`'s return value is the matching `DomainEvent` from `ExecutionEvents.ts` (`ExecutionValidatedEvent`, `...QueuedEvent`, `...StartedEvent`/`...ResumedEvent` depending on whether `RUNNING` was entered from `QUEUED` or `WAITING`, `...WaitingEvent`, `...CancellingEvent` — added in this phase, since 9a's original ten event classes had no dedicated event for the `CANCELLING` status — `...CompletedEvent`, `...FailedEvent`, `...CancelledEvent`, `...TimedOutEvent`). Publishing it (via `OutboxPublisher`, the same mechanism `WorkflowApplicationService` already uses) is left to a caller — most likely Phase 9c's orchestrator — consistent with "separate state from events": this aggregate computes which event a transition corresponds to (that logic belongs with the state machine, not re-derived by every call site), but does not decide when or whether it is actually published.

**8. Authorization of who may trigger a transition is explicitly out of scope**, per `09-EXECUTION-LIFECYCLE-RUNTIME.md`'s own sequencing (Phase 9f). `transitionTo()`'s optional `actor` field records who triggered a transition for audit purposes; it does not check whether that actor was permitted to.

## Consequences

- `recordStatus()` is removed, not deprecated-and-kept, since nothing called it. Any future reader who finds a reference to `recordStatus()` in an old note or draft should read it as superseded by `transitionTo()`.
- 9a's original `ExecutionEvents.ts` had ten classes for what is, after this ADR, ten statuses but eleven possible transition-entry points (`RUNNING` reachable two ways, `CANCELLING` previously uncovered) — `ExecutionCancellingEvent` was added to close that gap. This is a small, additive change to 9a's output, not a reopening of `ADR-039`'s vocabulary decision.
- This ADR does not decide anything about `packages/engineering-review`'s `SandboxStateMachine`/`CoordinatorState` — that system continues to exist, tested and working, on its own terms. If it ever needs to integrate with Phase 9's `Execution` aggregate, that is a future adapter/port decision for whoever owns that package, not a consequence of this ADR.
- Persistence of `transitionHistory` (does it grow a table row per transition, get stored as a JSON column, or something else) is explicitly not decided here — that is Phase 9d's job, operating on the shape this ADR fixes.
- Real publishing of the events `transitionTo()` now returns is still Phase 9e's job; nothing publishes anywhere as a result of this ADR.

## Related bounded contexts

`packages/engineering-review` owns a separate, independent lifecycle for sandboxed analyzer execution — `SandboxSession`/`SandboxStateMachine` ("M26.7") for individual analyzer runs, `ExecutionPlan`/`ExecutionBatch`/`ExecutionPlanner`/`CoordinatorState` ("M26.8"/"M26.9") for batches of them. This ADR's transition graph does not govern that lifecycle, and that lifecycle's `RuntimeState`/`CoordinatorState` vocabularies are not migrated onto `ExecutionStatus`. This is a deliberate boundary, not an oversight surfaced-and-ignored: the two systems solve different problems (canonical execution identity/lifecycle for agents, workflows, tools, and evaluations vs. sandboxed process orchestration for static-analysis tooling), and `SandboxStateMachine`'s already-tested transition-graph shape was read as precedent for this ADR's own mechanism, not as a codebase to unify with.

If engineering-review's runtime ever needs to participate in Phase 9's execution model (for example, if an analyzer run should itself be represented as an `Execution` for cross-cutting observability), that is future integration work, and it should happen through an adapter or port at engineering-review's boundary — translating its own `RuntimeState`/`CoordinatorState` into `Execution`/`ExecutionStatus` at the seam — rather than by this graph absorbing engineering-review's states, or by engineering-review importing `Execution`/`ExecutionTransitions` directly. No such adapter exists today, and none is proposed by this ADR; this section exists so a future reader doesn't rediscover the same "are these the same thing?" question from scratch.

## Event ownership (who creates, who publishes, who delivers)

Decision 7 above states that `transitionTo()` returns a canonical event without publishing it. Made explicit, since this is a real domain/infrastructure boundary worth naming rather than leaving implicit:

```
Execution aggregate           →  constructs the correct DomainEvent for a
(this file)                      transition (transitionTo()'s return value) —
                                  computing *which* event maps to a transition
                                  is domain logic and belongs here.

Application service            →  decides *whether and when* to publish it —
(Phase 9c's future                calls OutboxPublisher.publish(event, context, tx)
orchestrator, following           inside the same transaction as the state
WorkflowApplicationService's      change, the pattern WorkflowApplicationService
existing pattern)                 already uses. Not decided by this ADR whose
                                   component this is — 9c's own design.

Infrastructure (OutboxPublisher /  →  delivers the published event to whatever
Phase 9e's real event bus)            real subscribers eventually exist. Zero
                                       real subscribers exist today (Slice 5
                                       review's finding); this ADR does not
                                       change that.
```

Nothing today calls `OutboxPublisher.publish()` with an `Execution` event — `transitionTo()`'s return value is inert until a Phase 9c-era application service exists to do something with it. That is consistent with this ADR's own Consequences section (no publishing happens as a result of this ADR) and is not contradicted by this section; it only names the boundary precisely.

## Logged for future consideration (not implemented by this ADR)

Raised during review of this ADR, and worth a deliberate look once the relevant later sub-phase is reached, rather than acted on speculatively now:

- **`TransitionRule` as first-class data** (`{ from, to, guard, description }` instead of a plain `Record<Status, Status[]>`) would make the graph self-documenting and let a future guard condition attach to a specific edge rather than being bolted onto `transitionTo()` as a growing if-chain. Worth adopting when 9f's policy guards (below) actually need per-edge conditions — introducing the richer shape now, with no real guard to attach, would be speculative.
- **Richer transition metadata** (`sourceComponent`, `command`, `trigger`, `retryNumber`, `policyName` alongside today's `actor`/`reason`/`correlationId`) — a reasonable extension once real callers exist and it's clear which of these fields they actually need populated; adding empty-in-practice fields now would not be evidence-based.
- **Separating graph legality from business guards** (`canTransition()` layering State Graph → Business Rules → Execution Policy, e.g. max retries, timeout-exceeded, tenant policy) is close to exactly what Phase 9f (`09-EXECUTION-LIFECYCLE-RUNTIME.md` §9f) already scopes as "policy and cancellation integration into the execution pipeline" — this is 9f's design question to answer, not a gap in 9b.

## Implementation status — Complete for 9b's own scope; not yet adopted anywhere live

`packages/domain/src/execution/ExecutionTransitions.ts` (new) defines the graph and `isLegalExecutionTransition()`/`legalNextExecutionStatuses()`. `Execution.ts` was modified: `recordStatus()` removed, `transitionTo()` added (enforcing legality, monotonic timestamps, and the `FAILED`-requires-reason rule; returning the matching canonical event; appending to `transitionHistory`), `ExecutionTransitionRecord` added, `createRetryOf()` added. `ExecutionEvents.ts` gained `ExecutionCancellingEvent`. Verified, not assumed:

- Real `tsc --strict` typecheck (scratch-toolchain pattern) — clean, zero errors, across all execution-package files and tests.
- Real `vitest` run — 41/41 tests passing: `ExecutionId` (3), `Execution.create` invariants (6), `transitionTo` legal-path behavior including `startedAt`/`completedAt` semantics, event-return correctness, and transition-history recording (9), illegal-transition rejection covering non-adjacent jumps, terminal-state immutability, the `FAILED`-requires-reason rule, and non-monotonic timestamps (6), `createRetryOf` retry semantics (1), parent/child/contributor-reference behavior (4), metadata (1), all ten `ExecutionEvents` classes' payload shapes (11), and a dedicated `ExecutionTransitions` suite (4) asserting every status has a graph entry, every terminal status has zero legal outgoing transitions, every non-terminal status can reach a terminal one via real graph-reachability traversal (not merely asserted), and spot-checks of `isLegalExecutionTransition()`.
- One real bug was caught by this test run and fixed before verification passed: a test asserted `transitionHistory` length `3` after four real transitions (`VALIDATING→QUEUED→RUNNING→FAILED`) — a miscounted test expectation, not an implementation defect; corrected to `4`.
- Scratch verification artifacts (temporary `node_modules` symlinks, scratch `tsconfig`/`vitest.config`) removed after the run.
- Not yet done, and not claimed as done: any call site adopting `transitionTo()` in place of a direct status write; persistence of `transitionHistory` (Phase 9d); real event publication (Phase 9e); authorization of transition-triggering actors (Phase 9f).
