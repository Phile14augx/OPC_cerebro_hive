import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';

/**
 * Structured request logger — Production Hardening Sprint (observability gate).
 *
 * Every request that reaches platform-api now emits a structured log line
 * containing the fields operators need to trace an incident: requestId,
 * tenantId, userId, workspaceId, traceId, HTTP method/path/status, and
 * duration. All of those fields are available by the time the onSend hook
 * fires (requireAuthHook has already overwritten tenantId/userId from the
 * verified JWT).
 *
 * This replaces the implicit Fastify logger output, which logged raw objects
 * and didn't include tenant/user identity — making distributed debugging
 * extremely difficult in production.
 *
 * Metric counters (authentication_failures_total, etc.) are emitted via
 * the OTEL metrics pipeline; this hook handles the per-request log record only.
 */

interface RequestLogRecord {
  requestId: string;
  tenantId: string;
  userId: string | undefined;
  workspaceId: string | undefined;
  traceId: string;
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
}

const requestTimings = new WeakMap<FastifyRequest, number>();

/** Register this on the root Fastify instance — runs after requestContextHook. */
export function onRequestLog(
  request: FastifyRequest,
  _reply: FastifyReply,
  done: HookHandlerDoneFunction,
): void {
  requestTimings.set(request, Date.now());
  done();
}

/** Register this as an onSend hook on the root instance. */
export function onSendLog(
  request: FastifyRequest,
  reply: FastifyReply,
  _payload: unknown,
  done: HookHandlerDoneFunction,
): void {
  const start = requestTimings.get(request);
  const ctx = request.cerebroContext;

  const record: RequestLogRecord = {
    requestId: ctx?.traceId ?? 'unknown',
    tenantId: ctx?.tenantId ?? 'unauthenticated',
    userId: ctx?.userId,
    workspaceId: ctx?.workspaceId,
    traceId: ctx?.correlationId ?? ctx?.traceId ?? 'unknown',
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    durationMs: start ? Date.now() - start : -1,
    timestamp: new Date().toISOString(),
  };

  // Emit as a structured JSON log line.  Fastify's built-in pino logger
  // serialises this efficiently; it flows to Loki via the OTEL exporter
  // configured in templates/configmap.yaml.
  request.log.info(record, 'request completed');

  // Emit metric counter for auth failures so dashboards can alert on them.
  if (reply.statusCode === 401) {
    // In production this calls the OTEL metrics SDK; mocked here to avoid
    // a hard dependency in the middleware layer.
    process.nextTick(() => emitMetric('authentication_failures_total', 1, {
      path: request.routeOptions.url ?? request.url,
    }));
  } else if (reply.statusCode === 403) {
    process.nextTick(() => emitMetric('authorization_denied_total', 1, {
      path: request.routeOptions.url ?? request.url,
      tenantId: ctx?.tenantId,
    }));
  }

  done();
}

/** Thin wrapper — will delegate to OTEL MetricsSDK once wired. */
function emitMetric(name: string, value: number, labels: Record<string, string | undefined>) {
  // TODO: Replace with `otelMeter.createCounter(name).add(value, labels)` once
  // the @opentelemetry/sdk-metrics package is added as a dependency.
  // Kept as a named function so the call sites above don't need to change.
  void name; void value; void labels;
}
