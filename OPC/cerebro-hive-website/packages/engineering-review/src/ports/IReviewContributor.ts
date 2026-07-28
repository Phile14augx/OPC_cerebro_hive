import { EvidenceReference, ReviewFinding } from '../valueObjects';
import { ReviewSnapshot } from './ISnapshotProvider';

/**
 * Phase 4 §inbound orchestration input / Phase 6 §2 (contributor contract).
 * What a contributor is given to work with. Deliberately narrow for Slice 2:
 * a workflow summary rather than the live workflow graph itself — wiring
 * this up to the real WorkflowApplicationService.publishVersion() call site
 * (ADR-004) is a later-slice concern, not Slice 2's.
 */
export interface ReviewContext {
  readonly workflowId: string;
  readonly workflowVersionId: string;
  readonly priorWorkflowVersionId?: string;
  readonly snapshot: ReviewSnapshot;
  readonly workflowSummary: {
    readonly nodeCount: number;
    readonly edgeCount: number;
  };
}

/** Phase 6 §4: a structured status, not a thrown exception, is how a
 * contributor's outcome crosses the contributor boundary. */
export type ContributorStatus = 'succeeded' | 'failed' | 'skipped';

/**
 * Phase 6 §4 (failure isolation):
 *   Contributor -> Execution Result -> Status -> Findings -> Evidence
 * `error` is populated only when status is 'failed' — a contributor that
 * throws should never propagate that exception across the boundary; the
 * orchestrator converts it into this shape (see
 * EngineeringReviewOrchestrator.safeExecute).
 */
export interface ContributorResult {
  readonly contributorId: string;
  readonly status: ContributorStatus;
  readonly evidence: readonly EvidenceReference[];
  readonly findings: readonly ReviewFinding[];
  readonly error?: string;
}

/**
 * Phase 6 §2: the contributor contract. `IReviewContributor` is an
 * infrastructure component (Phase 4: "contributors are infrastructure
 * components that produce domain objects through stable contracts") — this
 * interface is defined on the application/domain side; concrete
 * contributors implement it, never the reverse.
 */
export interface IReviewContributor {
  readonly contributorId: string;
  readonly displayName: string;
  readonly version: string;
  readonly category: string;
  execute(context: ReviewContext): Promise<ContributorResult>;
}
