import { PolicyLifecycleState } from '../models/PolicyRule';

export class PolicyLifecycleStateMachine {
  private static VALID_TRANSITIONS: Record<PolicyLifecycleState, PolicyLifecycleState[]> = {
    'Draft': ['Validation', 'Archived'],
    'Validation': ['Simulation', 'Draft'],
    'Simulation': ['Pending Review', 'Draft'],
    'Pending Review': ['Approved', 'Draft'],
    'Approved': ['Staged', 'Draft'],
    'Staged': ['Active', 'Archived'],
    'Active': ['Deprecated', 'Archived'],
    'Deprecated': ['Archived'],
    'Archived': []
  };

  static canTransition(currentState: PolicyLifecycleState, nextState: PolicyLifecycleState): boolean {
    const allowed = this.VALID_TRANSITIONS[currentState] || [];
    return allowed.includes(nextState);
  }

  static transition(currentState: PolicyLifecycleState, nextState: PolicyLifecycleState): PolicyLifecycleState {
    if (!this.canTransition(currentState, nextState)) {
      throw new Error(`Invalid policy lifecycle transition from ${currentState} to ${nextState}`);
    }
    return nextState;
  }
}
