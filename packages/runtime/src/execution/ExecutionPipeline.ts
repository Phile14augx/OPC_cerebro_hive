import { AgentExecutionContext } from '@cerebro/domain';
import { ExecutionTracer } from './ExecutionTracer';
import { ExecutionMetrics } from './ExecutionMetrics';
import { AgentExecutionResult } from './ExecutionResponse';
import { PromptCompiler } from './PromptCompiler';
import { ModelRouter } from './ModelRouter';
import { ToolOrchestrator } from '../orchestration/ToolOrchestrator';
import { ExecutionEventPublisher } from './ExecutionEventPublisher';
import { randomUUID } from 'crypto';

export interface PipelineParams {
  context: AgentExecutionContext;
  userMessage: string;
  tracer: ExecutionTracer;
  metrics: ExecutionMetrics;
  abortSignal: AbortSignal;
  eventPublisher: ExecutionEventPublisher;
}

export class ExecutionPipeline {
  constructor(
    private readonly promptCompiler: PromptCompiler,
    private readonly toolOrchestrator: ToolOrchestrator,
    private readonly gateway: any // To be replaced with strongly typed AI Gateway
  ) {}

  async execute(params: PipelineParams): Promise<AgentExecutionResult> {
    const { context, userMessage, tracer, metrics, abortSignal, eventPublisher } = params;
    
    // 1. Compile Prompt
    const compiledPrompt = this.promptCompiler.compile(context, userMessage);
    await eventPublisher.publish('PromptCompiled', context.executionId, { messages: compiledPrompt.messages.length });
    
    // 2. Route Model
    const route = ModelRouter.resolve({
      tier: 'high',
      capabilities: {
        supportsTools: context.tools && context.tools.length > 0 ? true : undefined
      },
      preferredProvider: 'anthropic' // Fallback or configurable
    });
    await eventPublisher.publish('ProviderSelected', context.executionId, { provider: route.provider, model: route.model });

    // 3. Execute through Gateway (Mocked payload for now until gateway contract is strictly defined in M10.1)
    const startTime = Date.now();
    await eventPublisher.publish('GatewayStarted', context.executionId);
    
    const rawResponse = await this.gateway.execute({
      provider: route.provider,
      model: route.model,
      temperature: route.temperature,
      maxTokens: route.maxTokens,
      messages: compiledPrompt.messages,
      tools: context.tools,
      stream: false,
      metadata: context.metadata
    }, abortSignal);

    const latencyMs = Date.now() - startTime;
    metrics.recordLatency('gateway_execute', latencyMs);
    metrics.recordUsage(
      route.provider,
      route.model,
      rawResponse.usage?.promptTokens || 0,
      rawResponse.usage?.completionTokens || 0,
      0, // cached
      rawResponse.cost?.totalCostUSD || 0
    );
    await eventPublisher.publish('GatewayCompleted', context.executionId, { latencyMs });

    if (rawResponse.toolCalls?.length) {
      await eventPublisher.publish('GatewayCompleted', context.executionId, { toolCount: rawResponse.toolCalls.length });
      
      const toolResults = await this.toolOrchestrator.executeCalls(
        rawResponse.toolCalls,
        {
          executionId: context.executionId,
          caller: {
            agentId: 'system',
            userId: 'user',
            tenantId: 'default',
            workspaceId: 'default'
          }
        }
      );
      
      // If we have tool results, we would normally loop back to the gateway.
      // For this simplified pipeline, we'll return the results directly in the output.
      return {
        id: randomUUID(),
        message: `Tools Executed:\n${JSON.stringify(toolResults, null, 2)}`,
        provider: route.provider,
        model: route.model,
        usage: rawResponse.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        finishReason: 'tool_completed',
        latencyMs,
        cost: rawResponse.cost?.totalCostUSD || 0,
        traceId: tracer.getTraceId(),
        executionId: tracer.getExecutionId()
      };
    }

    // 4. Normalize Response
    return {
      id: randomUUID(),
      message: rawResponse.content || '',
      provider: route.provider,
      model: route.model,
      usage: rawResponse.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      finishReason: rawResponse.finishReason || 'stop',
      latencyMs,
      cost: rawResponse.cost?.totalCostUSD || 0,
      traceId: tracer.getTraceId(),
      executionId: tracer.getExecutionId()
    };
  }

  async *executeStream(params: PipelineParams): AsyncGenerator<string, void, unknown> {
    const { context, userMessage, tracer, metrics, abortSignal, eventPublisher } = params;
    
    const compiledPrompt = this.promptCompiler.compile(context, userMessage);
    await eventPublisher.publish('PromptCompiled', context.executionId);

    const route = ModelRouter.resolve({
      tier: 'high',
      capabilities: {
        supportsTools: context.tools && context.tools.length > 0 ? true : undefined,
        supportsStreaming: true
      },
      preferredProvider: 'anthropic' 
    });
    await eventPublisher.publish('ProviderSelected', context.executionId, { provider: route.provider, model: route.model });

    await eventPublisher.publish('GatewayStarted', context.executionId);
    const stream = await this.gateway.execute({
      provider: route.provider,
      model: route.model,
      temperature: route.temperature,
      maxTokens: route.maxTokens,
      messages: compiledPrompt.messages,
      tools: context.tools,
      stream: true,
      metadata: context.metadata
    }, abortSignal);

    for await (const chunk of stream) {
      // Metric tracking per chunk could go here
      yield chunk.delta || chunk.content;
    }
    await eventPublisher.publish('GatewayCompleted', context.executionId);
  }
}

