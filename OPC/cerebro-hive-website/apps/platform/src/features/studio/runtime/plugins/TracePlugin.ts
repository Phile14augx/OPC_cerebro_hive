/**
 * M24 — TracePlugin
 * Records execution provenance into ExecutionTrace automatically.
 */
import { RuntimePlugin } from './RuntimePlugin';
import { StudioNode } from '../../graph/GraphModel';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionResult } from '../execution/ExecutionResult';
import { TypedValue } from '../routing/ExecutionPortStore';

export class TracePlugin implements RuntimePlugin {
  readonly id = 'core.trace';
  private inputSnapshots = new Map<string, Record<string, TypedValue>>();

  beforeNode(node: StudioNode, inputs: Record<string, TypedValue>, context: ExecutionContext): void {
    void context;
    this.inputSnapshots.set(node.id, JSON.parse(JSON.stringify(inputs)));
  }

  afterNode(node: StudioNode, result: ExecutionResult, context: ExecutionContext): void {
    // Derive parent trace IDs from upstream nodes
    const parentIds = context.graph.edges
      .filter(e => e.target === node.id)
      .map(e => `trace-${e.source}`)
      .filter(Boolean);

    context.trace.record({
      nodeId: node.id,
      stageId: context.executionPlan.stages.find(s => s.nodes.includes(node.id))?.id ?? 'unknown',
      parentIds,
      startedAt: context.metrics.nodeMetrics[node.id]?.startedAt ?? Date.now(),
      completedAt: Date.now(),
      inputSnapshot: this.inputSnapshots.get(node.id) ?? {},
      outputSnapshot: result.value,
      metadata: { status: result.status, tokenUsage: result.tokenUsage },
    });
  }
}
