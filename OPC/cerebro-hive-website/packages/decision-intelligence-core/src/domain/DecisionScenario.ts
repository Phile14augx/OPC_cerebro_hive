import { SemanticNode, SemanticEdge } from '../../../knowledge-graph-core/src/index';

export interface DecisionScenario {
  scenarioId: string;
  name: string;
  description: string;
  decisionId: string;
  
  // Proposed graph mutations to achieve this scenario
  proposedInjections: SemanticNode[];
  proposedDependencies: SemanticEdge[];
  proposedSeverances: string[]; // Edge IDs to remove

  // Calculated metrics
  metrics?: {
    AvailabilityScore: number;
    ComplianceScore: number;
    PerformanceScore: number;
    CostScore: number; // 0 to 1 (normalized)
    RecoveryTimeScore: number;
    BlastRadiusScore: number;
  };
  
  // Final calculated utility
  optimizationScore?: number;
}
