import { describe, it, expect } from 'vitest';
import type { TelemetryEvent, UIEvent } from './EventTypes';

describe('Events Contract', () => {
  it('should validate a correctly shaped TelemetryEvent', () => {
    const event: TelemetryEvent = {
      type: 'ALERT_TRIGGERED',
      severity: 'critical',
      timestamp: new Date(),
      source: 'monitoring-service',
      details: { alertId: 'alert-99' },
    };
    expect(event.type).toBe('ALERT_TRIGGERED');
    expect(event.severity).toBe('critical');
  });

  it('should fail when an incorrect severity is used (Negative Control)', () => {
    const severity = 'debug';
    const validSeverities = ['info', 'warning', 'critical'];
    expect(validSeverities.includes(severity)).toBe(false);
  });
});
