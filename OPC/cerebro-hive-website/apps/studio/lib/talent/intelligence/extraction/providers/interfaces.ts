export interface EvaluatedCapability {
  capabilityId: string;
  score: number;
  confidence: number;
  reasoning: string;
}

export interface EvaluatorContext {
executionArtifacts: unknown;
telemetryMetrics: unknown;
}

export interface IAIEvaluatorProvider {
  /**
   * Evaluates candidate execution evidence and maps it to structured Skill Capabilities.
   */
  evaluate(context: EvaluatorContext): Promise<{
    evaluatorVersion: string;
    capabilities: EvaluatedCapability[];
  }>;
}
