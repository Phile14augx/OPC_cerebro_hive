import { describe, expect, it } from 'vitest';
import { LLMExecutionService, PromptVersion, ContributorExecutionFailure } from '../LLMExecutionService';

describe('LLMExecutionService', () => {
  const dummyPrompt: PromptVersion = {
    template: 'test',
    version: '1.0',
    schema: 'test',
    parameters: {},
    supportedModels: ['mock-model']
  };

  const dummyContext: any = {
    workflowId: 'w-1',
    workflowVersionId: 'wv-1',
    workflowSummary: { nodeCount: 1, edgeCount: 1 }
  };

  it('should return successfully with mock response', async () => {
    const service = new LLMExecutionService();
    const mockRes = { findings: [] };
    const result = await service.executePrompt(dummyPrompt, dummyContext, undefined, mockRes);
    
    expect(result.structuredResponse).toEqual(mockRes);
    expect(result.provenance.model).toBe('mock-model');
  });

  it('should trigger policy rejection exception from governance engine', async () => {
    const service = new LLMExecutionService();
    const promptWithPolicyViolation = {
      ...dummyPrompt,
      parameters: { contains_pii: true }
    };
    
    await expect(service.executePrompt(promptWithPolicyViolation, dummyContext))
      .rejects.toThrow('Governance Engine rejected prompt: contains PII');
  });

  it('should not retry on invalid JSON (non-retryable)', async () => {
    const service = new LLMExecutionService(undefined, 3);
    const promptWithInvalidJson = {
      ...dummyPrompt,
      parameters: { simulate_invalid_json: true }
    };
    
    let caughtErr: ContributorExecutionFailure | undefined;
    try {
      await service.executePrompt(promptWithInvalidJson, dummyContext);
    } catch (err) {
      caughtErr = err as ContributorExecutionFailure;
    }
    
    expect(caughtErr).toBeDefined();
    expect(caughtErr?.failureType).toBe('invalid_response');
    expect(caughtErr?.retryable).toBe(false);
  });

  it('should retry on rate_limit and eventually fail with timeout if maxRetries reached', async () => {
    const service = new LLMExecutionService(undefined, 2); // 2 retries = 3 attempts
    const promptWithRateLimit = {
      ...dummyPrompt,
      parameters: { simulate_failure: 'rate_limit' }
    };
    
    let caughtErr: ContributorExecutionFailure | undefined;
    try {
      await service.executePrompt(promptWithRateLimit, dummyContext);
    } catch (err) {
      caughtErr = err as ContributorExecutionFailure;
    }
    
    expect(caughtErr).toBeDefined();
    expect(caughtErr).toBeDefined();
    // It retries max times and then throws the original error
    expect(caughtErr?.failureType).toBe('rate_limit');
    expect(caughtErr?.message).toContain('Simulated LLM Gateway Failure: rate_limit');
  });
});
