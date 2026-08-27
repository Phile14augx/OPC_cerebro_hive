import { VectorStoreService } from '../../src/services/vector-store.service';
import { HybridRetrievalService } from '../../src/services/hybrid-retrieval.service';
import { RerankingService } from '../../src/services/reranking.service';

describe('Vector Intelligence Integration', () => {
  let vectorStoreService: VectorStoreService;
  let hybridRetrievalService: HybridRetrievalService;
  let rerankingService: RerankingService;

  beforeEach(() => {
    vectorStoreService = new VectorStoreService();
    hybridRetrievalService = new HybridRetrievalService(vectorStoreService);
    rerankingService = new RerankingService();
  });

  // 1
  it('should upsert and query a vector', async () => {
    await vectorStoreService.upsert({
      namespace: 'ns-1',
      vectors: [{ id: 'v1', values: [1, 0, 0], metadata: { text: 'hello' } }]
    });
    const results = await vectorStoreService.query('ns-1', [1, 0, 0], 1);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('v1');
    expect(results[0].score).toBeGreaterThan(0);
  });

  // 2
  it('should query multiple vectors and return topK', async () => {
    await vectorStoreService.upsert({
      namespace: 'ns-2',
      vectors: [
        { id: 'v1', values: [1, 0, 0] },
        { id: 'v2', values: [0, 1, 0] },
        { id: 'v3', values: [0, 0, 1] }
      ]
    });
    const results = await vectorStoreService.query('ns-2', [1, 0.1, 0], 2);
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('v1');
  });

  // 3
  it('should query vectors with metadata filter', async () => {
    await vectorStoreService.upsert({
      namespace: 'ns-3',
      vectors: [
        { id: 'v1', values: [1, 0, 0], metadata: { type: 'A' } },
        { id: 'v2', values: [1, 0, 0], metadata: { type: 'B' } }
      ]
    });
    const results = await vectorStoreService.query('ns-3', [1, 0, 0], 10, { type: 'B' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('v2');
  });

  // 4
  it('should return empty results if namespace is empty', async () => {
    const results = await vectorStoreService.query('ns-empty', [1, 0, 0], 10);
    expect(results).toHaveLength(0);
  });

  // 5
  it('should delete a vector and return empty results', async () => {
    await vectorStoreService.upsert({
      namespace: 'ns-4',
      vectors: [{ id: 'v1', values: [1, 0, 0] }]
    });
    const delResult = await vectorStoreService.delete('ns-4', ['v1']);
    expect(delResult.deleted_count).toBe(1);
    const results = await vectorStoreService.query('ns-4', [1, 0, 0], 1);
    expect(results).toHaveLength(0);
  });

  // 6
  it('should handle deletion of non-existent vector', async () => {
    const delResult = await vectorStoreService.delete('ns-4', ['v-does-not-exist']);
    expect(delResult.deleted_count).toBe(0);
  });

  // 7
  it('should get all vectors for a namespace', async () => {
    await vectorStoreService.upsert({
      namespace: 'ns-5',
      vectors: [
        { id: 'v1', values: [1, 0, 0] },
        { id: 'v2', values: [0, 1, 0] }
      ]
    });
    const allDocs = await vectorStoreService.getAll('ns-5');
    expect(allDocs).toHaveLength(2);
    expect(allDocs.map(d => d.id)).toContain('v1');
    expect(allDocs.map(d => d.id)).toContain('v2');
  });

  // 8
  it('should return ranked results from hybrid search based on query vector', async () => {
    await vectorStoreService.upsert({
      namespace: 'ns-hybrid-1',
      vectors: [
        { id: 'doc1', values: [1, 0, 0], metadata: { text: 'machine learning model' } },
        { id: 'doc2', values: [0, 1, 0], metadata: { text: 'deep learning neural' } }
      ]
    });
    const results = await hybridRetrievalService.search({
      namespace: 'ns-hybrid-1',
      query_vector: [1, 0, 0],
      top_k: 2
    });
    expect(results.results.length).toBeGreaterThan(0);
    expect(results.results[0].id).toBe('doc1');
  });

  // 9
  it('should return ranked results from sparse text search', async () => {
    await vectorStoreService.upsert({
      namespace: 'ns-hybrid-2',
      vectors: [
        { id: 'doc1', values: [0, 0, 0], metadata: { text: 'machine learning model' } },
        { id: 'doc2', values: [0, 0, 0], metadata: { text: 'deep learning neural' } }
      ]
    });
    const results = await hybridRetrievalService.search({
      namespace: 'ns-hybrid-2',
      query_vector: [],
      query_text: 'machine',
      top_k: 2
    });
    expect(results.results.length).toBeGreaterThan(0);
    expect(results.results[0].id).toBe('doc1');
  });

  // 10
  it('should combine dense and sparse results using RRF', async () => {
    await vectorStoreService.upsert({
      namespace: 'ns-hybrid-3',
      vectors: [
        { id: 'doc1', values: [1, 0, 0], metadata: { text: 'cat' } },
        { id: 'doc2', values: [0, 1, 0], metadata: { text: 'machine learning' } }
      ]
    });
    const results = await hybridRetrievalService.search({
      namespace: 'ns-hybrid-3',
      query_vector: [1, 0, 0],
      query_text: 'machine',
      top_k: 2
    });
    expect(results.results).toHaveLength(2);
    const ids = results.results.map(r => r.id);
    expect(ids).toContain('doc1');
    expect(ids).toContain('doc2');
  });

  // 11
  it('should apply metadata filters during hybrid search', async () => {
    await vectorStoreService.upsert({
      namespace: 'ns-hybrid-4',
      vectors: [
        { id: 'doc1', values: [1, 0, 0], metadata: { text: 'test', type: 'A' } },
        { id: 'doc2', values: [1, 0, 0], metadata: { text: 'test', type: 'B' } }
      ]
    });
    const results = await hybridRetrievalService.search({
      namespace: 'ns-hybrid-4',
      query_vector: [1, 0, 0],
      query_text: 'test',
      top_k: 10,
      filter: { type: 'A' }
    });
    expect(results.results).toHaveLength(1);
    expect(results.results[0].id).toBe('doc1');
  });

  // 12
  it('should return results without metadata if include_metadata is false', async () => {
    await vectorStoreService.upsert({
      namespace: 'ns-hybrid-5',
      vectors: [
        { id: 'doc1', values: [1, 0, 0], metadata: { text: 'hidden metadata' } }
      ]
    });
    const results = await hybridRetrievalService.search({
      namespace: 'ns-hybrid-5',
      query_vector: [1, 0, 0],
      top_k: 1,
      include_metadata: false
    });
    expect(results.results).toHaveLength(1);
    expect(results.results[0].metadata).toBeUndefined();
  });

  // 13
  it('should return empty search results for non-existent namespace', async () => {
    const results = await hybridRetrievalService.search({
      namespace: 'ns-does-not-exist',
      query_vector: [1, 0, 0],
      query_text: 'test',
      top_k: 5
    });
    expect(results.results).toHaveLength(0);
  });

  // 14
  it('should correctly slice results by top_k in hybrid search', async () => {
    await vectorStoreService.upsert({
      namespace: 'ns-hybrid-6',
      vectors: [
        { id: 'doc1', values: [1, 0, 0], metadata: { text: 'test' } },
        { id: 'doc2', values: [1, 0, 0], metadata: { text: 'test' } },
        { id: 'doc3', values: [1, 0, 0], metadata: { text: 'test' } }
      ]
    });
    const results = await hybridRetrievalService.search({
      namespace: 'ns-hybrid-6',
      query_vector: [1, 0, 0],
      query_text: 'test',
      top_k: 2
    });
    expect(results.results).toHaveLength(2);
  });

  // 15
  it('should rerank results by keyword relevance', async () => {
    const candidates = [
      { id: 'r1', text: 'deep learning' },
      { id: 'r2', text: 'machine learning models' }
    ];
    const response = await rerankingService.rerankCandidates({
      query_text: 'machine learning',
      candidates,
      top_n: 2
    });
    expect(response.results).toBeDefined();
    expect(response.results[0].id).toBe('r2');
  });

  // 16
  it('should return candidates with 0 score if query text is empty', async () => {
    const candidates = [{ id: 'r1', text: 'deep learning' }];
    const response = await rerankingService.rerankCandidates({
      query_text: '',
      candidates,
      top_n: 1
    });
    expect(response.results).toHaveLength(1);
    expect(response.results[0].relevance_score).toBe(0);
  });

  // 17
  it('should sort candidates properly by relevance score', async () => {
    const candidates = [
      { id: 'c1', text: 'dog' },
      { id: 'c2', text: 'cat dog mouse' },
      { id: 'c3', text: 'cat dog' }
    ];
    const response = await rerankingService.rerankCandidates({
      query_text: 'cat dog',
      candidates,
      top_n: 3
    });
    expect(response.results[0].id).toBe('c3'); // exact match both terms
    expect(response.results[0].relevance_score).toBe(1);
  });

  // 18
  it('should correctly slice candidates by top_n', async () => {
    const candidates = [
      { id: 'c1', text: 'apple' },
      { id: 'c2', text: 'apple pie' },
      { id: 'c3', text: 'apple juice' }
    ];
    const response = await rerankingService.rerankCandidates({
      query_text: 'apple',
      candidates,
      top_n: 2
    });
    expect(response.results).toHaveLength(2);
  });

  // 19
  it('should return empty array if no candidates provided', async () => {
    const response = await rerankingService.rerankCandidates({
      query_text: 'test',
      candidates: [],
      top_n: 10
    });
    expect(response.results).toHaveLength(0);
  });

  // 20
  it('should handle special characters in query and candidate text', async () => {
    const candidates = [
      { id: 'c1', text: 'C++ programming!' },
      { id: 'c2', text: 'Java programming?' }
    ];
    const response = await rerankingService.rerankCandidates({
      query_text: 'C++!',
      candidates,
      top_n: 2
    });
    expect(response.results).toBeDefined();
    expect(response.results.length).toBeGreaterThan(0);
  });
});
