/**
 * Provider interfaces for the Execution Engine.
 * This decouples Talent OS from specific infrastructure (BullMQ, Docker, SSE).
 */

export interface ExecutionJobPayload {
  jobId: string;
  sessionId: string;
  code: string;
  language: string;
}

export interface IQueueProvider {
  /**
   * Pushes a new execution job onto the queue.
   */
  enqueueExecution(jobId: string, payload: ExecutionJobPayload): Promise<void>;

  /**
   * Registers the worker processor function to handle jobs off the queue.
   */
  registerWorker(processor: (payload: ExecutionJobPayload) => Promise<void>): void;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  memoryUsedBytes: number;
  timeMs: number;
}

export interface ISandboxProvider {
  /**
   * Executes the code securely inside an isolated sandbox and returns the result.
   */
  execute(language: string, code: string): Promise<ExecutionResult>;
}

export type ExecutionStreamEvent = 
  | { type: 'status'; status: string; timestamp: string }
  | { type: 'stdout'; data: string; timestamp: string }
  | { type: 'stderr'; data: string; timestamp: string }
  | { type: 'result'; exitCode: number; timestamp: string };

export interface IStreamingProvider {
  /**
   * Broadcasts a streaming event (e.g. stdout chunk) to a specific job's channel.
   */
  broadcast(jobId: string, event: ExecutionStreamEvent): void;

  /**
   * Subscribes a client to a job's stream channel. 
   * Returns a function to clean up the subscription.
   */
  subscribe(jobId: string, onEvent: (event: ExecutionStreamEvent) => void): () => void;
}
