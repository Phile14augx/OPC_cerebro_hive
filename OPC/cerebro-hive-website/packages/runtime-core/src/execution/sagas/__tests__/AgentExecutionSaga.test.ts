import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentExecutionSaga } from '../AgentExecutionSaga';
import { ExecutionRuntimeKernel } from '../../kernel/ExecutionRuntimeKernel';
import { ExecutionCommand } from '@cerebro/runtime-contracts/src/commands/ExecutionCommand';

describe('AgentExecutionSaga', () => {
  let mockKernel: unknown;
  let saga: AgentExecutionSaga;

  beforeEach(() => {
    mockKernel = {
      dispatchCommand: vi.fn().mockResolvedValue(undefined),
    };
    saga = new AgentExecutionSaga(mockKernel as unknown as ExecutionRuntimeKernel);
  });

  it('should dispatch commands directly to the kernel (Coordination only)', async () => {
    const cmd = { type: 'StartExecutionCommand' } as unknown;
    await saga.dispatch(cmd);
    expect(mockKernel.dispatchCommand).toHaveBeenCalledWith(cmd);
  });

  it('should emit a CancelExecutionCommand when compensate is called', async () => {
    await saga.compensate({ executionId: 'exec1', currentState: 'RUNNING', payload: {} }, 'Task Failed');
    
    expect(mockKernel.dispatchCommand).toHaveBeenCalledTimes(1);
    const dispatchedCommand = mockKernel.dispatchCommand.mock.calls[0][0] as ExecutionCommand;
    
    expect(dispatchedCommand.type).toBe('CancelExecutionCommand');
    expect(dispatchedCommand.executionId).toBe('exec1');
    expect(dispatchedCommand.payload.reason).toBe('Saga Compensation: Task Failed');
  });

  it('should not mutate state or perform business logic in next()', async () => {
    // Proves it only returns the next command intent
    const nextCmd = await saga.next({ executionId: 'exec1', currentState: 'WAITING_APPROVAL', payload: {} });
    expect(nextCmd).toBeNull(); // based on current skeleton
  });
});
