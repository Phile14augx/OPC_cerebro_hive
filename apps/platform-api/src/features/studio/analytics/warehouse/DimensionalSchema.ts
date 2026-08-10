
export interface FactReview {
  reviewId: string;
  workflowId: string;
  dateKey: number;
  orgKey: number;
  securityScore: number;
  architectureScore: number;
  reliabilityScore: number;
  costScore: number;
  complianceScore: number;
  governanceHealthIndex: number;
}

export interface FactFinding {
  findingId: string;
  reviewId: string;
  policyKey: number;
  severityKey: number;
  status: string;
}

export interface FactContributorExecution {
  executionId: string;
  reviewId: string;
  contributorKey: number;
  durationMs: number;
  findingDensity: number;
  status: string;
}

// Dimensions: DimTime, DimOrganization, DimWorkflow, DimPolicy, DimContributor, DimSeverity, DimComplianceFramework
