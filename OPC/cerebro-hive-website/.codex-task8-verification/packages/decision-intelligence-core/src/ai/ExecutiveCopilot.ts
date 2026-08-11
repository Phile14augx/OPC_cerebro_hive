import { DecisionScenario } from '../domain/DecisionScenario';
import { DecisionContext } from '../domain/DecisionContext';

export class ExecutiveCopilot {
  public summarizeRecommendation(context: DecisionContext, rankedScenarios: DecisionScenario[]): string {
    if (rankedScenarios.length === 0) return '[Executive Copilot] No valid scenarios evaluated.';

    const top = rankedScenarios[0];
    const alternates = rankedScenarios.slice(1);

    let summary = `\n[Executive Copilot] Strategic Recommendation Report
===================================================
Based on the defined Enterprise Context (Maximizing: ${context.objectives.maximize.join(', ')} | Minimizing: ${context.objectives.minimize.join(', ')}),
we have simulated and optimized the proposed scenarios.

🏆 RECOMMENDED STRATEGY: '${top.name}'
   Optimization Score: ${top.optimizationScore?.toFixed(2)}
   - Compliance: ${(top.metrics?.ComplianceScore! * 100).toFixed(0)}%
   - Availability: ${(top.metrics?.AvailabilityScore! * 100).toFixed(0)}%
   - Cost Profile (Lower is better): ${(top.metrics?.CostScore! * 100).toFixed(0)}%
   - Blast Radius Risk (Lower is better): ${(top.metrics?.BlastRadiusScore! * 100).toFixed(0)}%

`;

    if (alternates.length > 0) {
      summary += `⚖️ ALTERNATIVES CONSIDERED:\n`;
      for (const alt of alternates) {
        summary += `   - '${alt.name}' (Score: ${alt.optimizationScore?.toFixed(2)})\n`;
        // Highlighting trade-offs
        if (alt.metrics!.CostScore < top.metrics!.CostScore) {
          summary += `     * Trade-off: This option is cheaper, but sacrifices Compliance or Availability.\n`;
        } else if (alt.metrics!.AvailabilityScore > top.metrics!.AvailabilityScore) {
          summary += `     * Trade-off: This option has higher availability, but carries significantly higher costs.\n`;
        } else {
          summary += `     * Trade-off: Mathematically inferior across the weighted objectives.\n`;
        }
      }
    }

    summary += `\nDecision ready for Executive Sign-off.`;
    return summary;
  }
}
