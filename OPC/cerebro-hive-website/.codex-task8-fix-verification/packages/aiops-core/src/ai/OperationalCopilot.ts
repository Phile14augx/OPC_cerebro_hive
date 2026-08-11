import { RemediationPlan } from '../domain/RemediationPlan';

export class OperationalCopilot {
  explainPlan(plan: RemediationPlan): string {
    const runbooks = plan.runbooks.map(r => `${r.name} (v${r.version})`).join(', ');
    
    return `[Operational Copilot]
Here is the reasoning behind Remediation Plan '${plan.planId}':

Context:
- Incident: ${plan.incidentId} (Severity: ${plan.incidentSeverity})
- Target Entities: ${plan.targetNodes.map(n => n.id).join(', ')}

Selected Runbooks:
- ${runbooks}

Simulation Evidence:
- Confidence Score for runbooks is: ${plan.runbooks.map(r => r.confidenceScore).join(', ')}
- ${plan.confidenceRationale}

Policy Evaluation:
- Requires Human Approval: ${plan.requiresHumanApproval}
- Reason: ${plan.requiresHumanApproval ? 'Triggered by Automation Policy (Mission Critical or Low Confidence)' : 'Passed all autonomous criteria'}
`;
  }
}
