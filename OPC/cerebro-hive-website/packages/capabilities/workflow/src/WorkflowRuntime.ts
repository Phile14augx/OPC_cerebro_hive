import { WorkflowApplicationService, Result } from '@cerebro/domain';
import { RequestContext } from '@cerebro/db';

export class WorkflowRuntime {
  constructor(private readonly workflowAppService: WorkflowApplicationService) {}

  async executeWorkflow(
    _workflowId: string,
    _inputs: Record<string, unknown>,
    _context: RequestContext
  ): Promise<Result<unknown>> {
    // A Capability Service coordinates domain and execution logic.
    // 1. We might validate the workflow state via domain
    // 2. We trigger an execution engine (like a step function or temporal worker)
    // 3. We record the execution status.

    return Result.ok({
      executionId: 'exec_' + Date.now(),
      status: 'running',
    });
  }
}
