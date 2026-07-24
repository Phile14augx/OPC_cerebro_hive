import { IdentityContext } from '@cerebro/identity-core';

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
  startSpan(name: string, identity?: IdentityContext, attributes?: Record<string, any>): Span;
  recordMetric(name: string, value: number, identity?: IdentityContext, attributes?: Record<string, any>): void;
  recordLog(message: string, level?: 'info' | 'warn' | 'error', identity?: IdentityContext, attributes?: Record<string, any>): void;
  recordEvent(name: string, identity?: IdentityContext, attributes?: Record<string, any>): void;
}

export class MockTelemetryFacade implements TelemetryFacade {
  startSpan(name: string, identity?: IdentityContext, attributes?: Record<string, any>): Span {
    // Inject identity into span attributes
    if (identity) {
      attributes = {
        ...attributes,
        'auth.principal.id': identity.currentPrincipal.id,
        'auth.principal.type': identity.currentPrincipal.type,
        'auth.tenant.org': identity.tenancy.organizationId,
        'auth.tenant.ws': identity.tenancy.workspaceId || 'global',
        'auth.session.id': identity.session?.id || 'none',
        'auth.delegation.depth': identity.delegationChain.length
      };
    }
    
    return {
      end: () => {},
      recordException: (e: Error) => console.error(`[Telemetry Span Exception] ${name}:`, e),
      setAttribute: (key, value) => {}
    };
  }

  recordMetric(name: string, value: number, identity?: IdentityContext, attributes?: Record<string, any>): void {
    // Maps to OTel Meter / Counter / Histogram
  }

  recordLog(message: string, level: 'info' | 'warn' | 'error' = 'info', identity?: IdentityContext, attributes?: Record<string, any>): void {
    console[level](`[Telemetry Log] ${message}`, attributes || '');
  }

  recordEvent(name: string, identity?: IdentityContext, attributes?: Record<string, any>): void {
    // Maps to span events or structured logs
  }
}

let instance: TelemetryFacade = new MockTelemetryFacade();

export const Telemetry = {
  setInstance(impl: TelemetryFacade) {
    instance = impl;
  },
  
  startSpan(name: string, identity?: IdentityContext, attributes?: Record<string, any>): Span {
    return instance.startSpan(name, identity, attributes);
  },

  recordMetric(name: string, value: number, identity?: IdentityContext, attributes?: Record<string, any>): void {
    return instance.recordMetric(name, value, identity, attributes);
  },

  recordLog(message: string, level?: 'info' | 'warn' | 'error', identity?: IdentityContext, attributes?: Record<string, any>): void {
    return instance.recordLog(message, level, identity, attributes);
  },

  recordEvent(name: string, identity?: IdentityContext, attributes?: Record<string, any>): void {
    return instance.recordEvent(name, identity, attributes);
  }
};
