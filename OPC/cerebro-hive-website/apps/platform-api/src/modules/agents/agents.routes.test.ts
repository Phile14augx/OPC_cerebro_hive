import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import agentRoutes from './agents.routes';

async function createApp(overrides: Record<string, any> = {}) {
  const app = Fastify();
  app.addHook('preHandler', async request => {
    (request as any).cerebroContext = {
      tenantId: 'tenant-1', workspaceId: 'workspace-1', userId: 'user-1',
      permissions: ['agent.read'], traceId: 'trace-1',
    };
  });
  await app.register(agentRoutes, {
    registryService: { list: async () => ({ isSuccess: true, data: [] }), get: async () => ({ isSuccess: true, data: {} }), create: async () => ({ isSuccess: true, data: {} }), listVersions: async () => ({ isSuccess: true, data: [] }), getVersion: async () => ({ isSuccess: true, data: {} }) },
    draftService: { get: async () => ({ isSuccess: true, data: { revision: 2, validationStatus: 'INVALID' } }), update: async () => ({ isSuccess: true, data: {} }) },
    publicationService: { publish: async () => ({ isSuccess: true, data: {} }) },
    lifecycleService: { transition: async () => ({ isSuccess: true, data: {} }) },
    ...overrides,
  } as any);
  return app;
}

describe('agent registry routes', () => {
  it('returns only draft metadata supplied for a read-only user', async () => {
    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/a1/draft' });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.definition).toBeUndefined();
  });

  it('maps a stale autosave to 409 with a stable code', async () => {
    const app = await createApp({
      draftService: {
        get: async () => ({ isSuccess: true, data: {} }),
        update: async () => ({ isSuccess: false, error: { code: 'AGENT_DRAFT_REVISION_CONFLICT', message: 'stale', details: { currentRevision: 4 } } }),
      },
    });
    const response = await app.inject({
      method: 'PATCH', url: '/a1/draft',
      payload: { expectedRevision: 2, definition: { schemaVersion: 1 } },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe('AGENT_DRAFT_REVISION_CONFLICT');
    expect(response.json().error.details.currentRevision).toBe(4);
  });
});
