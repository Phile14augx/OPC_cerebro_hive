import { EvaluationProvider } from '../plugins/CapabilityProvider';
import { ExecutionContext } from '../context/ExecutionContext';
import { Goal } from './Goal';
import { ExecutionPlan } from './ExecutionPlan';
import { ScoredPlan } from './PlanningSession';
import { EvaluationPolicy } from './EvaluationPolicy';
import { GovernanceContextBuilder } from '../governance/GovernanceContextSnapshot';
import { GovernanceRuleEngine } from '../governance/GovernanceRuleEngine';
import { RuleResult } from '../governance/GovernanceRule';

export class DefaultEvaluationProvider implements EvaluationProvider {
  private ruleEngine = new GovernanceRuleEngine();
  
  public async initialize(): Promise<void> {}
  public async dispose(): Promise<void> {}

  public async evaluatePlans(plans: ExecutionPlan[], goal: Goal, context: ExecutionContext, policy: EvaluationPolicy): Promise<ScoredPlan[]> {
    const snapshot = GovernanceContextBuilder.build(context);
    
    const scoredPromises = plans.map(async (plan) => {
      let totalCost = 0;
      let totalDuration = 0;
      let totalConfidence = plan.confidence;

      plan.nodes.forEach(node => {
        totalCost += (node.estimatedCostUsd || 0);
        totalDuration += (node.estimatedDurationMs || 0);
        if (node.confidenceScore) {
          totalConfidence = (totalConfidence + node.confidenceScore) / 2;
        }
      });

      const maxBudget = goal.budget?.maxCostUsd || 1.0;
      const maxTime = goal.budget?.maxDurationMs || 10000;

      const costScore = Math.max(0, 1 - (totalCost / maxBudget));
      const latencyScore = Math.max(0, 1 - (totalDuration / maxTime));
      const riskScore = totalConfidence; 
      const complianceScore = 1.0; // Simulated
      const successProbabilityScore = totalConfidence;

      const reasons: string[] = [];

      // Enforce Veto Thresholds
      if (policy.vetoThresholds) {
        if (policy.vetoThresholds.maxCostUsd && totalCost > policy.vetoThresholds.maxCostUsd) {
          reasons.push(`Vetoed: Cost (${totalCost}) exceeds threshold (${policy.vetoThresholds.maxCostUsd})`);
        }
        if (policy.vetoThresholds.minComplianceScore && complianceScore < policy.vetoThresholds.minComplianceScore) {
          reasons.push(`Vetoed: Compliance (${complianceScore}) below threshold (${policy.vetoThresholds.minComplianceScore})`);
        }
      }

      const weights = policy.customWeights || {
        cost: 0.2, latency: 0.2, risk: 0.2, compliance: 0.2, successProbability: 0.2
      };

      let compositeScore = (
        (costScore * (weights.cost || 0)) +
        (latencyScore * (weights.latency || 0)) +
        (riskScore * (weights.risk || 0)) +
        (complianceScore * (weights.compliance || 0)) +
        (successProbabilityScore * (weights.successProbability || 0))
      );

      // --- Governance Rule Engine (Pre-Scoring Stage) ---
      let allRuleResults: RuleResult[] = [];
      if (policy.rules && policy.rules.length > 0) {
        const preScoringExecution = await this.ruleEngine.evaluateStage('PreScoring', policy.rules, plan, goal, snapshot);
        const preScoringResults = preScoringExecution.results;
        allRuleResults = allRuleResults.concat(preScoringResults);
        
        preScoringResults.forEach(r => {
          if (!r.passed) {
            reasons.push(`Vetoed (Rule ${r.ruleId}): ${r.reason}`);
          }
        });
      }

      // Apply veto
      if (reasons.some(r => r.startsWith('Vetoed'))) {
        compositeScore = 0;
      }

      if (costScore < 0.5 && !reasons.includes('High estimated cost')) reasons.push("High estimated cost");
      if (latencyScore < 0.5 && !reasons.includes('High estimated latency')) reasons.push("High estimated latency");
      if (successProbabilityScore > 0.8 && !reasons.includes('High historical success probability')) reasons.push("High historical success probability");

      return {
        plan,
        score: {
          costScore,
          latencyScore,
          riskScore,
          complianceScore,
          successProbabilityScore,
          compositeScore,
          reasons
        },
        ruleResults: allRuleResults,
        sourcePlanner: plan.assumptions.find(a => a.startsWith('Selected planner archetype: '))?.replace('Selected planner archetype: ', '') || 'Unknown'
      };
    });
    
    // Wait for all pre-scoring and weight calculations
    const scoredPlans = await Promise.all(scoredPromises);
    
    // Sort plans to identify top candidates for PostScoring
    scoredPlans.sort((a, b) => b.score.compositeScore - a.score.compositeScore);
    
    // --- Governance Rule Engine (Post-Scoring Stage) ---
    // In a real system, we might only run PostScoring rules on the top N candidates.
    if (policy.rules && policy.rules.length > 0) {
      for (const scored of scoredPlans) {
        if (scored.score.compositeScore > 0) {
          const postScoringExecution = await this.ruleEngine.evaluateStage('PostScoring', policy.rules, scored.plan, goal, snapshot);
          const postScoringResults = postScoringExecution.results;
          scored.ruleResults = scored.ruleResults.concat(postScoringResults);
          
          postScoringResults.forEach(r => {
            if (!r.passed) {
              scored.score.reasons.push(`Vetoed (Rule ${r.ruleId}): ${r.reason}`);
              scored.score.compositeScore = 0;
            }
          });
        }
      }
    }
    
    // Re-sort after post-scoring might have vetoed some
    scoredPlans.sort((a, b) => b.score.compositeScore - a.score.compositeScore);
    
    return scoredPlans;
  }
}
