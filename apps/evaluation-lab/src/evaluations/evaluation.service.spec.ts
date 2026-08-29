import { EvaluationService, EvalRunConfig } from './evaluation.service';

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
    expect(result.status).toBe('CREATED');
    expect(result.config).toEqual(config);
  });

  it('should execute metric computation accurately', () => {
    const predictions = ['true', 'true', 'false', 'false'];
    const groundTruth = ['true', 'false', 'true', 'false'];
    
    // correct: (true, true) -> 1, (false, false) -> 1 => 2/4 = 0.5 accuracy
    // truePos: (true, true) -> 1
    // falsePos: (true, false) -> 1
    // falseNeg: (false, true) -> 1
    // precision: 1 / (1 + 1) = 0.5
    // recall: 1 / (1 + 1) = 0.5
    
    const result = service.executeMetricComputation(predictions, groundTruth);
    expect(result.accuracy).toBe(0.5);
    expect(result.precision).toBe(0.5);
    expect(result.recall).toBe(0.5);
  });
  
  it('should complete an evaluation run', () => {
    const run = service.createEvalRun({ taskType: 'MODEL', datasetRef: 'ds', metrics: [] });
    const metrics = { accuracy: 0.9 };
    const result = service.completeEvalRun(run.evaluation_id, metrics);
    expect(result.status).toBe('COMPLETED');
    expect(result.metrics).toEqual(metrics);
  });
});
