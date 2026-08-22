import { ExecutionCommand } from '../commands/ExecutionCommand';

export interface SagaStepContext {
  readonly executionId: string;
  readonly currentState: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  readonly payload: Record<string, any>;
}

export interface ExecutionSaga {
  /**
   * Dispatches the initial command that starts the saga.
   */
  dispatch(command: ExecutionCommand): Promise<void>;

  /**
   * Evaluates the current state and returns the next command to execute, or null if complete.
   */
  next(context: SagaStepContext): Promise<ExecutionCommand | null>;

  /**
   * Executes compensation logic (rollback) if a step fails or times out.
   */
  compensate(context: SagaStepContext, reason: string): Promise<void>;
}
