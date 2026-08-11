import { describe, expect, it } from 'vitest';
import { SandboxStateMachine } from '../SandboxStateMachine';

describe('SandboxStateMachine (M26.7)', () => {
  it('allows legal transitions through the full lifecycle', () => {
    const sm = new SandboxStateMachine();
    expect(sm.getState()).toBe('Queued');

    sm.transitionTo('Provisioning');
    sm.transitionTo('SandboxCreated');
    sm.transitionTo('ArtifactsMounted');
    sm.transitionTo('Running');
    sm.transitionTo('CollectingOutput');
    sm.transitionTo('Completed');
    sm.transitionTo('CleaningUp');
    sm.transitionTo('Finished');

    expect(sm.getState()).toBe('Finished');
  });

  it('rejects illegal transitions', () => {
    const sm = new SandboxStateMachine();
    
    // Cannot skip Provisioning to go straight to Running
    expect(() => sm.transitionTo('Running')).toThrowError(/Illegal state transition/);
  });

  it('allows early cleanup (cancellation)', () => {
    const sm = new SandboxStateMachine();
    sm.transitionTo('Provisioning');
    
    // Cancelled during provisioning
    sm.transitionTo('CleaningUp');
    sm.transitionTo('Finished');

    expect(sm.getState()).toBe('Finished');
  });
});
