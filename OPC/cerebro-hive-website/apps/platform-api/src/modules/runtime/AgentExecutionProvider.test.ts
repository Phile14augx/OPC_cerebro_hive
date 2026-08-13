import { describe, expect, it } from 'vitest';
import { Execution } from '@cerebro/domain';
import { AgentExecutionProvider } from './AgentExecutionProvider';

const execution = Execution.create({
  kind: 'Agent', tenantId: 'tenant-1', workspaceId: 'workspace-1', userId: 'user-1',
  traceId: 'trace-1', correlationId: 'corr-1', metadata: { agentId: 'agent-1', message: 'hello' },
});

describe('AgentExecutionProvider governance', () => {
  it('refuses a suspended agent before invoking runtime', async () => {
    let invoked = false;
    const runtime = { execute: async () => { invoked = true; return {}; } } as any;
    const repository = {
      getActiveVersion: async () => ({ agent: { lifecycleStatus: 'SUSPENDED' }, version: { id: 'v1' }, fallbackUsed: false }),
    } as any;
    const provider = new AgentExecutionProvider(runtime, repository);

    const result = await provider.execute(execution);

    expect(result).toMatchObject({ outcome: 'failed', reason: expect.stringContaining('not executable') });
    expect(invoked).toBe(false);
  });
});
