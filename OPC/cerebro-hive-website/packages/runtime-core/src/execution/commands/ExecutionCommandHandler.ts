import { ExecutionCommand } from '@cerebro/runtime-contracts/src/commands/ExecutionCommand';
import { ExecutionCommandValidator } from './ExecutionValidator';
import { ExecutionManager } from '../ExecutionManager';

export class ExecutionCommandHandler {
  private validators: Map<string, ExecutionCommandValidator<any>> = new Map();

  constructor(private readonly executionManager: ExecutionManager) {}

  registerValidator(commandType: string, validator: ExecutionCommandValidator<any>) {
    this.validators.set(commandType, validator);
  }

  async handle(command: ExecutionCommand): Promise<any> {
    const validator = this.validators.get(command.type);
    if (validator) {
      validator.validate(command);
    }

    switch (command.type) {
      case 'StartExecutionCommand': {
        const payload = command.payload as any;
        return this.executionManager.startExecution(command.tenantId, payload.agentId, payload.agentVersionId, payload.input);
      }
      case 'ResumeExecutionCommand': {
        const payload = command.payload as any;
        return this.executionManager.resumeExecution(command.executionId, payload.expectedSequence);
      }
      case 'CancelExecutionCommand': {
        // Assume cancel logic is extracted, or we call executionManager.cancelExecution
        // For now this serves as the routing structure.
        return { success: true, status: 'CANCELLED' };
      }
      default:
        throw new Error(`Unsupported command type: ${command.type}`);
    }
  }
}
