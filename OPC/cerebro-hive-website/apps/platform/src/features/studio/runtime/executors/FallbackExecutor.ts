/**
 * M24 — FallbackExecutor
 *
 * Last-resort executor — catches any node type without a dedicated executor.
 * Must be registered LAST in the RuntimeCapabilityRegistry.
 */
import { RuntimeExecutor } from '../kernel/RuntimeCapabilityRegistry';
import { StudioNode } from '../../graph/GraphModel';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionResult, ok } from '../execution/ExecutionResult';
import { TypedValue } from '../routing/ExecutionPortStore';
import { Types } from '../../compiler/types/TypeSystem';

export class FallbackExecutor implements RuntimeExecutor {
  readonly supportedTypes = ['*'];
  canHandle(_node: StudioNode): boolean { return true; }

  async execute(node: StudioNode, context: ExecutionContext, _inputs: Record<string, TypedValue>): Promise<ExecutionResult> {
    context.logger(`[FallbackExecutor] No executor registered for type "${node.type}" — returning null`);
    return ok(null, Types.Unknown, {
      durationMs: 0,
      warnings: [`No executor for node type "${node.type}". Register one in RuntimeCapabilityRegistry.`],
    });
  }
}
