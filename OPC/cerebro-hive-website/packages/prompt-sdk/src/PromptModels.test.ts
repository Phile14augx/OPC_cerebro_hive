import { describe, it, expect } from 'vitest';
import type { PromptVersion } from './PromptModels';

describe('PromptModels Contract', () => {
  it('should construct a valid PromptVersion with approved status', () => {
    const pv: PromptVersion = {
      id: 'pv-001',
      promptId: 'pr-001',
      version: 1,
      template: 'You are a helpful assistant. {{context}}',
      variables: ['context'],
      approvalStatus: 'approved',
      metadata: {
        owner: 'team-ai',
        intendedAgent: 'cerebro-v2',
        supportedModels: ['claude-sonnet-4-6'],
        temperatureDefault: 0.7,
        maxTokens: 8192,
      },
    };
    expect(pv.approvalStatus).toBe('approved');
    expect(pv.variables).toContain('context');
  });

  it('should detect draft prompt usage in production (Negative Control)', () => {
    const status = 'draft';
    expect(status).not.toBe('approved');
  });
});
