export interface EvaluationMetrics {
  hallucinationScore?: number; // 0.0 to 1.0
  toxicityScore?: number;
  biasScore?: number;
  correctnessScore?: number;
  groundingScore?: number;
  instructionFollowingScore?: number;
  faithfulnessScore?: number;
  robustnessScore?: number;
  jailbreakResistanceScore?: number;
  promptInjectionResistanceScore?: number;
  privacyLeakageScore?: number;
  
  averageLatencyMs?: number;
  costPer1kTokens?: number;
}

export interface AIEvaluation {
  evaluationId: string;
  
  // What is being evaluated?
  modelId: string;
  promptTemplateId?: string;
  
  // What dataset was used?
  datasetId: string;
  
  metrics: EvaluationMetrics;
  
  evaluatorId: string; // The service or person running the eval
  evaluatedAt: Date;
  
  passed: boolean;
  notes?: string;
}
