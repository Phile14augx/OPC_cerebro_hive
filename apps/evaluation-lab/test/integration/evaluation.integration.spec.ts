import { EvaluationService } from '../../src/evaluations/evaluation.service';

describe('EvaluationService Integration', () => {
  let service: EvaluationService;
  beforeEach(() => { service = new EvaluationService(); });

  it('should compute accuracy for a set of predictions', async () => {
    const predictions = ['true', 'false', 'true'];
    const groundTruth = ['true', 'true', 'true'];
    const result = service.executeMetricComputation(predictions, groundTruth);
    expect(result).toBeDefined();
    expect(result.accuracy).toBeCloseTo(2/3, 1);
  });
});
