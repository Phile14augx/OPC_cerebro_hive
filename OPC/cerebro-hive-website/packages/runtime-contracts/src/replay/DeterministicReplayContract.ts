import { ExecutionEvent } from '../events/ExecutionEvent';

/**
 * Provides deterministic environmental context during both live execution and replay.
 * Reducers MUST NOT use Date.now(), Math.random(), or UUID generators directly.
 */
export interface ReplayContext {
  /**
   * The deterministically frozen timestamp of the current event being reduced.
   */
  readonly clock: {
    now(): number;
    toISOString(): string;
  };

  /**
   * A deterministically seeded random number generator.
   */
  readonly random: {
    next(): number; // 0 to 1
    uuid(): string; // Deterministic pseudo-UUID based on seed
  };

  /**
   * True if the aggregate is currently rebuilding state from history.
   * False if this is the live execution edge.
   */
  readonly isReplaying: boolean;
}

/**
 * A strongly-typed contract for an Event Reducer.
 * 
 * VIOLATION RULES:
 * 1. Reducers MUST be pure functions (State + Event -> State).
 * 2. Reducers MUST NOT perform I/O (no HTTP, no DB, no logging that affects control flow).
 * 3. Reducers MUST NOT throw exceptions (all business errors must be modeled as state transitions).
 */
export interface DeterministicReducer<TState, TEvent extends ExecutionEvent<unknown> = ExecutionEvent<unknown>> {
  (state: TState, event: TEvent, context: ReplayContext): TState;
}
