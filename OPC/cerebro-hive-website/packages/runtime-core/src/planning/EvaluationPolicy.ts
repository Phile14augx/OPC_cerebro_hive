export type OptimizationObjective = 
  | 'CostOptimized' 
  | 'LatencyOptimized' 
  | 'ReliabilityOptimized' 
  | 'ComplianceFirst'
  | 'Balanced'
  | 'Custom';

export interface EvaluationWeights {
  cost: number;
  latency: number;
  risk: number;
  compliance: number;
  successProbability: number;
}

export interface VetoThresholds {
  maxCostUsd?: number;
  maxLatencyMs?: number;
  minComplianceScore?: number;
  minSuccessProbability?: number;
}

export type TieResolutionStrategy = 'LowestRisk' | 'LowestCost' | 'HighestCompliance' | 'NeedsApproval';

import { GovernanceRule } from '../governance/GovernanceRule';

export interface EvaluationPolicy {
  id: string;
  name: string;
  version: number;
  description?: string;
  
  // High-level intent (e.g. "CostOptimized" implies a default weight profile)
  primaryObjective: OptimizationObjective;
  
  // Explicit overrides for advanced mode
  customWeights?: Partial<EvaluationWeights>;
  
  // Hard limits
  vetoThresholds?: VetoThresholds;
  tieResolution: TieResolutionStrategy;
  rules?: GovernanceRule[];
}

export interface PolicyProvenance {
  weightSources: Record<keyof EvaluationWeights, string>;
  vetoSources: Record<keyof VetoThresholds, string>;
  tieResolutionSource: string;
}

export interface CompositeEvaluationPolicy extends EvaluationPolicy {
  sourcePolicies: string[];
  provenance: PolicyProvenance;
}

export interface PolicyDecisionRecord {
  id: string;
  appliedPolicies: string[];
  compositePolicy: CompositeEvaluationPolicy;
  decisions: {
    planId: string;
    compositeScore: number;
    vetoes: string[];
    reasons: string[];
    ruleResults: import('../governance/GovernanceRule').RuleResult[];
  }[];
  selectedPlanId: string;
}

// Built-in Profiles
export const DefaultEvaluationPolicies: Record<OptimizationObjective, EvaluationPolicy> = {
  CostOptimized: {
    id: 'pol-cost-opt-1',
    name: 'Cost Optimized',
    version: 1,
    primaryObjective: 'CostOptimized',
    tieResolution: 'LowestCost',
    customWeights: { cost: 0.6, latency: 0.1, risk: 0.1, compliance: 0.1, successProbability: 0.1 }
  },
  LatencyOptimized: {
    id: 'pol-lat-opt-1',
    name: 'Latency Optimized',
    version: 1,
    primaryObjective: 'LatencyOptimized',
    tieResolution: 'LowestRisk',
    customWeights: { cost: 0.1, latency: 0.6, risk: 0.1, compliance: 0.1, successProbability: 0.1 }
  },
  ReliabilityOptimized: {
    id: 'pol-rel-opt-1',
    name: 'Reliability Optimized',
    version: 1,
    primaryObjective: 'ReliabilityOptimized',
    tieResolution: 'LowestRisk',
    customWeights: { cost: 0.1, latency: 0.1, risk: 0.4, compliance: 0.1, successProbability: 0.3 }
  },
  ComplianceFirst: {
    id: 'pol-comp-first-1',
    name: 'Compliance First',
    version: 1,
    primaryObjective: 'ComplianceFirst',
    tieResolution: 'NeedsApproval',
    customWeights: { cost: 0.1, latency: 0.1, risk: 0.1, compliance: 0.6, successProbability: 0.1 },
    vetoThresholds: { minComplianceScore: 1.0 } // Hard veto
  },
  Balanced: {
    id: 'pol-bal-1',
    name: 'Balanced',
    version: 1,
    primaryObjective: 'Balanced',
    tieResolution: 'LowestRisk',
    customWeights: { cost: 0.2, latency: 0.2, risk: 0.2, compliance: 0.2, successProbability: 0.2 }
  },
  Custom: {
    id: 'pol-custom-1',
    name: 'Custom',
    version: 1,
    primaryObjective: 'Custom',
    tieResolution: 'NeedsApproval'
  }
};
