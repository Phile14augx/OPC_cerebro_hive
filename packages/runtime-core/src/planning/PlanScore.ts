export interface PlanScore {
  costScore: number;
  latencyScore: number;
  riskScore: number;
  complianceScore: number;
  successProbabilityScore: number;
  
  compositeScore: number;
  
  // Explanation of why it received this score, used for "decision explanations"
  reasons: string[];
}
