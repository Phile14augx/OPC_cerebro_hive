
export interface EvaluationDataset {
  id: string;
  name: string;
  scenarios: { input: string; expectedOutput?: string; context?: string }[];
}

export type MetricCategory = 'Quality' | 'Knowledge' | 'Performance' | 'Cost' | 'Safety';

export interface EvaluationMetric {
  name: string;
  category: MetricCategory;
  score: number; // 0.0 to 1.0
  reasoning?: string;
}

export interface EvaluationResult {
  suiteId: string;
  targetModelOrPrompt: string;
  timestamp: Date;
  metrics: EvaluationMetric[];
}
