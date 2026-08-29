import { Test, TestingModule } from '@nestjs/testing';
import { GraphEmbeddingService } from './graph-embedding.service';
import { GraphStorageService } from '../graph-storage/graph-storage.service';

describe('GraphEmbeddingService', () => {
  let service: GraphEmbeddingService;
  let storage: GraphStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphEmbeddingService, GraphStorageService],
    }).compile();

    service = module.get<GraphEmbeddingService>(GraphEmbeddingService);
    storage = module.get<GraphStorageService>(GraphStorageService);
  });

  it('should generate embeddings', async () => {
    await storage.insertNode({ id: 'n1', labels: [], properties: {} });
    const data = await service.generateAndStoreNodeEmbedding('n1');
    expect(data.vectors[0].id).toBe('n1');
  });
});