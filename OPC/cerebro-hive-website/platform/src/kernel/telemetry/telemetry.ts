import { randomBytes } from "node:crypto";
import type { Logger } from "../logging/logger.js";

/** Lightweight OpenTelemetry-compatible tracing (W3C trace context ids). */
export interface SpanData {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  status: "ok" | "error";
  attributes: Record<string, string | number | boolean>;
  events: { name: string; at: number; attributes?: Record<string, unknown> }[];
}

export interface SpanExporter { export(span: SpanData): void }

export class Span {
  readonly data: SpanData;
  private readonly exporter: SpanExporter;
  constructor(name: string, exporter: SpanExporter, parent?: { traceId: string; spanId: string }) {
    this.exporter = exporter;
    this.data = {
      traceId: parent?.traceId ?? randomBytes(16).toString("hex"),
      spanId: randomBytes(8).toString("hex"),
      parentSpanId: parent?.spanId,
      name, startedAt: Date.now(), status: "ok", attributes: {}, events: [],
    };
  }
  setAttribute(key: string, value: string | number | boolean): this { this.data.attributes[key] = value; return this; }
  addEvent(name: string, attributes?: Record<string, unknown>): this { this.data.events.push({ name, at: Date.now(), attributes }); return this; }
  setError(err: unknown): this {
    this.data.status = "error";
    this.data.attributes["error.message"] = err instanceof Error ? err.message : String(err);
    return this;
  }
  end(): SpanData {
    this.data.endedAt = Date.now();
    this.data.durationMs = this.data.endedAt - this.data.startedAt;
    this.exporter.export(this.data);
    return this.data;
  }
  traceparent(): string { return `00-${this.data.traceId}-${this.data.spanId}-01`; }
}

export class InMemorySpanExporter implements SpanExporter {
  spans: SpanData[] = [];
  private readonly max: number;
  constructor(max = 5000) { this.max = max; }
  export(span: SpanData): void {
    this.spans.push(span);
    if (this.spans.length > this.max) this.spans.splice(0, this.spans.length - this.max);
  }
  byTrace(traceId: string): SpanData[] { return this.spans.filter(s => s.traceId === traceId); }
}

export class Tracer {
  constructor(private readonly exporter: SpanExporter) {}
  startSpan(name: string, parent?: { traceId: string; spanId: string }): Span { return new Span(name, this.exporter, parent); }
  async withSpan<T>(name: string, fn: (span: Span) => Promise<T>, parent?: { traceId: string; spanId: string }): Promise<T> {
    const span = this.startSpan(name, parent);
    try { return await fn(span); }
    catch (err) { span.setError(err); throw err; }
    finally { span.end(); }
  }
  get inMemoryExporter(): InMemorySpanExporter | undefined {
    return this.exporter instanceof InMemorySpanExporter ? this.exporter : undefined;
  }
}

export interface MetricPoint { count: number; sum: number; min: number; max: number }

export class Metrics {
  private counters = new Map<string, number>();
  private histograms = new Map<string, MetricPoint>();
  increment(name: string, by = 1, labels?: Record<string, string>): void {
    const key = metricKey(name, labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + by);
  }
  observe(name: string, value: number, labels?: Record<string, string>): void {
    const key = metricKey(name, labels);
    const p = this.histograms.get(key) ?? { count: 0, sum: 0, min: Infinity, max: -Infinity };
    p.count += 1; p.sum += value; p.min = Math.min(p.min, value); p.max = Math.max(p.max, value);
    this.histograms.set(key, p);
  }
  snapshot(): { counters: Record<string, number>; histograms: Record<string, MetricPoint & { avg: number }> } {
    const counters: Record<string, number> = {};
    for (const [k, v] of this.counters) counters[k] = v;
    const histograms: Record<string, MetricPoint & { avg: number }> = {};
    for (const [k, v] of this.histograms) histograms[k] = { ...v, avg: v.count ? v.sum / v.count : 0 };
    return { counters, histograms };
  }
  /** Prometheus text exposition format. */
  prometheus(): string {
    const lines: string[] = [];
    for (const [k, v] of this.counters) lines.push(`${promName(k)} ${v}`);
    for (const [k, v] of this.histograms) {
      lines.push(`${promName(k)}_count ${v.count}`, `${promName(k)}_sum ${v.sum}`);
    }
    return lines.join("\n") + "\n";
  }
}

function metricKey(name: string, labels?: Record<string, string>): string {
  if (!labels) return name;
  const parts = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`);
  return `${name}{${parts.join(",")}}`;
}
function promName(key: string): string { return key.replace(/[^a-zA-Z0-9_{}=",]/g, "_"); }

export interface Telemetry { tracer: Tracer; metrics: Metrics; logger: Logger }
