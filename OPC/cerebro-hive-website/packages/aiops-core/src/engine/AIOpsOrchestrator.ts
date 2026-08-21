import { RemediationPlanner } from './RemediationPlanner';
import { ExecutionEngine } from './ExecutionEngine';
import { AutomationPolicy } from '../domain/AutomationPolicy';
import { RemediationPlan } from '../domain/RemediationPlan';

export class AIOpsOrchestrator {
  constructor(
    private readonly planner: RemediationPlanner,
    private readonly executionEngine: ExecutionEngine,
    private readonly policies: AutomationPolicy[]
  ) {}

  async handleIncident(incidentId: string, failedNodeId: string): Promise<void> {
    console.log(`\n[AIOpsOrchestrator] Incident Detected: ${incidentId}`);
    
    // 1. Planning & Simulation
    const plan = await this.planner.planRemediation(incidentId, failedNodeId);
    plan.status = 'Validated';
    console.log(`[AIOpsOrchestrator] Plan generated and validated: ${plan.planId}`);

    // 2. Policy Evaluation
    let requiresApproval = false;
    for (const policy of this.policies) {
      if (policy.evaluate(plan)) {
        console.log(`[AIOpsOrchestrator] Policy triggered human approval gate: ${policy.name}`);
        requiresApproval = true;
        break;
      }
    }

    plan.requiresHumanApproval = requiresApproval;

    // 3. Approval Gate
    if (plan.requiresHumanApproval) {
      console.log(`[AIOpsOrchestrator] Pausing execution for Human Approval...`);
      // In a real system, we'd wait for a webhook or API call. Here we mock approval.
      await this.mockHumanApproval(plan);
    } else {
      console.log(`[AIOpsOrchestrator] Autonomous execution approved by policies.`);
      plan.status = 'Approved';
    }

    // 4. Execution & Verification
    if (plan.status === 'Approved') {
      await this.executionEngine.executePlan(plan);
    } else {
      console.log(`[AIOpsOrchestrator] Plan execution aborted.`);
    }
  }

  private async mockHumanApproval(plan: RemediationPlan) {
    console.log(`[ApprovalGate] Mock Human Operator reviewing plan ${plan.planId}...`);
    await new Promise(r => setTimeout(r, 500));
    console.log(`[ApprovalGate] Plan Approved.`);
    plan.status = 'Approved';
  }
}
