import { EvaluationService, EvalRunConfig } from './evaluation.service';
import { ConflictException } from '@nestjs/common';

describe('EvaluationService', () => {
  let service: EvaluationService;

  beforeEach(() => {
    service = new EvaluationService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an evaluation run', () => {
    const config: EvalRunConfig = {
      taskType: 'MODEL',
      datasetRef: 'ds_test',
      metrics: ['accuracy'],
    };
    const result = service.createEvalRun(config);
    expect(result.evaluation_id).toMatch(/^ev_/);
    expect(result.status).toBe('REGISTERED');
    expect(result.config).toEqual(config);
  });

  it('should progress through lifecycle states successfully', () => {
    const config: EvalRunConfig = { taskType: 'MODEL', datasetRef: 'ds_test', metrics: [] };
    const run = service.createEvalRun(config);
    const id = run.evaluation_id;
    
    expect(service.findOne(id).status).toBe('REGISTERED');
    
    const authorized = service.authorizeEvalRun(id, 't1', 'trace1');
    expect(authorized.status).toBe('AUTHORIZED');
    
    const inference = service.recordInferenceCompleted(id, ['out1']);
    expect(inference.status).toBe('INFERENCE_COMPLETED');
    expect(inference.inferenceOutputs).toEqual(['out1']);
    
    const evaluated = service.recordEvaluation(id, { accuracy: 1 });
    expect(evaluated.status).toBe('EVALUATED');
    expect(evaluated.metrics).toEqual({ accuracy: 1 });
    
    const benchmarked = service.recordBenchmark(id, { pass: true, reason: 'ok' });
    expect(benchmarked.status).toBe('BENCHMARKED');
    expect(benchmarked.benchmark).toEqual({ pass: true, reason: 'ok' });
    
    const completed = service.completeEvalRun(id);
    expect(completed.status).toBe('COMPLETED');
    
    // Test that findOne returns a clone
    const clone = service.findOne(id);
    expect(clone.tenantId).toBe('t1');
    expect(clone.traceId).toBe('trace1');
  });

  it('should throw ConflictException on invalid predecessor transition', () => {
    const run = service.createEvalRun({ taskType: 'MODEL', datasetRef: 'ds', metrics: [] });
    const id = run.evaluation_id;
    
    expect(() => service.recordInferenceCompleted(id, ['out'])).toThrow(ConflictException);
    expect(() => service.recordEvaluation(id, {})).toThrow(ConflictException);
    expect(() => service.completeEvalRun(id)).toThrow(ConflictException);
  });

  it('should enforce terminal idempotence', () => {
    const run = service.createEvalRun({ taskType: 'MODEL', datasetRef: 'ds', metrics: [] });
    const id = run.evaluation_id;
    
    service.authorizeEvalRun(id, 't1', 'trace1');
    service.recordInferenceCompleted(id, ['out']);
    service.recordEvaluation(id, { accuracy: 1 });
    service.recordBenchmark(id, { pass: true, reason: 'ok' });
    
    const completed1 = service.completeEvalRun(id);
    const completed2 = service.completeEvalRun(id); // Idempotent
    
    expect(completed1).toEqual(completed2);
    
    // Cannot fail a completed run
    const failed = service.failEvalRun(id, 'COMPLETED', new Error('test'));
    expect(failed).toEqual(completed1);
  });

  it('should enforce terminal idempotence for failure', () => {
    const run = service.createEvalRun({ taskType: 'MODEL', datasetRef: 'ds', metrics: [] });
    const id = run.evaluation_id;
    
    const failed1 = service.failEvalRun(id, 'REGISTERED', new Error('test error'));
    expect(failed1.status).toBe('FAILED');
    expect(failed1.failure).toEqual({ stage: 'REGISTERED', code: 'Error', message: 'test error' });
    
    const failed2 = service.failEvalRun(id, 'FAILED', new Error('another error'));
    expect(failed2).toEqual(failed1);
    
    const completed = service.completeEvalRun(id);
    expect(completed).toEqual(failed1);
  });

  it('should execute metric computation accurately', () => {
    const predictions = ['true', 'true', 'false', 'false'];
    const groundTruth = ['true', 'false', 'true', 'false'];
    
    const result = service.executeMetricComputation(predictions, groundTruth);
    expect(result.accuracy).toBe(0.5);
    expect(result.precision).toBe(0.5);
    expect(result.recall).toBe(0.5);
  });
});
