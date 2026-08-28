import { Test, TestingModule } from '@nestjs/testing';
import { EntityResolutionService } from './entity-resolution.service';
import { GraphStorageService } from '../graph-storage/graph-storage.service';

describe('EntityResolutionService', () => {
  let service: EntityResolutionService;
  let storage: GraphStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntityResolutionService, GraphStorageService],
    }).compile();

    service = module.get<EntityResolutionService>(EntityResolutionService);
    storage = module.get<GraphStorageService>(GraphStorageService);
  });

  it('should merge entities', async () => {
    await storage.insertNode({ id: '1', labels: ['Person'], properties: { age: 30 } });
    await storage.insertNode({ id: '2', labels: ['Person'], properties: { name: 'Bob' } });
    
    const result = await service.mergeEntities('1', '2', 'MERGE_PROPERTIES');
    expect(result).toBe(true);
    const merged = await storage.getNode('2');
    expect(merged?.properties).toEqual({ age: 30, name: 'Bob' });
  });
});