import { describe, it, expect, vi } from 'vitest';
import { MockTelemetryFacade, Telemetry } from './Telemetry';

describe('Telemetry Contract', () => {
  it('should start a span via MockTelemetryFacade', () => {
    const facade = new MockTelemetryFacade();
    const span = facade.startSpan('test-span');
    expect(span).toBeDefined();
    expect(span.end).toBeTypeOf('function');
    expect(span.setAttribute).toBeTypeOf('function');
  });

  it('should delegate to instance via Telemetry singleton (Negative Control)', () => {
    const mockImpl = new MockTelemetryFacade();
    const spy = vi.spyOn(mockImpl, 'startSpan');
    Telemetry.setInstance(mockImpl);
    Telemetry.startSpan('verify-delegation');
    expect(spy).toHaveBeenCalledWith('verify-delegation', undefined, undefined);
  });
});
