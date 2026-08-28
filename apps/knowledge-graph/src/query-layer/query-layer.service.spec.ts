import { Test, TestingModule } from '@nestjs/testing';
import { QueryLayerService } from './query-layer.service';
import { GraphStorageService } from '../graph-storage/graph-storage.service';

describe('QueryLayerService', () => {
  let service: QueryLayerService;
  let storage: GraphStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryLayerService, GraphStorageService],
    }).compile();

    service = module.get<QueryLayerService>(QueryLayerService);
    storage = module.get<GraphStorageService>(GraphStorageService);
    await storage.connect();
  });

  it('should execute cypher via storage layer', async () => {
    const res = await service.queryGraph('MATCH (n) RETURN n', {});
    expect(typeof res.metrics.nodesScanned).toBe('number');
  });
});
