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
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
}

export interface IToolExecutor {
  execute(args: any, context: any): Promise<any>;
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
}
