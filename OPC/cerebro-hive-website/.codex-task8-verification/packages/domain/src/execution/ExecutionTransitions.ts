import { ExecutionStatus } from './ExecutionStatus';

/**
 * Phase 9b's canonical legal-transition graph for `ExecutionStatus`
 * (`09-EXECUTION-LIFECYCLE-RUNTIME.md` §9b; `ADR-040`). This is the single
 * source of truth for "which transitions are legal" — `Execution.transitionTo()`
 * (see `Execution.ts`) enforces this graph rather than each call site
 * re-deriving its own notion of legality, closing the specific gap
 * `audit/SLICE-5-EXECUTION-LIFECYCLE-REVIEW.md` found: a `WorkflowExecution`
 * row that is written once (`status = 'RUNNING'`) and never transitioned
 * again by any code path, because no transition-legality mechanism existed
 * anywhere to enforce or even describe what should happen next.
 *
 * A structurally similar transition graph already exists and is tested in
 * this repository — `packages/engineering-review`'s `SandboxStateMachine`
 * ("M26.7") enforces `Queued → Provisioning → SandboxCreated →
 * ArtifactsMounted → Running → CollectingOutput → Completed → CleaningUp →
 * Finished`. That is real, working prior art for "a graph + reject-if-not-
 * listed" as a shape, read here for that reason. It is NOT reused, ported,
 * or migrated onto by this graph: `packages/engineering-review`'s runtime is
 * a separate bounded context (a sandboxed analyzer-execution runtime, a
 * different problem from the agent/workflow/tool/evaluation `Execution`
 * aggregate this masterplan governs), with its own status vocabulary
 * (`RuntimeState`) that ADR-039 did not adopt and this graph does not
 * reference. Per explicit scoping direction for Phase 9b: engineering-review
 * integrates with Phase 9 (if at all) through its own future adapters/ports,
 * not by sharing this transition graph or being refactored to match it.
 *
 * Scope boundary: this graph validates transition LEGALITY only. It does not
 * decide who may trigger a transition (that's authorization/policy — Phase
 * 9f), does not persist anything (Phase 9d), and does not publish events
 * (Phase 9e) — `Execution.transitionTo()` returns the matching canonical
 * event instance (see `ExecutionEvents.ts`) for a caller to publish, but does
 * not publish it itself.
 */
export const EXECUTION_TRANSITIONS: Readonly<Record<ExecutionStatus, readonly ExecutionStatus[]>> = {
  [ExecutionStatus.Created]: [ExecutionStatus.Validating, ExecutionStatus.Cancelled],
  [ExecutionStatus.Validating]: [ExecutionStatus.Queued, ExecutionStatus.Failed, ExecutionStatus.Cancelled],
  [ExecutionStatus.Queued]: [ExecutionStatus.Running, ExecutionStatus.Cancelled],
  [ExecutionStatus.Running]: [
    ExecutionStatus.Waiting,
    ExecutionStatus.Completed,
    ExecutionStatus.Failed,
    ExecutionStatus.Cancelling,
    ExecutionStatus.TimedOut,
  ],
  [ExecutionStatus.Waiting]: [ExecutionStatus.Running, ExecutionStatus.Cancelling, ExecutionStatus.TimedOut],
  [ExecutionStatus.Cancelling]: [ExecutionStatus.Cancelled, ExecutionStatus.Failed],
  // Terminal states: no outgoing transitions. A completed/failed/cancelled/
  // timed-out Execution cannot transition again — this is what makes
  // "completed executions are immutable" and "every execution has exactly
  // one terminal state" real, checked facts rather than documentation.
  [ExecutionStatus.Completed]: [],
  [ExecutionStatus.Failed]: [],
  [ExecutionStatus.Cancelled]: [],
  [ExecutionStatus.TimedOut]: [],
};

export function isLegalExecutionTransition(from: ExecutionStatus, to: ExecutionStatus): boolean {
  return EXECUTION_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Returns every status a given status may legally transition to. Exposed
 * mainly for tests and for future tooling (e.g. a conformance check that
 * every status has at least one reachable terminal path) rather than being
 * load-bearing application logic itself. */
export function legalNextExecutionStatuses(from: ExecutionStatus): readonly ExecutionStatus[] {
  return EXECUTION_TRANSITIONS[from] ?? [];
}
