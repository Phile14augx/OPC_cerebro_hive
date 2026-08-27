import { describe, it, expect, beforeEach } from 'vitest';
import { ModelRegistryService } from '../../src/mlflow/model-registry.service';

describe('ModelRegistryService Integration', () => {
  let service: ModelRegistryService;
  beforeEach(() => { service = new ModelRegistryService(); });

  it('should register a model and create a version', () => {
    const model = service.registerModel('test-model');
    expect(model).toBeDefined();
    expect(model.name).toBe('test-model');

    const version = service.createModelVersion('test-model', 'run-123');
    expect(version).toBeDefined();
    expect(version.version).toBe(1);
    expect(version.stage).toBe('None');
  });

  it('should transition model version stage', () => {
    service.registerModel('prod-model');
    service.createModelVersion('prod-model', 'run-456');
    
    const updated = service.transitionModelVersionStage('prod-model', 1, 'Production');
    expect(updated.stage).toBe('Production');
    
    const versions = service.listModelVersions('prod-model');
    expect(versions.length).toBe(1);
    expect(versions[0].stage).toBe('Production');
  });
});
