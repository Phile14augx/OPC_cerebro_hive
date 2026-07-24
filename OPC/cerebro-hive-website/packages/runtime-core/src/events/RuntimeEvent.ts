export enum RuntimeEventType {
  ExecutionStarted = "ExecutionStarted",
  ExecutionQueued = "ExecutionQueued",
  PlannerSelected = "PlannerSelected",
  KnowledgeRetrieved = "KnowledgeRetrieved",
  PolicyEvaluated = "PolicyEvaluated",
  ToolInvoked = "ToolInvoked",
  ToolCompleted = "ToolCompleted",
  ModelInvoked = "ModelInvoked",
  TokenStreamStarted = "TokenStreamStarted",
  TokenStreamCompleted = "TokenStreamCompleted",
  CheckpointCreated = "CheckpointCreated",
  ExecutionPaused = "ExecutionPaused",
  ExecutionResumed = "ExecutionResumed",
  ExecutionCompleted = "ExecutionCompleted",
  ExecutionFailed = "ExecutionFailed",
  ExecutionCancelled = "ExecutionCancelled"
}

export interface RuntimeEvent {
  id: string; // UUID
  executionId: string;
  workspaceId: string;
  type: RuntimeEventType;
  source: string; // e.g., 'AgentRuntime', 'WorkflowRuntime'
  payload: Record<string, any>;
  timestamp: Date;
}

export interface EventPublisher {
  publish(event: Omit<RuntimeEvent, 'id' | 'timestamp'>): Promise<void>;
}

export interface EventSubscriber {
  subscribe(
    filter: { executionId?: string; workspaceId?: string; type?: RuntimeEventType },
    handler: (event: RuntimeEvent) => void | Promise<void>
  ): void;
  
  unsubscribeAll(): void;
}
