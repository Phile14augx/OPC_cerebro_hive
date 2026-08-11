/**
 * M24 — LoggerPlugin
 * Structured execution logging — each event carries context.
 */
import { RuntimePlugin } from './RuntimePlugin';
import { StudioNode } from '../../graph/GraphModel';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionResult } from '../execution/ExecutionResult';

export class LoggerPlugin implements RuntimePlugin {
  readonly id = 'core.logger';

  beforeExecution(context: ExecutionContext): void {
    context.logger(`[Execution ${context.executionId.slice(0, 8)}] START mode=${context.simulationMode}`);
  }

  beforeNode(node: StudioNode, _inputs: unknown, context: ExecutionContext): void {
    context.logger(`  ▶ Node "${node.id}" (${node.type})`);
  }

  afterNode(node: StudioNode, result: ExecutionResult, context: ExecutionContext): void {
    const ms = context.metrics.nodeMetrics[node.id]?.executionMs ?? 0;
    const tokens = result.tokenUsage ? ` tokens=${result.tokenUsage.total}` : '';
    context.logger(`  ✓ Node "${node.id}" ${result.status} in ${ms}ms${tokens}`);
  }

  afterExecution(context: ExecutionContext): void {
    const m = context.metrics;
    context.logger(
      `[Execution ${context.executionId.slice(0, 8)}] DONE tokens=${m.totalTokens} cost=$${m.totalCostUsd.toFixed(4)}`,
    );
  }
}
