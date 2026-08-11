import { CoordinatorState } from './models';

export class CoordinatorStateMachine {
  private currentState: CoordinatorState = 'Planning';

  private readonly transitions: Record<CoordinatorState, CoordinatorState[]> = {
    Planning: ['Queued', 'Cancelled', 'Failed'],
    Queued: ['Scheduling', 'Cancelled', 'Failed'],
    Scheduling: ['Executing', 'Cancelled', 'Failed'],
    Executing: ['Waiting', 'Completed', 'Cancelled', 'Failed'],
    Waiting: ['Executing', 'Completed', 'Cancelled', 'Failed'], // Suspended state loop
    Completed: [],
    Cancelled: [],
    Failed: []
  };

  getState(): CoordinatorState {
    return this.currentState;
  }

  transitionTo(newState: CoordinatorState): void {
    const validNextStates = this.transitions[this.currentState];
    if (!validNextStates.includes(newState)) {
      throw new Error(`Illegal state transition from ${this.currentState} to ${newState}`);
    }
    this.currentState = newState;
  }
}
