import type { CapabilityType } from '../plugins/types';

export type NodeStatus = 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Skipped';

export interface ExecutionNode {
  id: string;
  type: 'Action' | 'Evaluation' | 'Loop';
  objective: string;
  capabilityRequired: CapabilityType;
  status: NodeStatus;
  
  // Metadata for execution and observation
  estimatedCostUsd?: number;
  estimatedDurationMs?: number;
  confidenceScore?: number;
  retryPolicy?: { maxRetries: number; backoffMs: number };
  successCriteria?: string[];
  rollbackStrategy?: string;
  
  // Bounded iteration
  maxIterations?: number;
  currentIteration?: number;
}

export interface ExecutionEdge {
  sourceId: string;
  targetId: string;
  condition?: string; // Optional condition for routing (e.g. for Evaluation nodes)
}

export interface ExecutionPlan {
  id: string;
  version: number;
  goalId: string;
  nodes: ExecutionNode[];
  edges: ExecutionEdge[];
  
  // High-level planner metadata
  confidence: number;
  assumptions: string[];
  risks: string[];
  alternatives: string[];
  
  createdAt: Date;
}
