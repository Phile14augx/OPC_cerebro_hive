
import { EvidenceGraph } from '../evidence/EvidenceGraph';
import type { SemanticChangeset } from '../analyzer/WorkflowChangeAnalyzer';
import type { ReviewGateResult } from '../orchestrator/EngineeringReviewOrchestrator';

/**
 * Contributor SDK — enables first-party and third-party review extensions
 * without modifying the orchestrator.
 *
 * Organizations can register custom review logic such as:
 * SecurityReviewContributor | HealthcareReviewContributor |
 * FinanceReviewContributor  | ArchitectureStandardsContributor
 *
 * Each contributes typed findings with evidence refs. The orchestrator
 * aggregates them without needing to know their internal logic.
 */
export interface EngineeringReviewContributor {
  readonly name: string;
  readonly version: string;
  contribute(changeset: SemanticChangeset, evidence: EvidenceGraph): Promise<ReviewGateResult[]>;
}

/** Example built-in contributor — architecture standards enforcement */
export class ArchitectureStandardsContributor implements EngineeringReviewContributor {
  readonly name = 'ArchitectureStandards';
  readonly version = '1.0.0';

  async contribute(changeset: SemanticChangeset, evidence: EvidenceGraph): Promise<ReviewGateResult[]> {
    const hasParallelWithoutTimeout = changeset.changes.some(c => c.changeType === 'ParallelismAdded');
    const evidenceId = `arch-${Date.now()}`;
    evidence.addNode({ id: evidenceId, type: 'PolicyEvaluation', label: 'Architecture standards check', data: changeset });

    return hasParallelWithoutTimeout ? [{
      gate: this.name,
      severity: 'WARNING',
      detail: 'Parallel branches added without explicit timeout configuration. Best practice: set per-branch timeout.',
      confidence: 1.0,
    }] : [{ gate: this.name, severity: 'PASS', detail: 'Architecture standards satisfied.', confidence: 1.0 }];
  }
}
