/**
 * @module runtime-core
 * Public API surface for the Cerebro Nexarch Agentic OS runtime layer.
 *
 * Packages:
 *   mission/    — Mission domain model and repository
 *   task/       — Task domain model, state machine, and repository
 *   execution/  — ExecutionRun model, reducers, and repository
 */

// Mission
export * from "./mission/mission.js";

// Task
export * from "./task/task.js";

// ExecutionRun
export * from "./execution/execution.js";

export type {
  ExecutionStore,
  ExecutionRecord,
  ExecutionOutboxEntry,
} from "./execution/ExecutionStore.js";
export type { ExecutionCheckpoint } from "./execution/ExecutionCheckpoint.js";
export type { ExecutionState } from "./execution/ExecutionStateMachine.js";
export { ExecutionStateMachine } from "./execution/ExecutionStateMachine.js";
export { ExecutionManager } from "./execution/ExecutionManager.js";
export { ExecutionReplayService } from "./execution/ExecutionReplayService.js";
export { ExecutionIdempotencyGuard } from "./execution/ExecutionIdempotency.js";
export type { ExecutionOutbox, OutboxMessage } from "./execution/ExecutionOutbox.js";
export { ReducerRegistry } from "./registry/ReducerRegistry.js";
export { ExecutionEventRegistry } from "./registry/ExecutionEventRegistry.js";
export { ExecutionCommandHandler } from "./execution/commands/ExecutionCommandHandler.js";
export {
  StartExecutionValidator,
  ResumeExecutionValidator,
  CancelExecutionValidator,
} from "./execution/commands/ExecutionValidator.js";
export { ExecutionRuntimeKernel } from "./execution/kernel/ExecutionRuntimeKernel.js";
