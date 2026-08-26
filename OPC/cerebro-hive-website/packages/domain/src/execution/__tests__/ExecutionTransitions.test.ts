import { describe, it, expect } from 'vitest';
import { EXECUTION_TRANSITIONS, isLegalExecutionTransition, legalNextExecutionStatuses } from '../ExecutionTransitions';
import { ExecutionStatus, TERMINAL_EXECUTION_STATUSES } from '../ExecutionStatus';

describe('ExecutionTransitions — canonical graph', () => {
  it('every status has an entry in the graph', () => {
    for (const status of Object.values(ExecutionStatus)) {
      expect(EXECUTION_TRANSITIONS[status]).toBeDefined();
    }
  });

  it('every terminal status has zero legal outgoing transitions', () => {
    for (const status of TERMINAL_EXECUTION_STATUSES) {
      expect(legalNextExecutionStatuses(status)).toEqual([]);
    }
  });

  it('every non-terminal status can reach a terminal status', () => {
    // Simple reachability check via BFS over the graph — every status should
    // be able to eventually reach at least one terminal status, so nothing
    // can get permanently stuck in a non-terminal loop.
    for (const status of Object.values(ExecutionStatus)) {
      if (TERMINAL_EXECUTION_STATUSES.has(status)) continue;
      const visited = new Set<ExecutionStatus>();
      const queue: ExecutionStatus[] = [status];
      let reachesTerminal = false;
      while (queue.length > 0) {
        const current = queue.shift();
        if (!current) break;
        if (visited.has(current)) continue;
        visited.add(current);
        if (TERMINAL_EXECUTION_STATUSES.has(current)) {
          reachesTerminal = true;
          break;
        }
        queue.push(...legalNextExecutionStatuses(current));
      }
      expect(reachesTerminal).toBe(true);
    }
  });

  it('isLegalExecutionTransition reflects the graph both ways', () => {
    expect(isLegalExecutionTransition(ExecutionStatus.Created, ExecutionStatus.Validating)).toBe(true);
    expect(isLegalExecutionTransition(ExecutionStatus.Created, ExecutionStatus.Running)).toBe(false);
    expect(isLegalExecutionTransition(ExecutionStatus.Completed, ExecutionStatus.Running)).toBe(false);
  });
});
