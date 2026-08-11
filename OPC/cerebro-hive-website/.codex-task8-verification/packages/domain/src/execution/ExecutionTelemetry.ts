import { Execution } from './Execution';
import { ExecutionStatus } from './ExecutionStatus';
import { correlationContextFrom } from './CorrelationContext';
import { Logger } from './Logger';
import { Meter } from './Meter';
import { Span, Tracer } from './Tracer';

/**
 * Phase 9g-5 — the single seam `ExecutionOrchestrator` calls into for every
 * observability signal (structured logs, metrics, traces) at the lifecycle
 * points named in the original 9g-5 scope: workflow start/end, step
 * (transition) execution, event publication, outbox relay, retry handling,
 * failure handling, cancellation. Composes a `Tracer`/`Meter`/`Logger`
 * rather than exposing them individually, so `ExecutionOrchestrator` has one
 * constructor dependency instead of three, and so the specific metric
 * names/log shapes used for each lifecycle event are defined once, here, not
 * duplicated at every call site.
 *
 * Default is `NoOpExecutionTelemetry` — instrumentation is opt-in, matching
 * every other optional `ExecutionOrchestrator` dependency's own default
 * posture (`AllowAllExecutionAuthorizationPolicy`, `NoOpExecutionIdempotencyStore`,
 * etc.): adding 9g-5 must not change any existing caller's behavior.
 */
export interface ExecutionTelemetry {
  /** Starts a span for a whole `run()`/`retry()`/`resume()` invocation. The
   * caller is responsible for calling `.end()` on the returned span. */
  startExecutionSpan(name: string, execution: Execution, parent?: Span): Span;

  /** Records a single legal transition (`from` -> `to`) — a span, a counter
   * increment, and a structured log line, all sharing the same
   * `CorrelationContext`. */
  recordTransition(execution: Execution, from: ExecutionStatus, to: ExecutionStatus, parent?: Span): void;

  /** Records a provider invocation's outcome and duration. */
  recordProviderInvocation(
    execution: Execution,
    outcome: 'completed' | 'failed' | 'waiting' | 'error',
    durationMs: number
  ): void;

  /** Records an event having been handed to the `ExecutionEventSink`. */
  recordEventPublished(execution: Execution, eventType: string): void;

  /** Records an `ExecutionEventRelay.relayOnce()` batch result. */
  recordRelayBatch(processed: number, published: number, failed: number, permanentlyFailed: number): void;

  /** Records a retry decision (attempted or declined). */
  recordRetry(execution: Execution, attempt: number, retried: boolean): void;

  /** Records a cancellation request or acknowledgement. */
  recordCancellation(execution: Execution, phase: 'requested' | 'acknowledged'): void;

  /** Records a transition, provider call, or other failure. */
  recordFailure(execution: Execution, reason: string): void;
}

const NOOP_SPAN: Span = {
  name: 'noop',
  spanId: 'noop',
  startedAt: new Date(0),
  setAttribute: () => undefined,
  recordException: () => undefined,
  end: () => undefined,
};

/** The explicit, visible no-instrumentation default — every method is a
 * real no-op, not a silently-absent optional dependency, matching this
 * package's established convention for every other `NoOp*` default. */
export class NoOpExecutionTelemetry implements ExecutionTelemetry {
  startExecutionSpan(_name: string, _execution: Execution, _parent?: Span): Span {
    return NOOP_SPAN;
  }
  recordTransition(_execution: Execution, _from: ExecutionStatus, _to: ExecutionStatus, _parent?: Span): void {}
  recordProviderInvocation(
    _execution: Execution,
    _outcome: 'completed' | 'failed' | 'waiting' | 'error',
    _durationMs: number
  ): void {}
  recordEventPublished(_execution: Execution, _eventType: string): void {}
  recordRelayBatch(_processed: number, _published: number, _failed: number, _permanentlyFailed: number): void {}
  recordRetry(_execution: Execution, _attempt: number, _retried: boolean): void {}
  recordCancellation(_execution: Execution, _phase: 'requested' | 'acknowledged'): void {}
  recordFailure(_execution: Execution, _reason: string): void {}
}

/** Real, standalone composition of an injected `Tracer`/`Meter`/`Logger`
 * into the lifecycle-specific signals `ExecutionOrchestrator` needs. Not a
 * no-op — this is production-shaped code; only the `Tracer`/`Meter`/`Logger`
 * implementations passed to it are, in this phase, in-memory ones (real
 * OTel/Prometheus/log-shipper adapters remain future work — see `ADR-050`). */
export class DefaultExecutionTelemetry implements ExecutionTelemetry {
  constructor(
    private readonly tracer: Tracer,
    private readonly meter: Meter,
    private readonly logger: Logger
  ) {}

  startExecutionSpan(name: string, execution: Execution, parent?: Span): Span {
    const ctx = correlationContextFrom(execution);
    return this.tracer.startSpan(name, { parent, attributes: { ...ctx, kind: execution.kind } });
  }

  recordTransition(execution: Execution, from: ExecutionStatus, to: ExecutionStatus, parent?: Span): void {
    const ctx = correlationContextFrom(execution);
    const span = this.tracer.startSpan('execution.transition', {
      parent,
      attributes: { ...ctx, from, to },
    });
    span.end();

    this.meter.incrementCounter('execution_transitions_total', 1, { from, to });

    this.logger.info('Execution transitioned', { ...ctx, from, to });
  }

  recordProviderInvocation(
    execution: Execution,
    outcome: 'completed' | 'failed' | 'waiting' | 'error',
    durationMs: number
  ): void {
    const ctx = correlationContextFrom(execution);
    this.meter.recordHistogram('execution_provider_duration_ms', durationMs, { outcome });
    this.meter.incrementCounter('execution_provider_invocations_total', 1, { outcome });
    this.logger.info('Execution provider invocation completed', { ...ctx, outcome, durationMs });
  }

  recordEventPublished(execution: Execution, eventType: string): void {
    const ctx = correlationContextFrom(execution);
    this.meter.incrementCounter('execution_events_published_total', 1, { eventType });
    this.logger.debug('Execution event published', { ...ctx, eventType });
  }

  recordRelayBatch(processed: number, published: number, failed: number, permanentlyFailed: number): void {
    this.meter.setGauge('execution_outbox_batch_processed', processed);
    this.meter.incrementCounter('execution_outbox_published_total', published);
    this.meter.incrementCounter('execution_outbox_failed_total', failed);
    this.meter.incrementCounter('execution_outbox_dead_lettered_total', permanentlyFailed);
    this.logger.info('Execution event relay batch processed', { processed, published, failed, permanentlyFailed });
  }

  recordRetry(execution: Execution, attempt: number, retried: boolean): void {
    const ctx = correlationContextFrom(execution);
    this.meter.incrementCounter('execution_retries_total', 1, { attempt, retried });
    this.logger.info('Execution retry decision', { ...ctx, attempt, retried });
  }

  recordCancellation(execution: Execution, phase: 'requested' | 'acknowledged'): void {
    const ctx = correlationContextFrom(execution);
    this.meter.incrementCounter('execution_cancellations_total', 1, { phase });
    this.logger.info('Execution cancellation ' + phase, { ...ctx, phase });
  }

  recordFailure(execution: Execution, reason: string): void {
    const ctx = correlationContextFrom(execution);
    this.meter.incrementCounter('execution_failures_total', 1);
    this.logger.error('Execution failure', { ...ctx, reason });
  }
}
