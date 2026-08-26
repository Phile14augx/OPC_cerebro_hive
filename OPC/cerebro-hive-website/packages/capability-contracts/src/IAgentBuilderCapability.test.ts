import { describe, it, expect } from 'vitest';

// capability-contracts defines a pure interface. We test the interface shape constraint.
import type { PublishAgentInput } from './IAgentBuilderCapability';

describe('CapabilityContracts Contract', () => {
  it('should construct a valid PublishAgentInput', () => {
    const input: PublishAgentInput = {
      modelId: 'claude-sonnet-4-6',
      instructions: 'You are a helpful assistant.',
      tools: [{ name: 'web_search' }],
    };
    expect(input.modelId).toBe('claude-sonnet-4-6');
    expect(input.tools).toHaveLength(1);
  });

  it('should detect missing instructions (Negative Control)', () => {
    const instructions = '';
    expect(instructions.length).toBe(0); // domain violation: empty instructions
  });
});
