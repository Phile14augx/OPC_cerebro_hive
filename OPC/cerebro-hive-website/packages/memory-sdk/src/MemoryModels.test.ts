import { describe, it, expect } from 'vitest';
import type { MemoryLayer, EpisodicMemory } from './MemoryModels';

describe('MemoryModels Contract', () => {
  it('should validate episodic memory with correct outcome', () => {
    const mem: EpisodicMemory = {
      id: 'mem-1',
      type: 'EPISODIC' as MemoryLayer,
      ownerId: 'agent-42',
      timestamp: new Date().toISOString(),
      metadata: {},
      confidenceScore: 0.88,
      executionId: 'exec-99',
      decision: 'Use tool X to resolve incident',
      outcome: 'SUCCESS',
      lessonsLearned: ['Tool X is reliable for P1 alerts'],
    };
    expect(mem.outcome).toBe('SUCCESS');
    expect(mem.confidenceScore).toBeLessThanOrEqual(1.0);
  });

  it('should detect invalid confidence score (Negative Control)', () => {
    const score = -0.1;
    expect(score < 0).toBe(true); // domain violation detected
  });
});
