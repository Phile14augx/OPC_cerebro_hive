export interface ExecutionTimer {
  /**
   * Schedules a wakeup event (timeout) for an execution.
   */
  scheduleTimeout(executionId: string, timeoutMs: number, reason: string): Promise<void>;
  
  /**
   * Cancels a previously scheduled timeout.
   */
  cancelTimeout(executionId: string): Promise<void>;
}

export interface ExecutionClock {
  /** Returns the current time. Useful for deterministic testing. */
  now(): Date;
}

export class SystemExecutionClock implements ExecutionClock {
  now(): Date {
    return new Date();
  }
}
