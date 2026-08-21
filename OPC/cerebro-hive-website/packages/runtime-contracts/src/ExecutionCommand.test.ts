import { describe, it, expect } from 'vitest';
import type { StartExecutionCommand, ExecutionCommandType } from './commands/ExecutionCommand';

describe('RuntimeContracts ExecutionCommand Contract', () => {
  it('should construct a valid StartExecutionCommand', () => {
    const cmd: StartExecutionCommand = {
      id: 'cmd-1',
      type: 'StartExecutionCommand' as ExecutionCommandType,
      executionId: 'exec-1',
      payload: { agentId: 'agent-42', agentVersionId: 'v1.0', input: 'Hello' },
      timestamp: new Date(),
      tenantId: 'tenant-a',
    };
    expect(cmd.type).toBe('StartExecutionCommand');
    expect(cmd.payload.agentId).toBe('agent-42');
  });

  it('should detect invalid command type (Negative Control)', () => {
    const validTypes: ExecutionCommandType[] = [
      'StartExecutionCommand', 'ResumeExecutionCommand', 'CancelExecutionCommand',
      'ApproveExecutionCommand', 'RejectExecutionCommand', 'TimeoutExecutionCommand',
    ];
    const invalid = 'DeleteExecutionCommand';
    expect(validTypes.includes(invalid as ExecutionCommandType)).toBe(false);
  });
});
