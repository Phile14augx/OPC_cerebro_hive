import { Test, TestingModule } from '@nestjs/testing';
import { OntologyRegistryService } from './ontology-registry.service';

describe('OntologyRegistryService', () => {
  let service: OntologyRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OntologyRegistryService],
    }).compile();

    service = module.get<OntologyRegistryService>(OntologyRegistryService);
  });

  it('should validate nodes', async () => {
    expect(await service.validateNode('Person', { employeeId: '1' })).toBe(true);
    expect(await service.validateNode('Person', { unknown: '1' })).toBe(false);
    expect(await service.validateNode('Unknown', {})).toBe(false);
  });
});