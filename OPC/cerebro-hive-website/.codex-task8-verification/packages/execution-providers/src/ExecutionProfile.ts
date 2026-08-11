
export interface ExecutionProfile {
  cpuShares: number;
  memoryLimitMB: number;
  timeoutMs: number;
  networkEnabled: boolean;
  retryPolicy: 'never' | 'on_failure' | 'exponential_backoff';
}
