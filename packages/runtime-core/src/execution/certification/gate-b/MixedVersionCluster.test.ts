import { describe, it, expect } from 'vitest';
import { ExecutionReplayService } from '../../ExecutionReplayService.js';
import { ExecutionEvent } from '../../../../../runtime-contracts/src/events/ExecutionEvent.js';
import { ReducerRegistry } from '../../../registry/ReducerRegistry.js';

// Worker v3
class WorkerV3Registry extends ReducerRegistry {
  constructor() {
    super();
    this.register('Ping', (state, event) => {
      state.context = state.context || {};
      state.context.v3Count = (state.context.v3Count || 0) + 1;
      return state;
    });
  }
}

// Worker v4
class WorkerV4Registry extends ReducerRegistry {
  constructor() {
    super();
    this.register('Ping', (state, event) => {
      state.context = state.context || {};
      // Worker V4 tracks total Pings instead of v3-specific pings
      state.context.totalPings = (state.context.totalPings || 0) + 1;
      return state;
    });
  }
}

class MockStore {
  public events: ExecutionEvent<any>[] = [];
  
  async getEvents(id: string, after?: bigint) {
    if (after) return this.events.filter(e => e.sequence > after);
    return this.events;
  }
  async getLatestSnapshot() { return null; }
}

describe('Gate B - Mixed-Version Cluster Certification', () => {

  it('should tolerate Worker v3 and Worker v4 processing the same stream', async () => {
    const store = new MockStore() as any;
    const replayServiceV3 = new ExecutionReplayService(store, new WorkerV3Registry(), { upcastEvent: e => e } as any);
    const replayServiceV4 = new ExecutionReplayService(store, new WorkerV4Registry(), { upcastEvent: e => e } as any);

    const execId = 'mixed-cluster-1';

    // Simulate Interleaved Processing
    // Worker V3 processes sequence 1
    store.events.push({ executionId: execId, sequence: 1n, type: 'Ping', payload: {}, timestamp: new Date(), tenantId: 't1' });
    const stateV3_Seq1 = await replayServiceV3.replay(execId);
    expect(stateV3_Seq1.context.v3Count).toBe(1);

    // Worker V4 processes sequence 2
    store.events.push({ executionId: execId, sequence: 2n, type: 'Ping', payload: {}, timestamp: new Date(), tenantId: 't1' });
    const stateV4_Seq2 = await replayServiceV4.replay(execId);
    expect(stateV4_Seq2.context.totalPings).toBe(2); // V4 replays seq1 + seq2

    // Worker V3 processes sequence 3
    store.events.push({ executionId: execId, sequence: 3n, type: 'Ping', payload: {}, timestamp: new Date(), tenantId: 't1' });
    const stateV3_Seq3 = await replayServiceV3.replay(execId);
    expect(stateV3_Seq3.context.v3Count).toBe(3); // V3 replays seq1 + seq2 + seq3
    
    // In a mixed-version cluster, different workers have different projections of the state,
    // but the underlying event stream (Event Sourcing) remains perfectly immutable and shareable!
  });

});
