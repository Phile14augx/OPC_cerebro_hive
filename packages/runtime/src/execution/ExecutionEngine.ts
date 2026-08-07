import { AgentExecutionContext } from '@cerebro/domain';
import { ExecutionPipeline } from './ExecutionPipeline';
import { ExecutionTracer } from './ExecutionTracer';
import { ExecutionMetrics } from './ExecutionMetrics';
import { AgentExecutionResult } from './ExecutionResponse';
import { ExecutionEventPublisher } from './ExecutionEventPublisher';
import { TimeoutError, AgentExecutionError } from './ErrorModels';

export class ExecutionEngine {
  // Store active execution abort controllers
  private activeExecutions = new Map<string, AbortController>();

  constructor(
    private readonly pipeline: ExecutionPipeline,
    private readonly eventPublisher: ExecutionEventPublisher
  ) {}

  async execute(context: AgentExecutionContext, userMessage: string): Promise<AgentExecutionResult> {
    const tracer = new ExecutionTracer(context.executionId);
    const metrics = new ExecutionMetrics();
    const abortController = new AbortController();

    this.activeExecutions.set(context.executionId, abortController);
    
    await this.eventPublisher.publish('ExecutionStarted', context.executionId, { 
      agentId: context.agent.id,
      sessionId: context.sessionId
    });

    try {
      const result = await this.pipeline.execute({
        context,
        userMessage,
        tracer,
        metrics,
        abortSignal: abortController.signal,
        eventPublisher: this.eventPublisher
      });

      this.logExecutionResult(context, metrics, result, 'success');
      await this.eventPublisher.publish('ExecutionFinished', context.executionId, result);

      return result;
    } catch (error: any) {
      const normalizedError = error instanceof AgentExecutionError ? error : new AgentExecutionError(error.message, 'UNKNOWN_ERROR', error);
      
      this.logExecutionResult(context, metrics, null, 'failed', normalizedError);
      await this.eventPublisher.publish('ExecutionFailed', context.executionId, { error: normalizedError });
      
      throw normalizedError;
    } finally {
      this.activeExecutions.delete(context.executionId);
    }
  }

  async *executeStream(context: AgentExecutionContext, userMessage: string): AsyncGenerator<string, void, unknown> {
    const tracer = new ExecutionTracer(context.executionId);
    const metrics = new ExecutionMetrics();
    const abortController = new AbortController();

    this.activeExecutions.set(context.executionId, abortController);
    await this.eventPublisher.publish('ExecutionStarted', context.executionId, { agentId: context.agent.id });

    try {
      yield* this.pipeline.executeStream({
        context,
        userMessage,
        tracer,
        metrics,
        abortSignal: abortController.signal,
        eventPublisher: this.eventPublisher
      });
      await this.eventPublisher.publish('ExecutionFinished', context.executionId);
    } catch (error: any) {
      const normalizedError = error instanceof AgentExecutionError ? error : new AgentExecutionError(error.message, 'UNKNOWN_ERROR', error);
      await this.eventPublisher.publish('ExecutionFailed', context.executionId, { error: normalizedError });
      throw normalizedError;
    } finally {
      this.activeExecutions.delete(context.executionId);
    }
  }

  /**
   * Cancels an active execution immediately.
   */
  cancelExecution(executionId: string): void {
    const controller = this.activeExecutions.get(executionId);
    if (controller) {
      controller.abort(new TimeoutError('Execution cancelled by user or system'));
      this.activeExecutions.delete(executionId);
    }
  }

  private logExecutionResult(
    context: AgentExecutionContext, 
    metrics: ExecutionMetrics, 
    result: AgentExecutionResult | null, 
    status: 'success' | 'failed', 
    error?: Error
  ) {
    const logPayload = {
      executionId: context.executionId,
      conversationId: context.conversationId,
      provider: result?.provider || 'unknown',
      model: result?.model || 'unknown',
      latency: metrics.getMetrics().total_duration_ms,
      promptTokens: result?.usage?.promptTokens || 0,
      completionTokens: result?.usage?.completionTokens || 0,
      cost: result?.cost || 0,
      finishReason: result?.finishReason || 'error',
      status,
      error: error ? error.message : undefined,
    };
    
    // In a real system this connects to @cerebro/telemetry structured logger
    console.log(`[ExecutionEngine] ${JSON.stringify(logPayload)}`);
  }
}
