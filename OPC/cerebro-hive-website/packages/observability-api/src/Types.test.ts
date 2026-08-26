import { describe, it, expect } from 'vitest';
import type { Trace } from './Types';

describe('ObservabilityAPI Types Contract', () => {
  it('should construct a valid Trace', () => {
    const trace: Trace = { traceId: 't-1', rootSpan: 's-1', durationMs: 42, error: false };
    expect(trace.error).toBe(false);
  });

  it('should detect trace with error (Negative Control)', () => {
    const trace: Trace = { traceId: 't-2', rootSpan: 's-2', durationMs: 100, error: true };
    expect(trace.error).toBe(true);
  });
});
