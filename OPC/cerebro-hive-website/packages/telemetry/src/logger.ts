import { trace } from '@opentelemetry/api';
import { getCorrelationId } from './correlation';

function getTraceFields(): Record<string, string> {
  const span = trace.getActiveSpan();
  if (!span) return {};
  const { traceId, spanId } = span.spanContext();
  const correlationId = getCorrelationId();
  return {
    ...(traceId && { trace_id: traceId }),
    ...(spanId && { span_id: spanId }),
    ...(correlationId && { correlation_id: correlationId }),
  };
}

function write(level: string, msg: string, ctx?: Record<string, unknown>, err?: unknown) {
  const entry: Record<string, unknown> = {
    level,
    msg,
    timestamp: new Date().toISOString(),
    ...getTraceFields(),
    ...ctx,
  };
  if (err !== undefined) {
    if (err instanceof Error) {
      entry['error'] = { message: err.message, stack: err.stack, name: err.name };
    } else {
      entry['error'] = err;
    }
  }
  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else if (level === 'debug') {
    console.debug(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info:  (msg: string, ctx?: Record<string, unknown>) => write('info', msg, ctx),
  warn:  (msg: string, ctx?: Record<string, unknown>) => write('warn', msg, ctx),
  debug: (msg: string, ctx?: Record<string, unknown>) => write('debug', msg, ctx),
  error: (msg: string, err?: unknown, ctx?: Record<string, unknown>) => write('error', msg, ctx, err),
  /** Create a child logger with fixed context fields */
  child: (fields: Record<string, unknown>) => ({
    info:  (msg: string, ctx?: Record<string, unknown>) => write('info',  msg, { ...fields, ...ctx }),
    warn:  (msg: string, ctx?: Record<string, unknown>) => write('warn',  msg, { ...fields, ...ctx }),
    debug: (msg: string, ctx?: Record<string, unknown>) => write('debug', msg, { ...fields, ...ctx }),
    error: (msg: string, err?: unknown, ctx?: Record<string, unknown>) => write('error', msg, { ...fields, ...ctx }, err),
  }),
};
