export interface ExecutionCheckpoint {
  readonly id: string;
  readonly executionId: string;
  readonly stepNumber: number;
  readonly createdAt: Date;

  readonly providerRequest?: Record<string, unknown>;
  readonly providerResponse?: Record<string, unknown>;
  readonly usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  readonly finishReason?: string;
  readonly toolCalls?: Array<{ id: string; name: string; arguments: string }>;
}
