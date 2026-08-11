/**
 * M24 — MemoryExecutor
 *
 * Executes MemoryRead and MemoryWrite nodes.
 * Reads/writes from ExecutionContext.memoryStore (in-process for M24).
 * Future: swap memoryStore for a real HiveMemory client.
 */
import { RuntimeExecutor } from '../kernel/RuntimeCapabilityRegistry';
import { StudioNode } from '../../graph/GraphModel';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionResult, ok } from '../execution/ExecutionResult';
import { TypedValue } from '../routing/ExecutionPortStore';
import { Types } from '../../compiler/types/TypeSystem';

export class MemoryExecutor implements RuntimeExecutor {
  readonly supportedTypes = ['MemoryRead', 'MemoryWrite'];
  canHandle(node: StudioNode): boolean {
    return node.type === 'MemoryRead' || node.type === 'MemoryWrite';
  }

  async execute(
    node: StudioNode,
    context: ExecutionContext,
    inputs: Record<string, TypedValue>,
  ): Promise<ExecutionResult> {
    context.cancellationToken.throwIfCancelled();
    const key: string = node.configuration?.['key'] ?? node.id;

    if (node.type === 'MemoryWrite') {
      const val = inputs['value']?.value ?? null;
      context.memoryStore.write(key, val);
      context.logger(`[Memory] WRITE key="${key}"`);
      return ok(true, Types.Boolean, { durationMs: 0, metadata: { key, operation: 'write' } });
    }

    // MemoryRead
    const val = context.memoryStore.read(key);
    const found = val !== undefined;
    context.logger(`[Memory] READ key="${key}" found=${found}`);
    return ok(
      val ?? null,
      Types.Unknown,
      { durationMs: 0, metadata: { key, operation: 'read', found } },
    );
  }
}
