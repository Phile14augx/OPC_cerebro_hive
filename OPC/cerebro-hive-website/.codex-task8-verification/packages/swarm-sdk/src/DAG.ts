
export type TaskStatus = 'PENDING' | 'READY' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'RETRYING' | 'SKIPPED' | 'CANCELLED';

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
}

export interface ExecutionProfile {
  cpu: number;
  memory: number;
  timeoutMs: number;
  priority: number;
  retryPolicy: RetryPolicy;
}

export interface TaskNode {
  id: string;
  agentId?: string;
  intent: string;
  status: TaskStatus;
  dependencies: string[]; // Parent IDs
  profile: ExecutionProfile;
}

export interface TaskEdge {
  from: string;
  to: string;
}

export interface TaskDAG {
  id: string;
  nodes: TaskNode[];
  edges: TaskEdge[];
}
