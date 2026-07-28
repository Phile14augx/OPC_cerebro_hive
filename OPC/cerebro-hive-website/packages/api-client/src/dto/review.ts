export type ReviewStateDTO = 'Draft' | 'GatheringEvidence' | 'Evaluating' | 'Published' | 'Archived';
export type ReviewOutcomeDTO = 'pass' | 'fail' | 'needs-attention' | 'not-applicable';

export interface EngineeringReviewSummaryDTO {
  id: string;
  workflowId: string;
  reviewVersion: number;
  state: ReviewStateDTO;
  createdAt: string;
  publishedAt?: string;
  verdict?: {
    outcome: ReviewOutcomeDTO;
    summary: string;
  };
  findingCount: number;
  evidenceCount: number;
}

export interface FindingDetailDTO {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
  message: string;
  evidenceRefs: string[];
}

export interface EvidenceDTO {
  id: string;
  description: string;
  provenance: {
    sourceSystem: string;
    sourceElementId: string;
    retrievedAt: string;
  };
  payload?: Record<string, unknown>; // Fetched separately in EvidenceViewer
}

export interface ContributorResultDTO {
  agentId: string;
  agentVersion: string;
  findingsProduced: number;
  executionTimeMs: number;
  completedAt: string;
}

export interface FreshnessStatusDTO {
  isStale: boolean;
  reason?: 'POLICY_CHANGED' | 'PLATFORM_CHANGED' | 'CONTRIBUTOR_UPGRADED' | 'WORKFLOW_CHANGED';
}
