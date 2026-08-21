
import { ReviewVerdict } from '../value-objects/ReviewVerdict';
import type { ReviewManifest } from '../value-objects/ReviewManifest';
import type { ReviewProvenance } from '../value-objects/ReviewProvenance';
import type { ReviewFinding } from '../value-objects/ReviewFinding';
import type { ReviewRecommendation } from '../value-objects/ReviewRecommendation';
import type { EvidenceReference } from '../value-objects/EvidenceReference';
import { ReviewEvaluationCompleted, ReviewPublished } from '../events/DomainEvents';

export type ReportState = 'Draft' | 'EvaluationCompleted' | 'Published';

export class EngineeringReviewReport {
  private state: ReportState = 'Draft';
  private verdict: ReviewVerdict = ReviewVerdict.DRAFT;
  private readonly domainEvents: unknown[] = [];

  constructor(
    public readonly reportId: string,
    public readonly proposedVersionId: string,
    public readonly baseVersionId: string,
    public readonly manifest: ReviewManifest,
    public readonly provenance: ReviewProvenance,
    public readonly semanticChangeset: object,
    public readonly findings: ReadonlyArray<ReviewFinding> = [],
    public readonly recommendations: ReadonlyArray<ReviewRecommendation> = [],
    public readonly evidenceReferences: ReadonlyArray<EvidenceReference> = [],
    public readonly overallConfidence: number = 0
  ) {
    Object.freeze(this.manifest);
    Object.freeze(this.provenance);
    Object.freeze(this.semanticChangeset);
  }

  public getState(): ReportState { return this.state; }
  public getVerdict(): ReviewVerdict { return this.verdict; }
  public getEvents() { return [...this.domainEvents]; }
  public clearEvents() { this.domainEvents.length = 0; }

  public completeEvaluation(verdict: ReviewVerdict) {
    if (this.state !== 'Draft') throw new Error('Cannot complete evaluation from state: ' + this.state);
    this.verdict = verdict;
    this.state = 'EvaluationCompleted';
    this.domainEvents.push(new ReviewEvaluationCompleted(this.reportId));
  }

  public publish() {
    if (this.state !== 'EvaluationCompleted') throw new Error('Must complete evaluation before publishing');
    this.state = 'Published';
    this.domainEvents.push(new ReviewPublished(this.reportId, this.verdict));
  }
}
