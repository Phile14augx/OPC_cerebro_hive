import { ExecutionEvent } from '@cerebro/runtime-contracts';
import { ExecutionState } from './ExecutionStateMachine.js';

export interface ExecutionSnapshotPolicyContext {
  readonly currentSequence: bigint;
  readonly lastSnapshotSequence: bigint;
  readonly currentState: ExecutionState;
  readonly lastSnapshotTime: Date;
  readonly currentTime: Date;
  readonly currentEvent: ExecutionEvent<any>;
}

export interface ExecutionSnapshotPolicy {
  /**
   * Determines if a snapshot should be taken based on the current execution context.
   */
  shouldSnapshot(context: ExecutionSnapshotPolicyContext): boolean;
}

export class CompositeSnapshotPolicy implements ExecutionSnapshotPolicy {
  constructor(private policies: ExecutionSnapshotPolicy[]) {}

  shouldSnapshot(context: ExecutionSnapshotPolicyContext): boolean {
    return this.policies.some(policy => policy.shouldSnapshot(context));
  }
}

export class EventCountSnapshotPolicy implements ExecutionSnapshotPolicy {
  constructor(private readonly maxEventsSinceLastSnapshot: number = 50) {}

  shouldSnapshot(context: ExecutionSnapshotPolicyContext): boolean {
    return (context.currentSequence - context.lastSnapshotSequence) >= this.maxEventsSinceLastSnapshot;
  }
}

export class TimeBasedSnapshotPolicy implements ExecutionSnapshotPolicy {
  constructor(private readonly maxTimeSinceLastSnapshotMs: number = 5 * 60 * 1000) {} // 5 mins

  shouldSnapshot(context: ExecutionSnapshotPolicyContext): boolean {
    return (context.currentTime.getTime() - context.lastSnapshotTime.getTime()) >= this.maxTimeSinceLastSnapshotMs;
  }
}

export class StateTransitionSnapshotPolicy implements ExecutionSnapshotPolicy {
  private readonly triggerStates: Set<ExecutionState> = new Set(['WAITING_APPROVAL', 'WAITING_TOOL', 'COMPLETED']);

  shouldSnapshot(context: ExecutionSnapshotPolicyContext): boolean {
    return this.triggerStates.has(context.currentState);
  }
}
