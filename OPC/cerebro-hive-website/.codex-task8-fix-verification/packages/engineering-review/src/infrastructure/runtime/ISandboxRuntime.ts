import { ExecutionContext, SandboxExecutionResult, RuntimeCapability } from './models';

export interface ILogStream {
  onData(callback: (chunk: string) => void): void;
  onError(callback: (error: string) => void): void;
}

export interface ILogInterceptor {
  intercept(chunk: string): string | null; // Returns null if chunk should be completely dropped
}

export type RuntimeLifecycleEvent = 
  | 'SandboxCreated'
  | 'ContainerStarted'
  | 'MountFinished'
  | 'CPUQuotaApplied'
  | 'CleanupStarted';

export interface IRuntimeEventStream {
  onEvent(callback: (event: RuntimeLifecycleEvent, timestamp: number) => void): void;
}

export interface SandboxSession {
  readonly sandboxSessionId: string;
  readonly context: ExecutionContext;
  
  getLogStream(): ILogStream;
  getEventStream(): IRuntimeEventStream;
  
  /**
   * Begins the execution lifecycle.
   */
  start(): Promise<void>;
  
  /**
   * Awaits completion, strictly enforcing cleanup via `finally`.
   */
  wait(): Promise<SandboxExecutionResult>;
}

export interface ISandboxRuntime {
  readonly capabilities: RuntimeCapability;
  
  createSession(context: ExecutionContext): SandboxSession;
}
