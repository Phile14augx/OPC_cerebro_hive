
export type ExecutionStatus = 'Pending' | 'Running' | 'Paused' | 'Completed' | 'Failed' | 'Cancelled';

export interface ExecutionState {
  executionId: string;
  status: ExecutionStatus;
  nodeStatuses: Record<string, ExecutionStatus>;
  checkpoints: Record<string, string>; // URI to state snapshot
}

export class ExecutionStateStore {
  async get(executionId: string): Promise<ExecutionState> {
    return { executionId, status: 'Running', nodeStatuses: {}, checkpoints: {} };
  }
  async update(executionId: string, mutation: Partial<ExecutionState>) {
    // Persist to Postgres/Redis
  }
}
