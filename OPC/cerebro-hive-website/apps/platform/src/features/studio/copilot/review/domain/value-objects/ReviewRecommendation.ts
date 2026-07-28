
export interface ReviewRecommendation {
  readonly id: string;
  readonly findingRef: string; // Must point to a ReviewFinding, never Evidence directly (ADR-006)
  readonly priority: 'High' | 'Medium' | 'Low';
  readonly action: string;
  readonly rationale: string;
}
