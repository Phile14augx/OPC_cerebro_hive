import { Test, TestingModule } from '@nestjs/testing';
import { ModelRegistryService } from '../src/mlflow/model-registry.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ModelRegistryService', () => {
  let service: ModelRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModelRegistryService],
    }).compile();

    service = module.get<ModelRegistryService>(ModelRegistryService);
  });

  it('should register a model', () => {
    const model = service.registerModel('MyModel');
    expect(model.name).toBe('MyModel');
  });

  it('should throw if model already registered', () => {
    service.registerModel('MyModel');
    expect(() => service.registerModel('MyModel')).toThrow(BadRequestException);
  });

  it('should create model versions', () => {
    service.registerModel('MyModel');
    const v1 = service.createModelVersion('MyModel', 'run-1');
    expect(v1.version).toBe(1);
    expect(v1.stage).toBe('None');

    const v2 = service.createModelVersion('MyModel', 'run-2');
    expect(v2.version).toBe(2);
  });

  it('should transition model stages', () => {
    service.registerModel('MyModel');
    const v1 = service.createModelVersion('MyModel', 'run-1');
    
    const updated = service.transitionModelVersionStage('MyModel', v1.version, 'Production');
    expect(updated.stage).toBe('Production');
  });

  it('should list model versions', () => {
    service.registerModel('MyModel');
    service.createModelVersion('MyModel', 'run-1');
    service.createModelVersion('MyModel', 'run-2');

    const versions = service.listModelVersions('MyModel');
    expect(versions.length).toBe(2);
  });

  it('should throw when listing versions for non-existent model', () => {
    expect(() => service.listModelVersions('NonExistent')).toThrow(NotFoundException);
  });

  it('should throw when creating version for non-existent model', () => {
    expect(() => service.createModelVersion('NonExistent', 'run-1')).toThrow(NotFoundException);
  });

  it('should throw when transitioning non-existent version', () => {
    service.registerModel('MyModel');
    expect(() => service.transitionModelVersionStage('MyModel', 99, 'Production')).toThrow(NotFoundException);
  });
});
