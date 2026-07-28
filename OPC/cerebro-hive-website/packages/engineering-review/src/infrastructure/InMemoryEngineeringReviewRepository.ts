import { EngineeringReviewReport } from '../EngineeringReviewReport';
import { IEngineeringReviewRepository } from '../ports/IEngineeringReviewRepository';
import { ReviewId } from '../ids';
import { ReviewOutcome } from '../valueObjects';

/**
 * Slice 1's only infrastructure component (per
 * M26.1-IMPLEMENTATION-ROADMAP.md — "an in-memory IEngineeringReviewRepository
 * implementation for testing"). Reconstructs aggregates via
 * EngineeringReviewReport.rehydrate() rather than assuming any particular
 * storage shape (Phase 5 §1: persist aggregates, not object graphs) — even
 * though this in-memory version happens to just hold the instances
 * directly, going through rehydrate() keeps this repository honest about
 * the reconstruction contract a real persistence adapter will need to
 * fulfill in Slice 3.
 */
export class InMemoryEngineeringReviewRepository implements IEngineeringReviewRepository {
  private readonly store = new Map<ReviewId, EngineeringReviewReport>();

  async save(review: EngineeringReviewReport): Promise<void> {
    const snapshot = EngineeringReviewReport.rehydrate({
      id: review.id,
      workflowId: review.workflowId,
      reviewVersion: review.reviewVersion,
      manifest: review.manifest,
      createdAt: review.createdAt,
      state: review.state,
      evidenceRefs: [...review.evidenceRefs],
      findings: [...review.findings],
      recommendations: [...review.recommendations],
      verdict: review.verdict,
      publishedAt: review.publishedAt,
    });
    this.store.set(review.id, snapshot);
  }

  async load(id: ReviewId): Promise<EngineeringReviewReport | undefined> {
    return this.store.get(id);
  }

  async findLatest(workflowId: string): Promise<EngineeringReviewReport | undefined> {
    const all = await this.findByWorkflow(workflowId);
    if (all.length === 0) return undefined;
    return [...all].sort((a, b) => b.reviewVersion - a.reviewVersion)[0];
  }

  async findByWorkflow(workflowId: string): Promise<readonly EngineeringReviewReport[]> {
    return [...this.store.values()].filter((r) => r.workflowId === workflowId);
  }

  async findByManifest(manifestId: string): Promise<EngineeringReviewReport | undefined> {
    return [...this.store.values()].find((r) => r.manifest.id === manifestId);
  }

  async findByVerdict(outcome: ReviewOutcome): Promise<readonly EngineeringReviewReport[]> {
    return [...this.store.values()].filter((r) => r.verdict?.outcome === outcome);
  }
}
