declare let describe: any; declare let it: any; declare let expect: any; declare let beforeEach: any; declare let jest: any;
import { Test, TestingModule } from '@nestjs/testing';
import { VectorStoreService } from './vector-store.service';
import { VectorUpsertDto } from '../dto/vector-upsert.dto';

describe('VectorStoreService', () => {
  let service: VectorStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VectorStoreService],
    }).compile();

    service = module.get<VectorStoreService>(VectorStoreService);
  });

  it('should upsert and query vectors correctly', async () => {
    const dto: VectorUpsertDto = {
      namespace: 'test-ns',
      vectors: [
        { id: 'vec1', values: [1, 0, 0], metadata: { type: 'A' } },
        { id: 'vec2', values: [0, 1, 0], metadata: { type: 'B' } },
        { id: 'vec3', values: [0, 0, 1], metadata: { type: 'A' } },
      ]
    };

    const res = await service.upsert(dto);
    expect(res.upserted_count).toBe(3);

    // Query for vec1
    const results = await service.query('test-ns', [1, 0, 0], 2);
    expect(results.length).toBe(2);
    expect(results[0].id).toBe('vec1');
    expect(results[0].score).toBe(1);

    // Query with filter
    const filterResults = await service.query('test-ns', [0, 0, 1], 2, { type: 'B' });
    expect(filterResults.length).toBe(1);
    expect(filterResults[0].id).toBe('vec2');
  });

  it('should handle zero vectors gracefully', async () => {
    const results = await service.query('test-ns', [0, 0, 0], 2);
    expect(results.length).toBe(0);
  });

  it('should delete vectors', async () => {
    await service.upsert({
      namespace: 'test-ns2',
      vectors: [
        { id: 'v1', values: [1, 1] },
        { id: 'v2', values: [2, 2] }
      ]
    });
    
    const delRes = await service.delete('test-ns2', ['v1', 'v3']);
    expect(delRes.deleted_count).toBe(1);

    const all = await service.getAll('test-ns2');
    expect(all.length).toBe(1);
    expect(all[0].id).toBe('v2');
  });

  it('rejects non-finite vectors', async () => {
    await expect(service.upsert({ namespace: 'tenant/docs', vectors: [{ id: 'v1', values: [1, Number.NaN] }] })).rejects.toThrow();
  });

  it.each([
    ['invalid namespace', { namespace: '../tenant', vectors: [{ id: 'v1', values: [1, 0] }] }],
    ['invalid vector id', { namespace: 'tenant/docs', vectors: [{ id: 'bad/id', values: [1, 0] }] }],
  ])('rejects malformed upserts: %s', async (_label, dto) => {
    await expect(service.upsert(dto as VectorUpsertDto)).rejects.toThrow();
  });

  it('rejects a query whose dimensions differ from persisted vectors', async () => {
    await service.upsert({ namespace: 'tenant/docs', vectors: [{ id: 'v1', values: [1, 0, 0] }] });
    await expect(service.query('tenant/docs', [1, 0], 10)).rejects.toThrow(/dimension/i);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 1001])('rejects unsafe topK value %s', async (topK) => {
    await expect(service.query('tenant/docs', [1, 0], topK)).rejects.toThrow(/topK/i);
  });

  it('orders equal scores deterministically by vector id', async () => {
    await service.upsert({ namespace: 'tenant/ties', vectors: [{ id: 'z-last', values: [1, 0] }, { id: 'a-first', values: [1, 0] }] });
    const results = await service.query('tenant/ties', [1, 0], 2);
    expect(results.map((result) => result.id)).toEqual(['a-first', 'z-last']);
  });
});
