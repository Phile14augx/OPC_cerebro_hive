export interface EvaluationContext {
  tenantId: string;
  subjectId: string;
  traceId: string;
  permissions: readonly string[];
}

export interface EvaluationDataset {
  id: string;
  tenantId: string;
  inputs: readonly string[];
  expected: readonly string[];
}

export interface RunEvaluationRequest {
  targetId: string;
  dataset: EvaluationDataset;
  metrics: readonly ('accuracy' | 'precision' | 'recall')[];
  benchmarkId: string;
}

export interface ModelInferenceRequest {
  targetId: string;
  inputs: readonly string[];
  context: EvaluationContext;
}

export interface ModelInferenceResponse {
  outputs: readonly string[];
}

export interface ModelInferencePort {
  infer(request: ModelInferenceRequest): Promise<ModelInferenceResponse>;
}

export interface AuthorizationPort {
  authorize(context: EvaluationContext, action: string): Promise<boolean>;
}

export interface MLOpsEvaluationPort {
  publishOutcome(evaluationId: string, outcome: string, metrics: any): Promise<void>;
}

export interface ObservabilityPort {
  publish(event: any): Promise<void>;
}
