export interface ExecutionMetric {
  readonly id: string;
  readonly executionId: string;
  readonly name: string;
  readonly value: number;
  readonly unit: string;
  readonly timestamp: Date;
}

export interface ExecutionMetricsTracker {
  /** Records a generic metric */
  recordMetric(executionId: string, name: string, value: number, unit: string): Promise<void>;
  
  /** Convenience method for token tracking */
  recordTokens(executionId: string, type: 'input' | 'output' | 'reasoning', count: number): Promise<void>;

  /** Convenience method for cost tracking */
  recordCost(executionId: string, costUsd: number): Promise<void>;
}
