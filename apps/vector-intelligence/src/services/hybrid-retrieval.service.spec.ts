declare let describe: any; declare let it: any; declare let expect: any; declare let beforeEach: any; declare let jest: any;
import { Test, TestingModule } from '@nestjs/testing';
import { HybridRetrievalService } from './hybrid-retrieval.service';
import { VectorStoreService } from './vector-store.service';
import { HybridSearchDto } from '../dto/hybrid-search.dto';

describe('HybridRetrievalService', () => {
  let service: HybridRetrievalService;
  let vectorStoreService: VectorStoreService;

  beforeEach(async () => {
    vectorStoreService = new VectorStoreService();
service = new HybridRetrievalService(vectorStoreService);




  });

  it('should search using dense and sparse and RRF', async () => {
    await vectorStoreService.upsert({
      namespace: 'ns1',
      vectors: [
        { id: 'doc1', values: [1, 0], metadata: { text: 'hello world', category: 'A' } },
        { id: 'doc2', values: [0, 1], metadata: { text: 'hello there', category: 'B' } },
        { id: 'doc3', values: [1, 1], metadata: { text: 'world of programming', category: 'A' } }
      ]
    });

    const dto: HybridSearchDto = {
      namespace: 'ns1',
      query_vector: [1, 0],
      query_text: 'hello world',
      top_k: 2,
      filter: { category: 'A' }
    };

    const res = await service.search(dto);
    expect(res.results.length).toBe(2);
    // With filter category A, doc1 and doc3 should be returned
    expect(res.results[0].id).toBe('doc1'); // Should be highest because it matches both dense perfectly and text perfectly
  });

  it('should handle sparse only search', async () => {
    await vectorStoreService.upsert({
      namespace: 'ns2',
      vectors: [
        { id: 'd1', values: [0], metadata: { title: 'quick brown fox' } },
        { id: 'd2', values: [0], metadata: { title: 'lazy dog' } }
      ]
    });

    const res = await service.search({
      namespace: 'ns2',
      query_vector: [],
      query_text: 'fox',
      top_k: 1
    });

    expect(res.results.length).toBe(1);
    expect(res.results[0].id).toBe('d1');
  });

  it('should handle empty text gracefully', async () => {
    const res = await service.search({
      namespace: 'ns2',
      query_vector: [0],
      query_text: '',
      top_k: 10
    });
    expect(res.results).toHaveLength(0);
  });
});
