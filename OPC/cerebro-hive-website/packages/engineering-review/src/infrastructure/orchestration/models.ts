import { AnalyzerExecutionRequest, AnalyzerResult } from '../analyzers/models';

export type CoordinatorState = 
  | 'Planning'
  | 'Queued'
  | 'Scheduling'
  | 'Executing'
  | 'Waiting'
  | 'Completed'
  | 'Cancelled'
  | 'Failed';

export interface ExecutionPlan {
  readonly planId: string;
  readonly plannerVersion: string;
  readonly planSchemaVersion: string;
  readonly generatedAt: number;
  readonly nodes: readonly ExecutionPlanNode[];
  readonly dependencies: readonly ExecutionDependency[];
}

export type CancellationPolicy = 
  | 'CancelImmediately'
  | 'CancelQueuedOnly'
  | 'DrainRunningSessions'
  | 'GracefulShutdown';

export interface SchedulingContext {
  readonly tenantId: string;
  readonly basePriority: number;
  readonly estimatedCost: number;
  readonly concurrencyClass: string;
  readonly affinity?: string;
  readonly retryBudget: number;
}

export interface ExecutionPlanNode {
  readonly nodeId: string;
  readonly request: AnalyzerExecutionRequest;
  readonly schedulingContext: SchedulingContext;
}

export interface ExecutionDependency {
  readonly fromNodeId: string; // Must finish before `toNodeId`
  readonly toNodeId: string;
}

export interface ReviewProgress {
  readonly totalAnalyzers: number;
  readonly queued: number;
  readonly running: number;
  readonly completed: number;
  readonly failed: number;
  readonly percentComplete: number;
}

export interface ExecutionBatch {
  readonly batchId: string;
  readonly reviewId: string;
  readonly plan: ExecutionPlan;
  readonly state: CoordinatorState;
  readonly progress: ReviewProgress;
  readonly results: readonly AnalyzerResult[];
  readonly cancellationToken?: AbortSignal;
  readonly cancellationPolicy: CancellationPolicy;
  readonly timeline: Record<CoordinatorState, number | undefined>; // Immutable timeline
  readonly cacheSnapshot?: unknown; // unknown for cross-package boundary M26.9 scaffolding
}

export type AdmissionDecisionType = 'Accepted' | 'Rejected' | 'Deferred';

export interface AdmissionDecision {
  readonly decision: AdmissionDecisionType;
  readonly reason?: string;
}

export type RetryDecisionType = 'RetryImmediately' | 'RetryWithBackoff' | 'DoNotRetry';

export interface RetryDecision {
  readonly decision: RetryDecisionType;
  readonly backoffMs?: number;
  readonly reason: string;
}

export interface RetryClassifierContext {
  readonly failureReason: string;
  readonly analyzerId: string;
  readonly runtimeType: string;
  readonly attemptCount: number;
  readonly durationMs: number;
}
