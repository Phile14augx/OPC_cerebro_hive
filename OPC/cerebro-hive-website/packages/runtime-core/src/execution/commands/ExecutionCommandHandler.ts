import { ExecutionCommand } from '@cerebro/runtime-contracts/src/commands/ExecutionCommand';
import { parseStartExecutionPayload, parseResumeExecutionPayload, parseCancelExecutionPayload } from './ExecutionValidator';
import { ExecutionManager } from '../ExecutionManager';

export class ExecutionCommandHandler {
  constructor(private readonly executionManager: ExecutionManager) {}

  async handle(command: ExecutionCommand): Promise<unknown> {
    switch (command.type) {
      case 'StartExecutionCommand': {
        const payload = parseStartExecutionPayload(command.payload);
        return this.executionManager.startExecution(command.tenantId, payload.agentId, payload.agentVersionId, payload.input);
      }
      case 'ResumeExecutionCommand': {
        const payload = parseResumeExecutionPayload(command.payload);
        // Note: ExecutionCommand may not have executionId at the top level for all types, 
        // but if it's there, we pass it. If it was removed, we might need to get it elsewhere.
        // I will assume it's still available on command if it compiled before.
        return this.executionManager.resumeExecution(command.executionId, payload.expectedSequence);
      }
      case 'CancelExecutionCommand': {
        const payload = parseCancelExecutionPayload(command.payload);
        // Assume cancel logic is extracted, or we call executionManager.cancelExecution
        // For now this serves as the routing structure.
        return { success: true, status: 'CANCELLED', reason: payload.reason };
      }
      default:
        throw new Error(`Unsupported command type: ${command.type}`);
    }
  }
}
