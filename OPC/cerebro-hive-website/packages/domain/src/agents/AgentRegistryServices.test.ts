import { describe, expect, it } from 'vitest';
import { AgentLifecycleService } from './AgentLifecycleService';
import { AgentPublicationService } from './AgentPublicationService';

const definition = {
  schemaVersion: 1 as const,
  purpose: 'Answer finance questions',
  businessFunction: 'Finance',
  responsibilities: ['Analyze approved records'],
  expectedOutputs: ['A sourced summary'],
  systemInstructions: 'Use only approved financial data.',
  modelConfig: { providerRef: 'provider:openai', modelRef: 'model:gpt-5', temperature: 0.2, maxTokens: 4096 },
  capabilities: [], allowedActions: [], prohibitedActions: [], escalationRules: [],
  securityLevel: 'CONFIDENTIAL' as const, toolPermissions: [], knowledgeSources: [],
};

const admin = {
  tenantId: 'tenant-1', workspaceId: 'workspace-1', userId: 'admin-1',
  permissions: ['agent.version.publish', 'agent.lifecycle.certify'] as const,
};

describe('Agent Registry services', () => {
  it('rejects publication while production', async () => {
    const repository = {
      getRegistryAgent: async () => ({ id: 'agent-1', lifecycleStatus: 'PRODUCTION', draft: { definition } }),
      publishDraftTransaction: async () => { throw new Error('must not publish'); },
    } as any;
    const service = new AgentPublicationService(repository, async () => 'model-id');

    const result = await service.publish('agent-1', { expectedDraftRevision: 1 }, admin as any);

    expect(result.error?.code).toBe('AGENT_LIFECYCLE_CONFLICT');
  });

  it('resets certified to sandbox when a new definition is published', async () => {
    let nextLifecycle: string | undefined;
    const repository = {
      getRegistryAgent: async () => ({ id: 'agent-1', lifecycleStatus: 'CERTIFIED', draft: { definition } }),
      publishDraftTransaction: async (_id: string, input: any) => {
        nextLifecycle = input.nextLifecycleStatus;
        return { agent: { lifecycleStatus: input.nextLifecycleStatus }, version: { id: 'v2' }, draft: { revision: 2 } };
      },
    } as any;
    const service = new AgentPublicationService(repository, async () => 'model-id');

    const result = await service.publish('agent-1', { expectedDraftRevision: 1 }, admin as any);

    expect(result.isSuccess).toBe(true);
    expect(nextLifecycle).toBe('SANDBOX');
  });

  it('requires the production capability at the certified boundary', async () => {
    const repository = {
      getRegistryAgent: async () => ({ id: 'agent-1', lifecycleStatus: 'CERTIFIED', activeVersionId: 'v1' }),
      transitionLifecycle: async () => { throw new Error('must not transition'); },
    } as any;
    const service = new AgentLifecycleService(repository);

    const result = await service.transition('agent-1', { action: 'promote_to_production' }, admin as any);

    expect(result.error?.code).toBe('AGENT_FORBIDDEN');
  });
});
