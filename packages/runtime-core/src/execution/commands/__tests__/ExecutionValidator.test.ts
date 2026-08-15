import { describe, it, expect } from 'vitest';
import { StartExecutionValidator, ResumeExecutionValidator, CancelExecutionValidator, ValidationError } from '../ExecutionValidator.js';
import { StartExecutionCommand, ResumeExecutionCommand, CancelExecutionCommand } from '@cerebro/runtime-contracts';

describe('ExecutionCommandValidators', () => {
  describe('StartExecutionValidator', () => {
    const validator = new StartExecutionValidator();

    it('should validate a valid StartExecutionCommand', () => {
      const cmd: StartExecutionCommand = {
        id: '1',
        type: 'StartExecutionCommand',
        executionId: 'exec1',
        timestamp: new Date(),
        tenantId: 'tenant1',
        payload: {
          agentId: 'agent1',
          agentVersionId: 'v1',
          input: 'hello'
        }
      };
      expect(() => validator.validate(cmd)).not.toThrow();
    });

    it('should throw if agentId is missing', () => {
      const cmd = { type: 'StartExecutionCommand', payload: { agentVersionId: 'v1', input: 'hello' }, tenantId: 'tenant1' } as any;
      expect(() => validator.validate(cmd)).toThrowError(ValidationError);
    });

    it('should throw if tenantId is missing', () => {
      const cmd = { type: 'StartExecutionCommand', payload: { agentId: 'agent1', agentVersionId: 'v1', input: 'hello' } } as any;
      expect(() => validator.validate(cmd)).toThrowError(ValidationError);
    });
  });

  describe('ResumeExecutionValidator', () => {
    const validator = new ResumeExecutionValidator();

    it('should validate a valid ResumeExecutionCommand', () => {
      const cmd: ResumeExecutionCommand = {
        id: '1',
        type: 'ResumeExecutionCommand',
        executionId: 'exec1',
        timestamp: new Date(),
        tenantId: 'tenant1',
        payload: {
          expectedSequence: BigInt(2)
        }
      };
      expect(() => validator.validate(cmd)).not.toThrow();
    });

    it('should throw if expectedSequence is missing', () => {
      const cmd = { type: 'ResumeExecutionCommand', executionId: 'exec1', payload: {} } as any;
      expect(() => validator.validate(cmd)).toThrowError(ValidationError);
    });
  });

  describe('CancelExecutionValidator', () => {
    const validator = new CancelExecutionValidator();

    it('should validate a valid CancelExecutionCommand', () => {
      const cmd: CancelExecutionCommand = {
        id: '1',
        type: 'CancelExecutionCommand',
        executionId: 'exec1',
        timestamp: new Date(),
        tenantId: 'tenant1',
        payload: {
          reason: 'user requested',
          requestedBy: 'user1'
        }
      };
      expect(() => validator.validate(cmd)).not.toThrow();
    });

    it('should throw if reason is missing', () => {
      const cmd = { type: 'CancelExecutionCommand', executionId: 'exec1', payload: { requestedBy: 'user1' } } as any;
      expect(() => validator.validate(cmd)).toThrowError(ValidationError);
    });
  });
});
