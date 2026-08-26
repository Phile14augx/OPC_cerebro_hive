import { describe, it, expect } from 'vitest';
import type { PlatformHealth } from './TelemetryTypes';

describe('TelemetryAPI Types Contract', () => {
  it('should construct valid PlatformHealth in healthy state', () => {
    const health: PlatformHealth = { status: 'healthy', uptimePercentage: 99.9, lastIncidentMs: 0 };
    expect(health.status).toBe('healthy');
  });

  it('should detect degraded status (Negative Control)', () => {
    const health: PlatformHealth = { status: 'degraded', uptimePercentage: 94.0, lastIncidentMs: 3600000 };
    expect(health.status).not.toBe('healthy');
  });
});
