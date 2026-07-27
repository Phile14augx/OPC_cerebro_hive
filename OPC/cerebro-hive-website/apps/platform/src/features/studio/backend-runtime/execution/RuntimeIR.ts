
export interface RetryPolicy {
  type: 'Exponential' | 'Linear' | 'None';
  maxAttempts: number;
}

export interface RuntimeTask {
  id: string;
  capabilityId: string;
  version: string;
  inputs: Record<string, any>;
  retry: RetryPolicy;
  timeoutMs: number;
}

export interface ParallelGroup {
  groupId: string;
  tasks: RuntimeTask[];
}

export interface RuntimeIR {
  version: string;
  stages: ParallelGroup[]; // Linear sequence of ParallelGroups
  dependencies: Record<string, string[]>;
}
