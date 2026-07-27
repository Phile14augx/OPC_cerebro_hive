/**
 * M24 — SnapshotManager
 *
 * Creates checkpoints of execution state at regular intervals.
 * Foundation for time-travel debugging and deterministic replay.
 */
import { ExecutionPortStore } from '../routing/ExecutionPortStore';
import { ExecutionCursor } from '../kernel/ExecutionCursor';

export interface ExecutionSnapshot {
  id: string;
  eventIndex: number;
  timestamp: number;
  portStoreSnapshot: Record<string, unknown>;
  cursorSnapshot: { stageIdx: number; nodeIdx: number };
  activeStageIds: string[];
}

export class SnapshotManager {
  private snapshots: ExecutionSnapshot[] = [];
  private checkpointInterval: number;

  constructor(checkpointInterval = 20) {
    this.checkpointInterval = checkpointInterval;
  }

  maybeCheckpoint(
    eventIndex: number,
    portStore: ExecutionPortStore,
    cursor: ExecutionCursor,
    activeStageIds: string[] = [],
  ): void {
    if (eventIndex > 0 && eventIndex % this.checkpointInterval === 0) {
      this.checkpoint(eventIndex, portStore, cursor, activeStageIds);
    }
  }

  checkpoint(
    eventIndex: number,
    portStore: ExecutionPortStore,
    cursor: ExecutionCursor,
    activeStageIds: string[] = [],
  ): ExecutionSnapshot {
    const snap: ExecutionSnapshot = {
      id: crypto.randomUUID(),
      eventIndex,
      timestamp: Date.now(),
      portStoreSnapshot: portStore.snapshot(),
      cursorSnapshot: cursor.snapshot(),
      activeStageIds,
    };
    this.snapshots.push(snap);
    return snap;
  }

  getAll(): ExecutionSnapshot[] { return [...this.snapshots]; }
  getNearest(eventIndex: number): ExecutionSnapshot | undefined {
    return [...this.snapshots].reverse().find(s => s.eventIndex <= eventIndex);
  }

  clear(): void { this.snapshots = []; }
}
