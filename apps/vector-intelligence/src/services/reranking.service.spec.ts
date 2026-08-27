declare let describe: any; declare let it: any; declare let expect: any; declare let beforeEach: any; declare let jest: any;
import { Test, TestingModule } from '@nestjs/testing';
import { RerankingService } from './reranking.service';
import { RerankDto } from '../dto/rerank.dto';

describe('RerankingService', () => {
  let service: RerankingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RerankingService],
    }).compile();

    service = module.get<RerankingService>(RerankingService);
  });

  it('should rerank candidates based on keyword overlap', async () => {
    const dto: RerankDto = {
      query_text: 'the quick brown fox',
      candidates: [
        { id: 'c1', text: 'a lazy dog' }, // 0 overlap
        { id: 'c2', text: 'the fox is brown' }, // 3 overlap: the, fox, brown
        { id: 'c3', text: 'quick fox' }, // 2 overlap: quick, fox
      ],
      top_n: 2
    };

    const res = await service.rerankCandidates(dto);
    expect(res.results.length).toBe(2);
    expect(res.results[0].id).toBe('c2'); // Highest overlap
    expect(res.results[1].id).toBe('c3');
  });

  it('should handle empty query', async () => {
    const res = await service.rerankCandidates({
      query_text: '',
      candidates: [{ id: '1', text: 'test' }],
      top_n: 1
    });
    expect(res.results.length).toBe(1);
    expect(res.results[0].relevance_score).toBe(0);
  });

  it('should prefer an exact match and never overcount duplicate terms', async () => {
    const res = await service.rerankCandidates({
      query_text: 'cat dog',
      candidates: [
        { id: 'verbose', text: 'cat cat dog mouse' },
        { id: 'exact', text: 'cat dog' },
      ],
      top_n: 2,
    });

    expect(res.results).toEqual([
      { id: 'exact', relevance_score: 1 },
      { id: 'verbose', relevance_score: 1 },
    ]);
  });
});
