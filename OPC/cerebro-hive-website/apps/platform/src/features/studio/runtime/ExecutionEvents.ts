
export type ExecutionEventType = 
  | 'ExecutionStarted'
  | 'StageStarted'
  | 'NodeStarted'
  | 'NodeCompleted'
  | 'VariableCreated'
  | 'VariableUpdated'
  | 'ToolCalled'
  | 'ToolReturned'
  | 'MemoryRead'
  | 'MemoryWrite'
  | 'BreakpointHit'
  | 'ErrorRaised'
  | 'ExecutionPaused'
  | 'ExecutionResumed'
  | 'ExecutionFinished';

export interface ExecutionEvent {
  id: string;
  timestamp: number;
  type: ExecutionEventType;
  payload: any;
  stageId?: string;
  nodeId?: string;
  symbolId?: string;
}

export interface ExecutionSnapshot {
  snapshotId: string;
  eventIndex: number; // The index in the event log this snapshot represents
  memoryState: Record<string, any>;
  activeStages: string[];
}

export interface ExecutionRecording {
  executionPlanId: string;
  events: ExecutionEvent[];
  snapshots: ExecutionSnapshot[];
  metrics: {
    durationMs: number;
    totalCost: number;
  };
}
