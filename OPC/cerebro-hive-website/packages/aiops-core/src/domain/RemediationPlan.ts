import { Runbook } from './Runbook';
import { SimulationResult } from '../../../simulation-core/src/domain/SimulationResult';
import { SemanticNode } from '../../../knowledge-graph-core/src/domain/SemanticNode';

export interface RemediationPlan {
  planId: string;
  incidentId: string;
  incidentSeverity: string;
  targetNodes: SemanticNode[];
  runbooks: Runbook[];
  simulatedImpact?: SimulationResult;
  confidenceRationale: string;
  requiresHumanApproval: boolean; // Set by AutomationPolicyEngine
  status: 'Pending' | 'Validated' | 'Approved' | 'Running' | 'Completed' | 'Failed' | 'RolledBack';
}
