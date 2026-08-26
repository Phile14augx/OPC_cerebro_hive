export interface PromptVersion {
  template: string;
  version: string;
  schema: string;
  parameters: Record<string, unknown>;
  supportedModels: string[];
}

export type LLMFailureType = 
  | 'timeout'
  | 'rate_limit'
  | 'server_error'
  | 'invalid_response'
  | 'schema_validation_failed'
  | 'provider_unavailable'
  | 'budget_exceeded'
  | 'policy_rejection';

export class ContributorExecutionFailure extends Error {
  constructor(
    public readonly failureType: LLMFailureType,
    message: string,
    public readonly isolated: boolean = true,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'ContributorExecutionFailure';
  }
}

export interface StructuredResponse {
  findings: Array<{
    severity: string;
    confidence: string;
    message: string;
    category?: string;
    description: string;
  }>;
}

export interface LLMExecutionResult {
  structuredResponse: StructuredResponse;
  provenance: {
    model: string;
    provider: string;
    temperature: number;
    executionTimeMs: number;
    tokenUsage: number;
    promptVersion: string;
  };
}
