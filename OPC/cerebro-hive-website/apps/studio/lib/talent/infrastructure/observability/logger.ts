/**
 * Core Observability and Telemetry Wrapper
 * Wraps console logs for now, but provides the interface to swap in OpenTelemetry or DataDog later.
 */

export interface LogContext {
  userId?: string;
  attemptId?: string;
  envId?: string;
  organizationId?: string;
  [key: string]: any;
}

export class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private format(level: string, message: string, context?: LogContext) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      context,
    });
  }

  info(message: string, context?: LogContext) {
    console.log(this.format('INFO', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.format('WARN', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorData = error instanceof Error ? { errorName: error.name, errorMsg: error.message, stack: error.stack } : { error };
    console.error(this.format('ERROR', message, { ...context, ...errorData }));
  }
}
