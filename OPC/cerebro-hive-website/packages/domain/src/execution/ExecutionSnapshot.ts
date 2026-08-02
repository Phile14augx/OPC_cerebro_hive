import { Execution, ExecutionKind, ExecutionMetadata, ExecutionTransitionRecord } from './Execution';
import { ExecutionId } from './ExecutionId';
import { ExecutionStatus } from './ExecutionStatus';

/**
 * Phase 9d — a plain, JSON-serializable representation of an `Execution`'s
 * full state, including its complete `transitionHistory`. This is the
 * boundary between the aggregate (which holds real `ExecutionId`/`Date`
 * objects) and anything that needs to store or transmit that state as plain
 * data — a standalone in-memory repository today
 * (`InMemoryExecutionRepository.ts`), a real Prisma-backed one or a message
 * payload in the future, neither built by this phase.
 *
 * Deliberately mirrors `ExecutionProps`'s shape field-for-field rather than
 * being a separate, drifting DTO — the one difference is that every
 * `ExecutionId` becomes a plain `string` and every `Date` becomes an ISO
 * string, since those are the two non-JSON-native types `ExecutionProps`
 * carries.
 */
export interface ExecutionTransitionRecordSnapshot {
  readonly from: ExecutionStatus;
  readonly to: ExecutionStatus;
  readonly at: string;
  readonly actor?: string;
  readonly reason?: string;
  readonly correlationId?: string;
}

export interface ExecutionSnapshot {
  readonly id: string;
  readonly kind: ExecutionKind;
  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly userId?: string;
  readonly traceId: string;
  readonly correlationId: string;
  readonly status: ExecutionStatus;
  readonly parentExecutionId?: string;
  readonly childExecutionIds: readonly string[];
  readonly contributorExecutionIds: readonly string[];
  readonly metadata: ExecutionMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly version: number;
  readonly transitionHistory: readonly ExecutionTransitionRecordSnapshot[];
}

/** Converts an `Execution` to its plain, JSON-serializable snapshot. Real
 * conversion logic, not a passthrough cast — every `ExecutionId` becomes a
 * string via `.toString()`, every `Date` becomes an ISO string. */
export function toExecutionSnapshot(execution: Execution): ExecutionSnapshot {
  const props = execution.toProps();
  return {
    id: props.id.toString(),
    kind: props.kind,
    tenantId: props.tenantId,
    workspaceId: props.workspaceId,
    userId: props.userId,
    traceId: props.traceId,
    correlationId: props.correlationId,
    status: props.status,
    parentExecutionId: props.parentExecutionId?.toString(),
    childExecutionIds: props.childExecutionIds.map((id) => id.toString()),
    contributorExecutionIds: props.contributorExecutionIds.map((id) => id.toString()),
    metadata: props.metadata,
    createdAt: props.createdAt.toISOString(),
    updatedAt: props.updatedAt.toISOString(),
    startedAt: props.startedAt?.toISOString(),
    completedAt: props.completedAt?.toISOString(),
    version: props.version,
    transitionHistory: props.transitionHistory.map((r) => ({
      from: r.from,
      to: r.to,
      at: r.at.toISOString(),
      actor: r.actor,
      reason: r.reason,
      correlationId: r.correlationId,
    })),
  };
}

/** Reconstructs a real `Execution` (via `Execution.reconstitute()`) from a
 * plain snapshot — the inverse of `toExecutionSnapshot()`. Round-trip
 * fidelity (`fromExecutionSnapshot(toExecutionSnapshot(x))` behaves
 * identically to `x`) is asserted by this file's test suite, including
 * through an actual `JSON.stringify`/`JSON.parse` pass, not just in-memory
 * object copying — that is the real risk this function guards against
 * (e.g. a `Date` silently surviving as a `Date` in memory but not after a
 * real serialize/deserialize round trip). */
export function fromExecutionSnapshot(snapshot: ExecutionSnapshot): Execution {
  const transitionHistory: ExecutionTransitionRecord[] = snapshot.transitionHistory.map((r) => ({
    from: r.from,
    to: r.to,
    at: new Date(r.at),
    actor: r.actor,
    reason: r.reason,
    correlationId: r.correlationId,
  }));

  return Execution.reconstitute({
    id: ExecutionId.of(snapshot.id),
    kind: snapshot.kind,
    tenantId: snapshot.tenantId,
    workspaceId: snapshot.workspaceId,
    userId: snapshot.userId,
    traceId: snapshot.traceId,
    correlationId: snapshot.correlationId,
    status: snapshot.status,
    parentExecutionId: snapshot.parentExecutionId ? ExecutionId.of(snapshot.parentExecutionId) : undefined,
    childExecutionIds: snapshot.childExecutionIds.map((id) => ExecutionId.of(id)),
    contributorExecutionIds: snapshot.contributorExecutionIds.map((id) => ExecutionId.of(id)),
    metadata: snapshot.metadata,
    createdAt: new Date(snapshot.createdAt),
    updatedAt: new Date(snapshot.updatedAt),
    startedAt: snapshot.startedAt ? new Date(snapshot.startedAt) : undefined,
    completedAt: snapshot.completedAt ? new Date(snapshot.completedAt) : undefined,
    version: snapshot.version,
    transitionHistory,
  });
}
