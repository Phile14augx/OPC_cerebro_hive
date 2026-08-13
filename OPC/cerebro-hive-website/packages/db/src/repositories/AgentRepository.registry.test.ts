import { describe, expect, it } from 'vitest';
import type { PrismaClient } from '../generated/client';
import { AgentRepository } from './AgentRepository';

const context = { tenantId: 'tenant-1', workspaceId: 'workspace-1', userId: 'user-1' };

function createFakePrisma() {
  const draft = {
    id: 'draft-1',
    agentId: 'agent-1',
    workspaceId: 'workspace-1',
    baseVersionId: null,
    definition: { schemaVersion: 1 },
    revision: 4,
    validationStatus: 'UNVALIDATED',
    validationErrors: null,
    createdBy: 'user-1',
    updatedBy: 'user-1',
    createdAt: new Date('2026-08-11T00:00:00Z'),
    updatedAt: new Date('2026-08-11T00:00:00Z'),
  };

  const prisma = {
    agent: {
      findFirst: async ({ where }: { where: { id: string; workspaceId: string } }) => {
        if (where.id !== 'agent-1' || where.workspaceId !== 'workspace-1') return null;
        return { id: 'agent-1', workspaceId: 'workspace-1', draft, activeVersion: null };
      },
    },
    agentDraft: {
      updateMany: async ({ where, data }: any) => {
        if (where.agentId !== draft.agentId || where.workspaceId !== draft.workspaceId || where.revision !== draft.revision) {
          return { count: 0 };
        }
        draft.definition = data.definition;
        draft.updatedBy = data.updatedBy;
        draft.revision += data.revision.increment;
        return { count: 1 };
      },
      findFirst: async ({ where }: any) => (
        where.agentId === draft.agentId && where.workspaceId === draft.workspaceId ? { ...draft } : null
      ),
    },
  };

  return { prisma: prisma as unknown as PrismaClient, draft };
}

describe('AgentRepository registry behavior', () => {
  it('never returns an agent from another workspace', async () => {
    const { prisma } = createFakePrisma();
    const repository = new AgentRepository(prisma);

    await expect(repository.getRegistryAgent('foreign-agent', { context })).resolves.toBeNull();
  });

  it('does not change a stale draft update', async () => {
    const { prisma, draft } = createFakePrisma();
    const repository = new AgentRepository(prisma);

    await expect(repository.updateDraft('agent-1', {
      expectedRevision: 3,
      definition: { schemaVersion: 1 } as any,
      updatedBy: 'user-1',
    }, { context })).rejects.toMatchObject({
      code: 'AGENT_DRAFT_REVISION_CONFLICT',
      currentRevision: 4,
    });

    expect(draft.revision).toBe(4);
    expect(draft.updatedAt).toEqual(new Date('2026-08-11T00:00:00Z'));
  });

  it('never uses legacy fallback for an explicitly non-production lifecycle', async () => {
    let versionLookup = false;
    const prisma = {
      agent: {
        findFirst: async () => ({ id: 'agent-1', workspaceId: 'workspace-1', lifecycleStatus: 'DRAFT', activeVersion: null }),
      },
      agentVersion: {
        findFirst: async () => { versionLookup = true; return { id: 'legacy-version' }; },
      },
    } as unknown as PrismaClient;
    const repository = new AgentRepository(prisma);

    const resolved = await repository.getActiveVersion('agent-1', { context, allowLegacyFallback: true });

    expect(resolved?.version).toBeNull();
    expect(resolved?.fallbackUsed).toBe(false);
    expect(versionLookup).toBe(false);
  });
});
