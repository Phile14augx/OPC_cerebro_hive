import { describe, it, expect } from 'vitest';
import { createAIService } from './factory';

describe('AI Factory Contract', () => {
  it('should create a mock provider successfully', () => {
    const service = createAIService({ provider: 'mock', modelId: 'mock-model' });
    expect(service).toBeDefined();
  });
  
  it('should throw error for unknown provider when domain behavior is incorrect', () => {
    expect(() => createAIService({ provider: 'unknown' as any, modelId: 'test' })).toThrow('Unknown AI provider: unknown');
  });
});
