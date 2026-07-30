import { ExecutionId } from './ExecutionId';
import { ExecutionStatus, isTerminalExecutionStatus } from './ExecutionStatus';
import { isLegalExecutionTransition } from './ExecutionTransitions';
import { InvariantViolationError, ValidationError } from '../errors/DomainError';
import { DomainEvent } from '../events/DomainEvent';
import {
  ExecutionCancelledEvent,
  ExecutionCancellingEvent,
  ExecutionCompletedEvent,
  ExecutionFailedEvent,
  ExecutionQueuedEvent,
  ExecutionResumedEvent,
  ExecutionStartedEvent,
  ExecutionTimedOutEvent,
  ExecutionValidatedEvent,
  ExecutionWaitingEvent,
} from './ExecutionEvents';

/**
 * Which execution-producing subsystem an Execution belongs to. Deliberately
 * an open string union, not a closed enum tied to today's known subsystems
 * — per Phase 9's governing invariant ("every execution-producing subsystem
 * ... references the same identity"), a future subsystem (a scheduler, an
 * external analyzer per the post-Phase-9 M26.6 initiative) must be able to
 * produce an `Execution` without a breaking change to this vocabulary,
 * mirroring the same "discovery over static matrix" reasoning `ADR-020`
 * already applied to providers.
 */
export type ExecutionKind = 'Agent' | 'Workflow' | 'Tool' | 'Evaluation' | 'Scheduler' | (string & {});

export interface ExecutionMetadata {
  readonly [key: string]: unknown;
}

/**
 * A single recorded transition (Phase 9b — `09-EXECUTION-LIFECYCLE-RUNTIME.md`
 * §9b, `ADR-040`). Every call to `Execution.transitionTo()` appends one of
 * these before mutating `status`, so an aggregate's `transitionHistory` is a
 * complete, ordered record of how it reached its current state — sufficient,
 * per `ADR-040`'s exit criterion, to support deterministic replay and
 * auditing without needing a separate event store to reconstruct "what
 * happened and why."
 */
export interface ExecutionTransitionRecord {
  readonly from: ExecutionStatus;
  readonly to: ExecutionStatus;
  readonly at: Date;
  /** Who or what triggered this transition (a userId, a system component
   * name such as `"AgentRuntimeService"`, or `"scheduler"` — not typed
   * further here, since Phase 9f, not 9b, decides how actor identity is
   * verified/authorized). Optional because not every transition has a
   * meaningful actor (e.g. a scheduler-driven timeout). */
  readonly actor?: string;
  readonly reason?: string;
  readonly correlationId?: string;
}

export interface ExecutionProps {
  readonly id: ExecutionId;
  readonly kind: ExecutionKind;
  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly userId?: string;
  readonly traceId: string;
  readonly correlationId: string;
  readonly status: ExecutionStatus;
  readonly parentExecutionId?: ExecutionId;
  readonly childExecutionIds: readonly ExecutionId[];
  /** Cross-references to other Executions this one draws on or contributes
   * evidence to, WITHOUT a strict parent/child ownership relationship — e.g.
   * an Evaluation execution referencing the Agent execution it evaluated.
   * Distinct from `childExecutionIds`, which is a strict spawn/ownership
   * hierarchy (a Workflow execution's own step executions). */
  readonly contributorExecutionIds: readonly ExecutionId[];
  readonly metadata: ExecutionMetadata;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly version: number;
  /** Ordered record of every transition this Execution has undergone (Phase
   * 9b). Empty for a freshly-`create()`d Execution — its `CREATED` status is
   * its initial state, not itself a transition. */
  readonly transitionHistory: readonly ExecutionTransitionRecord[];
}

/**
 * Phase 9's canonical execution aggregate — identity, vocabulary, and
 * structural shape from 9a (`ADR-039`), transition legality from 9b
 * (`ADR-040`) (`09-EXECUTION-LIFECYCLE-RUNTIME.md` §9a/§9b) — per the phase's governing
 * invariant, this is the ONLY authoritative execution identity in the
 * platform. Every execution-producing subsystem (agent, workflow, tool,
 * evaluation, scheduler, or anything built later) constructs one of these,
 * not a subsystem-specific record of its own.
 *
 * SCOPE BOUNDARY (read before extending this class): this aggregate holds
 * and validates *structural* invariants (see `create()`'s checks below) AND,
 * as of Phase 9b, transition-legality invariants — `transitionTo()` enforces
 * `ExecutionTransitions.ts`'s canonical graph and rejects illegal moves,
 * closing the gap the Slice 5 review found (a `WorkflowExecution` written
 * once and never transitioned again, because nothing anywhere enforced or
 * even described what a legal next state was). What this class still does
 * NOT do: decide who is authorized to trigger a transition (Phase 9f), persist
 * anything (`ExecutionRepository.ts` is a contract only; Phase 9d builds the
 * implementation), or publish events (`transitionTo()` returns the matching
 * canonical event for a caller to publish via the same `OutboxPublisher`
 * pattern `WorkflowApplicationService` already uses — it does not publish it
 * itself; that wiring is Phase 9e's). `09-EXECUTION-LIFECYCLE-RUNTIME.md` §9c
 * is the orchestrator that will actually drive this aggregate end to end.
 */
export class Execution {
  private constructor(private props: ExecutionProps) {}

  /**
   * Constructs a brand-new Execution. Enforces the aggregate's structural
   * invariants — real checks, not documentation of intent:
   * - `tenantId`, `traceId`, `correlationId` must be non-empty (every
   *   Execution is tenant-scoped and traceable; per the Slice 5 review's
   *   finding that `AgentExecutionContext`'s `traceId`-as-execution-id
   *   substitute identifies nothing once persisted, this aggregate carries
   *   its own real `ExecutionId` *and* a separate `traceId`, not one field
   *   doing both jobs).
   * - `kind` must be non-empty.
   * - `parentExecutionId`, if supplied, must not equal `id` (no
   *   self-parenting).
   * - initial `status` must not be a terminal status — an Execution cannot
   *   be born already finished.
   *
   * Additional invariants enforced elsewhere on this aggregate, listed here
   * for a single point of reference (Phase 9b, `ADR-040`):
   * - **Completed executions are immutable** — enforced by `transitionTo()`
   *   via the transition graph (terminal statuses have zero legal outgoing
   *   transitions) rather than a separate special-cased check.
   * - **Terminal states cannot transition** — same mechanism, same point.
   * - **Every execution has exactly one terminal state** — trivially true
   *   of a single `status` field; not separately enforced because there is
   *   nothing to enforce it against.
   * - **Transition timestamps are monotonic** — enforced by `transitionTo()`
   *   rejecting an `at` earlier than the current `updatedAt`.
   * - **A `FAILED` transition must carry a reason** — enforced by
   *   `transitionTo()`.
   */
  static create(input: {
    kind: ExecutionKind;
    tenantId: string;
    workspaceId?: string;
    userId?: string;
    traceId: string;
    correlationId: string;
    parentExecutionId?: ExecutionId;
    metadata?: ExecutionMetadata;
  }): Execution {
    const id = ExecutionId.generate();

    if (!input.kind || input.kind.trim().length === 0) {
      throw new InvariantViolationError('Execution.kind must be a non-empty string.');
    }
    if (!input.tenantId || input.tenantId.trim().length === 0) {
      throw new InvariantViolationError('Execution.tenantId is required — every Execution is tenant-scoped.');
    }
    if (!input.traceId || input.traceId.trim().length === 0) {
      throw new InvariantViolationError('Execution.traceId is required.');
    }
    if (!input.correlationId || input.correlationId.trim().length === 0) {
      throw new InvariantViolationError('Execution.correlationId is required.');
    }
    if (input.parentExecutionId && input.parentExecutionId.equals(id)) {
      throw new InvariantViolationError('Execution cannot be its own parent.');
    }

    const now = new Date();
    return new Execution({
      id,
      kind: input.kind,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      userId: input.userId,
      traceId: input.traceId,
      correlationId: input.correlationId,
      status: ExecutionStatus.Created,
      parentExecutionId: input.parentExecutionId,
      childExecutionIds: [],
      contributorExecutionIds: [],
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
      version: 1,
      transitionHistory: [],
    });
  }

  /**
   * Creates a new Execution representing a retry of `original`, per Phase
   * 9b's retry-semantics decision (`ADR-040`): **a retry is a new child
   * Execution, not a rewind of the original.** `original` is not mutated
   * into a fresh state — its own terminal status and history remain exactly
   * as they were; this method only registers the new Execution as
   * `original`'s child (via `addChildExecution`, mutating `original` only to
   * the extent every parent already reflects its children) and carries over
   * `tenantId`/`workspaceId`/`userId`/`kind` so the retry is recognizably
   * "the same kind of work again," not an unrelated Execution.
   *
   * Rationale (not decided silently): rewinding `original` back to `QUEUED`
   * would erase or overwrite the history of why it failed, and would make
   * "how many times was this retried" a derived, error-prone count rather
   * than a direct one (`original.childExecutionIds.length`). A new child
   * Execution keeps every attempt's full transition history intact and
   * independently queryable.
   */
  static createRetryOf(
    original: Execution,
    input?: { traceId?: string; correlationId?: string; metadata?: ExecutionMetadata }
  ): Execution {
    const retry = Execution.create({
      kind: original.kind,
      tenantId: original.tenantId,
      workspaceId: original.workspaceId,
      userId: original.userId,
      traceId: input?.traceId ?? original.traceId,
      correlationId: input?.correlationId ?? original.correlationId,
      parentExecutionId: original.id,
      metadata: input?.metadata ?? original.metadata,
    });
    original.addChildExecution(retry.id);
    return retry;
  }

  /**
   * Reconstructs an Execution from previously-persisted state (Phase 9d's
   * repository implementation is the expected caller). Performs the same
   * non-self-parenting check as `create()`, but — unlike `create()` — does
   * NOT reject an already-terminal `status`, since reconstituting a
   * completed/failed/cancelled Execution from storage is exactly what
   * loading its history requires.
   */
  static reconstitute(props: ExecutionProps): Execution {
    if (props.parentExecutionId && props.parentExecutionId.equals(props.id)) {
      throw new InvariantViolationError('Execution cannot be its own parent.');
    }
    return new Execution({ ...props });
  }

  get id(): ExecutionId {
    return this.props.id;
  }

  get kind(): ExecutionKind {
    return this.props.kind;
  }

  get status(): ExecutionStatus {
    return this.props.status;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get workspaceId(): string | undefined {
    return this.props.workspaceId;
  }

  get userId(): string | undefined {
    return this.props.userId;
  }

  get traceId(): string {
    return this.props.traceId;
  }

  get correlationId(): string {
    return this.props.correlationId;
  }

  get parentExecutionId(): ExecutionId | undefined {
    return this.props.parentExecutionId;
  }

  get childExecutionIds(): readonly ExecutionId[] {
    return this.props.childExecutionIds;
  }

  get contributorExecutionIds(): readonly ExecutionId[] {
    return this.props.contributorExecutionIds;
  }

  get metadata(): ExecutionMetadata {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get startedAt(): Date | undefined {
    return this.props.startedAt;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  get version(): number {
    return this.props.version;
  }

  get isTerminal(): boolean {
    return isTerminalExecutionStatus(this.props.status);
  }

  get transitionHistory(): readonly ExecutionTransitionRecord[] {
    return this.props.transitionHistory;
  }

  /**
   * Moves this Execution to `to`, enforcing Phase 9b's canonical transition
   * graph (`ExecutionTransitions.ts`) — this is the method that makes
   * "illegal transitions are impossible through the public API" a checked
   * fact rather than a convention. Supersedes 9a's `recordStatus()` (which
   * performed no legality check and has been removed; nothing in the live
   * system called it, per `ADR-039`'s own Consequences section, so this is
   * not a breaking change to any real caller).
   *
   * Enforces, in order:
   * 1. **Transition legality** — `isLegalExecutionTransition(from, to)` must
   *    hold, or this throws `InvariantViolationError` naming both states.
   *    Terminal states have no legal outgoing transitions at all, so this
   *    alone guarantees "completed executions are immutable" and "terminal
   *    states cannot transition" without a separate special case.
   * 2. **Monotonic timestamps** — `at` must not be earlier than this
   *    Execution's current `updatedAt`. Transition metadata (timestamps,
   *    replay, audit) is only trustworthy if time only moves forward.
   * 3. **`FAILED` requires a reason** — an Execution cannot be marked failed
   *    without saying why; `opts.reason` is mandatory for that specific
   *    target status (enforced here, not left to callers to remember).
   *
   * On success: appends one `ExecutionTransitionRecord` to
   * `transitionHistory`, updates `status`/`updatedAt`, sets `startedAt` on
   * first entry into `RUNNING` and `completedAt` on first entry into a
   * terminal status (both previously 9a behavior, preserved here), and
   * returns the canonical `DomainEvent` for this transition (see
   * `ExecutionEvents.ts`) for a caller to publish — this method does not
   * publish it itself.
   */
  transitionTo(
    to: ExecutionStatus,
    opts: { actor?: string; reason?: string; result?: unknown; at?: Date } = {}
  ): DomainEvent {
    const from = this.props.status;
    const at = opts.at ?? new Date();

    if (!isLegalExecutionTransition(from, to)) {
      throw new InvariantViolationError(
        `Illegal Execution transition: ${this.props.id.toString()} cannot move from ${from} to ${to}.`
      );
    }
    if (at.getTime() < this.props.updatedAt.getTime()) {
      throw new InvariantViolationError(
        `Execution ${this.props.id.toString()} received a transition timestamp (${at.toISOString()}) earlier than its last known update (${this.props.updatedAt.toISOString()}) — transition timestamps must be monotonic.`
      );
    }
    if (to === ExecutionStatus.Failed && !opts.reason) {
      throw new ValidationError('A reason is required when transitioning an Execution to FAILED.');
    }

    const startedAt =
      to === ExecutionStatus.Running && !this.props.startedAt ? at : this.props.startedAt;
    const completedAt =
      isTerminalExecutionStatus(to) && !this.props.completedAt ? at : this.props.completedAt;

    const record: ExecutionTransitionRecord = {
      from,
      to,
      at,
      actor: opts.actor,
      reason: opts.reason,
      correlationId: this.props.correlationId,
    };

    this.props = {
      ...this.props,
      status: to,
      updatedAt: at,
      startedAt,
      completedAt,
      version: this.props.version + 1,
      transitionHistory: [...this.props.transitionHistory, record],
    };

    return this.buildTransitionEvent(from, to, opts);
  }

  private buildTransitionEvent(from: ExecutionStatus, to: ExecutionStatus, opts: { reason?: string; result?: unknown }): DomainEvent {
    const base = {
      executionId: this.props.id.toString(),
      tenantId: this.props.tenantId,
      workspaceId: this.props.workspaceId,
      userId: this.props.userId,
      correlationId: this.props.correlationId,
    };

    switch (to) {
      case ExecutionStatus.Created:
        // Unreachable in practice: ExecutionTransitions.ts never lists
        // CREATED as a legal `to` target for any `from` state, so
        // transitionTo() would already have thrown above. Handled explicitly
        // only so the switch below can be exhaustively type-checked.
        throw new InvariantViolationError('CREATED is not a valid transition target.');
      case ExecutionStatus.Validating:
        return new ExecutionValidatedEvent(base);
      case ExecutionStatus.Queued:
        return new ExecutionQueuedEvent(base);
      case ExecutionStatus.Running:
        return from === ExecutionStatus.Waiting
          ? new ExecutionResumedEvent(base)
          : new ExecutionStartedEvent(base);
      case ExecutionStatus.Waiting:
        return new ExecutionWaitingEvent({ ...base, reason: opts.reason });
      case ExecutionStatus.Cancelling:
        return new ExecutionCancellingEvent({ ...base, reason: opts.reason });
      case ExecutionStatus.Completed:
        return new ExecutionCompletedEvent({ ...base, result: opts.result });
      case ExecutionStatus.Failed:
        return new ExecutionFailedEvent({ ...base, reason: opts.reason as string });
      case ExecutionStatus.Cancelled:
        return new ExecutionCancelledEvent({ ...base, reason: opts.reason });
      case ExecutionStatus.TimedOut:
        return new ExecutionTimedOutEvent(base);
      default: {
        const exhaustiveCheck: never = to;
        throw new InvariantViolationError(`No canonical event mapped for Execution status ${exhaustiveCheck}.`);
      }
    }
  }

  /** Registers a strict child Execution (e.g. a Workflow's own step
   * executions). Idempotent — adding the same child id twice is a no-op,
   * not a duplicate entry. */
  addChildExecution(childId: ExecutionId): void {
    if (this.props.childExecutionIds.some((existing) => existing.equals(childId))) {
      return;
    }
    this.props = {
      ...this.props,
      childExecutionIds: [...this.props.childExecutionIds, childId],
      updatedAt: new Date(),
    };
  }

  /** Registers a looser cross-reference to another Execution (see
   * `contributorExecutionIds`'s own doc comment for the distinction from a
   * strict child). Idempotent, same as `addChildExecution`. */
  addContributorExecutionReference(executionId: ExecutionId): void {
    if (this.props.contributorExecutionIds.some((existing) => existing.equals(executionId))) {
      return;
    }
    this.props = {
      ...this.props,
      contributorExecutionIds: [...this.props.contributorExecutionIds, executionId],
      updatedAt: new Date(),
    };
  }

  /** Returns an immutable snapshot of this aggregate's current state — the
   * shape `ExecutionRepository.save()` persists and `ExecutionEvents`'
   * payloads are drawn from. */
  toProps(): ExecutionProps {
    return { ...this.props };
  }
}
