/**
 * @module kernel-core/delegation
 * DelegationManager — tracks agent-to-agent work delegation.
 *
 * Safety invariants enforced:
 *  1. MAX_DELEGATION_DEPTH: No chain may exceed 10 levels deep.
 *  2. Cycle detection: A → B → A (direct or transitive) is rejected.
 *  3. Capability confinement: A child cannot be granted a capability the
 *     parent does not itself hold.
 *  4. Budget confinement: The allocated slice cannot exceed the parent's
 *     remaining budget (checked per-dimension where set).
 */

import { randomUUID } from "crypto";
import type {
  DelegationRecord,
  DelegationResult,
  ResourceBudget,
  ResourceUsage,
  AgentCapabilityGrant,
} from "./types.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MAX_DELEGATION_DEPTH = 10;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class DelegationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DelegationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DelegationCycleError extends DelegationError {
  constructor(from: string, to: string) {
    super(`Delegation cycle detected: "${from}" → "${to}" would create a cycle in the delegation graph.`);
    this.name = "DelegationCycleError";
  }
}

export class DelegationDepthError extends DelegationError {
  constructor(instanceId: string, depth: number) {
    super(
      `Delegation depth limit reached for instance "${instanceId}": ` +
        `current depth is ${depth}, maximum is ${MAX_DELEGATION_DEPTH}.`,
    );
    this.name = "DelegationDepthError";
  }
}

export class CapabilityConfinementError extends DelegationError {
  constructor(capability: string, fromInstanceId: string) {
    super(
      `Capability confinement violation: "${capability}" cannot be granted because ` +
        `the delegating instance "${fromInstanceId}" does not hold that capability.`,
    );
    this.name = "CapabilityConfinementError";
  }
}

export class BudgetConfinementError extends DelegationError {
  constructor(dimension: string, requested: number, available: number) {
    super(
      `Budget confinement violation: requested ${dimension}=${requested} but ` +
        `the parent only has ${available} remaining.`,
    );
    this.name = "BudgetConfinementError";
  }
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface DelegateOptions {
  missionId: string;
  taskId?: string;
  scope?: string[];
  grantedCapabilities?: string[];
  budgetAllocation?: ResourceBudget;
  reason: string;
  expiresAt?: string;
}

// ---------------------------------------------------------------------------
// Capability provider interface
// ---------------------------------------------------------------------------

/**
 * Callers must supply a function that returns the current capability grants
 * for an agent instance.  This decouples DelegationManager from AgentKernel.
 */
export type CapabilityProvider = (instanceId: string) => AgentCapabilityGrant[];

/**
 * Callers must supply a function that returns the current remaining budget
 * for an agent instance (budget - usage).
 */
export type BudgetProvider = (instanceId: string) => ResourceBudget;

// ---------------------------------------------------------------------------
// DelegationManager
// ---------------------------------------------------------------------------

export class DelegationManager {
  /** All delegation records, keyed by delegationId. */
  private readonly records = new Map<string, DelegationRecord>();

  /**
   * Adjacency list: instanceId → set of instanceIds it has delegated TO.
   * Used for cycle detection.
   */
  private readonly outEdges = new Map<string, Set<string>>();

  private readonly capabilityProvider?: CapabilityProvider;
  private readonly budgetProvider?: BudgetProvider;

  constructor(options?: {
    capabilityProvider?: CapabilityProvider;
    budgetProvider?: BudgetProvider;
  }) {
    this.capabilityProvider = options?.capabilityProvider;
    this.budgetProvider = options?.budgetProvider;
  }

  // -------------------------------------------------------------------------
  // delegate
  // -------------------------------------------------------------------------

  /**
   * Create a delegation record from `fromInstanceId` to `toInstanceId`.
   *
   * Performs:
   *  - Cycle detection
   *  - Depth check
   *  - Capability confinement validation
   *  - Budget confinement validation
   *
   * Returns the persisted DelegationRecord.
   */
  delegate(
    fromInstanceId: string,
    toInstanceId: string,
    opts: DelegateOptions,
  ): DelegationRecord {
    // Safety checks.
    this.validateDelegation(fromInstanceId, toInstanceId, opts.grantedCapabilities ?? [], opts.budgetAllocation);

    const now = new Date().toISOString();
    const delegationId = randomUUID();

    const record: DelegationRecord = {
      delegationId,
      fromInstanceId,
      toInstanceId,
      missionId: opts.missionId,
      taskId: opts.taskId,
      scope: opts.scope ?? [],
      grantedCapabilities: opts.grantedCapabilities ?? [],
      budgetAllocation: opts.budgetAllocation ?? {},
      delegatedAt: now,
      expiresAt: opts.expiresAt,
      reason: opts.reason,
    };

    this.records.set(delegationId, record);
    this.addEdge(fromInstanceId, toInstanceId);

    return { ...record };
  }

  // -------------------------------------------------------------------------
  // resolve
  // -------------------------------------------------------------------------

  /**
   * Record the result of a delegation (success or failure).
   * Removes the graph edge so the delegate can be reused.
   */
  resolve(delegationId: string, result: DelegationResult): void {
    const record = this.requireRecord(delegationId);

    if (record.result) {
      throw new DelegationError(
        `Delegation "${delegationId}" has already been resolved.`,
      );
    }

    record.result = { ...result };
    this.removeEdge(record.fromInstanceId, record.toInstanceId);
  }

  // -------------------------------------------------------------------------
  // Query helpers
  // -------------------------------------------------------------------------

  /**
   * Returns all delegation records where `instanceId` appears on either side,
   * ordered by `delegatedAt` ascending (oldest first).
   */
  getChain(instanceId: string): DelegationRecord[] {
    return Array.from(this.records.values())
      .filter((r) => r.fromInstanceId === instanceId || r.toInstanceId === instanceId)
      .sort((a, b) => a.delegatedAt.localeCompare(b.delegatedAt))
      .map((r) => ({ ...r }));
  }

  /**
   * Returns the delegation depth for `instanceId` — i.e. how many levels of
   * delegation ancestry this instance has.  A root agent returns 0.
   */
  getDepth(instanceId: string): number {
    // Follow the "toInstanceId" back-edges to count ancestors.
    let depth = 0;
    let current: string | undefined = instanceId;

    const visited = new Set<string>();

    while (current) {
      if (visited.has(current)) break; // cycle guard (shouldn't happen post-validate)
      visited.add(current);

      // Find the most recent non-resolved delegation where `current` is the delegate.
      const incoming = Array.from(this.records.values()).find(
        (r) => r.toInstanceId === current && !r.result,
      );

      if (!incoming) break;

      depth++;
      current = incoming.fromInstanceId;
    }

    return depth;
  }

  /**
   * Returns all delegation records for a given missionId.
   */
  getByMission(missionId: string): DelegationRecord[] {
    return Array.from(this.records.values())
      .filter((r) => r.missionId === missionId)
      .map((r) => ({ ...r }));
  }

  /**
   * Get a single delegation record.
   */
  getRecord(delegationId: string): DelegationRecord {
    return { ...this.requireRecord(delegationId) };
  }

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  /**
   * Validates a proposed delegation and throws a descriptive error if any
   * invariant would be violated.
   *
   * This can be called ahead of `delegate()` to check feasibility without
   * committing the record.
   */
  validateDelegation(
    fromInstanceId: string,
    toInstanceId: string,
    grantedCapabilities: string[],
    budgetAllocation?: ResourceBudget,
  ): void {
    // 1. Cycle detection.
    if (this.detectCycle(fromInstanceId, toInstanceId)) {
      throw new DelegationCycleError(fromInstanceId, toInstanceId);
    }

    // 2. Depth check.
    const currentDepth = this.getDepth(fromInstanceId);
    if (currentDepth >= MAX_DELEGATION_DEPTH) {
      throw new DelegationDepthError(fromInstanceId, currentDepth);
    }

    // 3. Capability confinement.
    if (grantedCapabilities.length > 0 && this.capabilityProvider) {
      const parentGrants = this.capabilityProvider(fromInstanceId);
      const parentCapabilities = new Set(parentGrants.map((g) => g.capability));

      for (const cap of grantedCapabilities) {
        if (!parentCapabilities.has(cap)) {
          throw new CapabilityConfinementError(cap, fromInstanceId);
        }
      }
    }

    // 4. Budget confinement.
    if (budgetAllocation && this.budgetProvider) {
      const remaining = this.budgetProvider(fromInstanceId);

      const checks: Array<[keyof ResourceBudget, string]> = [
        ["tokenBudget", "tokenBudget"],
        ["costBudgetUsd", "costBudgetUsd"],
        ["executionTimeMs", "executionTimeMs"],
        ["toolCallLimit", "toolCallLimit"],
        ["maxIterations", "maxIterations"],
        ["concurrencyLimit", "concurrencyLimit"],
      ];

      for (const [key, label] of checks) {
        const requested = budgetAllocation[key];
        const available = remaining[key];

        if (requested !== undefined && available !== undefined) {
          if (requested > available) {
            throw new BudgetConfinementError(label, requested, available);
          }
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Cycle detection
  // -------------------------------------------------------------------------

  /**
   * Returns `true` if adding an edge from → to would create a cycle in the
   * delegation graph.
   *
   * Uses a DFS from `to` to check whether `from` is reachable.  If yes, the
   * new edge would close a cycle.
   */
  detectCycle(from: string, to: string): boolean {
    // If `to` is the same as `from`, it is trivially a self-loop.
    if (from === to) return true;

    // DFS from `to` to see if we can reach `from`.
    const visited = new Set<string>();
    const stack: string[] = [to];

    while (stack.length > 0) {
      const node = stack.pop()!;
      if (node === from) return true;
      if (visited.has(node)) continue;
      visited.add(node);

      const neighbors = this.outEdges.get(node);
      if (neighbors) {
        for (const neighbor of neighbors) {
          stack.push(neighbor);
        }
      }
    }

    return false;
  }

  // -------------------------------------------------------------------------
  // Internal graph maintenance
  // -------------------------------------------------------------------------

  private addEdge(from: string, to: string): void {
    if (!this.outEdges.has(from)) {
      this.outEdges.set(from, new Set());
    }
    this.outEdges.get(from)!.add(to);
  }

  private removeEdge(from: string, to: string): void {
    const edges = this.outEdges.get(from);
    if (edges) {
      edges.delete(to);
      if (edges.size === 0) {
        this.outEdges.delete(from);
      }
    }
  }

  private requireRecord(delegationId: string): DelegationRecord {
    const record = this.records.get(delegationId);
    if (!record) {
      throw new DelegationError(`Delegation record not found: "${delegationId}"`);
    }
    return record;
  }

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------

  /**
   * Return summary statistics about the current delegation graph.
   */
  getStats(): {
    total: number;
    active: number;
    resolved: number;
    maxObservedDepth: number;
  } {
    let active = 0;
    let resolved = 0;

    for (const record of this.records.values()) {
      if (record.result) {
        resolved++;
      } else {
        active++;
      }
    }

    // Determine the maximum delegation depth across all known delegates.
    const delegates = new Set(Array.from(this.records.values()).map((r) => r.toInstanceId));
    let maxObservedDepth = 0;
    for (const instanceId of delegates) {
      const depth = this.getDepth(instanceId);
      if (depth > maxObservedDepth) maxObservedDepth = depth;
    }

    return {
      total: this.records.size,
      active,
      resolved,
      maxObservedDepth,
    };
  }
}
