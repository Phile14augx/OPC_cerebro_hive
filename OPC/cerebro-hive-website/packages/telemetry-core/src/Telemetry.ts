export interface TelemetryConfig {
  serviceName: string;
  version?: string;
  environment?: string;
}

export interface Span {
  end(): void;
  recordException(e: Error): void;
  setAttribute(key: string, value: string | number | boolean): void;
}

export interface TelemetryFacade {
  startSpan(name: string, attributes?: Record<string, any>): Span;
  recordMetric(name: string, value: number, attributes?: Record<string, any>): void;
  recordLog(message: string, level?: 'info' | 'warn' | 'error', attributes?: Record<string, any>): void;
  recordEvent(name: string, attributes?: Record<string, any>): void;
}

export class MockTelemetryFacade implements TelemetryFacade {
  startSpan(name: string, attributes?: Record<string, any>): Span {
    // In real implementation, this wraps OTel Tracer.startSpan
    return {
      end: () => {},
      recordException: (e: Error) => console.error(`[Telemetry Span Exception] ${name}:`, e),
      setAttribute: (key, value) => {}
    };
  }

  recordMetric(name: string, value: number, attributes?: Record<string, any>): void {
    // In real implementation, this maps to OTel Meter / Counter / Histogram
  }

  recordLog(message: string, level: 'info' | 'warn' | 'error' = 'info', attributes?: Record<string, any>): void {
    // In real implementation, maps to OTel Logger
    console[level](`[Telemetry Log] ${message}`, attributes || '');
  }

  recordEvent(name: string, attributes?: Record<string, any>): void {
    // Maps to span events or structured logs
  }
}

let instance: TelemetryFacade = new MockTelemetryFacade();

export const Telemetry = {
  setInstance(impl: TelemetryFacade) {
    instance = impl;
  },
  
  startSpan(name: string, attributes?: Record<string, any>): Span {
    return instance.startSpan(name, attributes);
  },

  recordMetric(name: string, value: number, attributes?: Record<string, any>): void {
    return instance.recordMetric(name, value, attributes);
  },

  recordLog(message: string, level?: 'info' | 'warn' | 'error', attributes?: Record<string, any>): void {
    return instance.recordLog(message, level, attributes);
  },

  recordEvent(name: string, attributes?: Record<string, any>): void {
    return instance.recordEvent(name, attributes);
  }
};
