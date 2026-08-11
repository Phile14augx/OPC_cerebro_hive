import { EvaluationPolicy, DefaultEvaluationPolicies, CompositeEvaluationPolicy, EvaluationWeights, VetoThresholds } from './EvaluationPolicy';
import { Goal } from './Goal';
import { ExecutionContext } from '../context/ExecutionContext';
import { GovernanceGraphValidator } from '../governance/GovernanceGraphValidator';

export class PolicyResolver {
  
  /**
   * Resolves the active CompositeEvaluationPolicy by aggregating policies in order of precedence:
   * 1. Platform Default (Lowest precedence)
   * 2. ExecutionContext.policies (Tenant / Workspace)
   * 3. Goal Override (Highest precedence)
   */
  public static resolve(goal: Goal, context: ExecutionContext): CompositeEvaluationPolicy {
    const activePolicies: EvaluationPolicy[] = [];

    // 1. Platform Default
    activePolicies.push(DefaultEvaluationPolicies.Balanced);

    // 2. Tenant / Workspace Policies
    if (context.policies && context.policies.length > 0) {
      for (const policyId of context.policies) {
        const found = this.findPolicyById(policyId);
        if (found) activePolicies.push(found);
      }
    }

    // 3. Goal Override
    if (goal.preferredEvaluationPolicyId) {
      const explicitPolicy = this.findPolicyById(goal.preferredEvaluationPolicyId);
      if (explicitPolicy) activePolicies.push(explicitPolicy);
    }

    return this.compose(activePolicies);
  }

  public static compose(policies: EvaluationPolicy[]): CompositeEvaluationPolicy {
    if (policies.length === 0) throw new Error("Cannot compose empty policy list");

    const provenance = {
      weightSources: {} as Record<keyof EvaluationWeights, string>,
      vetoSources: {} as Record<keyof VetoThresholds, string>,
      tieResolutionSource: policies[policies.length - 1].name
    };

    let compositeWeights: EvaluationWeights = { cost: 0, latency: 0, risk: 0, compliance: 0, successProbability: 0 };
    let compositeVetoes: VetoThresholds = {};
    let tieRes = policies[0].tieResolution;
    let conflictInTieRes = false;
    let compositeRules: import('../governance/GovernanceRule').GovernanceRule[] = [];

    // We process policies in order of precedence (lowest to highest).
    // Higher precedence overwrites weights, but vetoes are monotonic (most restrictive wins).
    policies.forEach((policy, index) => {
      // 1. Weights: Higher precedence completely overrides or we can do hierarchical weighted sum.
      // The user recommended hierarchical weighted composition: e.g. Tenant x3, Workspace x2, Goal x1
      // For simplicity in this iteration, we do a weighted average where later policies have higher multiplier.
      const multiplier = index + 1;
      const w = policy.customWeights || DefaultEvaluationPolicies.Balanced.customWeights!;
      
      compositeWeights.cost += (w.cost || 0) * multiplier;
      compositeWeights.latency += (w.latency || 0) * multiplier;
      compositeWeights.risk += (w.risk || 0) * multiplier;
      compositeWeights.compliance += (w.compliance || 0) * multiplier;
      compositeWeights.successProbability += (w.successProbability || 0) * multiplier;

      Object.keys(compositeWeights).forEach(k => provenance.weightSources[k as keyof EvaluationWeights] = `Hierarchical Average (including ${policy.name})`);

      // 2. Vetoes: Monotonic (most restrictive wins, cannot be weakened)
      if (policy.vetoThresholds) {
        if (policy.vetoThresholds.maxCostUsd !== undefined) {
          if (compositeVetoes.maxCostUsd === undefined || policy.vetoThresholds.maxCostUsd < compositeVetoes.maxCostUsd) {
            compositeVetoes.maxCostUsd = policy.vetoThresholds.maxCostUsd;
            provenance.vetoSources.maxCostUsd = policy.name;
          }
        }
        if (policy.vetoThresholds.maxLatencyMs !== undefined) {
          if (compositeVetoes.maxLatencyMs === undefined || policy.vetoThresholds.maxLatencyMs < compositeVetoes.maxLatencyMs) {
            compositeVetoes.maxLatencyMs = policy.vetoThresholds.maxLatencyMs;
            provenance.vetoSources.maxLatencyMs = policy.name;
          }
        }
        if (policy.vetoThresholds.minComplianceScore !== undefined) {
          if (compositeVetoes.minComplianceScore === undefined || policy.vetoThresholds.minComplianceScore > compositeVetoes.minComplianceScore) {
            compositeVetoes.minComplianceScore = policy.vetoThresholds.minComplianceScore;
            provenance.vetoSources.minComplianceScore = policy.name;
          }
        }
      }

      // 3. Tie Resolution
      if (index > 0 && policy.tieResolution !== tieRes) {
        conflictInTieRes = true;
      }
      tieRes = policy.tieResolution;

      // 4. Rules
      if (policy.rules && policy.rules.length > 0) {
        compositeRules = compositeRules.concat(policy.rules);
      }
    });

    // Validate the resulting rules DAG
    GovernanceGraphValidator.validate(compositeRules);

    // Normalize weights to sum to 1.0
    const sum = Object.values(compositeWeights).reduce((a, b) => a + b, 0);
    if (sum > 0) {
      Object.keys(compositeWeights).forEach(k => {
        (compositeWeights as any)[k] = (compositeWeights as any)[k] / sum;
      });
    }

    if (conflictInTieRes) {
      tieRes = 'NeedsApproval';
      provenance.tieResolutionSource = 'Conflict Escalation (NeedsApproval)';
    } else {
      provenance.tieResolutionSource = policies[policies.length - 1].name;
    }

    const sourceNames = policies.map(p => p.name);

    return {
      id: `composite-${Date.now()}`,
      name: `Composite(${sourceNames.join(', ')})`,
      version: 1,
      primaryObjective: 'Custom',
      customWeights: compositeWeights,
      vetoThresholds: compositeVetoes,
      tieResolution: tieRes,
      rules: compositeRules,
      sourcePolicies: policies.map(p => p.id),
      provenance
    };
  }

  private static findPolicyById(id: string): EvaluationPolicy | undefined {
    return Object.values(DefaultEvaluationPolicies).find(p => p.id === id);
  }
}
