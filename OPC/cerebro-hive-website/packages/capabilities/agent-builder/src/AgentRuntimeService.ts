import { AgentExecutionContext } from '@cerebro/domain';
import { RuntimeRegistry, ExecutionContext } from '@cerebro/runtime-core';
import type { LLMProvider, LLMMessage, LLMToolDefinition, LLMInvocationResult, ToolProvider } from '@cerebro/runtime-core';

/**
 * Configurable execution limits — prevents infinite loops and runaway
 * tool calls. Can be overridden via constructor or environment variables.
 */
export interface RuntimeExecutionLimits {
  maxIterations: number;
  maxToolCalls: number;
  maxExecutionTimeMs: number;
}

const DEFAULT_LIMITS: RuntimeExecutionLimits = {
  maxIterations: Number(process.env.AGENT_MAX_ITERATIONS ?? 10),
  maxToolCalls: Number(process.env.AGENT_MAX_TOOL_CALLS ?? 20),
  maxExecutionTimeMs: Number(process.env.AGENT_MAX_EXECUTION_MS ?? 120_000),
};

/**
 * Internal message shape used by the runtime loop. A superset of the
 * registry's LLMMessage that also allows 'tool', so tool results can be
 * threaded back to the model.
 */
interface RuntimeMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: { id: string; name: string; arguments: string }[];
  /** Present on 'tool' role — ties the result back to the originating call. */
  toolCallId?: string;
}

function isAcceptedAsyncToolResult(value: unknown): value is { status: 'accepted'; jobId: string } {
  return typeof value === 'object'
    && value !== null
    && 'status' in value
    && 'jobId' in value
    && value.status === 'accepted'
    && typeof value.jobId === 'string';
}

export class AgentRuntimeService {
  private limits: RuntimeExecutionLimits;

  constructor(limits?: Partial<RuntimeExecutionLimits>) {
    this.limits = { ...DEFAULT_LIMITS, ...limits };
  }

  /**
   * The core execution loop of the Agent Runtime.
   *
   * Tool-calling is now fully wired:
   * 1. If the resolved LLMProvider supports `invokeModelWithTools()` and
   *    the agent has `availableTools`, tools are forwarded to the model.
   * 2. When the model returns tool calls, each is executed via the
   *    ToolProvider and results are pushed back into the message history.
   * 3. The loop continues until the model produces a final answer or
   *    execution limits are hit.
   */
  async execute(context: AgentExecutionContext, userInput: string, systemPrompt?: string): Promise<unknown> {
    // 1. Safety Layer
    this.validateSafety(userInput);

    const executionStart = Date.now();
    let isComplete = false;
    let iterations = 0;
    let totalToolCalls = 0;

    const messages: RuntimeMessage[] = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...(context.memory.conversationHistory as RuntimeMessage[]),
      { role: 'user' as const, content: userInput },
    ];

    // 2. The Execution Loop
    while (!isComplete && iterations < this.limits.maxIterations) {
      iterations++;

      // a. Check Cancellation
      if (context.cancellationToken?.isCancellationRequested) {
        throw new Error('Agent execution was cancelled');
      }

      // b. Check execution time limit
      if (Date.now() - executionStart > this.limits.maxExecutionTimeMs) {
        throw new Error(`Agent execution exceeded time limit of ${this.limits.maxExecutionTimeMs}ms`);
      }

      // c. Runtime Registry / Model Invocation
      const llmResponse = await this.invokeModel(context, messages);

      // d. Check if Tool Execution is Needed
      if (llmResponse.needsTool && llmResponse.toolCalls?.length) {
        // Push the assistant message with its tool call declarations
        messages.push({
          role: 'assistant',
          content: llmResponse.content ?? '',
          toolCalls: llmResponse.toolCalls,
        });

        // Execute each tool call sequentially
        const toolProvider = await RuntimeRegistry.getInstance().resolve<ToolProvider>({ capability: 'ToolProvider' });
        const runtimeContext = this.toRuntimeExecutionContext(context);

        for (const toolCall of llmResponse.toolCalls) {
          // Check tool call limit
          totalToolCalls++;
          if (totalToolCalls > this.limits.maxToolCalls) {
            throw new Error(`Agent exceeded maximum tool calls limit of ${this.limits.maxToolCalls}`);
          }

          // Tool approval hook — extensible for policy-gated execution
          await this.beforeToolExecution(toolCall, context);

          let toolArgs: Record<string, unknown>;
          try {
            toolArgs = JSON.parse(toolCall.arguments);
          } catch {
            toolArgs = {};
          }

          try {
            const toolResult = await toolProvider.invokeTool(toolCall.name, toolArgs, runtimeContext);

            messages.push({
              role: 'tool',
              content: JSON.stringify(toolResult),
              toolCallId: toolCall.id,
            });

            // If async tool, suspend the execution.
            if (isAcceptedAsyncToolResult(toolResult)) {
              return {
                status: 'suspended',
                reason: 'waiting_for_async_tool',
                jobId: toolResult.jobId,
                messages,
              };
            }
          } catch (err: unknown) {
            // Tool errors are fed back to the model as error results
            // so it can recover gracefully
            messages.push({
              role: 'tool',
              content: JSON.stringify({ error: (err instanceof Error ? err.message : String(err)) ?? 'Tool execution failed' }),
              toolCallId: toolCall.id,
            });
          }
        }

        // After all tool results are pushed, loop back to let the model
        // reason over the results.
      } else {
        // Final Answer
        messages.push({ role: 'assistant', content: llmResponse.content });
        isComplete = true;
      }
    }

    if (!isComplete) {
      throw new Error('Max iterations reached before completion.');
    }

    // 3. Persistence & Event Publishing handled by caller (conversations.routes.ts)
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
   * Resolves the best available LLMProvider from the shared RuntimeRegistry.
   *
   * If the provider supports `invokeModelWithTools()` AND the context has
   * available tools, the extended method is used so tool calls can be
   * returned. Otherwise falls back to the basic `invokeModel()` which
   * returns plain text (no tool calling).
   */
  private async invokeModel(context: AgentExecutionContext, messages: RuntimeMessage[]): Promise<{
    needsTool: boolean;
    content: string;
    toolCalls?: { id: string; name: string; arguments: string }[];
  }> {
    const provider = await RuntimeRegistry.getInstance().resolve<LLMProvider>({ capability: 'LLMProvider' });
    const runtimeContext = this.toRuntimeExecutionContext(context);

    // If the provider supports tool calling AND we have tools, use the extended method
    if (provider.invokeModelWithTools && context.availableTools.length > 0) {
      const toolDefs: LLMToolDefinition[] = context.availableTools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.schema,
      }));

      const result: LLMInvocationResult = await provider.invokeModelWithTools(
        this.toLLMMessages(messages),
        toolDefs,
        runtimeContext,
      );

      return {
        needsTool: !!result.toolCalls?.length,
        content: result.content,
        toolCalls: result.toolCalls,
      };
    }

    // Fallback: basic invocation, no tool calling
    const content = await provider.invokeModel(this.toLLMMessages(messages), runtimeContext);
    return { needsTool: false, content };
  }

  /**
   * Hook point for tool approval policies. Called before each tool
   * execution. Override in a subclass or extend with a PolicyEngine
   * to implement human-in-the-loop approval, safety checks, or
   * cost guards.
   *
   * Default: no-op (all tools auto-approved).
   */
  protected async beforeToolExecution(
    _toolCall: { id: string; name: string; arguments: string },
    _context: AgentExecutionContext,
  ): Promise<void> {
    // No-op — hook point for future policy-gated tool approval
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
   * Convert RuntimeMessage[] to LLMMessage[] for the provider.
   * Now passes through 'tool' role messages natively (the LLMProvider
   * interface supports them after M10.2), including toolCalls and
   * toolCallId for proper tool result threading.
   */
  private toLLMMessages(messages: RuntimeMessage[]): LLMMessage[] {
    return messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.toolCalls && { toolCalls: m.toolCalls }),
      ...(m.toolCallId && { toolCallId: m.toolCallId }),
    }));
  }
}

