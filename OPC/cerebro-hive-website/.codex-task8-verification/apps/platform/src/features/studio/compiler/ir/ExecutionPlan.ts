
export interface DataSchema {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  collection: boolean;
}

export interface Resource {
  id: string;
  type: string;
  provider: string;
  identifier: string;
  quantity: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMultiplier: number;
}

export interface Stage {
  id: string;
  level: number;
  parallel: boolean;
  nodes: string[];
  inputs: DataSchema[];
  outputs: DataSchema[];
  
  // Enriched Metadata
  retryPolicy?: RetryPolicy;
  timeoutMs?: number;
  priority?: number;
  concurrencyLimit?: number;
  schedulingClass?: string;
  cacheable?: boolean;
}

export interface StageDependency {
  sourceStage: string;
  targetStage: string;
  type: 'Data' | 'Control' | 'Event' | 'Approval';
}

export interface CostEstimate {
  llmCost: number;
  apiCost: number;
  computeCost: number;
  storageCost: number;
  networkCost: number;
  humanReviewCost: number;
  totalCost: number;
}

export interface ExecutionPlanMetadata {
  version: string;
  compatibility: string;
  compilerVersion: string;
  generatedAt: string;
  sourceHash: string;
}

export interface ExecutionPlan {
  metadata: ExecutionPlanMetadata;
  workflowId: string;
  executionMode: 'simulation' | 'production';
  stages: Stage[];
  dependencies: StageDependency[];
  resources: Resource[];
  estimates: CostEstimate;
}
