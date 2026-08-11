// =============================================================================
// CerebroHive — OTel Metrics: AI-specific + HTTP + system meters
// =============================================================================

import {
  metrics,
  type Meter,
  type Counter,
  type Histogram,
  type UpDownCounter,
  type ObservableGauge,
  type Attributes,
} from '@opentelemetry/api';

// ─── Meter factory ───────────────────────────────────────────────────────────

let _meter: Meter | undefined;

export function getMeter(name = 'cerebro-hive'): Meter {
  if (!_meter) {
    _meter = metrics.getMeterProvider().getMeter(name, process.env.npm_package_version ?? '0.0.0');
  }
  return _meter;
}

// ─── AI-specific metrics ─────────────────────────────────────────────────────

export interface AIMetrics {
  /** Total input tokens consumed */
  inputTokens: Counter;
  /** Total output tokens produced */
  outputTokens: Counter;
  /** Estimated cost in USD (micro-dollars stored as integer for precision) */
  estimatedCostUSD: Counter;
  /** E2E latency per LLM request in milliseconds */
  requestDuration: Histogram;
  /** Time-to-first-token for streaming responses in milliseconds */
  ttft: Histogram;
  /** Total LLM requests counter, tagged by provider/model/status */
  requests: Counter;
  /** Active streaming connections */
  activeStreams: UpDownCounter;
  /** Provider errors */
  errors: Counter;
  /** Cache hits */
  cacheHits: Counter;
  /** Cache misses */
  cacheMisses: Counter;
}

let _aiMetrics: AIMetrics | undefined;

export function getAIMetrics(): AIMetrics {
  if (_aiMetrics) return _aiMetrics;

  const m = getMeter('cerebro-hive.ai');

  _aiMetrics = {
    inputTokens: m.createCounter('ai.tokens.input', {
      description: 'Total input tokens consumed from AI providers',
      unit: 'tokens',
    }),
    outputTokens: m.createCounter('ai.tokens.output', {
      description: 'Total output tokens produced by AI providers',
      unit: 'tokens',
    }),
    estimatedCostUSD: m.createCounter('ai.cost.usd', {
      description: 'Estimated AI cost in USD (use with rate 1=1e-6 for micro-dollar resolution)',
      unit: 'USD',
    }),
    requestDuration: m.createHistogram('ai.request.duration', {
      description: 'End-to-end duration of AI provider requests',
      unit: 'ms',
      advice: {
        explicitBucketBoundaries: [100, 500, 1000, 2000, 5000, 10000, 30000, 60000],
      },
    }),
    ttft: m.createHistogram('ai.streaming.ttft', {
      description: 'Time-to-first-token for streaming AI responses',
      unit: 'ms',
      advice: {
        explicitBucketBoundaries: [50, 100, 250, 500, 1000, 2000, 5000],
      },
    }),
    requests: m.createCounter('ai.requests.total', {
      description: 'Total AI provider requests',
    }),
    activeStreams: m.createUpDownCounter('ai.streams.active', {
      description: 'Currently active streaming LLM connections',
    }),
    errors: m.createCounter('ai.errors.total', {
      description: 'AI provider errors by provider/model/error_type',
    }),
    cacheHits: m.createCounter('ai.cache.hits', {
      description: 'AI response cache hits',
    }),
    cacheMisses: m.createCounter('ai.cache.misses', {
      description: 'AI response cache misses',
    }),
  };

  return _aiMetrics;
}

// ─── HTTP metrics ─────────────────────────────────────────────────────────────

export interface HttpMetrics {
  requestDuration: Histogram;
  requestsTotal: Counter;
  activeConnections: UpDownCounter;
}

let _httpMetrics: HttpMetrics | undefined;

export function getHttpMetrics(): HttpMetrics {
  if (_httpMetrics) return _httpMetrics;

  const m = getMeter('cerebro-hive.http');

  _httpMetrics = {
    requestDuration: m.createHistogram('http.server.request.duration', {
      description: 'HTTP request duration in milliseconds',
      unit: 'ms',
      advice: {
        explicitBucketBoundaries: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
      },
    }),
    requestsTotal: m.createCounter('http.server.requests.total', {
      description: 'Total HTTP requests',
    }),
    activeConnections: m.createUpDownCounter('http.server.connections.active', {
      description: 'Active HTTP connections',
    }),
  };

  return _httpMetrics;
}

// ─── Business metrics ─────────────────────────────────────────────────────────

export interface BusinessMetrics {
  workflowsCreated: Counter;
  workflowsExecuted: Counter;
  workflowDuration: Histogram;
  agentTasksQueued: Counter;
  agentTasksCompleted: Counter;
  activeOrganizations: ObservableGauge;
}

let _businessMetrics: BusinessMetrics | undefined;

export function getBusinessMetrics(): BusinessMetrics {
  if (_businessMetrics) return _businessMetrics;

  const m = getMeter('cerebro-hive.business');

  _businessMetrics = {
    workflowsCreated: m.createCounter('cerebro.workflows.created', {
      description: 'Total HiveForge workflows created',
    }),
    workflowsExecuted: m.createCounter('cerebro.workflows.executed', {
      description: 'Total workflow executions',
    }),
    workflowDuration: m.createHistogram('cerebro.workflow.duration', {
      description: 'Workflow execution duration',
      unit: 'ms',
      advice: {
        explicitBucketBoundaries: [100, 500, 1000, 5000, 15000, 30000, 60000, 300000],
      },
    }),
    agentTasksQueued: m.createCounter('cerebro.agent.tasks.queued', {
      description: 'Agent tasks queued for execution',
    }),
    agentTasksCompleted: m.createCounter('cerebro.agent.tasks.completed', {
      description: 'Agent tasks completed (use status=success|failure label)',
    }),
    activeOrganizations: m.createObservableGauge('cerebro.organizations.active', {
      description: 'Organizations with activity in last 24h',
    }),
  };

  return _businessMetrics;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Record a complete AI request with all metrics in one call. */
export function recordAIRequest(opts: {
  provider: string;
  model: string;
  status: 'success' | 'error' | 'cached';
  inputTokens?: number;
  outputTokens?: number;
  durationMs?: number;
  ttftMs?: number;
  costUSD?: number;
  errorType?: string;
  organizationId?: string;
}) {
  const ai = getAIMetrics();
  const attrs: Attributes = {
    provider: opts.provider,
    model: opts.model,
    status: opts.status,
    ...(opts.organizationId && { organization_id: opts.organizationId }),
    ...(opts.errorType && { error_type: opts.errorType }),
  };

  ai.requests.add(1, attrs);

  if (opts.status === 'cached') {
    ai.cacheHits.add(1, attrs);
    return;
  }

  if (opts.status === 'error') {
    ai.errors.add(1, attrs);
    ai.cacheMisses.add(1, attrs);
    return;
  }

  ai.cacheMisses.add(1, attrs);

  if (opts.inputTokens) ai.inputTokens.add(opts.inputTokens, attrs);
  if (opts.outputTokens) ai.outputTokens.add(opts.outputTokens, attrs);
  if (opts.costUSD) ai.estimatedCostUSD.add(opts.costUSD, attrs);
  if (opts.durationMs) ai.requestDuration.record(opts.durationMs, attrs);
  if (opts.ttftMs) ai.ttft.record(opts.ttftMs, attrs);
}
