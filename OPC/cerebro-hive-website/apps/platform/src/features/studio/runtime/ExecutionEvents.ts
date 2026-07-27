/**
 * M24 — ExecutionEvents (full lifecycle)
 *
 * Extended from M22 to cover the complete node execution lifecycle:
 * Queued → Scheduled → InputResolved → Running → OutputProduced → Completed
 * plus Streaming, Retrying, TimedOut, Cancelled, Skipped
 */

export type ExecutionEventType =
  // Execution lifecycle
  | 'ExecutionStarted'
  | 'ExecutionPaused'
  | 'ExecutionResumed'
  | 'ExecutionFinished'
  | 'ExecutionCancelled'
  // Stage lifecycle
  | 'StageStarted'
  | 'StageCompleted'
  // Node lifecycle (full)
  | 'NodeQueued'
  | 'NodeScheduled'
  | 'NodeInputResolved'
  | 'NodeStarted'
  | 'NodeStreaming'       // LLM token-by-token output
  | 'NodeOutputProduced'
  | 'NodeCompleted'
  | 'NodeCancelled'
  | 'NodeSkipped'
  | 'NodeRetrying'
  | 'NodeTimedOut'
  // Data
  | 'VariableCreated'
  | 'VariableUpdated'
  // Tools & Memory
  | 'ToolCalled'
  | 'ToolReturned'
  | 'MemoryRead'
  | 'MemoryWrite'
  // Debug
  | 'BreakpointHit'
  | 'ErrorRaised';

export interface ExecutionEvent {
  id: string;
  timestamp: number;
  type: ExecutionEventType;
  payload: unknown;
  stageId?: string;
  nodeId?: string;
  symbolId?: string;
}

export interface ExecutionSnapshot {
  snapshotId: string;
  eventIndex: number;
  timestamp: number;
  memoryState: Record<string, unknown>;
  activeStages: string[];
  cursorSnapshot: { stageIdx: number; nodeIdx: number };
}

export interface ExecutionRecording {
  executionId: string;
  executionPlanId: string;
  simulationMode: string;
  startedAt: number;
  finishedAt: number;
  events: ExecutionEvent[];
  snapshots: ExecutionSnapshot[];
  metrics: {
    durationMs: number;
    totalTokens: number;
    totalCostUsd: number;
    nodeCount: number;
  };
}
