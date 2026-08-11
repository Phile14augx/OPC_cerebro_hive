/**
 * Represents the ephemeral state of an active agent execution.
 * Ephemeral state is distinct from persistent memory.
 */
export interface ExecutionState {
  id: string;
  variables: Record<string, any>;
  messages: Array<Record<string, any>>; // e.g., LLM conversation history
  toolOutputs: Record<string, any>;
  plannerContext?: Record<string, any>;
}

/**
 * StateEngine manages ephemeral execution state during an agent's run.
 */
export class StateEngine {
  private states = new Map<string, ExecutionState>();

  /**
   * Initialize a new state session for an execution.
   */
  createState(executionId: string): ExecutionState {
    const initialState: ExecutionState = {
      id: executionId,
      variables: {},
      messages: [],
      toolOutputs: {}
    };
    this.states.set(executionId, initialState);
    return initialState;
  }

  /**
   * Retrieve the current state of an execution.
   */
  getState(executionId: string): ExecutionState | undefined {
    return this.states.get(executionId);
  }

  /**
   * Apply an update to the current execution state.
   */
  updateState(executionId: string, patch: Partial<ExecutionState>): void {
    const currentState = this.states.get(executionId);
    if (!currentState) {
      throw new Error(`Execution state for ${executionId} not found.`);
    }
    
    this.states.set(executionId, {
      ...currentState,
      ...patch,
      variables: { ...currentState.variables, ...(patch.variables || {}) },
      toolOutputs: { ...currentState.toolOutputs, ...(patch.toolOutputs || {}) },
      // Messages are typically appended
      messages: patch.messages ? [...currentState.messages, ...patch.messages] : currentState.messages
    });
  }

  /**
   * Clear the state for an execution (e.g. upon completion).
   */
  clearState(executionId: string): void {
    this.states.delete(executionId);
  }
}
