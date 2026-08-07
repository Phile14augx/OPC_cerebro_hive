export type ExecutionEventType =
  | 'ExecutionStarted'
  | 'PromptCompiled'
  | 'ProviderSelected'
  | 'GatewayStarted'
  | 'GatewayCompleted'
  | 'ToolRequested'
  | 'ToolCompleted'
  | 'ExecutionFinished'
  | 'ExecutionFailed';

export interface ExecutionEvent {
  type: ExecutionEventType;
  executionId: string;
  timestamp: number;
  payload?: any;
}
