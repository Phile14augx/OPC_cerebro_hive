import { describe, it, expect } from 'vitest';
import { parseStartExecutionPayload, parseResumeExecutionPayload, parseCancelExecutionPayload, ValidationError } from '../ExecutionValidator';

describe('ExecutionCommandValidators', () => {
  describe('parseStartExecutionPayload', () => {
    it('should validate a valid payload', () => {
      const payload = {
        agentId: 'agent1',
        agentVersionId: 'v1',
        input: 'hello'
      };
      expect(() => parseStartExecutionPayload(payload)).not.toThrow();
      expect(parseStartExecutionPayload(payload)).toEqual(payload);
    });

    it('should throw if agentId is missing', () => {
      const payload = { agentVersionId: 'v1', input: 'hello' };
      expect(() => parseStartExecutionPayload(payload)).toThrowError(ValidationError);
    });
  });

  describe('parseResumeExecutionPayload', () => {
    it('should validate a valid payload', () => {
      const payload = {
        expectedSequence: BigInt(2)
      };
      expect(() => parseResumeExecutionPayload(payload)).not.toThrow();
    });

    it('should throw if expectedSequence is missing', () => {
      const payload = {};
      expect(() => parseResumeExecutionPayload(payload)).toThrowError(ValidationError);
    });
  });

  describe('parseCancelExecutionPayload', () => {
    it('should validate a valid payload', () => {
      const payload = {
        reason: 'user requested',
        requestedBy: 'user1'
      };
      expect(() => parseCancelExecutionPayload(payload)).not.toThrow();
    });

    it('should throw if reason is missing', () => {
      const payload = { requestedBy: 'user1' };
      expect(() => parseCancelExecutionPayload(payload)).toThrowError(ValidationError);
    });
  });
});
