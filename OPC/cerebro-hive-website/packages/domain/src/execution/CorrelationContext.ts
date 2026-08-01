import { Execution } from './Execution';

/**
 * Phase 9g-5 — the set of identifiers that should travel alongside every
 * log line, span, and metric label emitted for a given Execution, so a real
 * observability backend (once one exists) can correlate them across the
 * whole `API -> Command -> Aggregate -> Domain Events -> Outbox -> Relay`
 * pipeline `ADR-049` built. Deliberately a plain data shape, not a class —
 * nothing here needs behavior, only to be threaded through consistently.
 */
export interface CorrelationContext {
  readonly executionId: string;
  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly traceId: string;
  readonly correlationId: string;
  readonly parentExecutionId?: string;
}

/** Derives a `CorrelationContext` from an `Execution`'s own recorded fields
 * — the single place this shape is assembled, so `ExecutionOrchestrator`'s
 * instrumentation call sites never duplicate this field-mapping logic. */
export function correlationContextFrom(execution: Execution): CorrelationContext {
  return {
    executionId: execution.id.toString(),
    tenantId: execution.tenantId,
    workspaceId: execution.workspaceId,
    traceId: execution.traceId,
    correlationId: execution.correlationId,
    parentExecutionId: execution.parentExecutionId?.toString(),
  };
}
