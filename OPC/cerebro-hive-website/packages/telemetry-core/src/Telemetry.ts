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
  startSpan(name: string, identity?: IdentityContext, attributes?: Record<string, unknown>): Span;
  recordMetric(name: string, value: number, identity?: IdentityContext, attributes?: Record<string, unknown>): void;
  recordLog(message: string, level?: 'info' | 'warn' | 'error', identity?: IdentityContext, attributes?: Record<string, unknown>): void;
  recordEvent(name: string, identity?: IdentityContext, attributes?: Record<string, unknown>): void;
}

export class MockTelemetryFacade implements TelemetryFacade {
  startSpan(name: string, identity?: IdentityContext, attributes?: Record<string, unknown>): Span {
    // Inject identity into span attributes
    let _injectedAttributes = attributes;
    if (identity) {
      _injectedAttributes = {
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
      setAttribute: (_key, _value) => {}
    };
  }

  recordMetric(_name: string, _value: number, _identity?: IdentityContext, _attributes?: Record<string, unknown>): void {
    // Maps to OTel Meter / Counter / Histogram
  }

  recordLog(message: string, level: 'info' | 'warn' | 'error' = 'info', _identity?: IdentityContext, attributes?: Record<string, unknown>): void {
    console[level](`[Telemetry Log] ${message}`, attributes || '');
  }

  recordEvent(_name: string, _identity?: IdentityContext, _attributes?: Record<string, unknown>): void {
    // Maps to span events or structured logs
  }
}

let instance: TelemetryFacade = new MockTelemetryFacade();

export const Telemetry = {
  setInstance(impl: TelemetryFacade) {
    instance = impl;
  },
  
  startSpan(name: string, identity?: IdentityContext, attributes?: Record<string, unknown>): Span {
    return instance.startSpan(name, identity, attributes);
  },

  recordMetric(name: string, value: number, identity?: IdentityContext, attributes?: Record<string, unknown>): void {
    return instance.recordMetric(name, value, identity, attributes);
  },

  recordLog(message: string, level?: 'info' | 'warn' | 'error', identity?: IdentityContext, attributes?: Record<string, unknown>): void {
    return instance.recordLog(message, level, identity, attributes);
  },

  recordEvent(name: string, identity?: IdentityContext, attributes?: Record<string, unknown>): void {
    return instance.recordEvent(name, identity, attributes);
  }
};
