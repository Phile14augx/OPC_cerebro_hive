import { RemediationPlan } from './RemediationPlan';

export interface AutomationPolicy {
  policyId: string;
  name: string;
  evaluate(plan: RemediationPlan): boolean; // Returns true if Human Approval is required
}

export class MissionCriticalApprovalPolicy implements AutomationPolicy {
  policyId = 'pol-mc-approval';
  name = 'Mission Critical Human Approval Gate';

  evaluate(plan: RemediationPlan): boolean {
    const affectsMissionCritical = plan.simulatedImpact?.cascadingFailures.some(n => n.labels.includes('MissionCritical')) ?? false;
    const targetsMissionCritical = plan.targetNodes.some(n => n.labels.includes('MissionCritical'));
    
    // If it targets or breaks a MissionCritical service, require a human.
    if (targetsMissionCritical || affectsMissionCritical) {
      return true; 
    }

    // If runbook confidence is too low, require human
    if (plan.runbooks.some(r => r.confidenceScore < 0.95)) {
      return true;
    }

    return false; // Can execute autonomously
  }
}
