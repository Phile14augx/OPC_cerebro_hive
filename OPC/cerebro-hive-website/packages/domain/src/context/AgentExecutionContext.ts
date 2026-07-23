export interface AgentExecutionContext {
  conversationId: string;
  tenantId: string;
  userId: string;
  
  traceId: string;
  correlationId: string;

  agentVersionId: string;
  promptVersionId: string;
  modelId: string;

  memory: {
    workingMemory: Record<string, any>;
    conversationHistory: any[];
    longTermMemoryContext?: string[];
  };

  availableTools: {
    name: string;
    description: string;
    version: string;
    executionMode: 'sync' | 'async';
    schema: Record<string, any>;
  }[];

  tokenBudget: {
    maxTokens: number;
    tokensUsed: number;
  };

  executionMode: 'sync' | 'async' | 'streaming';

  cancellationToken?: {
    isCancellationRequested: boolean;
  };
}
