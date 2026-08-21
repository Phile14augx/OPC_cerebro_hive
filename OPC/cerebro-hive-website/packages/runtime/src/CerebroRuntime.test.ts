import { describe, it, expect } from 'vitest';
import { CerebroRuntime } from './CerebroRuntime';

describe('CerebroRuntime Contract', () => {
  it('should throw when an unregistered provider is requested (Negative Control)', async () => {
    const runtime = new CerebroRuntime();
    await expect(
      runtime.compileAgent({ id: 'agent-1', name: 'Test', version: '1.0', type: 'assistant', nodes: [] }, 'nonexistent')
    ).rejects.toThrow("Execution provider 'nonexistent' is not registered.");
  });

  it('should compile an agent using a registered provider', async () => {
    const runtime = new CerebroRuntime();
    runtime.registerProvider({
      name: 'mock',
      compile: async () => {},
      execute: async (input) => ({ ...input, done: true }),
      cancel: async () => {},
    });
    const agent = await runtime.compileAgent(
      { id: 'agent-2', name: 'Test', version: '1.0', type: 'assistant', nodes: [] },
      'mock'
    );
    expect(agent).toBeDefined();
    const output = await agent.execute({ ping: true });
    expect(output).toHaveProperty('done', true);
  });
});
