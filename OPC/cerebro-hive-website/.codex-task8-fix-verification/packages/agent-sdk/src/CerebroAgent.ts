import { AgentDefinition } from '@cerebro/contracts';

/**
 * CerebroAgent defines the programmatic interface for interacting with an agent
 * independently of its underlying execution framework (LangGraph, AutoGen, etc.).
 */
export interface CerebroAgent {
  /**
   * The canonical definition of this agent (its nodes, tools, memory).
   */
  readonly definition: AgentDefinition;

  /**
   * Initialize the agent, preparing it for execution.
   */
  initialize(): Promise<void>;

  /**
   * Execute the agent with the given input payload.
   * @param input The input parameters or initial state for the execution.
   * @returns A promise resolving to the final output state.
   */
  execute(input: Record<string, any>): Promise<Record<string, any>>;

  /**
   * Stop an ongoing execution.
   */
  terminate(): Promise<void>;
}
