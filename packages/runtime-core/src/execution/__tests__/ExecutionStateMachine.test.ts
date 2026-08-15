import { describe, it, expect } from 'vitest';
import { ExecutionStateMachine, ExecutionState } from '../ExecutionStateMachine.js';

describe('ExecutionStateMachine Formal Verification', () => {
  const ALL_STATES: ExecutionState[] = [
    'CREATED',
    'QUEUED',
    'RUNNING',
    'WAITING_TOOL',
    'WAITING_APPROVAL',
    'WAITING_PROVIDER',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'TIMED_OUT',
  ];

  it('proves every non-terminal state has valid outbound transitions', () => {
    ALL_STATES.forEach(state => {
      if (!ExecutionStateMachine.isTerminal(state)) {
        let hasOutbound = false;
        ALL_STATES.forEach(nextState => {
          if (ExecutionStateMachine.canTransition(state, nextState)) {
            hasOutbound = true;
          }
        });
        expect(hasOutbound).toBe(true);
      }
    });
  });

  it('proves no terminal state can transition to any other state', () => {
    ALL_STATES.forEach(state => {
      if (ExecutionStateMachine.isTerminal(state)) {
        ALL_STATES.forEach(nextState => {
          expect(ExecutionStateMachine.canTransition(state, nextState)).toBe(false);
        });
      }
    });
  });

  it('proves no unreachable states exist from CREATED (Graph Traversal)', () => {
    const visited = new Set<ExecutionState>();
    const queue: ExecutionState[] = ['CREATED'];

    while (queue.length > 0) {
      const current = queue.shift()!;
      visited.add(current);

      ALL_STATES.forEach(nextState => {
        if (ExecutionStateMachine.canTransition(current, nextState) && !visited.has(nextState)) {
          if (!queue.includes(nextState)) {
            queue.push(nextState);
          }
        }
      });
    }

    // Assert that every state in ALL_STATES was visited
    ALL_STATES.forEach(state => {
      expect(visited.has(state)).toBe(true);
    });
  });

  it('proves no disconnected components exist (all nodes reachable from CREATED)', () => {
    // If every state is visited from CREATED, there are no isolated islands
    const visited = new Set<ExecutionState>();
    const queue: ExecutionState[] = ['CREATED'];
    while (queue.length > 0) {
      const current = queue.shift()!;
      visited.add(current);
      ALL_STATES.forEach(nextState => {
        if (ExecutionStateMachine.canTransition(current, nextState) && !visited.has(nextState) && !queue.includes(nextState)) {
          queue.push(nextState);
        }
      });
    }
    expect(visited.size).toBe(ALL_STATES.length);
  });

  it('proves illegal transitions are rejected (e.g., FAILED -> RUNNING)', () => {
    expect(ExecutionStateMachine.canTransition('FAILED', 'RUNNING')).toBe(false);
    expect(ExecutionStateMachine.canTransition('COMPLETED', 'RUNNING')).toBe(false);
    expect(ExecutionStateMachine.canTransition('CREATED', 'COMPLETED')).toBe(false);
  });
});
