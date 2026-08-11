/**
 * Phase 9g-5 — a minimal, Prometheus-client-shaped metrics abstraction
 * (counter/gauge/histogram, the three instrument kinds `prom-client` and
 * OpenTelemetry's Metrics API both expose). Deliberately NOT a dependency on
 * `prom-client` or `@opentelemetry/api-metrics`: no live Prometheus/OTel
 * collector exists in this sandbox to scrape or export to, so a real adapter
 * would be unverifiable code (see `ADR-050`). The shape here is close enough
 * that a real `PrometheusMeter` wrapping `prom-client`'s `Counter`/`Gauge`/
 * `Histogram` could satisfy this interface later without caller-side changes.
 */
export interface MetricLabels {
  readonly [key: string]: string | number | boolean | undefined;
}

export interface Meter {
  incrementCounter(name: string, value?: number, labels?: MetricLabels): void;
  recordHistogram(name: string, value: number, labels?: MetricLabels): void;
  setGauge(name: string, value: number, labels?: MetricLabels): void;
}

export interface RecordedMetric {
  readonly kind: 'counter' | 'histogram' | 'gauge';
  readonly name: string;
  readonly value: number;
  readonly labels: Record<string, string | number | boolean>;
  readonly recordedAt: Date;
}

function normalizeLabels(labels?: MetricLabels): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  if (!labels) {
    return result;
  }
  for (const [key, value] of Object.entries(labels)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

/** Standalone, in-memory reference `Meter` — real, not a test double.
 * Records every call for later introspection/aggregation via `getMetrics()`
 * and the convenience aggregate readers (`counterTotal()`, `gaugeValue()`,
 * `histogramValues()`). */
export class InMemoryMetricsCollector implements Meter {
  private readonly metrics: RecordedMetric[] = [];

  incrementCounter(name: string, value = 1, labels?: MetricLabels): void {
    this.metrics.push({ kind: 'counter', name, value, labels: normalizeLabels(labels), recordedAt: new Date() });
  }

  recordHistogram(name: string, value: number, labels?: MetricLabels): void {
    this.metrics.push({ kind: 'histogram', name, value, labels: normalizeLabels(labels), recordedAt: new Date() });
  }

  setGauge(name: string, value: number, labels?: MetricLabels): void {
    this.metrics.push({ kind: 'gauge', name, value, labels: normalizeLabels(labels), recordedAt: new Date() });
  }

  getMetrics(): readonly RecordedMetric[] {
    return this.metrics;
  }

  /** Sum of every `incrementCounter()` call recorded for `name` (across all
   * label combinations, unless `labels` is given to filter to an exact
   * label-set match). */
  counterTotal(name: string, labels?: MetricLabels): number {
    const wantedLabels = labels ? normalizeLabels(labels) : undefined;
    return this.metrics
      .filter((m) => m.kind === 'counter' && m.name === name && this.labelsMatch(m.labels, wantedLabels))
      .reduce((sum, m) => sum + m.value, 0);
  }

  /** The most recently set gauge value for `name`, or `undefined` if never set. */
  gaugeValue(name: string): number | undefined {
    const matches = this.metrics.filter((m) => m.kind === 'gauge' && m.name === name);
    return matches.length > 0 ? matches[matches.length - 1].value : undefined;
  }

  histogramValues(name: string): readonly number[] {
    return this.metrics.filter((m) => m.kind === 'histogram' && m.name === name).map((m) => m.value);
  }

  clear(): void {
    this.metrics.length = 0;
  }

  private labelsMatch(
    actual: Record<string, string | number | boolean>,
    wanted: Record<string, string | number | boolean> | undefined
  ): boolean {
    if (!wanted) {
      return true;
    }
    return Object.entries(wanted).every(([key, value]) => actual[key] === value);
  }
}
