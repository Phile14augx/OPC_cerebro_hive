import { ExecutionSaga, SagaStepContext } from '@cerebro/runtime-contracts/src/sagas/ExecutionSaga';
import { ExecutionCommand } from '@cerebro/runtime-contracts/src/commands/ExecutionCommand';
import { ExecutionRuntimeKernel } from '../kernel/ExecutionRuntimeKernel';

export class AgentExecutionSaga implements ExecutionSaga {
  constructor(private readonly kernel: ExecutionRuntimeKernel) {}

  async dispatch(command: ExecutionCommand): Promise<void> {
    await this.kernel.dispatchCommand(command);
  }

  async next(context: SagaStepContext): Promise<ExecutionCommand | null> {
    switch (context.currentState) {
      case 'WAITING_PROVIDER':
        // The LLM has completed. The payload should have `toolCalls` or `finishReason`.
        // If there are tool calls requiring approval, next command is to transition to WAITING_APPROVAL.
        // If there are tool calls not requiring approval, transition to WAITING_TOOL.
        // For this skeleton, we assume it's implemented via state machine.
        return null;
        
      case 'WAITING_APPROVAL':
        // Approval was granted. Next command is to resume.
        return null;

      case 'WAITING_TOOL':
        // Tool completed. Next command is ResumeExecutionCommand to pass tool output back to LLM.
        return null;

      default:
        return null;
    }
  }

  async compensate(context: SagaStepContext, reason: string): Promise<void> {
    // If a tool failed, we might dispatch a command to inform the LLM of the tool failure.
    // If the entire execution timed out, we dispatch CancelExecutionCommand.
    const cancelCmd: ExecutionCommand = {
      id: crypto.randomUUID(),
      type: 'CancelExecutionCommand',
      executionId: context.executionId,
      timestamp: new Date(),
      tenantId: 'system',
      payload: {
        reason: `Saga Compensation: ${reason}`,
        requestedBy: 'SystemSagaCoordinator'
      }
    };
    await this.kernel.dispatchCommand(cancelCmd);
  }
}
