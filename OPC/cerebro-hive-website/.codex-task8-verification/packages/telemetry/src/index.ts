// =============================================================================
// @cerebro/telemetry — Public API
// =============================================================================

// SDK init + shutdown
export { initTelemetry, shutdownTelemetry } from './tracer';
export type { TelemetryConfig } from './tracer';

// Span utilities
export {
  getTracer,
  withSpan,
  withAISpan,
  extractContext,
  injectContext,
  getCurrentTraceContext,
  AI_ATTRS,
} from './spans';
export type { AISpanOptions, AISpanResult } from './spans';

// Metrics
export {
  getMeter,
  getAIMetrics,
  getHttpMetrics,
  getBusinessMetrics,
  recordAIRequest,
} from './metrics';
export type { AIMetrics, HttpMetrics, BusinessMetrics } from './metrics';

// HTTP middleware
export {
  expressTelemetryMiddleware,
  withNextTelemetry,
  isUntracedPath,
} from './middleware';

// Correlation / context propagation
export { correlationStorage, withCorrelationId, getCorrelationId } from './correlation';

// Structured logger with trace context injection
export { logger } from './logger';

// Re-export OTel API for convenience
export {
  trace,
  metrics,
  context,
  propagation,
  SpanStatusCode,
  SpanKind,
} from '@opentelemetry/api';
export type { Span, Tracer, Meter, Attributes } from '@opentelemetry/api';
