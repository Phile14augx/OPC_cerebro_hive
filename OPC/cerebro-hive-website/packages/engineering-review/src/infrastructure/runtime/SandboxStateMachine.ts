import { RuntimeState } from './models';

export class SandboxStateMachine {
  private currentState: RuntimeState = 'Queued';

  // Strict valid transitions map
  private readonly transitions: Record<RuntimeState, RuntimeState[]> = {
    Queued: ['Provisioning', 'CleaningUp'], // Can clean up if cancelled early
    Provisioning: ['SandboxCreated', 'CleaningUp'],
    SandboxCreated: ['ArtifactsMounted', 'CleaningUp'],
    ArtifactsMounted: ['Running', 'CleaningUp'],
    Running: ['CollectingOutput', 'CleaningUp'],
    CollectingOutput: ['Completed', 'CleaningUp'],
    Completed: ['CleaningUp'],
    CleaningUp: ['Finished'],
    Finished: [] // Terminal
  };

  getState(): RuntimeState {
    return this.currentState;
  }

  transitionTo(newState: RuntimeState): void {
    const validNextStates = this.transitions[this.currentState];
    if (!validNextStates.includes(newState)) {
      throw new Error(`Illegal state transition from ${this.currentState} to ${newState}`);
    }
    this.currentState = newState;
  }
}
