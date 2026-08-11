import type { FastifyInstance } from 'fastify';
import { CommandBus } from '@cerebro/core-bus';
import type {
  OperatingSystemRepository,
  RequestContext,
} from '@cerebro/db';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  EntityDetail,
  OperatingGraphSnapshot,
  OperatingNodeType,
} from '../../../../../packages/shared-types/src/domain/operating-system';
import { bootstrap, type BootstrapDeps } from '../../bootstrap';
import { OperatingSystemService } from './OperatingSystemService';

vi.mock('@cerebro/auth/server', () => ({
  safeVerifyJWT: async (token: string) =>
    token === 'verified-test-token'
      ? {
          payload: {
            sub: 'user-verified',
            org_id: 'tenant-verified',
          },
          isExpired: false,
        }
      : { error: 'invalid test token', isExpired: false },
  isSystemAdmin: () => false,
  getRealmRoles: () => [],
  getClientRoles: () => [],
  getPermissions: () => [],
}));

const originalNodeEnvironment = process.env.NODE_ENV;
const originalDemoFlag = process.env.CEREBRO_COMPANY_OS_DEMO;

let failLiveSnapshot = false;
const knownAgentId = '00000000-0000-4000-8000-000000000001';

function authHeaders(workspaceId = 'workspace-a') {
  return {
    authorization: 'Bearer verified-test-token',
    'x-workspace-id': workspaceId,
  };
}

function liveSnapshot(context: RequestContext): OperatingGraphSnapshot {
  return {
    revision: `${context.tenantId}:${context.workspaceId}`,
    generatedAt: '2026-08-09T00:00:00.000Z',
    mode: 'live',
    nodes: [],
    edges: [],
  };
}

function entityDetail(
  type: OperatingNodeType,
  id: string,
  context: RequestContext,
): EntityDetail {
  return {
    node: {
      id,
      type,
      label: `${context.workspaceId}:${id}`,
      status: 'healthy',
      departmentId: null,
      detailUrl: `/operating-system/${type}/${id}`,
      tags: [],
      health: { score: 100, lastActivityAt: null },
      summary: {},
    },
    metrics: { healthScore: 100 },
    relationships: [],
    actions: [],
  };
}

function createRepository() {
  return {
    async getGraphSnapshot({ context }: { context: RequestContext }) {
      if (failLiveSnapshot) {
        throw new Error('live repository unavailable');
      }
      return liveSnapshot(context);
    },
    async getEntityDetail(
      type: OperatingNodeType,
      id: string,
      { context }: { context: RequestContext },
    ) {
      return id === 'known-entity' || id === knownAgentId
        ? entityDetail(type, id, context)
        : null;
    },
  } as unknown as OperatingSystemRepository;
}

function createBootstrapDependencies(
  repository: OperatingSystemRepository,
): BootstrapDeps {
  const workspaceRepository = {
    async getWorkspaceById(
      workspaceId: string,
      { context }: { context: RequestContext },
    ) {
      if (
        workspaceId !== 'workspace-a' ||
        context.tenantId !== 'tenant-verified'
      ) {
        return null;
      }
      return { id: workspaceId, tenantId: context.tenantId };
    },
  };

  return {
    agentRuntimeService: { execute: vi.fn().mockResolvedValue(undefined) },
    agentRepository: {
      getLatestVersion: vi.fn().mockResolvedValue({
        id: 'published-version-1',
        modelId: 'gpt-test',
        instructions: 'Be a verified operating-system agent.',
      }),
    },
    agentConversationRepository: {},
    workspaceRepository,
    aiGateway: { getHealth: () => ({ providers: [] }) },
    toolRuntime: {},
    toolRegistry: {},
    unitOfWork: {},
    executionKernel: {},
    executionStore: {},
    executionReplayService: {},
    operatingSystemService: new OperatingSystemService(repository),
  } as unknown as BootstrapDeps;
}

describe('operating-system routes', () => {
  let app!: FastifyInstance;

  beforeAll(async () => {
    app = await bootstrap(
      new CommandBus(),
      createBootstrapDependencies(createRepository()),
    );
    app.log.level = 'silent';
  }, 60_000);

  beforeEach(() => {
    failLiveSnapshot = false;
    process.env.NODE_ENV = 'test';
    process.env.CEREBRO_COMPANY_OS_DEMO = 'enabled';
  });

  afterEach(() => {
    if (originalNodeEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnvironment;

    if (originalDemoFlag === undefined) delete process.env.CEREBRO_COMPANY_OS_DEMO;
    else process.env.CEREBRO_COMPANY_OS_DEMO = originalDemoFlag;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('rejects unauthenticated graph requests through the production middleware chain', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/operating-system/graph',
      headers: { 'x-workspace-id': 'workspace-a' },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe('UNAUTHORIZED');
  });

  it('rejects a workspace outside the verified tenant through the production middleware chain', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/operating-system/graph',
      headers: authHeaders('workspace-b'),
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe('FORBIDDEN');
  });

  it('registers the graph route behind authenticated workspace access', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/operating-system/graph',
      headers: authHeaders('workspace-a'),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: expect.objectContaining({
        mode: 'live',
        revision: 'tenant-verified:workspace-a',
      }),
    });
  });

  it('rejects demo mode in production', async () => {
    process.env.NODE_ENV = 'production';
    const response = await app.inject({
      method: 'GET',
      url: '/api/operating-system/graph?mode=demo',
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe('DEMO_MODE_DISABLED');
  });

  it('uses snapshot mode as the only public demo marker', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/operating-system/graph?mode=demo',
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.mode).toBe('demo');
    expect(
      body.data.nodes.some(
        (node: { tags: string[]; summary: Record<string, unknown> }) =>
          node.tags.includes('demo') || node.summary.demo !== undefined,
      ),
    ).toBe(false);
    expect(body.data.nodes.map((node: { type: string }) => node.type).sort()).toEqual([
      'agent',
      'data-source',
      'department',
      'human',
      'integration',
      'memory',
      'model',
      'output',
      'skill',
      'system',
      'task',
      'tool',
      'workflow',
    ]);
    expect(body.data.nodes[0].id).toBe('demo-department-operations');
  });

  it('does not replace live repository failures with demo data', async () => {
    failLiveSnapshot = true;
    const response = await app.inject({
      method: 'GET',
      url: '/api/operating-system/graph',
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().data).toBeUndefined();
  });

  it('rejects demo mode when the explicit runtime flag is disabled', async () => {
    delete process.env.CEREBRO_COMPANY_OS_DEMO;
    const response = await app.inject({
      method: 'GET',
      url: '/api/operating-system/graph?mode=demo',
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe('DEMO_MODE_DISABLED');
  });

  it('rejects unsupported graph modes', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/operating-system/graph?mode=fallback',
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('INVALID_MODE');
  });

  it('returns an entity from the verified workspace projection', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/operating-system/entities/agent/known-entity',
      headers: authHeaders('workspace-a'),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: expect.objectContaining({
        node: expect.objectContaining({
          id: 'known-entity',
          type: 'agent',
          label: 'workspace-a:known-entity',
        }),
      }),
    });
  });

  it('rejects unsupported entity types', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/operating-system/entities/secret/known-entity',
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('INVALID_ENTITY_TYPE');
  });

  it('rejects blank entity ids', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/operating-system/entities/agent/%20',
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('INVALID_ENTITY_ID');
  });

  it('returns a safe not-found response for an absent entity', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/operating-system/entities/agent/missing-entity',
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'ENTITY_NOT_FOUND' });
  });

  it('dispatches an allowed agent command through the production bootstrap', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/operating-system/commands',
      headers: authHeaders(),
      payload: {
        kind: 'execute-agent',
        targetId: knownAgentId,
        input: { message: 'Summarize the current operating state.' },
      },
    });

    expect(response.statusCode).toBe(202);
    expect(response.json()).toEqual({
      data: expect.objectContaining({ status: 'running' }),
    });
  });

  it('resolves the workspace-authorized agent version and instructions before runtime execution', async () => {
    const runtime = { execute: vi.fn().mockResolvedValue(undefined) };
    const agentRepository = {
      getLatestVersion: vi.fn().mockResolvedValue({ id: 'published-version-2', modelId: 'gpt-verified', instructions: 'Use the configured instructions.' }),
    };
    const isolated = await bootstrap(new CommandBus(), {
      ...createBootstrapDependencies(createRepository()),
      agentRuntimeService: runtime,
      agentRepository,
    } as unknown as BootstrapDeps);
    isolated.log.level = 'silent';
    const response = await isolated.inject({ method: 'POST', url: '/api/operating-system/commands', headers: authHeaders(), payload: { kind: 'execute-agent', targetId: knownAgentId, input: { message: 'Run the configured agent.' } } });
    expect(response.statusCode).toBe(202);
    await vi.waitFor(() => expect(runtime.execute).toHaveBeenCalled());
    expect(runtime.execute).toHaveBeenCalledWith(expect.objectContaining({ agentVersionId: 'published-version-2', promptVersionId: 'published-version-2', modelId: 'gpt-verified' }), 'Run the configured agent.', 'Use the configured instructions.');
    await isolated.close();
  });
});
