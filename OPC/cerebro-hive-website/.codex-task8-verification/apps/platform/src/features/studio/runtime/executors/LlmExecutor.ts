/**
 * M24 — LlmExecutor
 *
 * Executes LLM nodes via SimulationMode strategy:
 *   OFFLINE / MOCK → deterministic stub (no network)
 *   LIVE / HYBRID  → real AI gateway call
 *
 * All future LLM changes (streaming, tool calling, caching) live here.
 * The kernel never changes.
 */
import { RuntimeExecutor } from '../kernel/RuntimeCapabilityRegistry';
import { StudioNode } from '../../graph/GraphModel';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionResult, ok, errResult } from '../execution/ExecutionResult';
import { TypedValue } from '../routing/ExecutionPortStore';
import { Types } from '../../compiler/types/TypeSystem';

export class LlmExecutor implements RuntimeExecutor {
  readonly supportedTypes = ['LLM'];
  canHandle(node: StudioNode): boolean { return node.type === 'LLM'; }

  async execute(
    node: StudioNode,
    context: ExecutionContext,
    inputs: Record<string, TypedValue>,
  ): Promise<ExecutionResult> {
    context.cancellationToken.throwIfCancelled();

    const mode = context.simulationMode;
    const modelId: string = node.configuration?.['modelId'] ?? 'claude-3-5-sonnet-20241022';
    const jsonMode: boolean = node.configuration?.['jsonMode'] ?? false;
    const outputType = jsonMode ? Types.JSON : Types.String;

    if (mode === 'OFFLINE' || mode === 'MOCK') {
      const inputText =
        (inputs['input']?.value ?? inputs['prompt']?.value ?? '[no input]') as string;
      const stub = `[STUB — ${modelId}] Received: "${String(inputText).slice(0, 80)}"`;
      return ok(stub, outputType, { durationMs: 12, metadata: { executor: 'LlmExecutor:stub', model: modelId } });
    }

    // LIVE — dynamic import keeps OFFLINE bundles tree-shaken
    try {
      const t0 = Date.now();
      const { createGateway } = await import('../../../../../../../packages/ai-gateway/src/gateway');
      const gateway = createGateway();
      const response = await gateway.chat({
        model: modelId,
        messages: [
          {
            role: 'system',
            content: node.configuration?.['systemPrompt'] ?? 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: String(inputs['input']?.value ?? inputs['prompt']?.value ?? ''),
          },
        ],
      });
      context.cancellationToken.throwIfCancelled();
      const durationMs = Date.now() - t0;
      return ok(
        response.content,
        outputType,
        {
          durationMs,
          tokenUsage: response.usage
            ? { prompt: response.usage.promptTokens, completion: response.usage.completionTokens, total: response.usage.totalTokens }
            : undefined,
          costUsd: response.cost,
          metadata: { executor: 'LlmExecutor:live', model: modelId, provider: response.model },
        },
      );
    } catch (err) {
      if ((err as Error).message === 'Execution was cancelled')
        return errResult(outputType, 'Cancelled');
      return errResult(outputType, `LLM call failed: ${String(err)}`);
    }
  }
}
