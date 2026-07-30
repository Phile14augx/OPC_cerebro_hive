import type {
  EvidenceReferenceId,
  FindingId,
  ManifestId,
  RecommendationId,
} from './ids';
import { DomainInvariantViolation } from './errors';

/** ISO-8601 string. Kept as a plain string type (not a class) so value
 * objects built from it stay trivially serializable — appropriate for
 * Slice 1's scope (see M26.1-IMPLEMENTATION-ROADMAP.md). */
export type Timestamp = string;

export function now(): Timestamp {
  return new Date().toISOString();
}

/** Phase 3 §Value Objects: Severity — how bad. */
export type Severity = 'low' | 'medium' | 'high' | 'critical';

/** Phase 3 §Value Objects: Confidence — how sure. Distinct axis from Severity. */
export type Confidence = 'low' | 'medium' | 'high';

/** Phase 3 §Value Objects: RecommendationPriority. */
export type RecommendationPriority = 'low' | 'medium' | 'high';

/**
 * Phase 3 §Value Objects: Provenance — ties an EvidenceReference back to its
 * exact source and moment of retrieval. The concrete mechanism behind the
 * Explainability success metric (ADR-003, PRD): every Finding/Recommendation
 * is traceable through an EvidenceReference's provenance back to a specific
 * source read at a specific time.
 */
export interface ReviewProvenance {
  /** Which external, immutable source this evidence came from. Per Phase 2,
   * Engineering Review reads these but never owns them. */
  readonly sourceSystem: 'workflow-graph' | 'prior-workflow-version' | 'capability-registry';
  /** The identifier of the specific element within that source system — e.g.
   * a WorkflowNode id, a WorkflowEdge id, or a capability-registry entry id.
   * Deliberately an opaque string, not a reference to the source system's
   * own types, per the anti-corruption-layer boundary named in Phase 2. */
  readonly sourceElementId: string;
  readonly retrievedAt: Timestamp;
}

/**
 * Phase 3 §Value Objects: EvidenceReference — a citation into source data
 * owned elsewhere, not a copy of that data (Phase 2 refinement, Phase 5 §7:
 * the aggregate owns the identity of the reference, not the evidence's
 * storage location).
 */
export interface EvidenceReference {
  readonly id: EvidenceReferenceId;
  readonly description: string;
  readonly provenance: ReviewProvenance;
}

export function createEvidenceReference(input: {
  id: EvidenceReferenceId;
  description: string;
  provenance: ReviewProvenance;
}): EvidenceReference {
  if (!input.description.trim()) {
    throw new DomainInvariantViolation('EvidenceReference requires a non-empty description.');
  }
  return { id: input.id, description: input.description, provenance: input.provenance };
}

export interface ExecutionProvenance {
  readonly model: string;
  readonly provider: string;
  readonly temperature: number;
  readonly executionTimeMs: number;
  readonly tokenUsage: number;
  readonly promptVersion: string;
}

/**
 * Phase 3 §Finding: append-only entity owned by EngineeringReviewReport.
 * Invariant 2: a Finding cannot be constructed without at least one
 * EvidenceReference — enforced here, at construction, not left to callers.
 */
export interface ReviewFinding {
  readonly id: FindingId;
  readonly evidenceRefs: readonly EvidenceReferenceId[];
  readonly severity: Severity;
  readonly confidence: Confidence;
  readonly message: string;
  readonly category?: string;
  readonly executionProvenance?: ExecutionProvenance;
}

export function createReviewFinding(input: {
  id: FindingId;
  evidenceRefs: readonly EvidenceReferenceId[];
  severity: Severity;
  confidence: Confidence;
  message: string;
  category?: string;
  executionProvenance?: ExecutionProvenance;
}): ReviewFinding {
  if (input.evidenceRefs.length === 0) {
    throw new DomainInvariantViolation(
      'A Finding cannot exist without at least one EvidenceReference (Phase 3 invariant 2).'
    );
  }
  if (!input.message.trim()) {
    throw new DomainInvariantViolation('ReviewFinding requires a non-empty message.');
  }
  return {
    id: input.id,
    evidenceRefs: [...input.evidenceRefs],
    severity: input.severity,
    confidence: input.confidence,
    message: input.message,
    category: input.category,
    executionProvenance: input.executionProvenance,
  };
}

/**
 * Phase 3 §Recommendation: derived from Findings, immutable once generated.
 * Invariant 3: cannot be constructed without at least one referenced Finding
 * ("recommendations never invent facts").
 */
export interface ReviewRecommendation {
  readonly id: RecommendationId;
  readonly findingRefs: readonly FindingId[];
  readonly priority: RecommendationPriority;
  readonly message: string;
}

export function createReviewRecommendation(input: {
  id: RecommendationId;
  findingRefs: readonly FindingId[];
  priority: RecommendationPriority;
  message: string;
}): ReviewRecommendation {
  if (input.findingRefs.length === 0) {
    throw new DomainInvariantViolation(
      'A Recommendation cannot exist without at least one supporting Finding (Phase 3 invariant 3).'
    );
  }
  if (!input.message.trim()) {
    throw new DomainInvariantViolation('ReviewRecommendation requires a non-empty message.');
  }
  return {
    id: input.id,
    findingRefs: [...input.findingRefs],
    priority: input.priority,
    message: input.message,
  };
}

/**
 * Phase 5 §3 / Phase 3 §Manifest: an immutable snapshot of the exact
 * execution context a review ran under. Written once, at review creation
 * time, and never recomputed.
 */
export interface ReviewManifest {
  readonly id: ManifestId;
  readonly workflowId: string;
  readonly workflowVersionId: string;
  readonly priorWorkflowVersionId?: string;
  readonly capabilityRegistrySnapshotId: string;
  /** Present only if an engineering-convention policy source was consulted —
   * PRD Open Question 2 / Phase 4 §policy evaluation port remains open;
   * this field is simply unpopulated until that's resolved (Slice 5). */
  readonly policyVersion?: string;
  readonly platformVersion: string;
  readonly featureFlags: Readonly<Record<string, boolean>>;
  readonly snapshotId: string;
  readonly capturedAt: Timestamp;
}

export function createReviewManifest(input: {
  id: ManifestId;
  workflowId: string;
  workflowVersionId: string;
  priorWorkflowVersionId?: string;
  capabilityRegistrySnapshotId: string;
  policyVersion?: string;
  platformVersion: string;
  featureFlags?: Readonly<Record<string, boolean>>;
  snapshotId: string;
  capturedAt?: Timestamp;
}): ReviewManifest {
  if (!input.workflowId.trim() || !input.workflowVersionId.trim()) {
    throw new DomainInvariantViolation('ReviewManifest requires workflowId and workflowVersionId.');
  }
  return {
    id: input.id,
    workflowId: input.workflowId,
    workflowVersionId: input.workflowVersionId,
    priorWorkflowVersionId: input.priorWorkflowVersionId,
    capabilityRegistrySnapshotId: input.capabilityRegistrySnapshotId,
    policyVersion: input.policyVersion,
    platformVersion: input.platformVersion,
    featureFlags: input.featureFlags ?? {},
    snapshotId: input.snapshotId,
    capturedAt: input.capturedAt ?? now(),
  };
}

/** PRD §Outputs: three states, not a numeric score, to avoid implying false
 * precision. */
export type ReviewOutcome = 'clear' | 'flagged' | 'needs-attention';

/**
 * Phase 3 §Verdict: the aggregate's own overall conclusion, derived from its
 * Recommendations. Invariant 11: cannot exist before EvaluationCompleted.
 * Invariant 12: a Published review cannot exist without one.
 */
export interface ReviewVerdict {
  readonly outcome: ReviewOutcome;
  readonly recommendationRefs: readonly RecommendationId[];
  readonly summary: string;
  readonly decidedAt: Timestamp;
}

export function createReviewVerdict(input: {
  outcome: ReviewOutcome;
  recommendationRefs: readonly RecommendationId[];
  summary: string;
  decidedAt?: Timestamp;
}): ReviewVerdict {
  if (!input.summary.trim()) {
    throw new DomainInvariantViolation('ReviewVerdict requires a non-empty summary.');
  }
  return {
    outcome: input.outcome,
    recommendationRefs: [...input.recommendationRefs],
    summary: input.summary,
    decidedAt: input.decidedAt ?? now(),
  };
}

/**
 * Phase 3 §ReviewSummary: a presentation object derived from the aggregate's
 * current Findings/Recommendations/Verdict — not a separate source of truth.
 * Computed on demand by EngineeringReviewReport.toSummary(), never stored.
 */
export interface ReviewSummary {
  readonly reviewId: string;
  readonly workflowId: string;
  readonly state: string;
  readonly findingCount: number;
  readonly recommendationCount: number;
  readonly verdict?: ReviewOutcome;
}
