/**
 * M24 — ExecutionCursor
 *
 * Explicit cursor into the execution plan.
 * Makes step() / resume() / rewind() operations trivial and
 * decouples traversal strategy from the runtime loop.
 */
import { ExecutionPlan, Stage } from '../../compiler/ir/ExecutionPlan';

export class ExecutionCursor {
  private stageIdx = 0;
  private nodeIdx = 0;
  private readonly plan: ExecutionPlan;

  constructor(plan: ExecutionPlan) { this.plan = plan; }

  get currentStage(): Stage | undefined { return this.plan.stages[this.stageIdx]; }
  get currentNodeId(): string | undefined { return this.currentStage?.nodes[this.nodeIdx]; }
  get stageIndex(): number { return this.stageIdx; }
  get nodeIndex(): number { return this.nodeIdx; }
  get isFinished(): boolean { return this.stageIdx >= this.plan.stages.length; }

  /** Advance to the next node. Returns true if there is a next node. */
  advance(): boolean {
    const stage = this.plan.stages[this.stageIdx];
    if (!stage) return false;
    this.nodeIdx++;
    if (this.nodeIdx >= stage.nodes.length) {
      this.stageIdx++;
      this.nodeIdx = 0;
    }
    return !this.isFinished;
  }

  reset(): void { this.stageIdx = 0; this.nodeIdx = 0; }

  snapshot(): { stageIdx: number; nodeIdx: number } {
    return { stageIdx: this.stageIdx, nodeIdx: this.nodeIdx };
  }

  restore(snap: { stageIdx: number; nodeIdx: number }): void {
    this.stageIdx = snap.stageIdx;
    this.nodeIdx = snap.nodeIdx;
  }
}
