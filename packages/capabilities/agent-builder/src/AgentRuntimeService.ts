import { AgentExecutionContext } from '@cerebro/domain';
import { ExecutionEngine, AgentExecutionResult } from '@cerebro/runtime';

export class AgentRuntimeService {
  constructor(private readonly executionEngine: ExecutionEngine) {}

  /**
   * Delegates the execution to the Enterprise Execution Engine pipeline.
   */
  async execute(context: AgentExecutionContext, userMessage: string): Promise<AgentExecutionResult> {
    return this.executionEngine.execute(context, userMessage);
  }

  /**
   * Delegates the streaming execution to the Enterprise Execution Engine pipeline.
   */
  async *executeStream(context: AgentExecutionContext, userMessage: string): AsyncGenerator<string, void, unknown> {
    yield* this.executionEngine.executeStream(context, userMessage);
  }

  /**
   * Cancels an active execution by ID. No-op if the execution is not found.
   */
  async cancelExecution(executionId: string): Promise<void> {
    this.executionEngine.cancelExecution(executionId);
  }
}
