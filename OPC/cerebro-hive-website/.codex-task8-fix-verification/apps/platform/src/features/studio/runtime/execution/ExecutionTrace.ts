/**
 * M24 — Execution Trace (Provenance Graph)
 *
 * Every output records where it came from, enabling:
 * - Replay & time-travel debugging
 * - Audit / explainability
 * - Lineage tracking across executions
 */

export interface TraceNode {
  id: string;
  nodeId: string;
  stageId: string;
  executionId: string;
  /** IDs of TraceNodes whose outputs fed into this node. */
  parentIds: string[];
  startedAt: number;
  completedAt: number;
  inputSnapshot: Record<string, unknown>;
  outputSnapshot: unknown;
  metadata?: Record<string, unknown>;
}

export class ExecutionTrace {
  private nodes: Map<string, TraceNode> = new Map();
  private executionId: string;

  constructor(executionId: string) {
    this.executionId = executionId;
  }

  record(entry: Omit<TraceNode, 'id' | 'executionId'>): string {
    const id = `trace-${entry.nodeId}-${Date.now()}`;
    this.nodes.set(id, { ...entry, id, executionId: this.executionId });
    return id;
  }

  getByNodeId(nodeId: string): TraceNode[] {
    return Array.from(this.nodes.values()).filter(n => n.nodeId === nodeId);
  }

  getLineage(traceId: string): TraceNode[] {
    const result: TraceNode[] = [];
    const visit = (id: string) => {
      const node = this.nodes.get(id);
      if (!node || result.find(r => r.id === id)) return;
      result.unshift(node);
      node.parentIds.forEach(visit);
    };
    visit(traceId);
    return result;
  }

  toGraph(): TraceNode[] {
    return Array.from(this.nodes.values());
  }

  snapshot(): TraceNode[] {
    return JSON.parse(JSON.stringify(Array.from(this.nodes.values())));
  }
}
