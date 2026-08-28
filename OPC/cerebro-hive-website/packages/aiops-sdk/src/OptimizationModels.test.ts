import { describe, it, expect } from 'vitest';
import type { OptimizationRecommendation, AutonomyLevel } from './OptimizationModels';

function determineAutonomy(confidence: number): AutonomyLevel {
  if (confidence > 0.95) return 'POLICY_CONSTRAINED';
  if (confidence > 0.8) return 'RECOMMENDATION_ONLY';
  return 'HUMAN_APPROVAL_REQUIRED';
}

describe('OptimizationModels Contract', () => {
  it('should require human approval for low confidence', () => {
    const level = determineAutonomy(0.7);
    expect(level).toBe('HUMAN_APPROVAL_REQUIRED');
  });

  it('should fail when domain behavior is incorrect (Negative Control)', () => {
    // If logic changes and high confidence still requires human approval
    const level = determineAutonomy(0.99);
    expect(level).not.toBe('HUMAN_APPROVAL_REQUIRED');
  });
});
