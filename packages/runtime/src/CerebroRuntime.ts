import { AgentDefinition } from '@cerebro/contracts';
import { CerebroAgent } from '@cerebro/agent-sdk';
import { ExecutionProvider } from './ExecutionProvider';

/**
 * CerebroRuntime is the central execution orchestrator.
 * It manages the lifecycle, state, scheduling, telemetry, and security
 * while delegating the actual execution to a configured ExecutionProvider.
 */
export class CerebroRuntime {
  private providers: Map<string, ExecutionProvider> = new Map();

  /**
   * Register a new Execution Provider plugin (e.g., LangGraph, AutoGen).
   */
  registerProvider(provider: ExecutionProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Instantiate an executable CerebroAgent from a definition using a specific provider.
   * @param definition The canonical agent definition.
   * @param providerName The name of the registered execution provider to use.
   */
  async compileAgent(definition: AgentDefinition, providerName: string = 'native'): Promise<CerebroAgent> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Execution provider '${providerName}' is not registered.`);
    }

    await provider.compile(definition);

    // Return an anonymous CerebroAgent that wraps the underlying provider execution.
    // In a full implementation, this agent would also hook into the EventBus and StateEngine.
    return {
      definition,
      initialize: async () => { /* Runtime initialization logic */ },
      execute: async (input) => {
        // Here the runtime injects telemetry, event emission, and state tracking.
        return await provider.execute(input);
      },
      terminate: async () => {
        await provider.cancel();
      }
    };
  }
}
