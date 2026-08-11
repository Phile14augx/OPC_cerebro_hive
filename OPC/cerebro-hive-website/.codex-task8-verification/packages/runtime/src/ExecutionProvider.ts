import { AgentDefinition } from '@cerebro/contracts';

/**
 * ExecutionProvider defines the contract for underlying frameworks (like LangGraph, AutoGen)
 * to execute agent definitions within the Cerebro Runtime.
 */
export interface ExecutionProvider {
  /**
   * Uniquely identifies the provider (e.g., 'langgraph', 'autogen', 'native').
   */
  readonly name: string;

  /**
   * Prepares the provider to run a specific agent definition.
   */
  compile(agentDefinition: AgentDefinition): Promise<void>;

  /**
   * Executes the agent with the given input state.
   * @param input The starting state.
   * @returns The final state after execution.
   */
  execute(input: Record<string, any>): Promise<Record<string, any>>;

  /**
   * Halts any currently running execution.
   */
  cancel(): Promise<void>;
}
