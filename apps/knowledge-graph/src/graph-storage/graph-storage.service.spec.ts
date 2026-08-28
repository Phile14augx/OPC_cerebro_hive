import { Test, TestingModule } from '@nestjs/testing';
import { GraphStorageService } from './graph-storage.service';

describe('GraphStorageService', () => {
  let service: GraphStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphStorageService],
    }).compile();

    service = module.get<GraphStorageService>(GraphStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect and execute cypher', async () => {
    await service.connect();
    const result = await service.executeCypher('MATCH (n) RETURN n', {});
    expect(result.metrics).toBeDefined();
  });

  it('should insert and retrieve a node', async () => {
    const node = { id: 'n1', labels: ['Person'], properties: { name: 'Alice' } };
    await service.insertNode(node);
    const retrieved = await service.getNode('n1');
    expect(retrieved).toEqual(node);
  });
});