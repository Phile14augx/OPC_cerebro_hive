// =============================================================================
// CerebroHive — Span utilities and AI-specific span attributes
// =============================================================================

import {
  trace,
  context,
  SpanStatusCode,
  SpanKind,
  type Span,
  type Tracer,
  type Attributes,
} from '@opentelemetry/api';

// ─── Semantic conventions for AI (GenAI) ─────────────────────────────────────
// Based on OpenTelemetry GenAI semantic conventions (experimental)

export const AI_ATTRS = {
  SYSTEM: 'gen_ai.system',
  REQUEST_MODEL: 'gen_ai.request.model',
  RESPONSE_MODEL: 'gen_ai.response.model',
  INPUT_TOKENS: 'gen_ai.usage.input_tokens',
  OUTPUT_TOKENS: 'gen_ai.usage.output_tokens',
  MAX_TOKENS: 'gen_ai.request.max_tokens',
  TEMPERATURE: 'gen_ai.request.temperature',
  TOP_P: 'gen_ai.request.top_p',
  FINISH_REASON: 'gen_ai.response.finish_reasons',
  STREAM: 'gen_ai.request.stream',
  // CerebroHive extensions
  COST_USD: 'cerebro.ai.cost_usd',
  TTFT_MS: 'cerebro.ai.ttft_ms',
  CACHE_HIT: 'cerebro.ai.cache_hit',
  ORG_ID: 'cerebro.organization_id',
  WORKFLOW_ID: 'cerebro.workflow_id',
  AGENT_ID: 'cerebro.agent_id',
} as const;

// ─── Tracer factory ───────────────────────────────────────────────────────────

export function getTracer(name = 'cerebro-hive', version?: string): Tracer {
  return trace.getTracer(name, version ?? process.env.npm_package_version);
}

// ─── withSpan helper ─────────────────────────────────────────────────────────

/**
 * Wrap an async function in a span. Automatically sets status and records
 * exceptions on error.
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  opts?: {
    attributes?: Attributes;
    kind?: SpanKind;
    tracerName?: string;
  }
): Promise<T> {
  const tracer = getTracer(opts?.tracerName);

  return tracer.startActiveSpan(
    name,
    { kind: opts?.kind ?? SpanKind.INTERNAL, attributes: opts?.attributes },
    async (span) => {
      try {
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (err) {
        span.recordException(err as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: err instanceof Error ? err.message : String(err),
        });
        throw err;
      } finally {
        span.end();
      }
    }
  );
}

// ─── AI request span ─────────────────────────────────────────────────────────

export interface AISpanOptions {
  provider: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
  organizationId?: string;
  workflowId?: string;
  agentId?: string;
}

export interface AISpanResult {
  inputTokens?: number;
  outputTokens?: number;
  finishReason?: string;
  costUSD?: number;
  ttftMs?: number;
  cacheHit?: boolean;
  responseModel?: string;
}

/**
 * Wrap an AI provider call in a properly attributed span.
 * The span name follows OpenTelemetry GenAI convention: "chat <model>"
 */
export async function withAISpan<T>(
  fn: (span: Span) => Promise<T>,
  opts: AISpanOptions,
  getResult?: (result: T) => AISpanResult
): Promise<T> {
  const spanName = `chat ${opts.model}`;

  return withSpan(
    spanName,
    async (span) => {
      span.setAttributes({
        [AI_ATTRS.SYSTEM]: opts.provider,
        [AI_ATTRS.REQUEST_MODEL]: opts.model,
        [AI_ATTRS.STREAM]: opts.stream ?? false,
        ...(opts.maxTokens !== undefined && { [AI_ATTRS.MAX_TOKENS]: opts.maxTokens }),
        ...(opts.temperature !== undefined && { [AI_ATTRS.TEMPERATURE]: opts.temperature }),
        ...(opts.topP !== undefined && { [AI_ATTRS.TOP_P]: opts.topP }),
        ...(opts.organizationId && { [AI_ATTRS.ORG_ID]: opts.organizationId }),
        ...(opts.workflowId && { [AI_ATTRS.WORKFLOW_ID]: opts.workflowId }),
        ...(opts.agentId && { [AI_ATTRS.AGENT_ID]: opts.agentId }),
      });

      const result = await fn(span);

      if (getResult) {
        const r = getResult(result);
        span.setAttributes({
          ...(r.inputTokens !== undefined && { [AI_ATTRS.INPUT_TOKENS]: r.inputTokens }),
          ...(r.outputTokens !== undefined && { [AI_ATTRS.OUTPUT_TOKENS]: r.outputTokens }),
          ...(r.finishReason && { [AI_ATTRS.FINISH_REASON]: [r.finishReason] }),
          ...(r.costUSD !== undefined && { [AI_ATTRS.COST_USD]: r.costUSD }),
          ...(r.ttftMs !== undefined && { [AI_ATTRS.TTFT_MS]: r.ttftMs }),
          ...(r.cacheHit !== undefined && { [AI_ATTRS.CACHE_HIT]: r.cacheHit }),
          ...(r.responseModel && { [AI_ATTRS.RESPONSE_MODEL]: r.responseModel }),
        });
      }

      return result;
    },
    { kind: SpanKind.CLIENT, tracerName: 'cerebro-hive.ai' }
  );
}

// ─── Context propagation helpers ──────────────────────────────────────────────

/** Extract trace context from an HTTP headers map (for server-side receiving) */
export function extractContext(headers: Record<string, string | string[] | undefined>) {
  const { propagation } = require('@opentelemetry/api');
  return propagation.extract(context.active(), headers);
}

/** Inject trace context into an outgoing headers map */
export function injectContext(headers: Record<string, string>) {
  const { propagation } = require('@opentelemetry/api');
  propagation.inject(context.active(), headers);
  return headers;
}

/** Get current trace + span IDs for log correlation */
export function getCurrentTraceContext(): {
  traceId?: string;
  spanId?: string;
  traceFlags?: number;
} {
  const span = trace.getActiveSpan();
  if (!span) return {};
  const { traceId, spanId, traceFlags } = span.spanContext();
  return { traceId, spanId, traceFlags };
}
