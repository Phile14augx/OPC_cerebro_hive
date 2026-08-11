import { Execution, ExecutionKind, ExecutionMetadata, ExecutionTransitionRecord } from './Execution';
import { ExecutionId } from './ExecutionId';
import { ExecutionStatus } from './ExecutionStatus';

/**
 * Phase 9d — deterministic replay: reconstructs an `Execution` from its
 * initial identity plus its full `transitionHistory`, by literally re-driving
 * it through `Execution.transitionTo()` in original order with the original
 * timestamps. This is the direct, executable proof of `ADR-040`'s own claim
 * that `transitionHistory` is "sufficient... to support deterministic replay
 * and auditing without needing a separate event store" — this function
 * doesn't touch any event store or persisted snapshot of intermediate
 * states, only the identity + history a `findById()` call already returns.
 *
 * Used by this phase's recovery tests (replay after a simulated restart)
 * and available to a future real recovery path, though no live call site
 * uses it yet.
 */
export interface ExecutionReplayInput {
  readonly id: ExecutionId;
  readonly kind: ExecutionKind;
  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly userId?: string;
  readonly traceId: string;
  readonly correlationId: string;
  readonly parentExecutionId?: ExecutionId;
  readonly metadata?: ExecutionMetadata;
  readonly transitionHistory: readonly ExecutionTransitionRecord[];
}

export function replayExecution(input: ExecutionReplayInput): Execution {
  const firstTransitionAt = input.transitionHistory[0]?.at ?? new Date();

  const execution = Execution.reconstitute({
    id: input.id,
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
    createdAt: firstTransitionAt,
    updatedAt: firstTransitionAt,
    version: 1,
    transitionHistory: [],
  });

  for (const record of input.transitionHistory) {
    execution.transitionTo(record.to, { actor: record.actor, reason: record.reason, at: record.at });
  }

  return execution;
}
