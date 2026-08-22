// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- ARCH-LINT: Deferred
// @ts-nocheck
export interface EvaluatedCapability {
  capabilityId: string;
  score: number;
  confidence: number;
  reasoning: string;
}

export interface EvaluatorContext {
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  executionArtifacts: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  telemetryMetrics: any;
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
