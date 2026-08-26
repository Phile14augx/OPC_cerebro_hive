/**
 * M24 — MetricsPlugin
 * Records per-node timing into ExecutionMetrics automatically.
 */
import { RuntimePlugin } from './RuntimePlugin';
import { StudioNode } from '../../graph/GraphModel';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionResult } from '../execution/ExecutionResult';
import type { NodeMetrics } from '../execution/ExecutionMetrics';

export class MetricsPlugin implements RuntimePlugin {
  readonly id = 'core.metrics';
  private nodeStartTimes = new Map<string, number>();

  beforeNode(node: StudioNode, _inputs: unknown, context: ExecutionContext): void {
    this.nodeStartTimes.set(node.id, Date.now());
    context.metrics.recordNodeStart(node.id);
  }

  afterNode(node: StudioNode, result: ExecutionResult, context: ExecutionContext): void {
    const status: NodeMetrics['status'] = result.status === 'streaming' ? 'running' : result.status;
    context.metrics.recordNodeEnd(node.id, status, {
      tokenUsage: result.tokenUsage,
      costUsd: result.costUsd,
    });
    // Propagate resource consumption
    if (result.tokenUsage) {
      context.resources.consume({ tokensConsumed: result.tokenUsage.total, costUsd: result.costUsd });
    }
  }

  afterExecution(context: ExecutionContext): void {
    context.metrics.finish();
  }
}
