import { describe, it, expect, beforeEach } from 'vitest';
import { ExperimentService } from '../../src/mlflow/experiment.service';

describe('ExperimentService Integration', () => {
  let service: ExperimentService;
  beforeEach(() => { service = new ExperimentService(); });

  it('should create an experiment and return its id', () => {
    const exp = service.createExperiment('test-experiment');
    expect(exp).toBeDefined();
    expect(exp.id).toBeTruthy();
    expect(exp.name).toBe('test-experiment');
  });

  it('should log a run and retrieve it', () => {
    const exp = service.createExperiment('exp-2');
    const run = service.createRun(exp.id);
    
    service.logParameter(run.id, 'lr', '0.01');
    service.logMetric(run.id, 'accuracy', 0.95);
    
    const retrieved = service.getRun(run.id);
    expect(retrieved).toBeDefined();
    expect(retrieved.params['lr']).toBe('0.01');
    expect(retrieved.metrics['accuracy']).toBe(0.95);
  });
});
