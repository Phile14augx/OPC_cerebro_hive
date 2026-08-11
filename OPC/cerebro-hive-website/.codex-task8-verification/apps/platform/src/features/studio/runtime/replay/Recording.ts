/**
 * M24 — Execution Recording
 *
 * Immutable record of a completed execution.
 * Foundation for deterministic replay and the time-travel debugger.
 */
import { ExecutionSnapshot } from './SnapshotManager';

export interface RecordedEvent {
  id: string;
  timestamp: number;
  type: string;
  payload: unknown;
  stageId?: string;
  nodeId?: string;
}

export interface ExecutionRecording {
  readonly executionId: string;
  readonly executionPlanId: string;
  readonly simulationMode: string;
  readonly startedAt: number;
  readonly finishedAt: number;
  readonly events: RecordedEvent[];
  readonly snapshots: ExecutionSnapshot[];
  readonly metrics: {
    durationMs: number;
    totalTokens: number;
    totalCostUsd: number;
    nodeCount: number;
  };
}

export class RecordingBuilder {
  private events: RecordedEvent[] = [];
  private snapshots: ExecutionSnapshot[] = [];
  private readonly startedAt = Date.now();

  addEvent(event: RecordedEvent): void { this.events.push(event); }
  addSnapshot(snap: ExecutionSnapshot): void { this.snapshots.push(snap); }

  build(opts: {
    executionId: string;
    executionPlanId: string;
    simulationMode: string;
    totalTokens: number;
    totalCostUsd: number;
    nodeCount: number;
  }): ExecutionRecording {
    const finishedAt = Date.now();
    return {
      executionId: opts.executionId,
      executionPlanId: opts.executionPlanId,
      simulationMode: opts.simulationMode,
      startedAt: this.startedAt,
      finishedAt,
      events: [...this.events],
      snapshots: [...this.snapshots],
      metrics: {
        durationMs: finishedAt - this.startedAt,
        totalTokens: opts.totalTokens,
        totalCostUsd: opts.totalCostUsd,
        nodeCount: opts.nodeCount,
      },
    };
  }
}
