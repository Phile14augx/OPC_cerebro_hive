import { describe, it, expect } from 'vitest';
import { ExecutionReplayService } from '../../ExecutionReplayService.js';
import { ExecutionEvent } from '../../../../../runtime-contracts/src/events/ExecutionEvent.js';
import { ReducerRegistry } from '../../../registry/ReducerRegistry.js';

// Simulate Worker v1 (Old Reducer logic)
class WorkerV1Registry extends ReducerRegistry {
  constructor() {
    super();
    this.register('DataEvent', (state, event) => {
      state.context = state.context || {};
      state.context.data = event.payload.data; // V1 only supports single data
      return state;
    });
  }
}

// Simulate Worker v2 (New Reducer logic - supports an array of data)
class WorkerV2Registry extends ReducerRegistry {
  constructor() {
    super();
    this.register('DataEvent', (state, event) => {
      state.context = state.context || {};
      state.context.dataArray = state.context.dataArray || [];
      state.context.dataArray.push(event.payload.data);
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

describe('Gate B - Rolling Upgrade Certification', () => {

  it('should survive an in-flight execution upgrading from Worker v1 to Worker v2', async () => {
    const store = new MockStore() as any;
    const registryV1 = new WorkerV1Registry();
    const replayServiceV1 = new ExecutionReplayService(store, registryV1, { upcastEvent: e => e } as any);
    const registryV2 = new WorkerV2Registry();
    const replayServiceV2 = new ExecutionReplayService(store, registryV2, { upcastEvent: e => e } as any);

    const execId = 'upgrade-1';

    // 1. Worker v1 processes an event
    store.events.push({
      executionId: execId,
      sequence: 1n,
      type: 'DataEvent',
      payload: { data: 'A' },
      timestamp: new Date(),
      tenantId: 't1'
    });

    // Worker V1 state
    const stateV1 = await replayServiceV1.replay(execId);
    expect(stateV1.context.data).toBe('A');
    expect(stateV1.context.dataArray).toBeUndefined();

    // 2. Rolling Upgrade Occurs! Worker v1 dies. Worker v2 takes over.
    // Worker v2 adds new event.
    store.events.push({
      executionId: execId,
      sequence: 2n,
      type: 'DataEvent',
      payload: { data: 'B' },
      timestamp: new Date(),
      tenantId: 't1'
    });

    // 3. Worker v2 replays from 0
    const stateV2 = await replayServiceV2.replay(execId);

    // Assert Worker v2 logic applied to ALL events cleanly without crashing
    expect(stateV2.context.dataArray).toEqual(['A', 'B']);
    // 'data' property no longer populated because V2 reducer replaced it
    expect(stateV2.context.data).toBeUndefined();
  });

});
