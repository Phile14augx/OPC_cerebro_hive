import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { VectorStoreService } from './services/vector-store.service';

const actor = {
  subjectId: 'p02-worker',
  tenantId: 'tenant-a',
  scopes: ['vector:write', 'vector:read'],
  aclGroups: ['finance'],
};

describe('P03 remediation contracts', () => {
  it('persists vectors durably across repository and service re-instantiation', async () => {
    const { JsonFileVectorRepository } = await import('./adapters/json-file-vector.repository');
    const directory = await mkdtemp(join(tmpdir(), 'p03-durable-'));
    const file = join(directory, 'vectors.json');
    try {
      const first = new VectorStoreService(new JsonFileVectorRepository(file));
      await first.upsert({ namespace: 'tenant-a/docs', vectors: [{ id: 'doc-1', values: [1, 0] }] });

      const second = new VectorStoreService(new JsonFileVectorRepository(file));
      expect(await second.getAll('tenant-a/docs')).toEqual([{ id: 'doc-1', values: [1, 0] }]);
      expect(JSON.parse(await readFile(file, 'utf8')).namespaces['tenant-a/docs']).toHaveLength(1);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('exercises the declared P02 ingestion shape through local authorization and ingestion adapters', async () => {
    const { InMemoryVectorRepository } = await import('./adapters/in-memory-vector.repository');
    const { NamespaceScopeAuthorizationAdapter } = await import('./adapters/namespace-scope-authorization.adapter');
    const { AuthorizedVectorIntelligenceAdapter } = await import('./adapters/authorized-vector-intelligence.adapter');
    const { P02EmbeddingIngestionAdapter } = await import('./adapters/p02-embedding-ingestion.adapter');
    const store = new VectorStoreService(new InMemoryVectorRepository());
    const access = new AuthorizedVectorIntelligenceAdapter(store, new NamespaceScopeAuthorizationAdapter(), 100);
    const p02 = new P02EmbeddingIngestionAdapter(access);

    await expect(p02.ingest(actor, {
      producer: 'P02',
      namespace: 'tenant-a/docs',
      embedding_model: 'e5-large-v2',
      dimensions: 2,
      vectors: [{ id: 'doc-1', embedding: [1, 0], payload: { acl_groups: ['finance'] } }],
    })).resolves.toEqual({ upserted_count: 1 });
    await expect(access.query(actor, 'tenant-a/docs', [1, 0], 1)).resolves.toMatchObject([{ id: 'doc-1' }]);
  });

  it('rejects unauthorized cross-tenant access before touching storage', async () => {
    const { InMemoryVectorRepository } = await import('./adapters/in-memory-vector.repository');
    const { NamespaceScopeAuthorizationAdapter } = await import('./adapters/namespace-scope-authorization.adapter');
    const { AuthorizedVectorIntelligenceAdapter } = await import('./adapters/authorized-vector-intelligence.adapter');
    const access = new AuthorizedVectorIntelligenceAdapter(new VectorStoreService(new InMemoryVectorRepository()), new NamespaceScopeAuthorizationAdapter(), 100);

    await expect(access.query(actor, 'tenant-b/docs', [1, 0], 1)).rejects.toThrow(/authorized/i);
  });

  it('times out an unavailable authorization dependency deterministically', async () => {
    const { InMemoryVectorRepository } = await import('./adapters/in-memory-vector.repository');
    const { AuthorizedVectorIntelligenceAdapter } = await import('./adapters/authorized-vector-intelligence.adapter');
    const unavailableAuthorization = { authorize: () => new Promise<void>(() => undefined) };
    const access = new AuthorizedVectorIntelligenceAdapter(new VectorStoreService(new InMemoryVectorRepository()), unavailableAuthorization, 10);

    await expect(access.query(actor, 'tenant-a/docs', [1, 0], 1)).rejects.toThrow(/timed out/i);
  });

  it('keeps the previous durable snapshot when an atomic replacement fails', async () => {
    const { JsonFileVectorRepository } = await import('./adapters/json-file-vector.repository');
    const directory = await mkdtemp(join(tmpdir(), 'p03-rollback-'));
    const file = join(directory, 'vectors.json');
    try {
      const healthy = new VectorStoreService(new JsonFileVectorRepository(file));
      await healthy.upsert({ namespace: 'tenant-a/docs', vectors: [{ id: 'stable', values: [1, 0] }] });
      const failingFiles = { read: (path: string) => readFile(path, 'utf8'), writeAtomically: async () => { throw new Error('disk unavailable'); } };
      const failing = new VectorStoreService(new JsonFileVectorRepository(file, failingFiles));

      await expect(failing.upsert({ namespace: 'tenant-a/docs', vectors: [{ id: 'partial', values: [0, 1] }] })).rejects.toThrow(/disk unavailable/i);
      const restored = new VectorStoreService(new JsonFileVectorRepository(file));
      expect((await restored.getAll('tenant-a/docs')).map((item) => item.id)).toEqual(['stable']);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
