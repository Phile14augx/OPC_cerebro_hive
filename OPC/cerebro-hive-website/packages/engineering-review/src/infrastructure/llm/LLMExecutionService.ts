import { AIGovernanceEngine } from './AIGovernanceEngine';
import { ReviewContext } from '../../ports/IReviewContributor';

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

export class LLMExecutionService {
  constructor(
    private readonly governanceEngine: AIGovernanceEngine = new AIGovernanceEngine(),
    private readonly maxRetries: number = 3
  ) {}

  async executePrompt(
    prompt: PromptVersion,
    context: ReviewContext,
    providerOverride?: string,
    mockResponse?: StructuredResponse // Injected for mocking/testing
  ): Promise<LLMExecutionResult> {
    const startedAt = Date.now();

    // 1. Governance Interception
    await this.governanceEngine.evaluatePolicy(prompt);

    // 2. Retry Loop & Inference
    let attempt = 0;
    while (attempt <= this.maxRetries) {
      try {
        const result = await this.callGateway(prompt, context, providerOverride, mockResponse);
        const executionTimeMs = Date.now() - startedAt;
        
        return {
          structuredResponse: result.response,
          provenance: {
            model: result.model,
            provider: result.provider,
            temperature: 0.1, // Fixed for deterministic review outputs
            executionTimeMs,
            tokenUsage: result.tokenUsage,
            promptVersion: prompt.version,
          }
        };
      } catch (err) {
        if (err instanceof ContributorExecutionFailure && err.retryable && attempt < this.maxRetries) {
          attempt++;
          // Exponential backoff would go here
          continue;
        }
        throw err; // Isolated failure handled by Orchestrator
      }
    }
    
    throw new ContributorExecutionFailure('timeout', 'Exceeded maximum retries for LLM execution', true, false);
  }

  private async callGateway(
    prompt: PromptVersion,
    context: ReviewContext,
    provider: string = 'openai',
    mockResponse?: StructuredResponse
  ): Promise<{ response: StructuredResponse; model: string; provider: string; tokenUsage: number }> {
    
    if (mockResponse) {
      // Deterministic fallback for testing
      return {
        response: mockResponse,
        model: prompt.supportedModels[0] || 'gpt-4',
        provider: 'mock-provider',
        tokenUsage: 150,
      };
    }

    // In a real implementation, we would POST to /v1/chat/completions here.
    // For M26.5, this simulates hitting the LLM Gateway and returning structured parsing.
    
    // Simulate latency
    await new Promise(res => setTimeout(res, 200));

    // M26.5 simulation logic: if a special parameter is passed, we can simulate failures
    if (prompt.parameters['simulate_failure']) {
      const failureType = prompt.parameters['simulate_failure'] as LLMFailureType;
      const retryable = ['rate_limit', 'server_error', 'provider_unavailable'].includes(failureType);
      throw new ContributorExecutionFailure(failureType, `Simulated LLM Gateway Failure: ${failureType}`, true, retryable);
    }
    
    if (prompt.parameters['simulate_invalid_json']) {
      throw new ContributorExecutionFailure('invalid_response', 'Failed to parse JSON response from LLM', true, false);
    }

    // Default simulated response
    return {
      response: {
        findings: []
      },
      model: prompt.supportedModels[0] || 'gpt-4',
      provider,
      tokenUsage: 345,
    };
  }
}
