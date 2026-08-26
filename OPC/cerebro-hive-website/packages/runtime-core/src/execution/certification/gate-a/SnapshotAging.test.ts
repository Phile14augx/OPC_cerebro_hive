import { describe, it, expect } from 'vitest';
import { ExecutionReplayService } from '../../ExecutionReplayService';
import { ExecutionEvent } from '../../../../../runtime-contracts/src/events/ExecutionEvent';
import { ExecutionSnapshot } from '../../../../../runtime-contracts/src/snapshots/ExecutionSnapshot';
import { ReducerRegistry } from '../../../registry/ReducerRegistry';

// Dummy Event Registry
class MockRegistry extends ReducerRegistry {
  constructor() {
    super();
    this.register('UserMessage', (state, event) => {
      state.messages.push({ role: 'user', content: event.payload.text });
      return state;
    });
  }
}

class MockStore {
  public events: ExecutionEvent<unknown>[] = [];
  public snapshot: ExecutionSnapshot | null = null;
  
  async getEvents(id: string, after?: bigint) {
    if (after) return this.events.filter(e => e.sequence > after);
    return this.events;
  }
  async getLatestSnapshot() {
    return this.snapshot;
  }
}

describe('Gate A - Snapshot Aging Certification', () => {

  it('should restore and replay cleanly from a 180-day-old snapshot', async () => {
    const store = new MockStore() as unknown;
    const registry = new MockRegistry();
    const replayService = new ExecutionReplayService(store, registry, { upcastEvent: e => e } as unknown);

    const execId = 'aging-1';

    // 1. Simulate a snapshot created 180 days ago at sequence 5
    const snapshotDate = new Date();
    snapshotDate.setDate(snapshotDate.getDate() - 180);

    store.snapshot = {
      id: 'snap-1',
      executionId: execId,
      sequence: 5n,
      createdAt: snapshotDate,
      aggregateVersion: 1,
      tenantId: 't1',
      state: {
        workingMemory: {},
        messages: [{ role: 'user', content: 'Old message' }],
        context: {},
        activeToolCalls: []
      }
    };

    // 2. Add some new events that occurred TODAY (after the snapshot)
    store.events.push({
      executionId: execId,
      sequence: 6n,
      type: 'UserMessage',
      payload: { text: 'New message today' },
      timestamp: new Date(),
      tenantId: 't1'
    });

    // 3. Hydrate
    const state = await replayService.replay(execId);

    // Assert that the aged snapshot was cleanly loaded and Delta applied
    expect(state.sequence).toBe(6n);
    expect(state.messages.length).toBe(2);
    expect(state.messages[0].content).toBe('Old message');
    expect(state.messages[1].content).toBe('New message today');
  });

});
