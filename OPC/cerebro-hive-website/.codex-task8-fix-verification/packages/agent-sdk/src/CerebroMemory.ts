import { MemoryDefinition } from '@cerebro/contracts';

/**
 * Represents the durable or ephemeral memory accessible by a CerebroAgent.
 */
export interface CerebroMemory {
  /**
   * The canonical definition of this memory component.
   */
  readonly definition: MemoryDefinition;

  /**
   * Retrieve facts, state, or context from the memory.
   * @param query The query parameters.
   * @returns The retrieved memory context.
   */
  read(query: Record<string, any>): Promise<any>;

  /**
   * Store new facts, state, or context into the memory.
   * @param data The data to persist.
   */
  write(data: Record<string, any>): Promise<void>;
}
