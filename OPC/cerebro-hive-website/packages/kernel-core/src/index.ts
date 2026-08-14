/**
 * @module kernel-core
 * Public API surface for the Cerebro Nexarch kernel-core package.
 */

// Types — re-export everything so consumers only need one import path.
export type {
  AgentLifecycleState,
  AgentRiskLevel,
  AgentTrustLevel,
  ResourceBudget,
  ResourceUsage,
  ModelPolicy,
  AgentCapabilityGrant,
  AgentDefinition,
  AgentControlBlock,
  AgentError,
  StateTransition,
  SchedulerTask,
  SchedulerTaskStatus,
  DelegationRecord,
  DelegationResult,
  WatchdogAlert,
  WatchdogAlertSeverity,
  WatchdogAlertType,
  WatchdogAlertAction,
  KernelEvents,
} from "./types.js";

// Lifecycle state machine
export {
  getValidTransitions,
  isTerminal,
  canReceiveWork,
  validateTransition,
  isValidTransition,
  describeState,
  getProgressiveTransitions,
  isActivelyRunning,
  requiresIntervention,
  ALL_STATES,
  InvalidStateTransitionError,
} from "./lifecycle.js";

// AgentKernel
export {
  AgentKernel,
  KernelError,
  AgentNotFoundError,
  InstanceNotFoundError,
  InstanceTerminalError,
} from "./kernel.js";

export type {
  SpawnOptions,
  ListInstancesFilter,
  KernelConfig,
} from "./kernel.js";

// TaskScheduler
export {
  TaskScheduler,
  SchedulerError,
  TaskNotFoundError,
  createSchedulerTask,
} from "./scheduler.js";

export type {
  SchedulerQueueFilter,
  SchedulerStats,
} from "./scheduler.js";

// DelegationManager
export {
  DelegationManager,
  MAX_DELEGATION_DEPTH,
  DelegationError,
  DelegationCycleError,
  DelegationDepthError,
  CapabilityConfinementError,
  BudgetConfinementError,
} from "./delegation.js";

export type {
  DelegateOptions,
  CapabilityProvider,
  BudgetProvider,
} from "./delegation.js";

// AgentWatchdog
export { AgentWatchdog } from "./watchdog.js";

export type {
  WatchdogConfig,
  ACBProvider,
  DepthProvider,
} from "./watchdog.js";
