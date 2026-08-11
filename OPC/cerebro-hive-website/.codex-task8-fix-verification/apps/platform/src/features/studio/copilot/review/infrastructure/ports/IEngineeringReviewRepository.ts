
import type { EngineeringReviewReport } from '../../domain/aggregates/EngineeringReviewReport';

export interface IEngineeringReviewRepository {
  save(report: EngineeringReviewReport): Promise<void>;
  load(reportId: string): Promise<EngineeringReviewReport | null>;
  findLatest(workflowVersionId: string): Promise<EngineeringReviewReport | null>;
  findByVerdict(verdict: string): Promise<EngineeringReviewReport[]>;
  findByManifest(manifestId: string): Promise<EngineeringReviewReport[]>;
}
