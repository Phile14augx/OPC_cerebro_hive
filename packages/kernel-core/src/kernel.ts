/**
 * @module kernel-core/kernel
 * AgentKernel — the central control plane for the Cerebro Nexarch AOS.
 *
 * Responsibilities:
 *  - Maintain the registry of AgentDefinitions.
 *  - Spawn, track, and terminate AgentControlBlock instances.
 *  - Own the authoritative lifecycle state machine.
 *  - Record resource usage and enforce budget accounting.
 *  - Emit typed events for downstream consumers.
 *  - Support optional persistence via a pluggable `persistFn` callback.
 */

import { EventEmitter } from "events";
import { randomUUID } from "crypto";

import type {
  AgentDefinition,
  AgentControlBlock,
  AgentLifecycleState,
  AgentError,
  ResourceBudget,
  ResourceUsage,
  StateTransition,
  KernelEvents,
} from "./types.js";

import { validateTransition, isTerminal } from "./lifecycle.js";

// ---------------------------------------------------------------------------
// Typed EventEmitter shim
// ---------------------------------------------------------------------------

/**
 * Minimal typed EventEmitter facade.  Wraps Node's EventEmitter to provide
 * compile-time event name and payload safety.
 */
class TypedEmitter<TEvents extends Record<string, unknown[]>> extends EventEmitter {
  emit<K extends keyof TEvents & string>(event: K, ...args: TEvents[K]): boolean {
    return super.emit(event, ...args);
  }

  on<K extends keyof TEvents & string>(
    event: K,
    listener: (...args: TEvents[K]) => void,
  ): this {
    return super.on(event, listener as (...args: unknown[]) => void);
  }

  once<K extends keyof TEvents & string>(
    event: K,
    listener: (...args: TEvents[K]) => void,
  ): this {
    return super.once(event, listener as (...args: unknown[]) => void);
  }

  off<K extends keyof TEvents & string>(
    event: K,
    listener: (...args: TEvents[K]) => void,
  ): this {
    return super.off(event, listener as (...args: unknown[]) => void);
  }
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class KernelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KernelError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AgentNotFoundError extends KernelError {
  constructor(agentId: string) {
    super(`AgentDefinition not found: "${agentId}"`);
    this.name = "AgentNotFoundError";
  }
}

export class InstanceNotFoundError extends KernelError {
  constructor(instanceId: string) {
    super(`AgentControlBlock not found for instance: "${instanceId}"`);
    this.name = "InstanceNotFoundError";
  }
}

export class InstanceTerminalError extends KernelError {
  constructor(instanceId: string, state: AgentLifecycleState) {
    super(`Instance "${instanceId}" is already in terminal state "${state}" and cannot be modified.`);
    this.name = "InstanceTerminalError";
  }
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface SpawnOptions {
  /** Override the definition's goals for this specific run. */
  goals?: string[];
  /** Parent instance spawning this sub-agent. */
  parentInstanceId?: string;
  /** Identity that delegated work to this agent. */
  delegatedBy?: string;
  /** Pre-populated delegation chain (ancestry). */
  delegationChain?: string[];
  /** Mission context. */
  missionId?: string;
  /** Task the agent should work on. */
  taskId?: string;
  /** Scheduling priority (0–1000). */
  priority?: number;
  /** Override default budget from the definition. */
  budgetOverride?: ResourceBudget;
  /** Tracing correlation ID; a new UUID is generated if not provided. */
  traceId?: string;
  /** Arbitrary metadata attached to the ACB. */
  metadata?: Record<string, unknown>;
}

export interface ListInstancesFilter {
  agentId?: string;
  tenantId?: string;
  workspaceId?: string;
  state?: AgentLifecycleState;
  missionId?: string;
  parentInstanceId?: string;
}

export interface KernelConfig {
  /**
   * Called after every mutation to an AgentDefinition or AgentControlBlock.
   * Implementations can persist the snapshot to a DB, file, or message bus.
   * Failures in `persistFn` are logged but do not roll back the in-memory state.
   */
  persistFn?: (event: {
    type:
      | "agent_registered"
      | "instance_spawned"
      | "instance_updated"
      | "transition"
      | "checkpointed";
    payload: AgentDefinition | AgentControlBlock | StateTransition | { checkpointId: string; acb: AgentControlBlock };
  }) => Promise<void>;

  /**
   * Custom ID generator for instances and checkpoints.
   * Defaults to `crypto.randomUUID`.
   */
  generateId?: () => string;
}

// ---------------------------------------------------------------------------
// AgentKernel
// ---------------------------------------------------------------------------

export class AgentKernel extends TypedEmitter<KernelEvents> {
  private readonly definitions = new Map<string, AgentDefinition>();
  private readonly instances = new Map<string, AgentControlBlock>();
  private readonly transitions: StateTransition[] = [];
  private readonly config: Required<Omit<KernelConfig, "persistFn">> & { persistFn?: KernelConfig["persistFn"] };

  constructor(config: KernelConfig = {}) {
    super();
    this.config = {
      generateId: config.generateId ?? (() => randomUUID()),
      persistFn: config.persistFn,
    };
  }

  // -------------------------------------------------------------------------
  // Agent Definition Registry
  // -------------------------------------------------------------------------

  /**
   * Register an AgentDefinition into the kernel.
   * Re-registering the same `agentId` replaces the previous definition.
   */
  registerAgent(def: AgentDefinition): AgentDefinition {
    this.definitions.set(def.agentId, def);
    this.emit("agent:registered", def);
    this.persist("agent_registered", def);
    return def;
  }

  /**
   * Retrieve a registered definition.  Throws if not found.
   */
  getDefinition(agentId: string): AgentDefinition {
    const def = this.definitions.get(agentId);
    if (!def) throw new AgentNotFoundError(agentId);
    return def;
  }

  /**
   * List all registered definitions, optionally filtered by deprecated status.
   */
  listDefinitions(includeDeprecated = false): AgentDefinition[] {
    const defs = Array.from(this.definitions.values());
    return includeDeprecated ? defs : defs.filter((d) => !d.isDeprecated);
  }

  // -------------------------------------------------------------------------
  // Instance lifecycle
  // -------------------------------------------------------------------------

  /**
   * Spawn a new AgentControlBlock for an existing AgentDefinition.
   * The instance starts in the "registered" state and is immediately
   * transitioned to "initializing".
   */
  spawnInstance(agentId: string, opts: SpawnOptions = {}): AgentControlBlock {
    const def = this.getDefinition(agentId);

    if (def.isDeprecated) {
      throw new KernelError(
        `Cannot spawn instance of deprecated agent definition "${agentId}".`,
      );
    }

    const now = new Date().toISOString();
    const instanceId = this.config.generateId();
    const traceId = opts.traceId ?? this.config.generateId();

    const acb: AgentControlBlock = {
      instanceId,
      agentId: def.agentId,
      tenantId: def.tenantId,
      workspaceId: def.workspaceId,
      state: "registered",
      role: def.role,
      goals: opts.goals ?? [...def.goals],
      currentMissionId: opts.missionId,
      currentTaskId: opts.taskId,
      parentInstanceId: opts.parentInstanceId,
      delegatedBy: opts.delegatedBy,
      delegationChain: opts.delegationChain ? [...opts.delegationChain] : [],
      memoryRefs: [],
      contextRefs: [],
      capabilityGrants: def.capabilities.map((c) => ({ ...c })),
      toolPermissions: [...def.toolPermissions],
      modelPolicy: { ...def.modelPolicy },
      budget: opts.budgetOverride ? { ...opts.budgetOverride } : { ...def.defaultBudget },
      usage: {
        tokensUsed: 0,
        costUsd: 0,
        executionTimeMs: 0,
        toolCallsMade: 0,
        iterations: 0,
      },
      priority: opts.priority ?? 500,
      startedAt: now,
      lastHeartbeatAt: now,
      retryCount: 0,
      traceId,
      metadata: opts.metadata ? { ...opts.metadata } : {},
      errorHistory: [],
    };

    this.instances.set(instanceId, acb);
    this.emit("instance:spawned", acb);
    this.persist("instance_spawned", acb);

    // Immediately move to "initializing" — callers should subsequently
    // call transitionState(instanceId, "ready") once the agent is warm.
    this.transitionState(instanceId, "initializing", "kernel.spawnInstance");

    return this.instances.get(instanceId)!;
  }

  /**
   * Transition an instance to a new lifecycle state.
   * Validates the transition against the state machine before applying.
   */
  transitionState(
    instanceId: string,
    toState: AgentLifecycleState,
    triggeredBy: string,
    reason?: string,
  ): void {
    const acb = this.requireACB(instanceId);

    if (isTerminal(acb.state)) {
      throw new InstanceTerminalError(instanceId, acb.state);
    }

    validateTransition(acb.state, toState, instanceId);

    const transition: StateTransition = {
      from: acb.state,
      to: toState,
      instanceId,
      agentId: acb.agentId,
      timestamp: new Date().toISOString(),
      triggeredBy,
      reason,
    };

    acb.state = toState;
    this.transitions.push(transition);

    this.emit("instance:transitioned", transition);
    this.persist("transition", transition);
  }

  /**
   * Retrieve the AgentControlBlock for an instance.  Throws if not found.
   */
  getACB(instanceId: string): AgentControlBlock {
    return this.requireACB(instanceId);
  }

  /**
   * Return a shallow copy of all ACBs, optionally filtered.
   */
  listInstances(filters?: ListInstancesFilter): AgentControlBlock[] {
    let result = Array.from(this.instances.values());

    if (!filters) return result;

    if (filters.agentId !== undefined) {
      result = result.filter((a) => a.agentId === filters.agentId);
    }
    if (filters.tenantId !== undefined) {
      result = result.filter((a) => a.tenantId === filters.tenantId);
    }
    if (filters.workspaceId !== undefined) {
      result = result.filter((a) => a.workspaceId === filters.workspaceId);
    }
    if (filters.state !== undefined) {
      result = result.filter((a) => a.state === filters.state);
    }
    if (filters.missionId !== undefined) {
      result = result.filter((a) => a.currentMissionId === filters.missionId);
    }
    if (filters.parentInstanceId !== undefined) {
      result = result.filter((a) => a.parentInstanceId === filters.parentInstanceId);
    }

    return result;
  }

  // -------------------------------------------------------------------------
  // Heartbeat
  // -------------------------------------------------------------------------

  /**
   * Record a heartbeat for a running instance.
   * The watchdog uses this timestamp to detect stalled agents.
   */
  heartbeat(instanceId: string): void {
    const acb = this.requireACB(instanceId);
    const timestamp = new Date().toISOString();
    acb.lastHeartbeatAt = timestamp;
    this.emit("instance:heartbeat", { instanceId, timestamp });
  }

  // -------------------------------------------------------------------------
  // Budget & usage
  // -------------------------------------------------------------------------

  /**
   * Replace (or set) the budget for a running instance.
   * Used by the DelegationManager to allocate a slice of the parent budget.
   */
  allocateBudget(instanceId: string, budget: ResourceBudget): void {
    const acb = this.requireACB(instanceId);
    acb.budget = { ...budget };
    this.emit("budget:allocated", { instanceId, budget });
    this.persist("instance_updated", acb);
  }

  /**
   * Add incremental resource usage to the instance's running totals.
   * Returns the updated cumulative ResourceUsage.
   */
  recordUsage(instanceId: string, delta: Partial<ResourceUsage>): ResourceUsage {
    const acb = this.requireACB(instanceId);

    acb.usage = {
      tokensUsed: acb.usage.tokensUsed + (delta.tokensUsed ?? 0),
      costUsd: acb.usage.costUsd + (delta.costUsd ?? 0),
      executionTimeMs: acb.usage.executionTimeMs + (delta.executionTimeMs ?? 0),
      toolCallsMade: acb.usage.toolCallsMade + (delta.toolCallsMade ?? 0),
      iterations: acb.usage.iterations + (delta.iterations ?? 0),
    };

    this.emit("usage:recorded", { instanceId, usage: acb.usage });
    return { ...acb.usage };
  }

  // -------------------------------------------------------------------------
  // Error recording
  // -------------------------------------------------------------------------

  /**
   * Append an error to the instance's error history.
   * If `incrementRetry` is true, also bumps the retry counter.
   */
  recordError(
    instanceId: string,
    error: AgentError,
    incrementRetry = false,
  ): void {
    const acb = this.requireACB(instanceId);
    acb.errorHistory.push(error);
    if (incrementRetry) {
      acb.retryCount += 1;
    }
    this.persist("instance_updated", acb);
  }

  // -------------------------------------------------------------------------
  // Terminate & quarantine
  // -------------------------------------------------------------------------

  /**
   * Forcefully terminate an instance.
   * Transitions to "terminated" regardless of current state (except already terminal).
   */
  terminate(instanceId: string, reason: string): void {
    const acb = this.requireACB(instanceId);

    if (isTerminal(acb.state)) {
      // Already terminal — silently succeed so callers don't need to guard.
      return;
    }

    // Allow termination from any non-terminal state by bypassing the normal
    // state machine validation (termination is always legal from the kernel).
    const transition: StateTransition = {
      from: acb.state,
      to: "terminated",
      instanceId,
      agentId: acb.agentId,
      timestamp: new Date().toISOString(),
      triggeredBy: "kernel.terminate",
      reason,
    };

    acb.state = "terminated";
    this.transitions.push(transition);

    this.emit("instance:transitioned", transition);
    this.emit("instance:terminated", { instanceId, reason });
    this.persist("transition", transition);
  }

  /**
   * Move an instance to quarantine.
   * Quarantine is a terminal isolation state for agents that have violated
   * policy or behaved anomalously.
   */
  quarantine(instanceId: string, reason: string): void {
    const acb = this.requireACB(instanceId);

    if (isTerminal(acb.state)) {
      return;
    }

    const transition: StateTransition = {
      from: acb.state,
      to: "quarantined",
      instanceId,
      agentId: acb.agentId,
      timestamp: new Date().toISOString(),
      triggeredBy: "kernel.quarantine",
      reason,
    };

    acb.state = "quarantined";
    this.transitions.push(transition);

    this.emit("instance:transitioned", transition);
    this.emit("instance:quarantined", { instanceId, reason });
    this.persist("transition", transition);
  }

  // -------------------------------------------------------------------------
  // Checkpointing
  // -------------------------------------------------------------------------

  /**
   * Snapshot the current ACB state and return a checkpoint ID.
   * Callers may store the ACB JSON themselves; this method assigns the ID
   * and emits the appropriate event/persist call.
   */
  checkpoint(instanceId: string): string {
    const acb = this.requireACB(instanceId);
    const checkpointId = this.config.generateId();
    acb.checkpointId = checkpointId;

    this.emit("instance:checkpointed", { instanceId, checkpointId });
    this.persist("checkpointed", { checkpointId, acb: { ...acb } });

    return checkpointId;
  }

  // -------------------------------------------------------------------------
  // Transition history
  // -------------------------------------------------------------------------

  /**
   * Returns the ordered transition history for a specific instance.
   */
  getTransitionHistory(instanceId: string): StateTransition[] {
    return this.transitions.filter((t) => t.instanceId === instanceId);
  }

  /**
   * Returns ALL transitions recorded since kernel startup.
   */
  getAllTransitions(): readonly StateTransition[] {
    return this.transitions;
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private requireACB(instanceId: string): AgentControlBlock {
    const acb = this.instances.get(instanceId);
    if (!acb) throw new InstanceNotFoundError(instanceId);
    return acb;
  }

  private persist(
    type: Parameters<NonNullable<KernelConfig["persistFn"]>>[0]["type"],
    payload: Parameters<NonNullable<KernelConfig["persistFn"]>>[0]["payload"],
  ): void {
    if (!this.config.persistFn) return;
    // Fire-and-forget; log errors without disturbing the caller.
    this.config.persistFn({ type, payload } as Parameters<NonNullable<KernelConfig["persistFn"]>>[0]).catch(
      (err: unknown) => {
        console.error("[AgentKernel] persistFn error:", err);
      },
    );
  }
}
