
export type RecommendationType = 'ROUTING_CHANGE' | 'PROMPT_UPDATE' | 'BUDGET_ADJUSTMENT' | 'CAPACITY_SCALING';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type AutonomyLevel = 'RECOMMENDATION_ONLY' | 'POLICY_CONSTRAINED' | 'HUMAN_APPROVAL_REQUIRED';

export interface OptimizationRecommendation {
  id: string;
  type: RecommendationType;
  severity: SeverityLevel;
  confidence: number; // 0.0 to 1.0
  evidence: string[];
  expectedBenefit: string;
  potentialRisk: string;
  suggestedAction: Record<string, unknown>;
  autonomyLevel: AutonomyLevel;
}
