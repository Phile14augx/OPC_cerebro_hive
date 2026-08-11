import { describe, it, expect } from 'vitest';
import { ExecutionReplayService } from '../../ExecutionReplayService';
import { ExecutionEvent } from '../../../../../runtime-contracts/src/events/ExecutionEvent';
import { ReducerRegistry } from '../../../registry/ReducerRegistry';

class MockRegistry extends ReducerRegistry {
  constructor() {
    super();
    this.register('Command', (state, event) => {
      state.context = state.context || {};
      state.context.cmds = (state.context.cmds || 0) + 1;
      return state;
    });
  }
}

class MockStore {
  public events: ExecutionEvent<any>[] = [];
  async getEvents(id: string, after?: bigint) { return this.events; }
  async getLatestSnapshot() { return null; }
}

describe('Gate C - Capacity & Performance Certification', () => {

  it('should meet the SLA for high-throughput pure replay (>=500 events/sec)', async () => {
    const store = new MockStore() as any;
    const replayService = new ExecutionReplayService(store, new MockRegistry(), { upcastEvent: e => e } as any);
    const execId = 'perf-1';

    // Generate 50,000 events
    for (let i = 1; i <= 50000; i++) {
      store.events.push({ executionId: execId, sequence: BigInt(i), type: 'Command', payload: {}, timestamp: new Date(), tenantId: 't1' });
    }

    const start = process.hrtime.bigint();
    const state = await replayService.replay(execId);
    const end = process.hrtime.bigint();

    const durationSec = Number(end - start) / 1e9;
    const eventsPerSec = 50000 / durationSec;

    expect(state.sequence).toBe(50000n);
    expect(eventsPerSec).toBeGreaterThanOrEqual(500);
    
    // In node, a tight JS loop can easily clear 100k-500k ops/sec. We expect this to comfortably pass the 500 evt/s SLA.
    console.log(`[Gate C] Replay Throughput: ${Math.round(eventsPerSec)} events/sec`);
  });

});
