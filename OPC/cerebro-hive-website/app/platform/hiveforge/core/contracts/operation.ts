/**
 * Operations & Workflows Contracts
 */

import { ExecutionGraph } from "../engine/planner/graph";

export type OperationCategory = 
  | "Provision"
  | "Destroy"
  | "Scale"
  | "Backup"
  | "Restore"
  | "Upgrade"
  | "Migration"
  | "Validation"
  | "Import"
  | "Export";

export type OperationState = 
  | "queued"
  | "running"
  | "paused"
  | "retrying"
  | "completed"
  | "failed"
  | "cancelled";

export type FailureStrategy = 
  | "fail_fast"
  | "retry_with_backoff"
  | "continue_on_non_critical"
  | "compensate_using_rollback"
  | "require_manual_approval";

export interface OperationContext {
  correlationId: string;
  workspaceId: string;
  userId: string;
}

export interface PersistentWorkflow {
  id: string;
  category: OperationCategory;
  state: OperationState;
  context: OperationContext;
  
  // Concurrency & Resilience
  failureStrategy: FailureStrategy;
  maxConcurrency: number;
  retryCount: number;
  
  // Graphs
  executionGraph: ExecutionGraph;
  rollbackGraph?: ExecutionGraph;
  
  createdAt: string;
  updatedAt: string;
}
