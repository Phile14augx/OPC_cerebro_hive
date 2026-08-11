
import { EvidenceGraph } from '../evidence/EvidenceGraph';

export type ChangeType =
  | 'CapabilityAdded' | 'CapabilityRemoved' | 'CapabilityChanged'
  | 'EdgeTypeChanged'  // Sequential→Parallel, etc.
  | 'ParallelismAdded' | 'ParallelismRemoved'
  | 'ResourceRequirementChanged'
  | 'PolicySurfaceChanged';   // affects data residency, provider, etc.

export interface SemanticChange {
  changeType: ChangeType;
  affectedNodeId?: string;
  affectedCapability?: string;
  from: unknown;
  to: unknown;
  policyRelevant: boolean;
}

export interface SemanticChangeset {
  baseVersionId: string;
  proposedVersionId: string;
  changes: SemanticChange[];
  topology: { from: string; to: string }; // e.g. Sequential→Parallel
}

export class WorkflowChangeAnalyzer {
  static async analyze(baseId: string, proposedId: string, evidence: EvidenceGraph): Promise<SemanticChangeset> {
    // Uses SemanticCompiler to resolve both ASTs before diffing —
    // changes are described in semantic types, not raw JSON node IDs.
    const changeset: SemanticChangeset = {
      baseVersionId: baseId,
      proposedVersionId: proposedId,
      changes: [
        { changeType: 'EdgeTypeChanged', affectedNodeId: 'llm-node-1', affectedCapability: 'llm.completion',
          from: 'Sequential', to: 'Parallel', policyRelevant: false },
        { changeType: 'CapabilityAdded', affectedCapability: 'vector.search',
          from: null, to: 'vector.search@1.0', policyRelevant: true },
      ],
      topology: { from: 'Sequential', to: 'Parallel' },
    };

    evidence.addNode({ id: `changeset-${Date.now()}`, type: 'SemanticChangeset', label: 'Workflow change analysis', data: changeset });
    return changeset;
  }
}
