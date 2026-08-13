import { describe, expect, it } from 'vitest';
import { evaluateScenario } from './scenario-engine';

describe('scenario engine', () => {
  it('forks a snapshot and never mutates live state', () => {
    const live = [{ entityId: 'motor-07', entityKey: 'motor-07', state: { vibration: 7.2 } }];
    const frozen = structuredClone(live);
    const result = evaluateScenario(
      'ENTITY_OUTAGE',
      { entityId: 'motor-07', throughputChangePercent: -23, downtimeHours: 4.5 },
      live,
    );
    expect(result.isolation).toBe('SNAPSHOT_FORK');
    expect(result.result['throughputChangePercent']).toBe(-23);
    expect(result.snapshot[0]?.state['available']).toBe(false);
    expect(live).toEqual(frozen);
  });

  it('rejects an outage against an unknown entity', () => {
    expect(() =>
      evaluateScenario('ENTITY_OUTAGE', { entityId: 'missing' }, [
        { entityId: 'icu-bed-12', state: { occupancy: true } },
      ]),
    ).toThrow('ENTITY_NOT_FOUND');
  });
});
