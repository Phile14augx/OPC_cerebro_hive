import { RemediationPlan } from '../domain/RemediationPlan';
import { RunbookProviderPort } from '../ports/RunbookProviderPort';
import { ClosedLoopVerifier } from './ClosedLoopVerifier';

export class ExecutionEngine {
  constructor(
    private readonly providers: RunbookProviderPort[],
    private readonly verifier: ClosedLoopVerifier
  ) {}

  async executePlan(plan: RemediationPlan): Promise<void> {
    console.log(`[ExecutionEngine] Starting execution for Plan: ${plan.planId}`);
    plan.status = 'Running';

    let allSuccess = true;

    for (const target of plan.targetNodes) {
      for (const runbook of plan.runbooks) {
        const provider = this.providers.find(p => p.supports(runbook.provider));
        if (!provider) {
          console.error(`[ExecutionEngine] No provider found for: ${runbook.provider}`);
          allSuccess = false;
          continue;
        }

        try {
          const result = await provider.execute(runbook, target.id);
          
          // Verify and update confidence
          await this.verifier.verifyExecution(runbook, result);

          if (!result.success) {
            allSuccess = false;
          }
        } catch (error) {
          console.error(`[ExecutionEngine] Execution failed for ${runbook.name}:`, error);
          allSuccess = false;
        }
      }
    }

    plan.status = allSuccess ? 'Completed' : 'Failed';
    console.log(`[ExecutionEngine] Plan execution finished with status: ${plan.status}`);
  }
}
