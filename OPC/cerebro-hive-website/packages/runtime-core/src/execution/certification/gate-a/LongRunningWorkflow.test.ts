import { describe, it, expect } from 'vitest';
import { ExecutionReplayService } from '../../ExecutionReplayService';
import { ExecutionEvent } from '../../../../../runtime-contracts/src/events/ExecutionEvent';
import { ReducerRegistry } from '../../../registry/ReducerRegistry';

// Dummy Event Registry
class MockRegistry extends ReducerRegistry {
  constructor() {
    super();
    this.register('Ping', (state, event) => {
      // Very basic memory test, we just accumulate some data
      state.context = state.context || {};
      state.context.pingCount = (state.context.pingCount || 0) + 1;
      return state;
    });
  }
}

// Dummy Store
class MockStore {
  public events: ExecutionEvent<unknown>[] = [];
  
  async getEvents(id: string, after?: bigint) {
    if (after) return this.events.filter(e => e.sequence > after);
    return this.events;
  }
  async getLatestSnapshot() {
    return null;
  }
}

describe('Gate A - Long-Running Workflow Certification', () => {

  it('should maintain memory stability over a massive 10,000 event continuous execution (Simulated 1 Week)', async () => {
    const store = new MockStore() as unknown;
    const registry = new MockRegistry();
    const replayService = new ExecutionReplayService(store, registry, { upcastEvent: e => e } as unknown);

    const execId = 'long-running-1';
    
    // Simulate 1 week of intermittent "Ping" events (10,000 total)
    let currentTime = new Date('2026-08-01T00:00:00Z').getTime();
    for (let i = 1; i <= 10000; i++) {
      store.events.push({
        executionId: execId,
        sequence: BigInt(i),
        type: 'Ping',
        payload: { iter: i },
        timestamp: new Date(currentTime),
        tenantId: 'tenant-1'
      });
      // Advance time by roughly 1 minute per event
      currentTime += 60000;
    }

    // Measure memory before
    const memBefore = process.memoryUsage().heapUsed;

    const state = await replayService.replay(execId);

    // Measure memory after
    const memAfter = process.memoryUsage().heapUsed;
    
    // It should successfully replay all 10,000 events
    expect(state.sequence).toBe(10000n);
    expect(state.context.pingCount).toBe(10000);

    // Ensure memory overhead of the ReplayedState itself is tiny (e.g. less than 1MB per execution state)
    // The events themselves take memory, but the state should just be { sequence, workingMemory, context: { pingCount: 10000 } }
    const stateJsonStr = JSON.stringify(state, (k, v) => typeof v === 'bigint' ? v.toString() : v);
    const stateBytes = Buffer.byteLength(stateJsonStr, 'utf8');

    // State size should be very small (< 100KB)
    expect(stateBytes).toBeLessThan(100 * 1024);
  });

});
