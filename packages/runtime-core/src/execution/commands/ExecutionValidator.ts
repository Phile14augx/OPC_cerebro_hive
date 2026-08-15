import { ExecutionCommand } from '@cerebro/runtime-contracts';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ExecutionCommandValidator<T extends ExecutionCommand> {
  validate(command: T): void;
}

export class StartExecutionValidator implements ExecutionCommandValidator<ExecutionCommand> {
  validate(command: ExecutionCommand): void {
    const payload = command.payload as any;
    if (!payload.agentId || typeof payload.agentId !== 'string') {
      throw new ValidationError('StartExecutionCommand requires a valid agentId string');
    }
    if (!payload.agentVersionId || typeof payload.agentVersionId !== 'string') {
      throw new ValidationError('StartExecutionCommand requires a valid agentVersionId string');
    }
    if (!payload.input || typeof payload.input !== 'string') {
      throw new ValidationError('StartExecutionCommand requires a valid input string');
    }
    if (!command.tenantId) {
      throw new ValidationError('StartExecutionCommand requires a tenantId');
    }
  }
}

export class ResumeExecutionValidator implements ExecutionCommandValidator<ExecutionCommand> {
  validate(command: ExecutionCommand): void {
    const payload = command.payload as any;
    if (payload.expectedSequence === undefined || typeof payload.expectedSequence !== 'bigint') {
      throw new ValidationError('ResumeExecutionCommand requires an expectedSequence (bigint)');
    }
    if (!command.executionId) {
      throw new ValidationError('ResumeExecutionCommand requires an executionId');
    }
  }
}

export class CancelExecutionValidator implements ExecutionCommandValidator<ExecutionCommand> {
  validate(command: ExecutionCommand): void {
    const payload = command.payload as any;
    if (!payload.reason || typeof payload.reason !== 'string') {
      throw new ValidationError('CancelExecutionCommand requires a reason');
    }
  }
}
