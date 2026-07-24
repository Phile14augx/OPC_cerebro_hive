import { SemanticNode } from '../../../knowledge-graph-core/src/index';

export interface SimulationResult {
  scenarioId: string;
  impactedCapabilities: SemanticNode[];
  cascadingFailures: SemanticNode[];
  policyViolations: string[];
  criticalPath: SemanticNode[];
  confidenceLevel: string; // High, Medium, Low
  estimatedDegradation: string;
}
