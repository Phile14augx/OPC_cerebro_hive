export type ExecutionState =
  | 'CREATED'
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING_TOOL'
  | 'WAITING_APPROVAL'
  | 'WAITING_PROVIDER'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'TIMED_OUT'
  | 'POISONED';

export class ExecutionStateMachine {
  private static readonly VALID_TRANSITIONS: Record<ExecutionState, ExecutionState[]> = {
    CREATED: ['QUEUED', 'RUNNING', 'CANCELLED'],
    QUEUED: ['RUNNING', 'CANCELLED', 'TIMED_OUT'],
    RUNNING: [
      'WAITING_TOOL',
      'WAITING_APPROVAL',
      'WAITING_PROVIDER',
      'COMPLETED',
      'FAILED',
      'CANCELLED',
      'TIMED_OUT',
    ],
    WAITING_TOOL: ['RUNNING', 'FAILED', 'CANCELLED', 'TIMED_OUT'],
    WAITING_APPROVAL: ['RUNNING', 'FAILED', 'CANCELLED', 'TIMED_OUT'],
    WAITING_PROVIDER: ['RUNNING', 'FAILED', 'CANCELLED', 'TIMED_OUT'],
    COMPLETED: [],
    FAILED: [],
    CANCELLED: [],
    TIMED_OUT: [],
    POISONED: [],
  };

  /**
   * Validates if a transition from `currentState` to `nextState` is allowed.
   */
  public static canTransition(currentState: ExecutionState, nextState: ExecutionState): boolean {
    return this.VALID_TRANSITIONS[currentState]?.includes(nextState) ?? false;
  }

  /**
   * Throws an error if the transition is illegal.
   */
  public static validateTransition(currentState: ExecutionState, nextState: ExecutionState): void {
    if (!this.canTransition(currentState, nextState)) {
      throw new Error(`Illegal execution state transition: ${currentState} -> ${nextState}`);
    }
  }

  public static isTerminal(state: ExecutionState): boolean {
    return this.VALID_TRANSITIONS[state].length === 0;
  }
}
