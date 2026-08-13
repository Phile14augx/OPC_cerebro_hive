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
  it('preserves paginated list metadata and legacy versions projection', async () => {
    const app = await createApp({
      registryService: {
        list: async () => ({ isSuccess: true, data: [{ id: 'a1', name: 'Alpha', activeVersion: { id: 'v1' } }] }),
      },
    });
    const response = await app.inject({ method: 'GET', url: '/?page=1&limit=10&search=alp' });

    expect(response.statusCode).toBe(200);
    expect(response.json().meta).toMatchObject({ total: 1, page: 1, limit: 10, totalPages: 1 });
    expect(response.json().data[0].versions).toEqual([{ id: 'v1' }]);
  }, 10_000);

  it('redacts draft definition from the agent detail endpoint', async () => {
    const app = await createApp({
      registryService: {
        get: async () => ({ isSuccess: true, data: { id: 'a1', draft: { revision: 2 } } }),
      },
    });
    const response = await app.inject({ method: 'GET', url: '/a1' });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.draft.definition).toBeUndefined();
  });

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

  it('requires and forwards an idempotency key for publication', async () => {
    let command: Record<string, unknown> | undefined;
    const app = await createApp({
      publicationService: {
        publish: async (_id: string, value: Record<string, unknown>) => {
          command = value;
          return { isSuccess: true, data: {} };
        },
      },
    });

    const missing = await app.inject({ method: 'POST', url: '/a1/publish', payload: { expectedDraftRevision: 2 } });
    expect(missing.statusCode).toBe(400);
    expect(missing.json().error.code).toBe('AGENT_IDEMPOTENCY_KEY_REQUIRED');

    const accepted = await app.inject({
      method: 'POST', url: '/a1/publish',
      headers: { 'idempotency-key': 'publish-a1-r2' },
      payload: { expectedDraftRevision: 2 },
    });
    expect(accepted.statusCode).toBe(201);
    expect(command?.idempotencyKey).toBe('publish-a1-r2');
  });
});
