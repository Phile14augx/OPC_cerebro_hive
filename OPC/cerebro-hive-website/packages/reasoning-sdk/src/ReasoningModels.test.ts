import { describe, it, expect } from 'vitest';
import { ReasoningEvents } from './ReasoningModels';

describe('ReasoningModels Contract', () => {
  it('should export the correct canonical event names', () => {
    expect(ReasoningEvents.REASONING_STARTED).toBe('REASONING_STARTED');
    expect(ReasoningEvents.REASONING_COMPLETED).toBe('REASONING_COMPLETED');
    expect(ReasoningEvents.CONSENSUS_REACHED).toBe('CONSENSUS_REACHED');
  });

  it('should fail when domain event name is mutated (Negative Control)', () => {
    const mutated = 'REASONING_STARTED_X';
    expect(mutated).not.toBe(ReasoningEvents.REASONING_STARTED);
  });
});
