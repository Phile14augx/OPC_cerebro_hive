export interface Goal {
  id: string;
  intent: string;
  context?: Record<string, any>;
  constraints?: GoalConstraint[];
  successCriteria?: string[];
  priority?: number;
  deadline?: Date;
  budget?: ExecutionBudget;
  optimizationLevel?: OptimizationLevel;
  preferredEvaluationPolicyId?: string; // Goal-level policy override
}

export type OptimizationLevel = 'Fast' | 'Balanced' | 'Optimal';

export interface GoalConstraint {
  type: 'Region' | 'Latency' | 'Cost' | 'Compliance' | 'Model' | 'Custom';
  value: any;
  required: boolean;
}

export interface ExecutionBudget {
  maxTokens?: number;
  maxCostUsd?: number;
  maxDurationMs?: number;
  maxSteps?: number;
}
