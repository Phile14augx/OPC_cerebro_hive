import { AgentExecutionContext } from '@cerebro/domain';
import { RuntimeRegistry, ExecutionContext } from '@cerebro/runtime-core';
import type { LLMProvider, LLMMessage, ToolProvider } from '@cerebro/runtime-core';

/**
 * Internal message shape used by the runtime loop. A superset of the
 * registry's LLMMessage that also allows 'tool', so tool results can be
 * threaded back to the model once real tool-calling lands (M10.2/M10.3).
 * LLM providers only ever see system/user/assistant messages — see
 * `toLLMMessages`.
 */
interface RuntimeMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: unknown[];
}

export class AgentRuntimeService {
  /**
   * Both the LLM and Tool capabilities are resolved from the shared
   * RuntimeRegistry (packages/runtime-core) rather than injected directly —
   * this service has no compile-time dependency on any specific provider
   * package. See apps/platform-api/src/modules/runtime/providers for what's
   * actually registered (AIGatewayLLMProvider, ToolRuntimeToolProvider, and
   * the mock fallbacks).
   */

  /**
   * The core execution loop of the Agent Runtime.
   *
   * Tool-calling is still hardcoded off (`needsTool` always false); that
   * lands in M10.2 (gateway tool-calling contract) and M10.3 (tool runtime
   * loop). The branch below is left in place, now resolving ToolProvider
   * the same way invokeModel resolves LLMProvider, so those phases only
   * need to flip `needsTool`, not rewire this path.
   */
  async execute(context: AgentExecutionContext, userInput: string, systemPrompt?: string): Promise<any> {
    // 1. Safety Layer (Input Validation, Prompt Injection Detection)
    this.validateSafety(userInput);

    // 2. Load Agent, Context, Memory (Already loaded into AgentExecutionContext by caller)
    let isComplete = false;
    let iterations = 0;
    const maxIterations = 10;

    const messages: RuntimeMessage[] = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...context.memory.conversationHistory,
      { role: 'user' as const, content: userInput },
    ];

    // 3. The Execution Loop
    while (!isComplete && iterations < maxIterations) {
      iterations++;

      // a. Check Cancellation
      if (context.cancellationToken?.isCancellationRequested) {
        throw new Error('Agent execution was cancelled');
      }

      // b. Runtime Registry / Model Invocation
      const llmResponse = await this.invokeModel(context, messages);

      // c. Check if Tool Execution is Needed
      if (llmResponse.needsTool) {
        messages.push({ role: 'assistant', content: 'Calling tool: ' + llmResponse.toolName, toolCalls: [llmResponse] });

        // d. Tool Runtime Execution, resolved via the same registry as the LLM
        const toolProvider = await RuntimeRegistry.getInstance().resolve<ToolProvider>({ capability: 'ToolProvider' });
        const runtimeContext = this.toRuntimeExecutionContext(context);
        const toolResult = await toolProvider.invokeTool(llmResponse.toolName, llmResponse.toolArgs, runtimeContext);

        messages.push({ role: 'tool', content: JSON.stringify(toolResult) });

        // e. If async tool, we break the loop and return status
        if (toolResult.status === 'accepted' && toolResult.jobId) {
          return {
            status: 'suspended',
            reason: 'waiting_for_async_tool',
            jobId: toolResult.jobId,
            messages,
          };
        }
      } else {
        // Final Answer
        messages.push({ role: 'assistant', content: llmResponse.content });
        isComplete = true;
      }
    }

    if (!isComplete) {
      throw new Error('Max iterations reached before completion.');
    }

    // 4. Persistence & Event Publishing handled by caller (M10.4)
    return {
      status: 'completed',
      messages,
    };
  }

  private validateSafety(input: string) {
    // Scaffold: In reality, call a safety model or regex
    if (input.toLowerCase().includes('ignore all previous instructions')) {
      throw new Error('SafetyViolation: Potential prompt injection detected.');
    }
  }

  /**
   * Resolves the best available LLMProvider from the shared RuntimeRegistry
   * — the real AIGateway-backed provider if it's registered and healthy,
   * otherwise whatever else is (e.g. the mock). `needsTool` is hardcoded
   * false — wiring `context.availableTools` into the request and reading
   * tool calls back is M10.2/M10.3's job.
   */
  private async invokeModel(context: AgentExecutionContext, messages: RuntimeMessage[]): Promise<any> {
    const provider = await RuntimeRegistry.getInstance().resolve<LLMProvider>({ capability: 'LLMProvider' });
    const runtimeContext = this.toRuntimeExecutionContext(context);
    const content = await provider.invokeModel(this.toLLMMessages(messages), runtimeContext);

    return {
      needsTool: false,
      content,
    };
  }

  /**
   * Maps the domain-level AgentExecutionContext onto runtime-core's
   * ExecutionContext, which is what every capability provider (LLM or
   * Tool, real or mock) actually receives.
   */
  private toRuntimeExecutionContext(context: AgentExecutionContext): ExecutionContext {
    return new ExecutionContext({
      executionId: context.traceId,
      workspaceId: context.workspaceId,
      tenantId: context.tenantId,
      userId: context.userId,
      variables: context.memory.workingMemory,
      secretRefs: {},
      policies: [],
      modelSelection: { provider: 'auto', model: context.modelId },
      budget: { tokens: context.tokenBudget?.maxTokens },
    });
  }

  /**
   * LLMProvider only understands system/user/assistant messages. Until real
   * tool_calls support lands (M10.2/M10.3), fold any 'tool' role messages
   * into an assistant-authored note so this keeps working unchanged once
   * that support arrives.
   */
  private toLLMMessages(messages: RuntimeMessage[]): LLMMessage[] {
    return messages.map((m) =>
      m.role === 'tool'
        ? { role: 'assistant' as const, content: `Tool result: ${m.content}` }
        : { role: m.role, content: m.content }
    );
  }
}
