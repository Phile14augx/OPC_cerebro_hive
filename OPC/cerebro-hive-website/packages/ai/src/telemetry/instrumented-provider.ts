/**
 * InstrumentedAIProvider
 *
 * A transparent decorator over any AIService implementation that records
 * all AI-native telemetry metrics automatically. Use it by wrapping any
 * provider at construction time:
 *
 *   const provider = new InstrumentedAIProvider(
 *     new AnthropicProvider(config),
 *     { workspaceId, agentType }
 *   );
 *
 * Every generateText / streamText / generateStructured call will then emit:
 *   - llm.requests.total
 *   - llm.tokens.prompt.total + llm.tokens.completion.total
 *   - llm.cost.usd.total
 *   - llm.request.duration.seconds
 *   - llm.context_window.tokens
 *   - llm.active_requests (gauge delta)
 *   - llm.errors.total (on failure)
 */

import { context, trace, SpanStatusCode } from "@opentelemetry/api";
import type {
  AIService,
  AIGenerateRequest,
  AIGenerateResult,
  AIStreamChunk,
} from "../service/AIService";
import { getAIMetrics, costUSD } from "./metrics";

// ── Model max context windows (tokens) for utilisation calculation ─────────────
const MODEL_MAX_CONTEXT: Record<string, number> = {
  "claude-opus-4-5":           200_000,
  "claude-sonnet-4-6":         200_000,
  "claude-haiku-4-5-20251001": 200_000,
  "gpt-4o":                    128_000,
  "gpt-4o-mini":               128_000,
  "gpt-4-turbo":               128_000,
  "gpt-3.5-turbo":              16_385,
  "gemini-1.5-pro":          1_048_576,
  "gemini-1.5-flash":        1_048_576,
};

export interface InstrumentationContext {
  /** Logical identifier of the owning workspace tenant */
  workspaceId?: string;
  /** Which CerebroForge agent is making this call (e.g. "architect", "codegen") */
  agentType?: string;
  /** Human-readable name of the feature/module (e.g. "RequirementsStudio") */
  feature?: string;
}

export class InstrumentedAIProvider implements AIService {
  private readonly inner: AIService;
  private readonly model: string;
  private readonly ctx: InstrumentationContext;
  private readonly tracer = trace.getTracer("cerebro.ai", "1.0.0");

  constructor(inner: AIService, model: string, ctx: InstrumentationContext = {}) {
    this.inner = inner;
    this.model  = model;
    this.ctx    = ctx;
  }

  // ── Common attribute set ───────────────────────────────────────────────────
  private attrs() {
    return {
      "gen_ai.system":          this.modelSystem(),
      "gen_ai.request.model":   this.model,
      "cerebro.workspace_id":   this.ctx.workspaceId ?? "unknown",
      "cerebro.agent_type":     this.ctx.agentType   ?? "unknown",
      "cerebro.feature":        this.ctx.feature      ?? "unknown",
    };
  }

  private modelSystem(): string {
    if (this.model.startsWith("claude"))   return "anthropic";
    if (this.model.startsWith("gpt"))      return "openai";
    if (this.model.startsWith("gemini"))   return "google";
    return "unknown";
  }

  // ── generateText ────────────────────────────────────────────────────────────
  async generateText(req: AIGenerateRequest): Promise<AIGenerateResult> {
    const m = getAIMetrics();
    const attrs = this.attrs();
    const span = this.tracer.startSpan("gen_ai.request", { attributes: attrs });

    m.activeRequests.add(1, attrs);
    m.llmRequests.add(1, attrs);

    const t0 = performance.now();
    try {
      const result = await context.with(
        trace.setSpan(context.active(), span),
        () => this.inner.generateText(req),
      );

      const durationSec = (performance.now() - t0) / 1000;
      const cost = costUSD(this.model, result.tokensIn, result.tokensOut);
      const maxCtx = MODEL_MAX_CONTEXT[this.model] ?? 128_000;

      // Record metrics
      m.llmTokensPrompt.add(result.tokensIn, attrs);
      m.llmTokensCompletion.add(result.tokensOut, attrs);
      m.llmCostUsd.add(cost, attrs);
      m.llmRequestDuration.record(durationSec, attrs);
      m.contextWindowTokens.record(result.tokensIn, attrs);
      m.contextWindowPct.record(result.tokensIn / maxCtx, attrs);

      // Enrich span
      span.setAttributes({
        "gen_ai.usage.prompt_tokens":     result.tokensIn,
        "gen_ai.usage.completion_tokens": result.tokensOut,
        "cerebro.ai.cost_usd":            cost,
        "cerebro.ai.duration_ms":         Math.round(durationSec * 1000),
      });
      span.setStatus({ code: SpanStatusCode.OK });

      return result;
    } catch (err) {
      m.llmErrors.add(1, { ...attrs, "error.type": (err as Error)?.constructor?.name ?? "Error" });
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
      span.recordException(err as Error);
      throw err;
    } finally {
      m.activeRequests.add(-1, attrs);
      span.end();
    }
  }

  // ── streamText ──────────────────────────────────────────────────────────────
  async *streamText(req: AIGenerateRequest): AsyncGenerator<AIStreamChunk> {
    const m = getAIMetrics();
    const attrs = this.attrs();
    const span = this.tracer.startSpan("gen_ai.stream", { attributes: attrs });

    m.activeRequests.add(1, attrs);
    m.llmRequests.add(1, { ...attrs, "gen_ai.stream": "true" });

    const t0 = performance.now();
    let firstChunk = true;
    let chunkCount = 0;

    try {
      for await (const chunk of context.with(
        trace.setSpan(context.active(), span),
        () => this.inner.streamText(req),
      )) {
        if (firstChunk) {
          m.llmTimeToFirstToken.record((performance.now() - t0) / 1000, attrs);
          firstChunk = false;
        }
        if (!chunk.done) {
          chunkCount++;
          m.llmStreamChunks.add(1, attrs);
        }
        yield chunk;
      }
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (err) {
      m.llmErrors.add(1, { ...attrs, "error.type": (err as Error)?.constructor?.name ?? "Error" });
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
      span.recordException(err as Error);
      throw err;
    } finally {
      m.activeRequests.add(-1, attrs);
      span.setAttributes({ "gen_ai.stream.chunk_count": chunkCount });
      span.end();
    }
  }

  // ── generateStructured ───────────────────────────────────────────────────────
  async generateStructured<T>(
    req: AIGenerateRequest & { schema: string; schemaDescription: string },
  ): Promise<T> {
    const m = getAIMetrics();
    const attrs = { ...this.attrs(), "gen_ai.output_type": "structured" };
    const span = this.tracer.startSpan("gen_ai.structured", { attributes: attrs });

    m.activeRequests.add(1, attrs);
    m.llmRequests.add(1, attrs);

    const t0 = performance.now();
    try {
      const result = await context.with(
        trace.setSpan(context.active(), span),
        () => this.inner.generateStructured<T>(req),
      );
      span.setAttributes({ "gen_ai.duration_ms": Math.round(performance.now() - t0) });
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      m.llmErrors.add(1, { ...attrs, "error.type": (err as Error)?.constructor?.name ?? "Error" });
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
      span.recordException(err as Error);
      throw err;
    } finally {
      m.activeRequests.add(-1, attrs);
      span.end();
    }
  }
}

// ── Agent instrumentation helpers ─────────────────────────────────────────────

export interface AgentRunContext {
  agentType: string;
  workspaceId?: string;
  feature?: string;
}

/**
 * Wrap an async agent function with iteration + duration + error tracking.
 *
 * Usage:
 *   const result = await withAgentTelemetry({ agentType: "codegen" }, async (iter) => {
 *     let i = 0;
 *     while (!done) { iter(); ... }
 *     return result;
 *   });
 */
export async function withAgentTelemetry<T>(
  ctx: AgentRunContext,
  fn: (recordIteration: () => void) => Promise<T>,
): Promise<T> {
  const m = getAIMetrics();
  const attrs = {
    "cerebro.agent_type":   ctx.agentType,
    "cerebro.workspace_id": ctx.workspaceId ?? "unknown",
    "cerebro.feature":      ctx.feature     ?? "unknown",
  };

  m.agentRuns.add(1, attrs);
  const t0 = performance.now();
  let iterations = 0;

  try {
    const result = await fn(() => { iterations++; });
    const durationSec = (performance.now() - t0) / 1000;
    m.agentRunDuration.record(durationSec, attrs);
    m.agentIterations.record(iterations, attrs);
    return result;
  } catch (err) {
    m.agentErrors.add(1, { ...attrs, "error.type": (err as Error)?.constructor?.name ?? "Error" });
    throw err;
  }
}

/**
 * Record a tool call with duration tracking.
 *
 * Usage:
 *   const result = await withToolTelemetry({ agentType: "codegen", toolName: "readFile" }, fn);
 */
export async function withToolTelemetry<T>(
  ctx: { agentType: string; toolName: string; workspaceId?: string },
  fn: () => Promise<T>,
): Promise<T> {
  const m = getAIMetrics();
  const attrs = {
    "cerebro.agent_type":   ctx.agentType,
    "cerebro.tool_name":    ctx.toolName,
    "cerebro.workspace_id": ctx.workspaceId ?? "unknown",
  };

  m.toolCallsTotal.add(1, attrs);
  const t0 = performance.now();
  try {
    const result = await fn();
    m.toolCallDuration.record((performance.now() - t0) / 1000, attrs);
    return result;
  } catch (err) {
    m.toolCallDuration.record((performance.now() - t0) / 1000, { ...attrs, "error": "true" });
    throw err;
  }
}

/**
 * Record vector search latency and result count.
 *
 * Usage:
 *   const hits = await withVectorSearchTelemetry(
 *     { collection: "knowledge", workspaceId },
 *     () => qdrant.search(...)
 *   );
 */
export async function withVectorSearchTelemetry<T extends { length: number }>(
  ctx: { collection: string; workspaceId?: string },
  fn: () => Promise<T>,
): Promise<T> {
  const m = getAIMetrics();
  const attrs = {
    "cerebro.vector.collection": ctx.collection,
    "cerebro.workspace_id":      ctx.workspaceId ?? "unknown",
  };

  const t0 = performance.now();
  const results = await fn();
  m.vectorSearchLatency.record((performance.now() - t0) / 1000, attrs);
  m.vectorSearchResults.record(results.length, attrs);
  return results;
}

/**
 * Record user feedback on an LLM response.
 * Call from the thumbs-up/thumbs-down API endpoints.
 */
export function recordLLMFeedback(
  rating: "thumbs_up" | "thumbs_down",
  ctx: { model: string; agentType?: string; workspaceId?: string },
) {
  const m = getAIMetrics();
  const attrs = {
    "gen_ai.request.model":   ctx.model,
    "cerebro.agent_type":     ctx.agentType   ?? "unknown",
    "cerebro.workspace_id":   ctx.workspaceId ?? "unknown",
    "cerebro.feedback.rating": rating,
  };
  m.hallucinationFeedback.add(1, attrs);
  if (rating === "thumbs_up")   m.thumbsUp.add(1, attrs);
  if (rating === "thumbs_down") m.thumbsDown.add(1, attrs);
}
