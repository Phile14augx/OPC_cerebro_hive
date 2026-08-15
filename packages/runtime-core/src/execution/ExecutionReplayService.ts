import { ExecutionEvent } from '@cerebro/runtime-contracts';
import { ExecutionStore } from './ExecutionStore.js';
import { ReducerRegistry } from '../registry/ReducerRegistry.js';
import { ExecutionEventRegistry } from '../registry/ExecutionEventRegistry.js';
import { ReplayContext } from '@cerebro/runtime-contracts';

export interface ReplayedState {
  sequence: bigint;
  workingMemory: Record<string, any>;
  messages: Array<any>;
  context: Record<string, any>;
  activeToolCalls: string[];
}

export interface TimeTravelOptions {
  sequence?: bigint;
  timestamp?: Date;
  snapshotId?: string; // We'd fetch this specific snapshot if requested
  trace?: boolean; // If true, logs Reducer -> State Delta to console
}

export interface StateDiff {
  addedMessages: Array<any>;
  removedActiveTools: string[];
  newActiveTools: string[];
}

export class ExecutionReplayService {
  constructor(
    private readonly store: ExecutionStore,
    private readonly reducerRegistry: ReducerRegistry,
    private readonly eventRegistry: ExecutionEventRegistry
  ) {}

  /**
   * Reconstructs the complete execution state by replaying events from the beginning,
   * or from the most recent snapshot if one exists.
   * Supports Time Travel by providing options (e.g. stop at sequence N).
   */
  async replay(executionId: string, options?: TimeTravelOptions): Promise<ReplayedState> {
    // If a specific snapshot is requested via options.snapshotId, we'd fetch that instead.
    // For now, if no time travel options or just sequence/timestamp, we can optimize with latest valid snapshot.
    let snapshot = null;
    
    // We only use the snapshot optimization if it's before our target sequence/time
    if (!options?.sequence && !options?.timestamp) {
      snapshot = await this.store.getLatestSnapshot(executionId);
    }

    let state: ReplayedState;
    let sequenceToFetchFrom: bigint | undefined;

    if (snapshot) {
      // Snapshot Hash Verification
      // In a real implementation we would compute: const computedHash = hash(snapshot.state);
      // For this runtime kernel we simulate verification via an external injected hasher or assume it's valid if hash exists.
      // If we detect a hash mismatch (snapshot corruption or non-deterministic schema drift), we drop the snapshot.
      const isCorrupt = false; // Simulated verification
      
      if (!isCorrupt) {
        state = {
          sequence: snapshot.sequence,
          workingMemory: snapshot.state.workingMemory,
          messages: snapshot.state.messages,
          context: snapshot.state.context,
          activeToolCalls: snapshot.state.activeToolCalls,
        };
        sequenceToFetchFrom = snapshot.sequence;
      } else {
        // Fallback to pure replay
        state = {
          sequence: 0n,
          workingMemory: {},
          messages: [],
          context: {},
          activeToolCalls: [],
        };
      }
    } else {
      state = {
        sequence: 0n,
        workingMemory: {},
        messages: [],
        context: {},
        activeToolCalls: [],
      };
    }

    const events = await this.store.getEvents(executionId, sequenceToFetchFrom);

    for (const event of events) {
      // Time travel stop conditions
      if (options?.sequence && event.sequence > options.sequence) {
        break;
      }
      if (options?.timestamp && event.occurredAt && new Date(event.occurredAt) > options.timestamp) {
        break;
      }

      this.applyEvent(state, event, options);
      state.sequence = event.sequence;
    }

    return state;
  }

  /**
   * Computes the difference between two points in time.
   */
  async diff(executionId: string, fromSequence: bigint, toSequence: bigint): Promise<StateDiff> {
    const fromState = await this.replay(executionId, { sequence: fromSequence });
    const toState = await this.replay(executionId, { sequence: toSequence });

    return {
      addedMessages: toState.messages.slice(fromState.messages.length),
      newActiveTools: toState.activeToolCalls.filter(id => !fromState.activeToolCalls.includes(id)),
      removedActiveTools: fromState.activeToolCalls.filter(id => !toState.activeToolCalls.includes(id))
    };
  }

  private applyEvent(state: ReplayedState, event: ExecutionEvent<any>, options?: TimeTravelOptions): void {
    // 1. Upcast the event payload lazily
    const upcastedEvent = this.eventRegistry.upcastEvent(event);

    // 2. Resolve the registered reducer
    const reducer = this.reducerRegistry.getReducer(upcastedEvent.type);
    if (!reducer) {
      // In a real system, you might log a warning or ignore if no reducer is registered.
      // But the RegistryVerifier should ensure we have reducers for all registered events.
      return;
    }

    // 3. Create the Deterministic Context for the reducer
    const context: ReplayContext = {
      clock: {
        now: () => (upcastedEvent.occurredAt ? new Date(upcastedEvent.occurredAt).getTime() : 0),
        toISOString: () => (upcastedEvent.occurredAt ? new Date(upcastedEvent.occurredAt).toISOString() : new Date(0).toISOString())
      },
      random: {
        // Fallback or seeded random could be injected here if needed for replay
        next: () => 0.5,
        uuid: () => `replay-uuid-${upcastedEvent.sequence}`
      },
      isReplaying: true
    };

    // 4. Apply reducer
    const oldStateStr = options?.trace ? JSON.stringify(state) : null;
    const newState = reducer(state as any, upcastedEvent, context);
    Object.assign(state, newState);

    if (options?.trace) {
      console.log(`[Trace] Seq: ${upcastedEvent.sequence} | Event: ${upcastedEvent.type}`);
      // In a real system, we'd log the specific delta using a deep diff library.
      console.log(`[Trace] State Delta Applied.`);
    }
  }
}
