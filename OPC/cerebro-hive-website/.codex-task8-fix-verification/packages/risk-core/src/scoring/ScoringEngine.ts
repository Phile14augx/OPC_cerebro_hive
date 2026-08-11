export type RiskRating = 'Low' | 'Medium' | 'High' | 'Critical';

export interface NumericScore {
  likelihood: number; // 1-5
  impact: number;     // 1-5
  score: number;      // 1-25
}

export class ScoringEngine {
  
  /**
   * Calculates the numeric score based on likelihood and impact.
   */
  calculateScore(likelihood: number, impact: number): NumericScore {
    const l = Math.max(1, Math.min(5, likelihood));
    const i = Math.max(1, Math.min(5, impact));
    return {
      likelihood: l,
      impact: i,
      score: l * i
    };
  }

  /**
   * Translates a numeric score into a qualitative rating.
   */
  getRating(score: NumericScore): RiskRating {
    if (score.score >= 20) return 'Critical';
    if (score.score >= 12) return 'High';
    if (score.score >= 6) return 'Medium';
    return 'Low';
  }

  /**
   * Helper to downgrade a score due to effective controls.
   * Returns a new calculated score.
   */
  applyMitigation(base: NumericScore, reductionFactor: number): NumericScore {
    // reduce likelihood or impact based on factor. Simplified for MVP:
    const newLikelihood = Math.max(1, Math.round(base.likelihood - (base.likelihood * reductionFactor)));
    return this.calculateScore(newLikelihood, base.impact);
  }
  
  /**
   * Helper to elevate risk due to a control failure or policy exception.
   */
  applyPenalty(base: NumericScore, penaltyFactor: number): NumericScore {
    const newLikelihood = Math.min(5, Math.round(base.likelihood + (base.likelihood * penaltyFactor)));
    return this.calculateScore(newLikelihood, base.impact);
  }
}
