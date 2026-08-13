import { describe, expect, it } from 'vitest';
import { simulateEntityObservation, simulateFactoryTick } from './observation-simulator';

describe('observation simulator', () => {
  it('labels factory anomaly observations as simulated', () => {
    const normal = simulateFactoryTick(0, new Date('2026-08-11T00:00:00Z'));
    const anomaly = simulateFactoryTick(4, new Date('2026-08-11T00:04:00Z'));
    expect(normal.alert).toBeUndefined();
    expect(anomaly.alert?.entityId).toBe('motor-07');
    expect(anomaly.alert?.provenance.classification).toBe('SIMULATED');
  });

  it('simulates hospital occupancy from variable keys rather than industry switches', () => {
    const observation = simulateEntityObservation({
      entityKey: 'icu-bed-12',
      variables: [
        { key: 'occupancy', unit: 'boolean' },
        { key: 'turnover-minutes', unit: 'min' },
      ],
      tick: 6,
    });
    expect(observation.provenance.classification).toBe('SIMULATED');
    expect(observation.state.occupancy).toBe(false);
    expect(observation.state['turnover-minutes']).toBe(48);
    expect(observation.alert?.reason).toMatch(/turnover/i);
  });
});
