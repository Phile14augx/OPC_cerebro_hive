import { ToolRegistry } from './ToolRegistry';

export class ToolRuntime {
  constructor(private registry: ToolRegistry) {}

  /**
   * `context` is intentionally untyped (matches IToolExecutor.execute's own
   * `context: any`) — ToolRuntime never reads any specific field of it
   * itself, only passes it through to the executor. It previously required
   * @cerebro/domain's AgentExecutionContext specifically, which was an
   * accidental coupling: it blocked this class from being reused from
   * anywhere that has a different context shape (e.g. runtime-core's
   * ExecutionContext, via ToolRuntimeToolProvider).
   */
  async executeTool(name: string, args: any, context: unknown): Promise<any> {
    const metadata = this.registry.getMetadata(name);
    if (!metadata) {
      throw new Error(`Tool ${name} not found in registry`);
    }

    // Validate Input Schema (Placeholder)
    // Validate Permissions (Placeholder)

    const executor = this.registry.getExecutor(name);
    if (!executor) {
      throw new Error(`Executor for tool ${name} not found`);
    }

    if (metadata.executionMode === 'sync') {
      return this.executeSync(metadata, executor, args, context);
    } else {
      return this.executeAsync(metadata, executor, args, context);
    }
  }

  private async executeSync(metadata: any, executor: any, args: any, context: unknown): Promise<any> {
    // In a real system, enforce timeoutMs here
    try {
      const result = await executor.execute(args, context);
      // Telemetry success
      return result;
    } catch (e) {
      // Telemetry failure, apply retryPolicy if applicable
      throw e;
    }
  }

  private async executeAsync(metadata: any, executor: any, args: any, context: unknown): Promise<any> {
    // In an async execution, we would typically submit a job to a queue or temporal workflow,
    // and return a job ID immediately. The LLM would see the job ID, and when the job completes,
    // an event would wake up the conversation.
    // For scaffolding, we mock the job submission.

    return {
      status: 'accepted',
      jobId: `job-${Math.random().toString(36).substring(7)}`,
      message: `Tool execution started asynchronously. You will be notified upon completion.`
    };
  }
}
