
import type { ReviewFinding } from '../../domain/value-objects/ReviewFinding';
import type { EvidenceNode } from '../../domain/entities/EvidenceGraph';

export type ContributorStatus = 'SUCCESS' | 'FAILED' | 'TIMED_OUT' | 'SKIPPED' | 'NOT_EXECUTED';

export interface ContributorResult {
  readonly findings: ReviewFinding[];
  readonly evidence: EvidenceNode[];
  readonly executionMetadata: Record<string, unknown>;
  readonly durationMs: number;
  readonly confidence: number;
  readonly status: ContributorStatus;
}

export interface IReviewContributor {
  readonly id: string;
  readonly version: string;
  execute(snapshotId: string, semanticChangeset: object): Promise<ContributorResult>;
}
