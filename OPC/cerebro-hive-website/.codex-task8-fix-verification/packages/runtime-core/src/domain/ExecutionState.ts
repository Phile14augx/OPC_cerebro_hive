export enum ExecutionState {
  Created = "Created",
  Queued = "Queued",
  Planning = "Planning",
  Running = "Running",
  Streaming = "Streaming",
  Waiting = "Waiting",
  NeedsApproval = "NeedsApproval",
  Completed = "Completed",
  Failed = "Failed",
  Replanning = "Replanning",
  RollingBack = "RollingBack",
  Recovered = "Recovered",
  Cancelled = "Cancelled"
}

export class ExecutionStateMachine {
  private state: ExecutionState;

  // Define valid transitions. Key is current state, value is array of valid next states.
  private static VALID_TRANSITIONS: Record<ExecutionState, ExecutionState[]> = {
    [ExecutionState.Created]: [ExecutionState.Queued, ExecutionState.Cancelled],
    [ExecutionState.Queued]: [ExecutionState.Planning, ExecutionState.Cancelled],
    [ExecutionState.Planning]: [ExecutionState.Running, ExecutionState.Failed, ExecutionState.Cancelled],
    [ExecutionState.Running]: [
      ExecutionState.Streaming,
      ExecutionState.Waiting,
      ExecutionState.NeedsApproval,
      ExecutionState.Replanning,
      ExecutionState.Completed,
      ExecutionState.Failed,
      ExecutionState.Cancelled
    ],
    [ExecutionState.Streaming]: [ExecutionState.Running, ExecutionState.Completed, ExecutionState.Failed],
    [ExecutionState.Waiting]: [ExecutionState.Running, ExecutionState.Failed, ExecutionState.Cancelled],
    [ExecutionState.NeedsApproval]: [ExecutionState.Running, ExecutionState.Cancelled], // Approved -> Running, Rejected -> Cancelled
    [ExecutionState.Completed]: [], // Terminal state
    [ExecutionState.Failed]: [ExecutionState.Replanning, ExecutionState.RollingBack, ExecutionState.Recovered],
    [ExecutionState.Replanning]: [ExecutionState.Running, ExecutionState.Failed, ExecutionState.Cancelled],
    [ExecutionState.RollingBack]: [ExecutionState.Failed, ExecutionState.Recovered],
    [ExecutionState.Recovered]: [ExecutionState.Running],
    [ExecutionState.Cancelled]: [] // Terminal state
  };

  constructor(initialState: ExecutionState = ExecutionState.Created) {
    this.state = initialState;
  }

  public getState(): ExecutionState {
    return this.state;
  }

  public canTransitionTo(targetState: ExecutionState): boolean {
    const validNextStates = ExecutionStateMachine.VALID_TRANSITIONS[this.state] || [];
    return validNextStates.includes(targetState);
  }

  public transitionTo(targetState: ExecutionState): void {
    if (!this.canTransitionTo(targetState)) {
      throw new Error(`Invalid state transition from ${this.state} to ${targetState}`);
    }
    this.state = targetState;
  }

  public isTerminal(): boolean {
    return this.state === ExecutionState.Completed || this.state === ExecutionState.Cancelled;
  }
}
