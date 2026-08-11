import {
  DomainInvariantViolation,
  DuplicateDomainIdentifier,
  InvalidLifecycleTransition,
  MissingEvidenceReference,
  MissingFindingReference,
  MissingRecommendationReference,
} from './errors';
import { FindingId, RecommendationId, ReviewId } from './ids';
import {
  EvidenceReference,
  ReviewFinding,
  ReviewManifest,
  ReviewRecommendation,
  ReviewSummary,
  ReviewVerdict,
  Timestamp,
  now,
} from './valueObjects';

/**
 * Phase 3 §Lifecycle. Every transition is a mandatory gate — no state may be
 * skipped. Enforced by EngineeringReviewReport itself (see each transition
 * method below), not left to caller discipline: "a state machine only a
 * careful caller can respect isn't really enforcing anything."
 */
export type ReviewState =
  | 'Draft'
  | 'EvidenceCollected'
  | 'EvaluationCompleted'
  | 'RecommendationsGenerated'
  | 'Published';

const NEXT_STATE: Record<ReviewState, ReviewState | null> = {
  Draft: 'EvidenceCollected',
  EvidenceCollected: 'EvaluationCompleted',
  EvaluationCompleted: 'RecommendationsGenerated',
  RecommendationsGenerated: 'Published',
  Published: null,
};

export interface EngineeringReviewReportProps {
  id: ReviewId;
  workflowId: string;
  reviewVersion: number;
  manifest: ReviewManifest;
  createdAt?: Timestamp;
}

/**
 * The sole aggregate root for this bounded context (Phase 3). Everything
 * inside — evidence references, findings, recommendations, manifest,
 * verdict, lifecycle state — changes together or not at all.
 *
 * This class never imports persistence, transport, or any specific external
 * system's client (Phase 4 §dependency direction: "the domain depends on
 * nothing").
 */
export class EngineeringReviewReport {
  readonly id: ReviewId;
  readonly workflowId: string;
  readonly reviewVersion: number;
  readonly manifest: ReviewManifest;
  readonly createdAt: Timestamp;

  private _state: ReviewState = 'Draft';
  private _evidenceRefs: EvidenceReference[] = [];
  private _findings: ReviewFinding[] = [];
  private _recommendations: ReviewRecommendation[] = [];
  private _verdict?: ReviewVerdict;
  private _publishedAt?: Timestamp;

  private constructor(props: EngineeringReviewReportProps) {
    this.id = props.id;
    this.workflowId = props.workflowId;
    this.reviewVersion = props.reviewVersion;
    this.manifest = props.manifest;
    this.createdAt = props.createdAt ?? now();
  }

  /**
   * Manifest is required at creation (Phase 5 §3: written once, at review
   * time, never recomputed) — it captures the exact execution context this
   * review runs under.
   */
  static create(props: EngineeringReviewReportProps): EngineeringReviewReport {
    if (!props.workflowId.trim()) {
      throw new DomainInvariantViolation('EngineeringReviewReport requires a workflowId.');
    }
    if (props.reviewVersion < 1) {
      throw new DomainInvariantViolation('reviewVersion must be a positive integer.');
    }
    return new EngineeringReviewReport(props);
  }

  get state(): ReviewState {
    return this._state;
  }
  get evidenceRefs(): readonly EvidenceReference[] {
    return this._evidenceRefs;
  }
  get findings(): readonly ReviewFinding[] {
    return this._findings;
  }
  get recommendations(): readonly ReviewRecommendation[] {
    return this._recommendations;
  }
  get verdict(): ReviewVerdict | undefined {
    return this._verdict;
  }
  get publishedAt(): Timestamp | undefined {
    return this._publishedAt;
  }

  private assertNotPublished(action: string): void {
    if (this._state === 'Published') {
      throw new InvalidLifecycleTransition(
        `Cannot ${action}: review ${this.id} is Published and immutable (Phase 3 invariant 4).`
      );
    }
  }

  private assertState(expected: ReviewState, action: string): void {
    if (this._state !== expected) {
      throw new InvalidLifecycleTransition(
        `Cannot ${action}: review ${this.id} is in state ${this._state}, expected ${expected}.`
      );
    }
  }

  private advance(from: ReviewState): void {
    const next = NEXT_STATE[from];
    if (!next) {
      throw new InvalidLifecycleTransition(`No valid transition out of terminal state ${from}.`);
    }
    this._state = next;
  }

  /**
   * Append-only (Phase 3 invariant 5) — there is no method to remove or
   * alter an EvidenceReference once added. Only permitted in Draft, so
   * "what evidence this review considered" is settled before evaluation
   * begins.
   */
  addEvidence(ref: EvidenceReference): void {
    this.assertNotPublished('add evidence');
    this.assertState('Draft', 'add evidence');
    if (this._evidenceRefs.some((e) => e.id === ref.id)) {
      throw new DuplicateDomainIdentifier(
        `EvidenceReference ${ref.id} already recorded on review ${this.id}. Evidence references are append-only and cannot be re-added or replaced (Phase 3 invariant 5).`
      );
    }
    this._evidenceRefs.push(ref);
  }

  /**
   * Draft -> EvidenceCollected. Invariant 1: a review cannot proceed toward
   * evaluation without at least one EvidenceReference recorded.
   */
  collectEvidence(): void {
    this.assertNotPublished('collect evidence');
    this.assertState('Draft', 'collect evidence');
    if (this._evidenceRefs.length === 0) {
      throw new DomainInvariantViolation(
        'A review cannot leave Draft without at least one EvidenceReference (Phase 3 invariant 1).'
      );
    }
    this.advance('Draft');
  }

  /**
   * Append-only (Findings are never edited or removed after creation).
   * Only permitted in EvidenceCollected. Invariant 2 is already enforced at
   * ReviewFinding construction (see valueObjects.ts); this additionally
   * verifies every referenced EvidenceReference actually exists on this
   * review, so a Finding can never cite evidence this review never
   * collected.
   */
  addFinding(finding: ReviewFinding): void {
    this.assertNotPublished('add finding');
    this.assertState('EvidenceCollected', 'add finding');
    for (const evidenceId of finding.evidenceRefs) {
      if (!this._evidenceRefs.some((e) => e.id === evidenceId)) {
        throw new MissingEvidenceReference(
          `Finding ${finding.id} references EvidenceReference ${evidenceId}, which was never recorded on this review.`
        );
      }
    }
    if (this._findings.some((f) => f.id === finding.id)) {
      throw new DuplicateDomainIdentifier(
        `Finding ${finding.id} already recorded on review ${this.id}. Findings are append-only and cannot be re-added or replaced.`
      );
    }
    this._findings.push(finding);
  }

  /** EvidenceCollected -> EvaluationCompleted. Zero findings is a valid
   * outcome (a clean review) — only evidence is required, not findings. */
  completeEvaluation(): void {
    this.assertNotPublished('complete evaluation');
    this.assertState('EvidenceCollected', 'complete evaluation');
    this.advance('EvidenceCollected');
  }

  /**
   * Immutable once generated. Only permitted in EvaluationCompleted.
   * Invariant 3 is enforced at ReviewRecommendation construction; this
   * additionally verifies every referenced Finding actually exists on this
   * review.
   */
  addRecommendation(recommendation: ReviewRecommendation): void {
    this.assertNotPublished('add recommendation');
    this.assertState('EvaluationCompleted', 'add recommendation');
    for (const findingId of recommendation.findingRefs) {
      if (!this._findings.some((f) => f.id === findingId)) {
        throw new MissingFindingReference(
          `Recommendation ${recommendation.id} references Finding ${findingId}, which was never recorded on this review.`
        );
      }
    }
    if (this._recommendations.some((r) => r.id === recommendation.id)) {
      throw new DuplicateDomainIdentifier(
        `Recommendation ${recommendation.id} already recorded on review ${this.id}. Recommendations are immutable once generated and cannot be re-added or replaced.`
      );
    }
    this._recommendations.push(recommendation);
  }

  /** EvaluationCompleted -> RecommendationsGenerated. Zero recommendations is
   * valid (no findings warranted one). */
  generateRecommendations(): void {
    this.assertNotPublished('generate recommendations');
    this.assertState('EvaluationCompleted', 'generate recommendations');
    this.advance('EvaluationCompleted');
  }

  /**
   * Invariant 11: a Verdict cannot exist before EvaluationCompleted — enforced
   * here by requiring RecommendationsGenerated (a stricter, later point,
   * consistent with Phase 3's description of Verdict as "derived from the
   * Recommendations"). Only permitted in RecommendationsGenerated, and only
   * once.
   */
  decideVerdict(verdict: ReviewVerdict): void {
    this.assertNotPublished('decide verdict');
    this.assertState('RecommendationsGenerated', 'decide verdict');
    if (this._verdict) {
      throw new DomainInvariantViolation(`Review ${this.id} already has a verdict.`);
    }
    for (const recommendationId of verdict.recommendationRefs) {
      if (!this._recommendations.some((r) => r.id === recommendationId)) {
        throw new MissingRecommendationReference(
          `Verdict references Recommendation ${recommendationId}, which was never recorded on this review.`
        );
      }
    }
    this._verdict = verdict;
  }

  /**
   * RecommendationsGenerated -> Published. Terminal and immutable (invariant
   * 4). Invariant 12: cannot publish without a Verdict.
   */
  publish(): void {
    this.assertNotPublished('publish');
    this.assertState('RecommendationsGenerated', 'publish');
    if (!this._verdict) {
      throw new DomainInvariantViolation(
        `Cannot publish review ${this.id} without a Verdict (Phase 3 invariant 12).`
      );
    }
    this.advance('RecommendationsGenerated');
    this._publishedAt = now();
  }

  /**
   * Phase 3 §ReviewSummary: computed on demand, never stored — restating
   * that it is a presentation object, not an independent source of truth.
   */
  toSummary(): ReviewSummary {
    return {
      reviewId: this.id,
      workflowId: this.workflowId,
      state: this._state,
      findingCount: this._findings.length,
      recommendationCount: this._recommendations.length,
      verdict: this._verdict?.outcome,
    };
  }

  /** Referenced by IDs referenced elsewhere (e.g. RecommendationId[]
   * lookups) — exposed for repository/read-model use, not for mutation. */
  findingIds(): readonly FindingId[] {
    return this._findings.map((f) => f.id);
  }
  recommendationIds(): readonly RecommendationId[] {
    return this._recommendations.map((r) => r.id);
  }

  /**
   * Reconstruction from persisted state (Phase 5 §1: "persist aggregates,
   * not object graphs" — storage is free to differ from the in-memory shape
   * as long as reconstruction is faithful). Bypasses the lifecycle gates
   * deliberately, since this is restoring an already-valid prior state, not
   * performing a new transition — the invariants were already satisfied
   * when this state was first produced.
   */
  static rehydrate(snapshot: {
    id: ReviewId;
    workflowId: string;
    reviewVersion: number;
    manifest: ReviewManifest;
    createdAt: Timestamp;
    state: ReviewState;
    evidenceRefs: EvidenceReference[];
    findings: ReviewFinding[];
    recommendations: ReviewRecommendation[];
    verdict?: ReviewVerdict;
    publishedAt?: Timestamp;
  }): EngineeringReviewReport {
    const report = new EngineeringReviewReport({
      id: snapshot.id,
      workflowId: snapshot.workflowId,
      reviewVersion: snapshot.reviewVersion,
      manifest: snapshot.manifest,
      createdAt: snapshot.createdAt,
    });
    report._state = snapshot.state;
    report._evidenceRefs = [...snapshot.evidenceRefs];
    report._findings = [...snapshot.findings];
    report._recommendations = [...snapshot.recommendations];
    report._verdict = snapshot.verdict;
    report._publishedAt = snapshot.publishedAt;
    return report;
  }
}
