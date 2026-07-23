// =============================================================================
// CerebroHive — OTel HTTP middleware for Express, Fastify, and Next.js
// =============================================================================

import { SpanStatusCode, SpanKind, trace, context } from '@opentelemetry/api';
import type { Request, Response, NextFunction } from 'express';
import { getHttpMetrics } from './metrics';
import { getCurrentTraceContext } from './spans';

// ─── Express middleware ───────────────────────────────────────────────────────

/**
 * Express middleware that:
 * 1. Measures request duration
 * 2. Records HTTP metrics (requests total, latency histogram)
 * 3. Injects trace context into response headers (for frontend correlation)
 * 4. Adds trace IDs to the log context
 */
export function expressTelemetryMiddleware() {
  return function cerebroTelemetry(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const metrics = getHttpMetrics();

    metrics.activeConnections.add(1);

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const attrs = {
        'http.method': req.method,
        'http.route': (req as any).route?.path ?? req.path,
        'http.status_code': String(res.statusCode),
        'http.flavor': '1.1',
      };

      metrics.requestDuration.record(durationMs, attrs);
      metrics.requestsTotal.add(1, attrs);
      metrics.activeConnections.add(-1);
    });

    // Inject trace ID header so frontend can correlate logs
    const { traceId, spanId } = getCurrentTraceContext();
    if (traceId) res.setHeader('X-Trace-Id', traceId);
    if (spanId) res.setHeader('X-Span-Id', spanId);

    next();
  };
}

// ─── Next.js middleware helper ────────────────────────────────────────────────

/**
 * Wrap a Next.js API route handler with telemetry.
 * Usage: export default withNextTelemetry(handler)
 */
export function withNextTelemetry<
  Req extends { method?: string; url?: string; headers: Record<string, any> },
  Res extends { status: (code: number) => any; setHeader?: (k: string, v: string) => void }
>(
  handler: (req: Req, res: Res) => Promise<void>,
  routeName?: string
) {
  return async function telemetryWrapper(req: Req, res: Res) {
    const tracer = trace.getTracer('cerebro-hive.nextjs');
    const start = Date.now();

    return tracer.startActiveSpan(
      routeName ?? `${req.method} ${req.url}`,
      { kind: SpanKind.SERVER },
      async (span) => {
        try {
          span.setAttributes({
            'http.method': req.method ?? 'UNKNOWN',
            'http.target': req.url ?? '',
            'http.scheme': 'https',
          });

          const { traceId, spanId } = getCurrentTraceContext();
          if (traceId && res.setHeader) res.setHeader('X-Trace-Id', traceId);

          await handler(req, res);

          span.setStatus({ code: SpanStatusCode.OK });
        } catch (err) {
          span.recordException(err as Error);
          span.setStatus({ code: SpanStatusCode.ERROR });
          throw err;
        } finally {
          span.setAttributes({ 'http.request.duration_ms': Date.now() - start });
          span.end();
        }
      }
    );
  };
}

// ─── Health endpoint — excludes from tracing ─────────────────────────────────

const UNTRACED_PATHS = new Set(['/health', '/healthz', '/metrics', '/ready', '/live']);

export function isUntracedPath(path: string): boolean {
  return UNTRACED_PATHS.has(path) || path.startsWith('/_next/');
}
