export interface ExecutionSummary {
  executionId: string;
  agentId: string;
  status: string;
  startedAt: Date;
  completedAt?: Date;
  totalSteps: number;
  totalCost: number;
  
  // Projection Versioning
  projectionVersion: number;
  schemaVersion: number;
  rebuiltAt: Date;
  originatingEventSequence: bigint;
}

export interface ProjectionMetrics {
  lag: bigint; // Difference between max event sequence and max projected sequence
  outstandingEvents: number;
  projectedSequence: bigint;
}

/**
 * Responsible strictly for persisting the Read Models.
 * Separated from the ProjectionManager so implementations (e.g. Prisma) can be swapped.
 */
export interface ExecutionProjectionStore {
  saveExecutionSummary(summary: ExecutionSummary): Promise<void>;
  getExecutionSummary(executionId: string): Promise<ExecutionSummary | null>;
  listExecutionSummaries(filters?: any): Promise<ExecutionSummary[]>;
  
  // Metrics
  getProjectionMetrics(): Promise<ProjectionMetrics>;
}
