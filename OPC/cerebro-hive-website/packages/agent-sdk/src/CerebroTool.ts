import { ToolDefinition } from '@cerebro/contracts';

/**
 * Represents a tool that a CerebroAgent can execute.
 */
export interface CerebroTool {
  /**
   * The canonical definition of this tool.
   */
  readonly definition: ToolDefinition;

  /**
   * Execute the tool with the given arguments.
   * @param args The arguments matching the tool's JSON schema.
   * @returns The result of the tool execution.
   */
  execute(args: Record<string, unknown>): Promise<unknown>;
}
