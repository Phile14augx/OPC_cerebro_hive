import { describe, expect, it } from 'vitest';
import { runBackfill, type AgentRegistryBackfillStore, type LegacyAgentBackfillRecord } from './backfill';

function storeFor(agents: LegacyAgentBackfillRecord[]): AgentRegistryBackfillStore & { agents: LegacyAgentBackfillRecord[] } {
  return {
    agents,
    async listAgentsAfter(cursor, limit) {
      return this.agents.filter(agent => !cursor || agent.id > cursor).sort((a, b) => a.id.localeCompare(b.id)).slice(0, limit);
    },
    async applyAgent(plan) {
      const agent = this.agents.find(value => value.id === plan.agentId)!;
      const governed = agent.versions.every(version => version.workspaceId && version.definition && version.definitionSchemaVersion && version.definitionHash && version.publishedAt && version.publicationSource);
      if (agent.activeVersionId === plan.activeVersionId && agent.lifecycleStatus === plan.lifecycleStatus && governed) return false;
      agent.activeVersionId = plan.activeVersionId;
      agent.lifecycleStatus = plan.lifecycleStatus;
      for (const version of agent.versions) {
        version.workspaceId = agent.workspaceId;
        version.definition = { schemaVersion: 1 };
        version.definitionSchemaVersion = 1;
        version.definitionHash = `hash-${version.id}`;
        version.publishedAt = new Date();
        version.publicationSource = 'MIGRATION';
      }
      return true;
    },
  };
}

describe('agent registry legacy backfill', () => {
  it('is idempotent and preserves highest-version runtime resolution', async () => {
    const store = storeFor([
      { id: 'a1', workspaceId: 'w1', name: 'One', description: null, isActive: true, activeVersionId: null, lifecycleStatus: null, versions: [{ id: 'v1', version: 1 }, { id: 'v2', version: 2 }] },
      { id: 'a2', workspaceId: 'w1', name: 'Two', description: null, isActive: true, activeVersionId: null, lifecycleStatus: null, versions: [] },
      { id: 'a3', workspaceId: 'w1', name: 'Three', description: null, isActive: false, activeVersionId: null, lifecycleStatus: null, versions: [{ id: 'v3', version: 1 }] },
    ]);

    const first = await runBackfill(store, { mode: 'apply', batchSize: 2 });
    const second = await runBackfill(store, { mode: 'apply', batchSize: 2 });

    expect(first.changed).toBe(3);
    expect(first.reviewRequired).toEqual(['a3']);
    expect(second.changed).toBe(0);
    expect(store.agents.map(agent => agent.activeVersionId)).toEqual(['v2', null, 'v3']);
    expect(store.agents[0].versions.every(version => version.workspaceId === 'w1' && version.definitionHash)).toBe(true);
  });

  it('does not mutate in dry-run mode', async () => {
    const store = storeFor([{ id: 'a1', workspaceId: 'w1', name: 'One', description: null, isActive: true, activeVersionId: null, lifecycleStatus: null, versions: [{ id: 'v1', version: 1 }] }]);
    const result = await runBackfill(store, { mode: 'dry-run', batchSize: 1 });
    expect(result.changed).toBe(1);
    expect(store.agents[0].activeVersionId).toBeNull();
  });
});
