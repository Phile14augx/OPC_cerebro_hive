export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  executionMode: 'sync' | 'async';
  permissions: string[];
  timeoutMs: number;
  retryPolicy: {
    maxRetries: number;
    backoffFactor: number;
  };
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

export interface IToolExecutor {
  execute(args: unknown, context: unknown): Promise<unknown>;
}

export class ToolRegistry {
  private metadata: Map<string, ToolMetadata> = new Map();
  private executors: Map<string, IToolExecutor> = new Map();

  register(metadata: ToolMetadata, executor: IToolExecutor) {
    this.metadata.set(metadata.name, metadata);
    this.executors.set(metadata.name, executor);
  }

  getMetadata(name: string): ToolMetadata | undefined {
    return this.metadata.get(name);
  }

  getExecutor(name: string): IToolExecutor | undefined {
    return this.executors.get(name);
  }

  /** All registered tool names — backs ToolProvider.listAvailableTools(). */
  listNames(): string[] {
    return Array.from(this.metadata.keys());
  }
}
