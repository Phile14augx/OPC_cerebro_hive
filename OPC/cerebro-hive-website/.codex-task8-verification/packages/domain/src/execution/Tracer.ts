/**
 * Phase 9g-5 — a minimal, OpenTelemetry-shaped tracing abstraction for
 * Execution lifecycle spans. Deliberately NOT a dependency on the real
 * `@opentelemetry/api` package: this sandbox has no live OTel collector to
 * export to, and no way to verify a real SDK integration end-to-end. The
 * shape here (`startSpan(name, opts) -> Span` with `end()`/`setAttribute()`/
 * `recordException()`) is intentionally close enough to OTel's own `Tracer`/
 * `Span` interfaces that a real adapter wrapping `@opentelemetry/api`'s
 * `trace.getTracer(...)` could satisfy this interface later without any
 * caller-side changes — but that adapter is explicitly not built in this
 * phase (see `ADR-050`).
 */
export interface SpanAttributes {
  readonly [key: string]: string | number | boolean | undefined;
}

export interface Span {
  readonly name: string;
  readonly spanId: string;
  readonly parentSpanId?: string;
  readonly startedAt: Date;
  setAttribute(key: string, value: string | number | boolean): void;
  recordException(error: unknown): void;
  end(): void;
}

export interface StartSpanOptions {
  readonly parent?: Span;
  readonly attributes?: SpanAttributes;
}

export interface Tracer {
  startSpan(name: string, opts?: StartSpanOptions): Span;
}

/** A completed span's full record, as captured by `InMemoryTracer` — useful
 * for tests asserting span hierarchy, attributes, duration, and whether an
 * exception was recorded. */
export interface RecordedSpan {
  readonly name: string;
  readonly spanId: string;
  readonly parentSpanId?: string;
  readonly startedAt: Date;
  readonly endedAt?: Date;
  readonly attributes: Record<string, string | number | boolean>;
  readonly exceptions: unknown[];
}

class InMemorySpan implements Span {
  readonly startedAt: Date;
  private endedAt?: Date;
  private readonly attributes: Record<string, string | number | boolean> = {};
  private readonly exceptions: unknown[] = [];

  constructor(
    readonly name: string,
    readonly spanId: string,
    readonly parentSpanId: string | undefined,
    now: Date,
    initialAttributes: SpanAttributes | undefined,
    private readonly onEnd: (record: RecordedSpan) => void
  ) {
    this.startedAt = now;
    if (initialAttributes) {
      for (const [key, value] of Object.entries(initialAttributes)) {
        if (value !== undefined) {
          this.attributes[key] = value;
        }
      }
    }
  }

  setAttribute(key: string, value: string | number | boolean): void {
    this.attributes[key] = value;
  }

  recordException(error: unknown): void {
    this.exceptions.push(error);
  }

  end(): void {
    if (this.endedAt) {
      return;
    }
    this.endedAt = new Date();
    this.onEnd({
      name: this.name,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      attributes: { ...this.attributes },
      exceptions: [...this.exceptions],
    });
  }
}

/** Standalone, in-memory reference `Tracer` — real, not a test double, same
 * status as this phase's other `InMemory*` classes. Records every ended span
 * for later introspection via `getSpans()`/`getSpan(spanId)`. */
export class InMemoryTracer implements Tracer {
  private readonly spans: RecordedSpan[] = [];
  private sequence = 0;

  startSpan(name: string, opts: StartSpanOptions = {}): Span {
    this.sequence += 1;
    const spanId = `span-${this.sequence}`;
    return new InMemorySpan(name, spanId, opts.parent?.spanId, new Date(), opts.attributes, (record) => {
      this.spans.push(record);
    });
  }

  getSpans(): readonly RecordedSpan[] {
    return this.spans;
  }

  getSpan(spanId: string): RecordedSpan | undefined {
    return this.spans.find((s) => s.spanId === spanId);
  }

  clear(): void {
    this.spans.length = 0;
  }
}
