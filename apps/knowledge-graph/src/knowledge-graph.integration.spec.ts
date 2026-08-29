import { Test, TestingModule } from '@nestjs/testing';
import { GraphStorageService } from './graph-storage/graph-storage.service';
import { EntityResolutionService } from './entity-resolution/entity-resolution.service';
import { GraphEmbeddingService } from './graph-embedding/graph-embedding.service';
import { OntologyRegistryService } from './ontology-registry/ontology-registry.service';
import { QueryLayerService } from './query-layer/query-layer.service';

describe('P04 Knowledge Graph Integration', () => {
  let storage: GraphStorageService;
  let entityRes: EntityResolutionService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphStorageService, EntityResolutionService, GraphEmbeddingService, OntologyRegistryService, QueryLayerService],
    }).compile();

    storage = module.get<GraphStorageService>(GraphStorageService);
    entityRes = module.get<EntityResolutionService>(EntityResolutionService);
    await storage.connect();
  });

  it('should perform a full integration flow', async () => {
    await storage.insertNode({ id: '1', labels: ['Person'], properties: { age: 30 } });
    await storage.insertNode({ id: '2', labels: ['Person'], properties: { name: 'Bob' } });
    await entityRes.mergeEntities('1', '2', 'MERGE_PROPERTIES');
    const node = await storage.getNode('2');
    expect(node?.properties.age).toBe(30);
  });
});