import { Execution, ExecutionKind, ExecutionMetadata } from './Execution';
import { ExecutionId } from './ExecutionId';
import { ExecutionRepository } from './ExecutionRepository';
import { ExecutionStatus } from './ExecutionStatus';
import { DomainEvent } from '../events/DomainEvent';
import { InvariantViolationError } from '../errors/DomainError';
import { ITransactionContext } from '../transactions/UnitOfWork';

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
 * canonical event to an `ExecutionEventSink` (both dependency-injected, both
 * still without a real implementation as of this phase — 9d builds the
 * repository, 9e builds the real event sink).
 *
 * NOT covered by this pass (deliberately, not silently): idempotency
 * guarantees for duplicate orchestration commands (`ExecutionRepository`
 * has no idempotency-key lookup — adding one would mean extending 9a's
 * aggregate/repository contract, which this class does not do on its own
 * authority), authorization/policy enforcement of who may trigger `run()`/
 * `retry()`/`resume()` (Phase 9f), cancellation (`CANCELLING`/`CANCELLED`
 * are legal per the graph but nothing here drives them — a real
 * cancellation-token mechanism is also Phase 9f's), and timeout detection
 * (nothing here race-conditions the provider call against a clock — a real
 * `TIMED_OUT` transition requires an external timer, out of this class's
 * scope).
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
 * created by this phase. */
export interface ExecutionProviderPort {
  execute(execution: Execution): Promise<ExecutionProviderResult>;
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
}

export class ExecutionOrchestrator {
  constructor(
    private readonly repository: ExecutionRepository,
    private readonly provider: ExecutionProviderPort,
    private readonly events?: ExecutionEventSink
  ) {}

  /** Creates a fresh Execution and drives it through CREATED → VALIDATING →
   * QUEUED → RUNNING → (terminal or WAITING), persisting and publishing at
   * every transition. */
  async run(input: RunExecutionInput, tx?: ITransactionContext): Promise<Execution> {
    const execution = Execution.create(input);
    await this.repository.save(execution, tx);

    await this.transitionAndPersist(execution, ExecutionStatus.Validating, {}, tx);
    await this.transitionAndPersist(execution, ExecutionStatus.Queued, {}, tx);
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
    await this.repository.save(original, tx);
    await this.repository.save(retryExecution, tx);

    await this.transitionAndPersist(retryExecution, ExecutionStatus.Validating, {}, tx);
    await this.transitionAndPersist(retryExecution, ExecutionStatus.Queued, {}, tx);
    await this.transitionAndPersist(retryExecution, ExecutionStatus.Running, {}, tx);
    await this.invokeProviderAndFinalize(retryExecution, tx);

    return retryExecution;
  }

  /** Resumes a WAITING Execution — transitions it back to RUNNING and
   * re-invokes the provider. Throws if the Execution is not currently
   * WAITING (this is a structural precondition of `resume()` itself, not a
   * duplicate of `ExecutionTransitions.ts`'s own legality check, though
   * `transitionTo()` would also reject an illegal call). */
  async resume(execution: Execution, tx?: ITransactionContext): Promise<Execution> {
    if (execution.status !== ExecutionStatus.Waiting) {
      throw new InvariantViolationError(
        `Cannot resume Execution ${execution.id.toString()} — it is not WAITING (current status: ${execution.status}).`
      );
    }

    await this.transitionAndPersist(execution, ExecutionStatus.Running, {}, tx);
    await this.invokeProviderAndFinalize(execution, tx);

    return execution;
  }

  /** The one place this class calls the injected provider — everything
   * before and after this call is coordination (transitions, persistence,
   * events), never the work itself. */
  private async invokeProviderAndFinalize(execution: Execution, tx?: ITransactionContext): Promise<void> {
    let providerResult: ExecutionProviderResult;
    try {
      providerResult = await this.provider.execute(execution);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      await this.transitionAndPersist(execution, ExecutionStatus.Failed, { reason }, tx);
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

  private async transitionAndPersist(
    execution: Execution,
    to: ExecutionStatus,
    opts: { reason?: string; result?: unknown },
    tx?: ITransactionContext
  ): Promise<void> {
    const event = execution.transitionTo(to, opts);
    await this.repository.save(execution, tx);
    if (this.events) {
      await this.events.publish(event, tx);
    }
  }
}
