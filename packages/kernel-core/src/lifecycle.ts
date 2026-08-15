/**
 * @module kernel-core/lifecycle
 * Agent lifecycle state machine.
 *
 * Encodes every legal state transition for an AgentControlBlock and exposes
 * query helpers used throughout the kernel.
 */

import type { AgentLifecycleState } from "./types.js";

// ---------------------------------------------------------------------------
// Transition table
// ---------------------------------------------------------------------------

/**
 * Complete map of valid state transitions.
 * Key   = current state
 * Value = set of states that can be transitioned TO from the key state
 */
const VALID_TRANSITIONS: Readonly<Record<AgentLifecycleState, readonly AgentLifecycleState[]>> = {
  // Newly registered agent definition is being instantiated.
  registered: ["initializing", "terminated"],

  // Kernel is loading the agent (acquiring resources, hydrating context, etc.).
  initializing: ["ready", "failed", "terminated"],

  // Agent is idle and able to accept work.
  ready: ["queued", "running", "suspended", "terminated"],

  // Agent is waiting in the scheduler queue for dispatch.
  queued: ["running", "paused", "terminated"],

  // Agent is actively executing its task.
  running: [
    "waiting",
    "paused",
    "blocked",
    "completed",
    "failed",
    "retrying",
    "terminated",
    "quarantined",
  ],

  // Agent is blocked on an external event (e.g. human-in-the-loop approval,
  // dependency output, async tool call) but not consuming CPU.
  waiting: ["running", "failed", "paused", "terminated"],

  // Execution temporarily suspended (graceful pause, e.g. budget review).
  paused: ["running", "queued", "suspended", "terminated"],

  // Deadlock or unresolvable dependency detected; needs intervention.
  blocked: ["running", "failed", "terminated", "quarantined"],

  // ---- Terminal states (no outbound transitions) ----
  completed: [],
  terminated: [],
  quarantined: [],

  // Agent finished this attempt and is waiting for the retry delay.
  retrying: ["running", "failed", "terminated", "quarantined"],

  // Agent is hibernated (e.g. low-priority, resource reclamation).
  suspended: ["ready", "initializing", "terminated", "quarantined"],
};

// ---------------------------------------------------------------------------
// Terminal and "can-receive-work" predicates
// ---------------------------------------------------------------------------

const TERMINAL_STATES = new Set<AgentLifecycleState>(["completed", "terminated", "quarantined"]);

/** States where an agent can accept a new task assignment. */
const CAN_RECEIVE_WORK_STATES = new Set<AgentLifecycleState>(["ready", "queued"]);

// ---------------------------------------------------------------------------
// Exported helpers
// ---------------------------------------------------------------------------

/**
 * Returns the list of states that can be transitioned to from `state`.
 */
export function getValidTransitions(state: AgentLifecycleState): readonly AgentLifecycleState[] {
  return VALID_TRANSITIONS[state];
}

/**
 * Returns `true` if `state` is a terminal (absorbing) state.
 * Terminal agents will never transition again.
 */
export function isTerminal(state: AgentLifecycleState): boolean {
  return TERMINAL_STATES.has(state);
}

/**
 * Returns `true` if an agent in `state` can be assigned new work.
 */
export function canReceiveWork(state: AgentLifecycleState): boolean {
  return CAN_RECEIVE_WORK_STATES.has(state);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Thrown by `validateTransition` when the requested transition is illegal.
 */
export class InvalidStateTransitionError extends Error {
  public readonly from: AgentLifecycleState;
  public readonly to: AgentLifecycleState;
  public readonly instanceId: string;

  constructor(from: AgentLifecycleState, to: AgentLifecycleState, instanceId: string) {
    super(
      `Invalid state transition for instance "${instanceId}": "${from}" → "${to}". ` +
        `Valid transitions from "${from}": [${VALID_TRANSITIONS[from].join(", ") || "none"}].`,
    );
    this.name = "InvalidStateTransitionError";
    this.from = from;
    this.to = to;
    this.instanceId = instanceId;
    // Maintain prototype chain in transpiled ES5 targets.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Validates that transitioning `instanceId` from `from` → `to` is legal.
 * Throws `InvalidStateTransitionError` if it is not.
 */
export function validateTransition(
  from: AgentLifecycleState,
  to: AgentLifecycleState,
  instanceId: string,
): void {
  const allowed = VALID_TRANSITIONS[from];
  if (!(allowed as readonly string[]).includes(to)) {
    throw new InvalidStateTransitionError(from, to, instanceId);
  }
}

/**
 * Pure predicate variant — returns `true` if the transition is legal.
 */
export function isValidTransition(
  from: AgentLifecycleState,
  to: AgentLifecycleState,
): boolean {
  return (VALID_TRANSITIONS[from] as readonly string[]).includes(to);
}

/**
 * Returns a human-readable description of a state.
 */
export function describeState(state: AgentLifecycleState): string {
  const descriptions: Record<AgentLifecycleState, string> = {
    registered: "Agent definition registered, not yet instantiated",
    initializing: "Agent instance is initialising (loading context, acquiring resources)",
    ready: "Agent is idle and ready to accept work",
    queued: "Agent is waiting in the scheduler queue",
    running: "Agent is actively executing",
    waiting: "Agent is waiting on an external event",
    paused: "Agent execution is temporarily paused",
    blocked: "Agent is blocked (deadlock or unresolvable dependency)",
    completed: "Agent completed its task successfully (terminal)",
    failed: "Agent failed after exhausting retries (terminal-like unless retrying)",
    retrying: "Agent is waiting before the next retry attempt",
    suspended: "Agent is hibernated to reclaim resources",
    terminated: "Agent was explicitly terminated (terminal)",
    quarantined: "Agent was quarantined due to policy violation or runaway behaviour (terminal)",
  };
  return descriptions[state];
}

/**
 * Given a current state, returns states that represent "healthy forward
 * progress" (i.e. not an error or terminal state).
 */
export function getProgressiveTransitions(
  state: AgentLifecycleState,
): readonly AgentLifecycleState[] {
  const errorOrTerminal = new Set<AgentLifecycleState>([
    "failed",
    "terminated",
    "quarantined",
    "blocked",
  ]);
  return VALID_TRANSITIONS[state].filter((s) => !errorOrTerminal.has(s));
}

/**
 * Returns `true` if an agent in `state` is consuming active compute resources.
 */
export function isActivelyRunning(state: AgentLifecycleState): boolean {
  return state === "running";
}

/**
 * Returns `true` if the agent instance needs operator attention.
 */
export function requiresIntervention(state: AgentLifecycleState): boolean {
  return state === "blocked" || state === "quarantined" || state === "suspended";
}

/**
 * All states, exported for iteration (e.g. building UIs or metrics labels).
 */
export const ALL_STATES: readonly AgentLifecycleState[] = [
  "registered",
  "initializing",
  "ready",
  "queued",
  "running",
  "waiting",
  "paused",
  "blocked",
  "completed",
  "failed",
  "retrying",
  "suspended",
  "terminated",
  "quarantined",
] as const;
