export enum RuntimeEventType {
  ExecutionStarted = "ExecutionStarted",
  ExecutionQueued = "ExecutionQueued",
  GoalReceived = "GoalReceived",
  PlannerSelected = "PlannerSelected",
  PlanGenerated = "PlanGenerated",
  CandidateGenerated = "CandidateGenerated",
  EvaluationStarted = "EvaluationStarted",
  SimulationStarted = "SimulationStarted",
  SimulationCompleted = "SimulationCompleted",
  PlanRanked = "PlanRanked",
  PlanSelected = "PlanSelected",
  PlanValidated = "PlanValidated",
  PlanRejected = "PlanRejected",
  PlanPatched = "PlanPatched",
  PlanCompleted = "PlanCompleted",
  MemoryRetrieved = "MemoryRetrieved",
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

export interface RuntimeEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  id: string; // UUID
  executionId: string;
  workspaceId: string;
  type: RuntimeEventType;
  source: string; // e.g., 'AgentRuntime', 'WorkflowRuntime'
  payload: TPayload;
  timestamp: Date;
}

export interface EventPublisher {
  publish(event: Omit<RuntimeEvent<Record<string, unknown>>, 'id' | 'timestamp'>): Promise<void>;
}

export interface EventSubscriber {
  subscribe(
    filter: { executionId?: string; workspaceId?: string; type?: RuntimeEventType },
    handler: (event: RuntimeEvent<Record<string, unknown>>) => void | Promise<void>
  ): void;
  
  unsubscribeAll(): void;
}
