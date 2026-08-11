import { DecisionContext } from '../domain/DecisionContext';
import { DecisionScenario } from '../domain/DecisionScenario';

export class OptimizationEngine {
  constructor(private readonly context: DecisionContext) {}

  public optimize(scenarios: DecisionScenario[]): DecisionScenario[] {
    console.log(`[OptimizationEngine] Scoring ${scenarios.length} scenarios against objectives...`);

    // Calculate utility scores based on weights
    for (const scenario of scenarios) {
      const m = scenario.metrics;
      if (!m) continue;

      let score = 0;
      const w = this.context.weights;
      
      // Maximize these (higher is better, so add)
      score += (m.AvailabilityScore * w.Availability);
      score += (m.ComplianceScore * w.Compliance);
      score += (m.PerformanceScore * w.Performance);

      // Minimize these (lower is better, so subtract)
      score -= (m.CostScore * w.Cost);
      score -= (m.RecoveryTimeScore * w.RecoveryTime);
      score -= (m.BlastRadiusScore * w.BlastRadius);

      scenario.optimizationScore = score;
    }

    // Rank descending
    return scenarios.sort((a, b) => (b.optimizationScore || 0) - (a.optimizationScore || 0));
  }
}
