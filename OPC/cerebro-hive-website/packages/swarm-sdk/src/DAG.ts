
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface TaskNode {
  id: string;
  agentId?: string; // assigned later by planner
  intent: string;
  status: TaskStatus;
  dependencies: string[]; // array of TaskNode IDs that must finish first
}

export interface TaskEdge {
  from: string;
  to: string;
}

export interface TaskDAG {
  nodes: TaskNode[];
  edges: TaskEdge[];
}
