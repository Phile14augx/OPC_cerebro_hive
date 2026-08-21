import { describe, it, expect } from 'vitest';
import type { CerebroAgent } from './CerebroAgent';

class MockAgent implements CerebroAgent {
  public definition = { id: 'mock-agent', name: 'Mock Agent', version: '1.0.0', type: 'assistant' as const, nodes: [] };
  
  async initialize(): Promise<void> {
    // initialize
  }
  
  async execute(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (input.fail) {
      throw new Error('Execution failed');
    }
    return { ...input, executed: true };
  }
  
  async terminate(): Promise<void> {
    // terminate
  }
}

describe('CerebroAgent Interface Contract', () => {
  it('should execute successfully when valid input is provided', async () => {
    const agent: CerebroAgent = new MockAgent();
    const result = await agent.execute({ text: 'hello' });
    expect(result.executed).toBe(true);
    expect(result.text).toBe('hello');
  });

  it('should fail when domain behavior is incorrect', async () => {
    const agent: CerebroAgent = new MockAgent();
    await expect(agent.execute({ fail: true })).rejects.toThrow('Execution failed');
  });
});
