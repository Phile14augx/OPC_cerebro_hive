/**
 * M24 — OpenTelemetry Compatibility Shim
 *
 * Creates trace/span hierarchy for every execution:
 *   Execution Trace → Stage Spans → Node Spans → Provider Spans
 *
 * When HiveOps wires real OTEL, swap out the NoopTracer below.
 * Zero changes required elsewhere.
 */

export interface Span {
  spanId: string;
  traceId: string;
  name: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, unknown>;
  status: 'ok' | 'error' | 'unset';
  end(attributes?: Record<string, unknown>): void;
  setStatus(status: 'ok' | 'error', message?: string): void;
  setAttribute(key: string, value: unknown): void;
}

export interface Tracer {
  startSpan(name: string, parentSpan?: Span): Span;
}

/** In-process noop tracer — compatible shape with @opentelemetry/api */
class NoopSpan implements Span {
  spanId = crypto.randomUUID().slice(0, 16);
  traceId: string;
  name: string;
  startTime = Date.now();
  endTime?: number;
  attributes: Record<string, unknown> = {};
  status: 'ok' | 'error' | 'unset' = 'unset';

  constructor(name: string, traceId: string) { this.name = name; this.traceId = traceId; }

  end(attrs?: Record<string, unknown>): void {
    this.endTime = Date.now();
    if (attrs) Object.assign(this.attributes, attrs);
    if (this.status === 'unset') this.status = 'ok';
  }

  setStatus(status: 'ok' | 'error', _msg?: string): void { this.status = status; }
  setAttribute(key: string, value: unknown): void { this.attributes[key] = value; }
}

class InProcessTracer implements Tracer {
  private spans: NoopSpan[] = [];
  private rootTraceId = crypto.randomUUID();

  startSpan(name: string, _parentSpan?: Span): Span {
    const span = new NoopSpan(name, this.rootTraceId);
    this.spans.push(span);
    return span;
  }

  getSpans(): NoopSpan[] { return [...this.spans]; }
}

let _activeTracer: Tracer = new InProcessTracer();

/** Replace with real OTel tracer when HiveOps is wired. */
export function setGlobalTracer(tracer: Tracer): void { _activeTracer = tracer; }
export function getTracer(): Tracer { return _activeTracer; }

export function startExecutionTrace(executionId: string): Span {
  const span = _activeTracer.startSpan(`execution:${executionId.slice(0, 8)}`);
  span.setAttribute('execution.id', executionId);
  return span;
}

export function startStageSpan(stageId: string, parentSpan: Span): Span {
  const span = _activeTracer.startSpan(`stage:${stageId}`, parentSpan);
  span.setAttribute('stage.id', stageId);
  return span;
}

export function startNodeSpan(nodeId: string, nodeType: string, parentSpan: Span): Span {
  const span = _activeTracer.startSpan(`node:${nodeType}:${nodeId}`, parentSpan);
  span.setAttribute('node.id', nodeId);
  span.setAttribute('node.type', nodeType);
  return span;
}
