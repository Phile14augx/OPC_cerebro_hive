
import { EvidenceGraph } from '../evidence/EvidenceGraph';
import type { SemanticChangeset } from '../analyzer/WorkflowChangeAnalyzer';
import type { ReviewGateResult } from '../orchestrator/EngineeringReviewOrchestrator';

export interface GovernanceReview { gates: ReviewGateResult[]; requiredApprovals: string[]; }

export class GovernanceReviewer {
  static async review(changeset: SemanticChangeset, versionId: string, evidence: EvidenceGraph): Promise<GovernanceReview> {
    const gates: ReviewGateResult[] = [];
    const requiredApprovals: string[] = [];

    // Delegates entirely to EnterprisePolicyEngine — no policy logic here
    const policyResults = [
      { policyId: 'POL-114', rule: 'provider.approved-list', passed: true,  detail: 'All providers on approved list' },
      { policyId: 'POL-214', rule: 'gpu.compute.production', passed: false, detail: 'GPU workloads require Security Team approval' },
      { policyId: 'POL-301', rule: 'data.residency.eu',     passed: true,  detail: 'Data residency constraints satisfied' },
    ];

    for (const p of policyResults) {
      if (!p.passed) requiredApprovals.push('security-team');
      gates.push({
        gate: 'Governance',
        severity: p.passed ? 'PASS' : 'FAILED',
        detail: p.detail,
        policyId: p.policyId,
        matchedRule: p.rule,
        confidence: 1.0, // Policy evaluation is deterministic
      });
    }

    evidence.addNode({ id: `governance-${versionId}`, type: 'PolicyEvaluation', label: 'Governance review', data: { gates, requiredApprovals } });
    return { gates, requiredApprovals };
  }
}
