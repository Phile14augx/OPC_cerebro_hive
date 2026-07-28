import { EngineeringReviewReport } from '../EngineeringReviewReport';
import { ReviewId } from '../ids';
import { ReviewOutcome } from '../valueObjects';

/**
 * Phase 5 §5: repository responsibilities are aggregate-scoped only. This
 * interface deals exclusively with EngineeringReviewReport persistence — no
 * contributor-specific or evidence-specific queries belong here (those are
 * read-model or evidence-access-service concerns, per Phase 5 §6, out of
 * scope for Slice 1).
 */
export interface IEngineeringReviewRepository {
  save(review: EngineeringReviewReport): Promise<void>;
  load(id: ReviewId): Promise<EngineeringReviewReport | undefined>;
  findLatest(workflowId: string): Promise<EngineeringReviewReport | undefined>;
  findByWorkflow(workflowId: string): Promise<readonly EngineeringReviewReport[]>;
  findByManifest(manifestId: string): Promise<EngineeringReviewReport | undefined>;
  findByVerdict(outcome: ReviewOutcome): Promise<readonly EngineeringReviewReport[]>;
}
