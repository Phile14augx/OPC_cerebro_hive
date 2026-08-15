import { describe, it, expect } from 'vitest';
import { DeterministicReducer, ReplayContext } from '@cerebro/runtime-contracts';

describe('Replay Determinism', () => {
  it('should produce byte-for-byte identical state across multiple replays', () => {
    // A mock reducer simulating a business aggregate
    const mockReducer: DeterministicReducer<any, any> = (state, event, context) => {
      // Must use ReplayContext, not Date.now() or Math.random()
      return {
        ...state,
        count: (state.count || 0) + 1,
        lastUpdated: context.clock.toISOString(),
        id: context.random.uuid(),
        history: [...(state.history || []), event.payload.value]
      };
    };

    const mockEvents = [
      { type: 'EventA', payload: { value: 10 } },
      { type: 'EventB', payload: { value: 20 } },
      { type: 'EventC', payload: { value: 30 } }
    ] as any[];

    // Deterministic Context Mock
    const createSeededContext = (seed: number): ReplayContext => {
      let callCount = 0;
      return {
        clock: {
          now: () => 1000000 + (seed * 10) + callCount,
          toISOString: () => new Date(1000000 + (seed * 10) + callCount).toISOString()
        },
        random: {
          next: () => 0.5 + (seed * 0.01),
          uuid: () => `uuid-${seed}-${callCount++}`
        },
        isReplaying: true
      };
    };

    // Replay 1
    let state1 = {};
    const context1 = createSeededContext(42);
    for (const event of mockEvents) {
      state1 = mockReducer(state1, event, context1);
    }

    // Replay 2 (same seed)
    let state2 = {};
    const context2 = createSeededContext(42);
    for (const event of mockEvents) {
      state2 = mockReducer(state2, event, context2);
    }

    // Replay 3 (same seed)
    let state3 = {};
    const context3 = createSeededContext(42);
    for (const event of mockEvents) {
      state3 = mockReducer(state3, event, context3);
    }

    // Assert absolute byte-for-byte structural equality
    expect(JSON.stringify(state1)).toBe(JSON.stringify(state2));
    expect(JSON.stringify(state2)).toBe(JSON.stringify(state3));
    expect(state1).toEqual(state3);
  });
});
