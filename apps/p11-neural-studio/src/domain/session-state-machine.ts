// ─── Session State Machine ────────────────────────────────────────────────────
// Enforces valid lifecycle transitions for ModelSession.

import {
  SessionLifecycleState,
  SESSION_TRANSITIONS,
  InvalidTransitionError,
} from '../contracts';

export class SessionStateMachine {
  /**
   * Validates and returns the new state after transitioning from `current` to `next`.
   * Throws `InvalidTransitionError` when the transition is not permitted.
   */
  static transition(
    current: SessionLifecycleState,
    next: SessionLifecycleState,
  ): SessionLifecycleState {
    const allowed = SESSION_TRANSITIONS[current];
    if (!allowed.includes(next)) {
      throw new InvalidTransitionError(current, next);
    }
    return next;
  }

  /** Returns all valid next states from a given state. */
  static allowedTransitions(
    state: SessionLifecycleState,
  ): readonly SessionLifecycleState[] {
    return SESSION_TRANSITIONS[state];
  }

  /** Returns true when a state has no further transitions. */
  static isTerminal(state: SessionLifecycleState): boolean {
    return SESSION_TRANSITIONS[state].length === 0;
  }
}
