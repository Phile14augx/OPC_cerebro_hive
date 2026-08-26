
export interface TraceNode {
  stage: string; // e.g. "Validation", "Fusion", "Parallelization", "Admission"
  decision: string;
  explanation: string;
  metadata: Record<string, unknown>;
}

export class PlannerTrace {
  private trace: TraceNode[] = [];

  record(node: TraceNode) {
    this.trace.push(node);
  }

  exportTrace() {
    return this.trace;
  }
}
