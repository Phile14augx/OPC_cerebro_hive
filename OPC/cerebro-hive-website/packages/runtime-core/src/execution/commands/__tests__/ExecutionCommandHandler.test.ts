import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionCommandHandler } from '../ExecutionCommandHandler';
import { StartExecutionCommand } from '@cerebro/runtime-contracts/src/commands/ExecutionCommand';
import { ExecutionManager } from '../../ExecutionManager';
import { ValidationError } from '../ExecutionValidator';

describe('ExecutionCommandHandler', () => {
  let mockManager: unknown;
  let handler: ExecutionCommandHandler;

  beforeEach(() => {
    mockManager = {
      startExecution: vi.fn().mockResolvedValue('exec-123'),
      resumeExecution: vi.fn(),
    };
    handler = new ExecutionCommandHandler(mockManager as unknown as ExecutionManager);
  });

  it('should call ExecutionManager on valid StartExecutionCommand', async () => {
    const cmd: StartExecutionCommand = {
      id: '1',
      type: 'StartExecutionCommand',
      executionId: 'exec1',
      timestamp: new Date(),
      tenantId: 'tenant1',
      payload: { agentId: 'a1', agentVersionId: 'v1', input: 'hi' }
    };

    const result = await handler.handle(cmd);

    expect(mockManager.startExecution).toHaveBeenCalledWith('tenant1', 'a1', 'v1', 'hi');
    expect(result).toBe('exec-123');
  });

  it('should throw if validator fails', async () => {
    const cmd = { type: 'StartExecutionCommand', payload: {} } as unknown as StartExecutionCommand;

    await expect(handler.handle(cmd)).rejects.toThrowError(ValidationError);
    expect(mockManager.startExecution).not.toHaveBeenCalled();
  });

  it('should throw Error on unsupported command type', async () => {
    const cmd = { type: 'UnknownCommand' } as any;
    await expect(handler.handle(cmd)).rejects.toThrow('Unsupported command type: UnknownCommand');
  });
});
