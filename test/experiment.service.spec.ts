import { Test, TestingModule } from '@nestjs/testing';
import { ExperimentService } from '../src/mlflow/experiment.service';
import { NotFoundException } from '@nestjs/common';

describe('ExperimentService', () => {
  let service: ExperimentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExperimentService],
    }).compile();

    service = module.get<ExperimentService>(ExperimentService);
  });

  it('should create and get an experiment', () => {
    const exp = service.createExperiment('Test Exp');
    expect(exp.name).toBe('Test Exp');
    expect(exp.id).toBeDefined();

    const fetched = service.getExperiment(exp.id);
    expect(fetched.name).toBe('Test Exp');
  });

  it('should throw when getting non-existent experiment', () => {
    expect(() => service.getExperiment('999')).toThrow(NotFoundException);
  });

  it('should create a run and allow logging metrics, params, and tags', () => {
    const exp = service.createExperiment('Test Exp');
    const run = service.createRun(exp.id);

    expect(run.experimentId).toBe(exp.id);
    expect(run.status).toBe('RUNNING');

    service.logMetric(run.id, 'accuracy', 0.95);
    service.logParameter(run.id, 'learning_rate', '0.01');
    service.logTag(run.id, 'env', 'prod');

    const fetchedRun = service.getRun(run.id);
    expect(fetchedRun.metrics['accuracy']).toBe(0.95);
    expect(fetchedRun.params['learning_rate']).toBe('0.01');
    expect(fetchedRun.tags['env']).toBe('prod');
  });

  it('should list runs with optional filtering', () => {
    const exp = service.createExperiment('Test Exp');
    const run1 = service.createRun(exp.id);
    const run2 = service.createRun(exp.id);

    service.logTag(run1.id, 'env', 'prod');
    service.logTag(run2.id, 'env', 'dev');

    const allRuns = service.listRuns(exp.id);
    expect(allRuns.length).toBe(2);

    const prodRuns = service.listRuns(exp.id, 'env', 'prod');
    expect(prodRuns.length).toBe(1);
    expect(prodRuns[0].id).toBe(run1.id);
  });

  it('should throw when creating run for non-existent experiment', () => {
    expect(() => service.createRun('999')).toThrow(NotFoundException);
  });
});
