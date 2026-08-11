/**
 * CerebroHive AI-Native Telemetry
 *
 * Registers all LLM/agent/vector-search metrics using the OpenTelemetry SDK.
 * Designed to be used as a singleton — call `getAIMetrics()` anywhere in
 * the process after `initTelemetry()` has been called at startup.
 *
 * Metric naming follows the OpenTelemetry semantic conventions for GenAI
 * (https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/) where
 * they exist, plus CerebroHive-specific extensions for agent and vector ops.
 */

import {
  type Meter,
  type Counter,
  type Histogram,
  type UpDownCounter,
  type ObservableGauge,
  metrics,
  ValueType,
} from "@opentelemetry/api";

// ── Cost table (USD per 1M tokens) ────────────────────────────────────────────
// Keep in sync with provider pricing pages. Used to convert token counts to USD.
export const MODEL_COST_PER_1M_TOKENS: Record<string, { input: number; output: number }> = {
  // Anthropic
  "claude-opus-4-5":           { input: 15.00,  output: 75.00  },
  "claude-sonnet-4-6":         { input:  3.00,  output: 15.00  },
  "claude-haiku-4-5-20251001": { input:  0.80,  output:  4.00  },
  // OpenAI
  "gpt-4o":                    { input:  5.00,  output: 15.00  },
  "gpt-4o-mini":               { input:  0.15,  output:  0.60  },
  "gpt-4-turbo":               { input: 10.00,  output: 30.00  },
  "gpt-3.5-turbo":             { input:  0.50,  output:  1.50  },
  // Google
  "gemini-1.5-pro":            { input:  3.50,  output: 10.50  },
  "gemini-1.5-flash":          { input:  0.075, output:  0.30  },
  // Azure (same as OpenAI)
  "gpt-4o-azure":              { input:  5.00,  output: 15.00  },
};

export function costUSD(model: string, tokensIn: number, tokensOut: number): number {
  const pricing = MODEL_COST_PER_1M_TOKENS[model] ?? { input: 0, output: 0 };
  return (tokensIn * pricing.input + tokensOut * pricing.output) / 1_000_000;
}

// ── Metric containers ─────────────────────────────────────────────────────────
export interface AIMetrics {
  // LLM requests
  llmRequests: Counter;
  llmErrors:   Counter;

  // Token usage
  llmTokensPrompt:     Counter;
  llmTokensCompletion: Counter;

  // Cost (USD)
  llmCostUsd: Counter;

  // Latency
  llmRequestDuration: Histogram;   // seconds
  llmTimeToFirstToken: Histogram;  // seconds (streaming only)

  // Streaming
  llmStreamChunks: Counter;

  // Agent-level
  agentIterations:       Histogram;  // iterations per run
  agentRunDuration:      Histogram;  // seconds
  agentRuns:             Counter;
  agentErrors:           Counter;
  toolCallsTotal:        Counter;
  toolCallDuration:      Histogram;  // seconds

  // Context window
  contextWindowTokens: Histogram;  // tokens used per request
  contextWindowPct:    Histogram;  // fraction of model max context used

  // Vector / embedding
  embeddingRequests: Counter;
  embeddingDuration: Histogram;  // seconds
  vectorSearchLatency: Histogram;  // seconds
  vectorSearchResults: Histogram;  // number of results returned

  // Caching
  llmCacheHits:   Counter;
  llmCacheMisses: Counter;

  // User feedback (hallucination signal)
  hallucinationFeedback: Counter;  // label: {rating: "thumbs_up"|"thumbs_down"}
  thumbsUp:   Counter;
  thumbsDown: Counter;

  // Active requests (in-flight)
  activeRequests: UpDownCounter;
}

let _metrics: AIMetrics | null = null;

/**
 * Initialize AI metrics against the global OTel MeterProvider.
 * Call once at application startup, after configuring the OTel SDK.
 */
export function initAIMetrics(meterName = "cerebro.ai"): AIMetrics {
  if (_metrics) return _metrics;

  const meter: Meter = metrics.getMeter(meterName, "1.0.0");

  _metrics = {
    // ── LLM ─────────────────────────────────────────────────────────────────
    llmRequests: meter.createCounter("llm.requests.total", {
      description: "Total LLM API requests",
      valueType: ValueType.INT,
    }),
    llmErrors: meter.createCounter("llm.errors.total", {
      description: "Total LLM API errors",
      valueType: ValueType.INT,
    }),
    llmTokensPrompt: meter.createCounter("llm.tokens.prompt.total", {
      description: "Total prompt tokens sent to LLM providers",
      unit: "tokens",
      valueType: ValueType.INT,
    }),
    llmTokensCompletion: meter.createCounter("llm.tokens.completion.total", {
      description: "Total completion tokens received from LLM providers",
      unit: "tokens",
      valueType: ValueType.INT,
    }),
    llmCostUsd: meter.createCounter("llm.cost.usd.total", {
      description: "Total LLM API cost in USD",
      unit: "USD",
    }),
    llmRequestDuration: meter.createHistogram("llm.request.duration.seconds", {
      description: "LLM request duration from call to full response",
      unit: "s",
      advice: { explicitBucketBoundaries: [0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 30, 60] },
    }),
    llmTimeToFirstToken: meter.createHistogram("llm.time_to_first_token.seconds", {
      description: "Time from sending request to receiving first streaming token",
      unit: "s",
      advice: { explicitBucketBoundaries: [0.05, 0.1, 0.25, 0.5, 1, 2, 5] },
    }),
    llmStreamChunks: meter.createCounter("llm.stream.chunks.total", {
      description: "Total streaming chunks received",
      valueType: ValueType.INT,
    }),

    // ── Agent ────────────────────────────────────────────────────────────────
    agentIterations: meter.createHistogram("agent.iterations", {
      description: "Number of reasoning iterations per agent run",
      advice: { explicitBucketBoundaries: [1, 2, 3, 5, 8, 13, 20, 50] },
    }),
    agentRunDuration: meter.createHistogram("agent.run.duration.seconds", {
      description: "Total agent run duration including all LLM calls and tool uses",
      unit: "s",
      advice: { explicitBucketBoundaries: [1, 5, 10, 30, 60, 120, 300, 600] },
    }),
    agentRuns: meter.createCounter("agent.runs.total", {
      description: "Total agent run attempts",
      valueType: ValueType.INT,
    }),
    agentErrors: meter.createCounter("agent.errors.total", {
      description: "Total agent run failures",
      valueType: ValueType.INT,
    }),
    toolCallsTotal: meter.createCounter("agent.tool_calls.total", {
      description: "Total tool/function calls executed by agents",
      valueType: ValueType.INT,
    }),
    toolCallDuration: meter.createHistogram("agent.tool_call.duration.seconds", {
      description: "Duration of individual tool/function calls",
      unit: "s",
      advice: { explicitBucketBoundaries: [0.01, 0.05, 0.1, 0.5, 1, 5, 10] },
    }),

    // ── Context window ───────────────────────────────────────────────────────
    contextWindowTokens: meter.createHistogram("llm.context_window.tokens", {
      description: "Total tokens in context window (prompt) per request",
      unit: "tokens",
      advice: { explicitBucketBoundaries: [256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 128000] },
    }),
    contextWindowPct: meter.createHistogram("llm.context_window.utilization", {
      description: "Fraction of model's maximum context window used (0.0–1.0)",
      advice: { explicitBucketBoundaries: [0.1, 0.25, 0.5, 0.7, 0.85, 0.9, 0.95, 1.0] },
    }),

    // ── Embeddings / vector search ───────────────────────────────────────────
    embeddingRequests: meter.createCounter("embedding.requests.total", {
      description: "Total embedding generation requests",
      valueType: ValueType.INT,
    }),
    embeddingDuration: meter.createHistogram("embedding.duration.seconds", {
      description: "Duration of embedding generation requests",
      unit: "s",
      advice: { explicitBucketBoundaries: [0.05, 0.1, 0.25, 0.5, 1, 2] },
    }),
    vectorSearchLatency: meter.createHistogram("vector_search.duration.seconds", {
      description: "Duration of vector similarity search (Qdrant)",
      unit: "s",
      advice: { explicitBucketBoundaries: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5] },
    }),
    vectorSearchResults: meter.createHistogram("vector_search.results.count", {
      description: "Number of results returned per vector search",
      advice: { explicitBucketBoundaries: [1, 3, 5, 10, 20, 50, 100] },
    }),

    // ── Caching ───────────────────────────────────────────────────────────────
    llmCacheHits: meter.createCounter("llm.cache.hits.total", {
      description: "LLM prompt cache hits (semantic cache / prefix cache)",
      valueType: ValueType.INT,
    }),
    llmCacheMisses: meter.createCounter("llm.cache.misses.total", {
      description: "LLM prompt cache misses",
      valueType: ValueType.INT,
    }),

    // ── User feedback ─────────────────────────────────────────────────────────
    hallucinationFeedback: meter.createCounter("llm.feedback.total", {
      description: "User quality feedback on LLM responses",
      valueType: ValueType.INT,
    }),
    thumbsUp: meter.createCounter("llm.feedback.thumbs_up.total", {
      description: "Positive user feedback on LLM responses",
      valueType: ValueType.INT,
    }),
    thumbsDown: meter.createCounter("llm.feedback.thumbs_down.total", {
      description: "Negative user feedback on LLM responses (hallucination signal)",
      valueType: ValueType.INT,
    }),

    // ── Concurrency ───────────────────────────────────────────────────────────
    activeRequests: meter.createUpDownCounter("llm.active_requests", {
      description: "Number of LLM requests currently in flight",
      valueType: ValueType.INT,
    }),
  };

  return _metrics;
}

/** Get the singleton AIMetrics. Throws if initAIMetrics() was not called. */
export function getAIMetrics(): AIMetrics {
  if (!_metrics) {
    // Lazy-initialize with a no-op meter if OTel wasn't configured
    // (e.g., in tests). Counters/histograms will accept calls but emit nothing.
    return initAIMetrics();
  }
  return _metrics;
}
