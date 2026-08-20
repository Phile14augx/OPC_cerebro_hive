import { DomainEvent } from '../events/DomainEvent';
import { ExecutionStatus } from './ExecutionStatus';

/**
 * Phase 9a's event *shapes* for the Execution lifecycle — one class per
 * transition in the 9b lifecycle diagram
 * (`09-EXECUTION-LIFECYCLE-RUNTIME.md` §9e's list:
 * ExecutionCreated/Validated/Queued/Started/Waiting/Cancelling/Resumed/
 * Completed/Failed/Cancelled/TimedOut — `ExecutionCancellingEvent` added in
 * Phase 9b to cover the `CANCELLING` status that 9a's original ten classes
 * didn't have a dedicated event for).
 *
 * These extend this package's own `DomainEvent` (the real, already-used base
 * class — see `WorkflowPublishedEvent`/`AgentPublishedEvent` in
 * `services/WorkflowApplicationService.ts`/`AgentApplicationService.ts`),
 * not HiveForge's `HiveDomainEvent` (`packages/domain-model`, Slice 3).
 * This is a real design choice, made here rather than deferred silently:
 * `packages/domain` already has a working `DomainEvent`/`EventBus`/
 * `OutboxPublisher` implementation in active (if currently unreached, per
 * the Slice 5 review) use in this exact package, whereas
 * `HiveDomainEvent`/`HiveEventBus` are interfaces only, with zero
 * implementations or consumers anywhere in the repository. Building on the
 * implementation that already exists, in the package these events' own
 * aggregate lives in, is "reuse before invention" per the phase doc.
 * Phase 9e's own scope note reserves the final call on which event system
 * becomes the platform's single canonical one — if that decision goes the
 * other way, these classes are the shape to port, not throw away.
 *
 * NO event bus wiring happens here — publishing these (via
 * `OutboxPublisher`, the same mechanism `WorkflowApplicationService` already
 * uses) is Phase 9c/9e's job, once a real orchestrator exists to call
 * `.publish()` from. Defining the shape now, unpublished, mirrors exactly
 * how HiveForge's own Slice 3 defined `HiveDomainEvent` as "shape only, no
 * bus" ahead of its eventual real implementation.
 */

interface ExecutionEventBase {
  readonly executionId: string;
  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly userId?: string;
  readonly correlationId?: string;
}

interface ExecutionCreatedPayload {
  readonly kind: string;
  readonly status: ExecutionStatus;
  readonly parentExecutionId?: string;
}

interface ExecutionStatusPayload {
  readonly status: ExecutionStatus;
}

interface ExecutionReasonPayload extends ExecutionStatusPayload {
  readonly reason?: string;
}

interface ExecutionCompletedPayload extends ExecutionStatusPayload {
  readonly result?: unknown;
}

interface ExecutionFailedPayload extends ExecutionStatusPayload {
  readonly reason: string;
}

export class ExecutionCreatedEvent extends DomainEvent<ExecutionCreatedPayload> {
  /** `parentExecutionId` is optional and, per the event-contract test suite
   * (`ExecutionEventContract.test.ts`), is the one field that lets a
   * retry's lineage (`Execution.createRetryOf()`, `ADR-040` decision 6) be
   * reconstructed from the event stream alone, without cross-referencing the
   * parent aggregate's own `childExecutionIds`. Added when writing that
   * contract test suite surfaced the gap: without it, an
   * `ExecutionCreatedEvent` for a retry was indistinguishable from one for an
   * unrelated fresh Execution. A small, additive, backward-compatible change
   * to 9a's original shape — not a reopening of `ADR-039`. */
  constructor(base: ExecutionEventBase & { kind: string; parentExecutionId?: string }) {
    super('Execution', base.executionId, base.tenantId, base.workspaceId, base.userId, base.correlationId, undefined, {
      kind: base.kind,
      status: ExecutionStatus.Created,
      parentExecutionId: base.parentExecutionId,
    });
  }
}

export class ExecutionValidatedEvent extends DomainEvent<ExecutionStatusPayload> {
  constructor(base: ExecutionEventBase) {
    super('Execution', base.executionId, base.tenantId, base.workspaceId, base.userId, base.correlationId, undefined, {
      status: ExecutionStatus.Validating,
    });
  }
}

export class ExecutionQueuedEvent extends DomainEvent<ExecutionStatusPayload> {
  constructor(base: ExecutionEventBase) {
    super('Execution', base.executionId, base.tenantId, base.workspaceId, base.userId, base.correlationId, undefined, {
      status: ExecutionStatus.Queued,
    });
  }
}

export class ExecutionStartedEvent extends DomainEvent<ExecutionStatusPayload> {
  constructor(base: ExecutionEventBase) {
    super('Execution', base.executionId, base.tenantId, base.workspaceId, base.userId, base.correlationId, undefined, {
      status: ExecutionStatus.Running,
    });
  }
}

export class ExecutionWaitingEvent extends DomainEvent<ExecutionReasonPayload> {
  constructor(base: ExecutionEventBase & { reason?: string }) {
    super('Execution', base.executionId, base.tenantId, base.workspaceId, base.userId, base.correlationId, undefined, {
      status: ExecutionStatus.Waiting,
      reason: base.reason,
    });
  }
}

export class ExecutionCancellingEvent extends DomainEvent<ExecutionReasonPayload> {
  constructor(base: ExecutionEventBase & { reason?: string }) {
    super('Execution', base.executionId, base.tenantId, base.workspaceId, base.userId, base.correlationId, undefined, {
      status: ExecutionStatus.Cancelling,
      reason: base.reason,
    });
  }
}

export class ExecutionResumedEvent extends DomainEvent<ExecutionStatusPayload> {
  constructor(base: ExecutionEventBase) {
    super('Execution', base.executionId, base.tenantId, base.workspaceId, base.userId, base.correlationId, undefined, {
      status: ExecutionStatus.Running,
    });
  }
}

export class ExecutionCompletedEvent extends DomainEvent<ExecutionCompletedPayload> {
  constructor(base: ExecutionEventBase & { result?: unknown }) {
    super('Execution', base.executionId, base.tenantId, base.workspaceId, base.userId, base.correlationId, undefined, {
      status: ExecutionStatus.Completed,
      result: base.result,
    });
  }
}

export class ExecutionFailedEvent extends DomainEvent<ExecutionFailedPayload> {
  constructor(base: ExecutionEventBase & { reason: string }) {
    super('Execution', base.executionId, base.tenantId, base.workspaceId, base.userId, base.correlationId, undefined, {
      status: ExecutionStatus.Failed,
      reason: base.reason,
    });
  }
}

export class ExecutionCancelledEvent extends DomainEvent<ExecutionReasonPayload> {
  constructor(base: ExecutionEventBase & { reason?: string }) {
    super('Execution', base.executionId, base.tenantId, base.workspaceId, base.userId, base.correlationId, undefined, {
      status: ExecutionStatus.Cancelled,
      reason: base.reason,
    });
  }
}

export class ExecutionTimedOutEvent extends DomainEvent<ExecutionStatusPayload> {
  constructor(base: ExecutionEventBase) {
    super('Execution', base.executionId, base.tenantId, base.workspaceId, base.userId, base.correlationId, undefined, {
      status: ExecutionStatus.TimedOut,
    });
  }
}
