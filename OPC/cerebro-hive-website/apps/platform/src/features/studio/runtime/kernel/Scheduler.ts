/**
 * M24 — Scheduler
 *
 * Scheduler.next() returns the next executable node.
 * Currently sequential; stub for parallel stages, priorities, retries.
 */
import { ExecutionCursor } from './ExecutionCursor';

export class Scheduler {
  /** Returns the next nodeId to execute, or null if exhausted. */
  static next(cursor: ExecutionCursor): string | null {
    if (cursor.isFinished) return null;
    return cursor.currentNodeId ?? null;
  }

  static hasMore(cursor: ExecutionCursor): boolean {
    return !cursor.isFinished;
  }
}
