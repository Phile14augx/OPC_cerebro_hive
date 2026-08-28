import { describe, it, expect } from 'vitest';
import { StateEngine } from './StateEngine';

describe('StateEngine Contract', () => {
  it('should create and retrieve execution state', () => {
    const engine = new StateEngine();
    const state = engine.createState('exec-1');
    expect(state.id).toBe('exec-1');
    expect(state.variables).toEqual({});
    const retrieved = engine.getState('exec-1');
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe('exec-1');
  });

  it('should throw error when state not found (Negative Control)', () => {
    const engine = new StateEngine();
    expect(() => engine.updateState('nonexistent', { variables: {} }))
      .toThrow('Execution state for nonexistent not found.');
  });
});
