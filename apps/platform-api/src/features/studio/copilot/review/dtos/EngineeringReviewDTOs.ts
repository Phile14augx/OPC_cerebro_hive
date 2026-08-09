export interface EngineeringReviewSummaryDTO {
  readonly id: string;
  readonly workflowId: string;
  readonly verdict: string;
  readonly confidence: number;
  readonly createdAt: string;
  readonly manifestHash: string;
}

export interface ReviewStatisticsDTO {
  readonly totalFindings: number;
  readonly findingsBySeverity: Record<string, number>;
  readonly contributorCount: number;
  readonly failedContributors: number;
  readonly reviewDurationMs: number;
  readonly freshnessState: string;
  readonly overallConfidence: number;
}

export interface EngineeringReviewDetailDTO {
  readonly summary: EngineeringReviewSummaryDTO;
  readonly statistics: ReviewStatisticsDTO;
  readonly findings: any[];
  readonly recommendations: any[];
  readonly provenance: any;
}

export interface ReviewComparisonDTO {
  readonly baseReviewId: string;
  readonly targetReviewId: string;
  readonly verdictChanged: boolean;
  readonly newFindings: any[];
  readonly resolvedFindings: any[];
  readonly policyDifferences: any;
}

export interface ContributorExecutionDTO {
  readonly contributorId: string;
  readonly durationMs: number;
  readonly status: string;
  readonly warnings: string[];
}
