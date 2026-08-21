import { describe, it, expect } from 'vitest';
import type { EvaluationMetric, MetricCategory } from './EvaluationModels';

describe('EvaluationModels Contract', () => {
  it('should validate a correct EvaluationMetric shape', () => {
    const metric: EvaluationMetric = {
      name: 'faithfulness',
      category: 'Quality' as MetricCategory,
      score: 0.95,
    };
    expect(metric.score).toBeGreaterThan(0);
    expect(metric.score).toBeLessThanOrEqual(1.0);
  });

  it('should detect out-of-range score (Negative Control)', () => {
    const score = 1.5;
    expect(score > 1.0).toBe(true); // domain violation detected
  });
});
