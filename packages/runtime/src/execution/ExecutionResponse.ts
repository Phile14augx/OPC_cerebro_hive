export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AgentExecutionResult {
  id: string;
  message: string;
  provider: string;
  model: string;
  usage: TokenUsage;
  finishReason: string;
  latencyMs: number;
  cost: number;
  traceId: string;
  executionId: string;
}
