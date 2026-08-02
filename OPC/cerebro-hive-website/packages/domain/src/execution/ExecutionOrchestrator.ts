import { Execution, ExecutionKind, ExecutionMetadata } from './Execution';
import { ExecutionId } from './ExecutionId';
import { ExecutionRepository } from './ExecutionRepository';
import { ExecutionStatus } from './ExecutionStatus';
import { DomainEvent } from '../events/DomainEvent';
import { AuthorizationError, DuplicateCommandError, InvariantViolationError } from '../errors/DomainError';
import { ITransactionContext } from '../transactions/UnitOfWork';
import { Clock, SystemClock } from './Clock';
import { ExecutionCancellationSignal, ExecutionCancellationTokenSource } from './ExecutionCancellation';
import {
  AllowAllExecutionAuthorizationPolicy,
  ExecutionAuthorizationAction,
  ExecutionAuthorizationPolicy,
} from './ExecutionAuthorizationPolicy';
import { ExecutionIdempotencyStore, NoOpExecutionIdempotencyStore } from './ExecutionIdempotency';
import { ExecutionLeaseStore, InMemoryExecutionLeaseStore } from './ExecutionLease';
import { DefaultExecutionFailureClassifier, ExecutionFailureClassifier } from './ExecutionFailureClassification';
import { ExecutionRetryPolicy, NeverRetryPolicy } from './ExecutionRetryPolicy';
import { ExecutionTelemetry, NoOpExecutionTelemetry } from './ExecutionTelemetry';

/**
 * Phase 9c's production orchestrator — a real component that drives an
 * `Execution` (9a/`ADR-039`) through `ExecutionTransitions.ts`'s canonical
 * graph (9b/`ADR-040`), invoking a provider to do the actual work and
 * persisting/publishing at each step. This is standalone and unwired by
 * design for this pass (per explicit direction): it replaces nothing in
 * `apps/platform-api`'s `runtime.routes.ts` (still mocked) or
 * `AgentRuntimeService` — wiring either of those to construct and call this
 * class is separate, future integration work, not done here. Building it
 * standalone first, with its own real tests, mirrors the same zero-risk,
 * additive pattern 9a/9b/the event-contract suite already used.
 *
 * INVARIANT THIS CLASS MUST NOT VIOLATE (confirmed already holding by the
 * Slice 5 review, and re-affirmed by `09-EXECUTION-LIFECYCLE-RUNTIME.md`
 * §9c's own scope note): **providers execute, orchestrators coordinate.**
 * This class never performs the actual unit of work itself — it delegates
 * every real action to the injected `ExecutionProviderPort`, and its own
 * responsibility is limited to sequencing legal transitions, persisting the
 * aggregate through `ExecutionRepository`, and handing the resulting
 * canonical event to an `ExecutionEventSink`.
 *
 * PHASE 9F-1 ADDITIONS (`ADR-044`) — authorization, cancellation, and
 * timeout, the three things this class's own doc comment previously named as
 * explicitly deferred to "Phase 9f":
 * - **Authorization**: every transition this class drives now passes through
 *   an injected `ExecutionAuthorizationPolicy` (default: `AllowAllExecutionAuthorizationPolicy`,
 *   an explicit, visible permissive default — not a silently-skipped check).
 *   A denied `Decision` raises `AuthorizationError`.
 * - **Cancellation**: `requestCancellation()`/`acknowledgeCancellation()` —
 *   a real, cooperative, single-process cancellation protocol (see
 *   `ExecutionCancellation.ts`'s own scope note on what this is NOT: a
 *   distributed preemption mechanism).
 * - **Timeout**: an optional `RunExecutionInput.timeoutMs`, checked against
 *   an injected `Clock` (default: `SystemClock`) around the provider
 *   invocation and on `resume()`. Timeout takes precedence over whatever a
 *   provider reports if the deadline has already passed.
 *
 * PHASE 9F-2 ADDITIONS (`ADR-045`) — reliability and ownership, the five
 * things named when 9f's scope was split ("what happens when things go
 * wrong or happen more than once?"):
 * - **Idempotency**: `runIdempotent()` — an injected `ExecutionIdempotencyStore`
 *   (default: `NoOpExecutionIdempotencyStore`, an explicit, visible no-check
 *   default) reserves a caller-supplied key before a new Execution is
 *   persisted; a real duplicate returns the *existing* Execution instead of
 *   creating a second one.
 * - **Retry eligibility**: `retryIfEligible()` — delegates to an injected
 *   `ExecutionFailureClassifier` (default: `DefaultExecutionFailureClassifier`)
 *   and `ExecutionRetryPolicy` (default: `NeverRetryPolicy` — safe, matches
 *   every existing caller's current behavior of never auto-retrying) to
 *   decide whether a terminal Execution's failure is worth `retry()`-ing.
 * - **Ownership/leases**: `resumeOwned()` — acquires an
 *   `ExecutionLeaseStore` lease (default: a real `InMemoryExecutionLeaseStore`,
 *   not a no-op, since calling this method at all signals intent to enforce
 *   ownership) before `resume()`ing, releasing it afterward.
 * - **Duplicate-request handling**: the same mechanism as idempotency above
 *   — a duplicate `runIdempotent()` call is not a second orchestration, it's
 *   a lookup of the first.
 * - **Failure classification**: `ExecutionFailureClassification.ts`,
 *   consulted by `retryIfEligible()`, not stored on the aggregate itself.
 *
 * Distributed/cross-process cancellation propagation, a live timeout-sweep
 * process, a real (Redis/PostgreSQL-backed) idempotency store or lease
 * store, and any live scheduler that actually waits `retryDelayMs()` before
 * re-invoking `retry()` remain **Phase 9g**'s job — 9f-1/9f-2 define
 * contracts and real, standalone, in-memory reference implementations only.
 */

export interface ExecutionProviderResult {
  readonly outcome: 'completed' | 'failed' | 'waiting';
  readonly result?: unknown;
  readonly reason?: string;
}

/** The one seam through which real work happens. Deliberately minimal and
 * local to this file rather than importing `packages/domain-model`'s
 * `HiveProviderExecutor` — same bounded-context-separation reasoning as
 * `ExecutionId` staying off `Identifier<Brand>` (`ADR-039` decision 5). A
 * future adapter could implement this port by delegating to a real
 * `HiveProviderExecutor`, but that adapter does not exist yet and is not
 * created by this phase.
 *
 * `opts.cancellationSignal` (Phase 9f-1) is optional and read-only — a real
 * provider MAY observe it cooperatively (e.g. abort an in-flight HTTP call
 * when `isCancellationRequested` flips true) but cannot itself request
 * cancellation through it; only `ExecutionOrchestrator.requestCancellation()`
 * holds the writable token. A provider that ignores the signal entirely
 * still behaves correctly — the orchestrator still honors a pending
 * cancellation once the provider call returns (see
 * `invokeProviderAndFinalize()`). */
export interface ExecutionProviderPort {
  execute(
    execution: Execution,
    opts?: { cancellationSignal?: ExecutionCancellationSignal }
  ): Promise<ExecutionProviderResult>;
}

/** Where a transition's canonical event goes once produced. A real
 * implementation (Phase 9e) would call `OutboxPublisher.publish()`, the same
 * mechanism `WorkflowApplicationService` already uses; nothing wires that up
 * here. */
export interface ExecutionEventSink {
  publish(event: DomainEvent, tx?: ITransactionContext): Promise<void> | void;
}

export interface RunExecutionInput {
  readonly kind: ExecutionKind;
  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly userId?: string;
  readonly traceId: string;
  readonly correlationId: string;
  readonly parentExecutionId?: ExecutionId;
  readonly metadata?: ExecutionMetadata;
  /** Phase 9f-1 — if given, the execution is expected to reach a terminal
   * status within this many milliseconds of `run()` being called (measured
   * from the injected `Clock`, not necessarily wall-clock `Date.now()`).
   * Enforced only around the provider invocation and on `resume()` — time
   * spent in CREATED/VALIDATING/QUEUED is not counted against it, since
   * `ExecutionTransitions.ts`'s graph only allows `TIMED_OUT` from RUNNING
   * or WAITING (admission/queueing latency is a different concern from "the
   * work itself took too long"). */
  readonly timeoutMs?: number;
}

export class ExecutionOrchestrator {
  private readonly cancellationTokens = new Map<string, ExecutionCancellationTokenSource>();
  private readonly deadlines = new Map<string, Date>();
  private readonly authorizationPolicy: ExecutionAuthorizationPolicy;
  private readonly clock: Clock;
  private readonly idempotencyStore: ExecutionIdempotencyStore;
  private readonly leaseStore: ExecutionLeaseStore;
  private readonly failureClassifier: ExecutionFailureClassifier;
  private readonly retryPolicy: ExecutionRetryPolicy;
  private readonly telemetry: ExecutionTelemetry;

  constructor(
    private readonly repository: ExecutionRepository,
    private readonly provider: ExecutionProviderPort,
    private readonly events?: ExecutionEventSink,
    opts?: {
      authorizationPolicy?: ExecutionAuthorizationPolicy;
      clock?: Clock;
      idempotencyStore?: ExecutionIdempotencyStore;
      leaseStore?: ExecutionLeaseStore;
      failureClassifier?: ExecutionFailureClassifier;
      retryPolicy?: ExecutionRetryPolicy;
      telemetry?: ExecutionTelemetry;
    }
  ) {
    this.authorizationPolicy = opts?.authorizationPolicy ?? new AllowAllExecutionAuthorizationPolicy();
    this.clock = opts?.clock ?? new SystemClock();
    this.idempotencyStore = opts?.idempotencyStore ?? new NoOpExecutionIdempotencyStore();
    this.leaseStore = opts?.leaseStore ?? new InMemoryExecutionLeaseStore(this.clock);
    this.failureClassifier = opts?.failureClassifier ?? new DefaultExecutionFailureClassifier();
    this.retryPolicy = opts?.retryPolicy ?? new NeverRetryPolicy();
    this.telemetry = opts?.telemetry ?? new NoOpExecutionTelemetry();
  }

  /** Creates a fresh Execution and drives it through CREATED → VALIDATING →
   * QUEUED → RUNNING → (terminal or WAITING), persisting and publishing at
   * every transition. Checks for a pending cancellation before each
   * pre-RUNNING step (see `checkAndFinalizeIfCancelled()`), since a
   * cancellation requested while still queued has no cooperative provider
   * call to wait on. */
  async run(input: RunExecutionInput, tx?: ITransactionContext): Promise<Execution> {
    const execution = Execution.create(input);
    // Nothing persisted for this brand-new id yet — expectedVersion 0 is the
    // repository's documented convention for "I expect this not to exist."
    await this.repository.save(execution, 0, tx);
    return this.driveNewExecution(execution, input, tx);
  }

  /** Phase 9f-2 — like `run()`, but deduplicated against `input.idempotencyKey`
   * via the injected `ExecutionIdempotencyStore`. If the key is already
   * reserved by a *different* Execution, this returns that existing
   * Execution (loaded via the repository) instead of creating a second one —
   * a real duplicate command is a lookup, not a second orchestration. Throws
   * `DuplicateCommandError` in the (deliberately surfaced, not papered over)
   * edge case where the key is reserved but the owning Execution cannot yet
   * be loaded (e.g. a concurrent `runIdempotent()` call reserved the key a
   * moment ago but has not persisted it yet). With the default
   * `NoOpExecutionIdempotencyStore`, every reservation succeeds and this
   * behaves exactly like `run()`. */
  async runIdempotent(
    input: RunExecutionInput & { idempotencyKey: string },
    tx?: ITransactionContext
  ): Promise<Execution> {
    const execution = Execution.create(input);
    const record = await this.idempotencyStore.reserve(input.idempotencyKey, execution.id);

    if (!record.executionId.equals(execution.id)) {
      const existing = await this.repository.load(record.executionId, tx);
      if (existing) {
        return existing;
      }
      throw new DuplicateCommandError(
        `Idempotency key "${input.idempotencyKey}" is already reserved by Execution ${record.executionId.toString()}, but it could not be loaded.`
      );
    }

    await this.repository.save(execution, 0, tx);
    return this.driveNewExecution(execution, input, tx);
  }

  private async driveNewExecution(
    execution: Execution,
    input: RunExecutionInput,
    tx?: ITransactionContext
  ): Promise<Execution> {
    if (input.timeoutMs !== undefined) {
      this.deadlines.set(execution.id.toString(), new Date(this.clock.now().getTime() + input.timeoutMs));
    }

    if (await this.checkAndFinalizeIfCancelled(execution, tx)) return execution;
    await this.transitionAndPersist(execution, ExecutionStatus.Validating, {}, tx);

    if (await this.checkAndFinalizeIfCancelled(execution, tx)) return execution;
    await this.transitionAndPersist(execution, ExecutionStatus.Queued, {}, tx);

    if (await this.checkAndFinalizeIfCancelled(execution, tx)) return execution;
    await this.transitionAndPersist(execution, ExecutionStatus.Running, {}, tx);

    await this.invokeProviderAndFinalize(execution, tx);
    return execution;
  }

  /** Retries a terminal Execution per `ADR-040` decision 6 — creates a new
   * child Execution via `Execution.createRetryOf()` (not a rewind of
   * `original`) and drives the child through the same pipeline as `run()`.
   * Both `original` (whose `childExecutionIds` changed) and the new child
   * are persisted. */
  async retry(original: Execution, tx?: ITransactionContext): Promise<Execution> {
    if (!original.isTerminal) {
      throw new InvariantViolationError(
        `Cannot retry Execution ${original.id.toString()} — it has not reached a terminal status (current: ${original.status}).`
      );
    }

    const retryExecution = Execution.createRetryOf(original);
    // addChildExecution() (called inside createRetryOf) does not bump
    // `version` — only transitionTo() does — so `original`'s current version
    // IS the version already persisted for it; that's what we expect to find
    // stored.
    await this.repository.save(original, original.version, tx);
    await this.repository.save(retryExecution, 0, tx);

    if (await this.checkAndFinalizeIfCancelled(retryExecution, tx)) return retryExecution;
    await this.transitionAndPersist(retryExecution, ExecutionStatus.Validating, {}, tx);

    if (await this.checkAndFinalizeIfCancelled(retryExecution, tx)) return retryExecution;
    await this.transitionAndPersist(retryExecution, ExecutionStatus.Queued, {}, tx);

    if (await this.checkAndFinalizeIfCancelled(retryExecution, tx)) return retryExecution;
    await this.transitionAndPersist(retryExecution, ExecutionStatus.Running, {}, tx);

    await this.invokeProviderAndFinalize(retryExecution, tx);
    return retryExecution;
  }

  /** Phase 9f-2 — decides whether `original` (a terminal Execution) is worth
   * retrying at all, before calling `retry()`. Classifies `original`'s
   * failure via the injected `ExecutionFailureClassifier` and asks the
   * injected `ExecutionRetryPolicy` whether to proceed, given the caller-
   * supplied `attempt` number (see `ExecutionRetryPolicy.ts`'s own doc
   * comment for why this is not derived internally from
   * `childExecutionIds`). Returns `undefined` (not an error — declining to
   * retry is a normal, expected outcome) if the policy says no; otherwise
   * delegates to `retry()` and returns its result. With the default
   * `NeverRetryPolicy`, this always returns `undefined` — matching every
   * existing caller's current behavior of never auto-retrying. */
  async retryIfEligible(
    original: Execution,
    opts: { attempt: number },
    tx?: ITransactionContext
  ): Promise<Execution | undefined> {
    const failureClass = this.failureClassifier.classify(original);
    const shouldRetry = this.retryPolicy.shouldRetry({ execution: original, failureClass, attempt: opts.attempt });
    this.telemetry.recordRetry(original, opts.attempt, shouldRetry);
    if (!shouldRetry) {
      return undefined;
    }
    return this.retry(original, tx);
  }

  /** Resumes a WAITING Execution — transitions it back to RUNNING and
   * re-invokes the provider. Throws if the Execution is not currently
   * WAITING (this is a structural precondition of `resume()` itself, not a
   * duplicate of `ExecutionTransitions.ts`'s own legality check, though
   * `transitionTo()` would also reject an illegal call). If a timeout
   * deadline has already passed while waiting, resumes straight to
   * TIMED_OUT instead of RUNNING. */
  async resume(execution: Execution, tx?: ITransactionContext): Promise<Execution> {
    if (execution.status !== ExecutionStatus.Waiting) {
      throw new InvariantViolationError(
        `Cannot resume Execution ${execution.id.toString()} — it is not WAITING (current status: ${execution.status}).`
      );
    }

    if (this.isPastDeadline(execution)) {
      await this.transitionAndPersist(execution, ExecutionStatus.TimedOut, {}, tx);
      return execution;
    }

    await this.transitionAndPersist(execution, ExecutionStatus.Running, {}, tx);
    await this.invokeProviderAndFinalize(execution, tx);

    return execution;
  }

  /** Phase 9f-2 — like `resume()`, but ownership-gated: acquires an
   * `ExecutionLeaseStore` lease for `opts.owner` before resuming, and
   * releases it afterward (whether `resume()` succeeds or throws), so a
   * second caller cannot concurrently resume the same Execution while
   * `owner` holds the lease. Throws `ConflictError` (from
   * `ExecutionLeaseStore.acquire()`) if a different owner already holds a
   * valid lease — that error is allowed to propagate, not swallowed, since
   * "someone else is already driving this Execution forward" is exactly the
   * caller's problem to handle (e.g. by not scheduling this work at all). */
  async resumeOwned(
    execution: Execution,
    opts: { owner: string; leaseDurationMs: number },
    tx?: ITransactionContext
  ): Promise<Execution> {
    await this.leaseStore.acquire(execution.id, opts.owner, opts.leaseDurationMs);
    try {
      return await this.resume(execution, tx);
    } finally {
      await this.leaseStore.release(execution.id, opts.owner);
    }
  }

  /** Phase 9f-1 — requests cancellation of `execution`, authorization-gated
   * the same as any other transition. Behavior depends on current status:
   * - Terminal: no-op (nothing left to cancel).
   * - RUNNING or WAITING: transitions to CANCELLING immediately (a legal
   *   direct edge per the graph) and records the cancellation token; a
   *   concurrently in-flight `run()`/`retry()`/`resume()` call observes the
   *   same token (see `invokeProviderAndFinalize()`) and will not try to
   *   re-enter CANCELLING itself. Finalizing out of CANCELLING (to CANCELLED
   *   or FAILED) is `acknowledgeCancellation()`'s job, not this method's —
   *   this method only ever *requests*.
   * - CREATED/VALIDATING/QUEUED: the token is recorded, but no transition
   *   happens here — the graph has no CANCELLING intermediate state for
   *   these (no real work has started), and the in-flight `run()`/`retry()`
   *   step loop's own `checkAndFinalizeIfCancelled()` will finalize straight
   *   to CANCELLED before its next step. */
  async requestCancellation(
    execution: Execution,
    opts: { actor?: string; reason?: string } = {},
    tx?: ITransactionContext
  ): Promise<Execution> {
    await this.authorize({ actor: opts.actor, action: 'cancel' }, execution);

    this.getOrCreateCancellationToken(execution.id.toString()).requestCancellation(opts.reason);
    this.telemetry.recordCancellation(execution, 'requested');

    if (execution.isTerminal) {
      return execution;
    }

    if (execution.status === ExecutionStatus.Running || execution.status === ExecutionStatus.Waiting) {
      await this.transitionAndPersist(
        execution,
        ExecutionStatus.Cancelling,
        { actor: opts.actor, reason: opts.reason },
        tx,
        'cancel'
      );
    }

    return execution;
  }

  /** Phase 9f-1 — finalizes an Execution currently in CANCELLING, moving it
   * to CANCELLED (`opts.succeeded` true, the default) or FAILED (cleanup
   * itself did not complete cleanly — a real, legal outcome per the
   * transition graph's own `CANCELLING → FAILED` edge). Throws if the
   * Execution is not currently CANCELLING — same "structural precondition,
   * not a duplicate of transition legality" reasoning as `resume()`'s own
   * WAITING check. */
  async acknowledgeCancellation(
    execution: Execution,
    opts: { succeeded?: boolean; actor?: string; reason?: string } = {},
    tx?: ITransactionContext
  ): Promise<Execution> {
    if (execution.status !== ExecutionStatus.Cancelling) {
      throw new InvariantViolationError(
        `Cannot acknowledge cancellation for Execution ${execution.id.toString()} — it is not CANCELLING (current status: ${execution.status}).`
      );
    }

    const succeeded = opts.succeeded ?? true;
    const to = succeeded ? ExecutionStatus.Cancelled : ExecutionStatus.Failed;
    const reason = opts.reason ?? (succeeded ? undefined : 'Cancellation could not be completed cleanly.');
    await this.transitionAndPersist(execution, to, { actor: opts.actor, reason }, tx, 'cancel');
    this.telemetry.recordCancellation(execution, 'acknowledged');
    return execution;
  }

  /** The one place this class calls the injected provider — everything
   * before and after this call is coordination (transitions, persistence,
   * events), never the work itself. Checks the timeout deadline both before
   * and after the provider call (a late-arriving result does not override an
   * already-passed deadline), and honors a pending cancellation over
   * whatever the provider itself reports — once cancellation has been
   * requested, the Execution is committed to the CANCELLING path rather than
   * racing a late "completed"/"failed" report for the final say. */
  private async invokeProviderAndFinalize(execution: Execution, tx?: ITransactionContext): Promise<void> {
    const key = execution.id.toString();

    if (this.isPastDeadline(execution)) {
      await this.transitionAndPersist(execution, ExecutionStatus.TimedOut, {}, tx);
      return;
    }

    const token = this.getOrCreateCancellationToken(key);
    let providerResult: ExecutionProviderResult;
    const startedAt = this.clock.now().getTime();
    try {
      providerResult = await this.provider.execute(execution, { cancellationSignal: token });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      this.telemetry.recordProviderInvocation(execution, 'error', this.clock.now().getTime() - startedAt);
      await this.transitionAndPersist(execution, ExecutionStatus.Failed, { reason }, tx);
      return;
    }
    this.telemetry.recordProviderInvocation(execution, providerResult.outcome, this.clock.now().getTime() - startedAt);

    if (this.isPastDeadline(execution)) {
      await this.transitionAndPersist(execution, ExecutionStatus.TimedOut, {}, tx);
      return;
    }

    if (execution.status === ExecutionStatus.Cancelling) {
      // A concurrent requestCancellation() call already moved this
      // Execution to CANCELLING while the provider call above was in
      // flight — regardless of what the provider itself reported, cancellation
      // once entered is committed. Finalizing out of CANCELLING (to CANCELLED
      // or FAILED) is acknowledgeCancellation()'s job, not this one's.
      return;
    }

    if (token.isCancellationRequested) {
      // Cancellation was requested (e.g. a real provider cooperatively
      // observed `cancellationSignal` and is unwinding) but nothing has
      // transitioned yet — do so now, regardless of the provider's own
      // reported outcome. Cancellation, once requested, always takes the
      // Execution down the CANCELLING path rather than letting a race
      // against a late "completed"/"failed" report decide the outcome.
      await this.transitionAndPersist(execution, ExecutionStatus.Cancelling, { reason: token.reason }, tx, 'cancel');
      return;
    }

    switch (providerResult.outcome) {
      case 'completed':
        await this.transitionAndPersist(execution, ExecutionStatus.Completed, { result: providerResult.result }, tx);
        return;
      case 'failed':
        await this.transitionAndPersist(
          execution,
          ExecutionStatus.Failed,
          { reason: providerResult.reason ?? 'Provider reported failure with no reason given.' },
          tx
        );
        return;
      case 'waiting':
        await this.transitionAndPersist(execution, ExecutionStatus.Waiting, { reason: providerResult.reason }, tx);
        return;
    }
  }

  /** Pre-RUNNING cancellation short-circuit for `run()`/`retry()`'s own step
   * loop: if a cancellation was requested while still CREATED/VALIDATING/
   * QUEUED (no CANCELLING intermediate exists for those per the transition
   * graph), finalizes straight to CANCELLED and reports `true` so the caller
   * stops driving further steps. Returns `false` (no-op) otherwise. */
  private async checkAndFinalizeIfCancelled(execution: Execution, tx?: ITransactionContext): Promise<boolean> {
    const token = this.cancellationTokens.get(execution.id.toString());
    if (!token?.isCancellationRequested) {
      return false;
    }
    await this.transitionAndPersist(
      execution,
      ExecutionStatus.Cancelled,
      { reason: token.reason },
      tx,
      'cancel'
    );
    return true;
  }

  private isPastDeadline(execution: Execution): boolean {
    const deadline = this.deadlines.get(execution.id.toString());
    return deadline !== undefined && this.clock.now().getTime() >= deadline.getTime();
  }

  private getOrCreateCancellationToken(key: string): ExecutionCancellationTokenSource {
    let token = this.cancellationTokens.get(key);
    if (!token) {
      token = new ExecutionCancellationTokenSource();
      this.cancellationTokens.set(key, token);
    }
    return token;
  }

  private async authorize(
    context: { actor?: string; action: ExecutionAuthorizationAction; toStatus?: ExecutionStatus },
    execution: Execution
  ): Promise<void> {
    const decision = await this.authorizationPolicy.evaluate(context, execution);
    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ??
          `Actor ${context.actor ?? '(unknown)'} is not authorized to ${context.action} Execution ${execution.id.toString()}${
            context.toStatus ? ` to ${context.toStatus}` : ''
          }.`
      );
    }
  }

  private async transitionAndPersist(
    execution: Execution,
    to: ExecutionStatus,
    opts: { actor?: string; reason?: string; result?: unknown },
    tx?: ITransactionContext,
    action: ExecutionAuthorizationAction = 'transition'
  ): Promise<void> {
    await this.authorize({ actor: opts.actor, action, toStatus: to }, execution);

    // Capture the version BEFORE transitionTo() mutates it — since every
    // prior save left the store holding exactly this pre-transition version,
    // this is always the correct `expectedVersion` for the save that follows.
    const expectedVersion = execution.version;
    const from = execution.status;
    const event = execution.transitionTo(to, opts);
    await this.repository.save(execution, expectedVersion, tx);
    this.telemetry.recordTransition(execution, from, to);
    if (to === ExecutionStatus.Failed || to === ExecutionStatus.TimedOut) {
      this.telemetry.recordFailure(execution, opts.reason ?? `Transitioned to ${to}.`);
    }
    if (this.events) {
      await this.events.publish(event, tx);
      this.telemetry.recordEventPublished(execution, event.constructor.name);
    }
  }
}
