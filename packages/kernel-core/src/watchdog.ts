/**
 * @module kernel-core/watchdog
 * AgentWatchdog — periodic health-check monitor for running agent instances.
 *
 * Alert thresholds (configurable via WatchdogConfig):
 *  - Missed heartbeat    : lastHeartbeatAt older than HEARTBEAT_STALE_MS (30 s)
 *  - Budget spike        : tokensUsed > BUDGET_TOKEN_THRESHOLD_PCT (90 %) of budget
 *  - Runaway loop        : iterations > ITERATION_THRESHOLD_PCT (80 %) of maxIterations
 *  - Repeated errors     : errorHistory.length >= REPEATED_ERROR_THRESHOLD (5)
 *  - Excessive tool calls: toolCallsMade > TOOL_CALL_THRESHOLD_PCT (80 %) of toolCallLimit
 *  - Unbounded delegation: delegation depth exceeds MAX_DELEGATION_DEPTH (from delegation.ts)
 *
 * Each unique (instanceId, alertType) pair emits at most one unresolved alert.
 * Calling `resolveAlert` clears the block so a new alert of the same type can
 * be raised for the same instance.
 */

import { randomUUID } from "crypto";
import type {
  AgentControlBlock,
  WatchdogAlert,
  WatchdogAlertAction,
  WatchdogAlertSeverity,
  WatchdogAlertType,
} from "./types.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface WatchdogConfig {
  /** Milliseconds after which a non-terminal agent's heartbeat is "stale". Default: 30_000 */
  heartbeatStaleMs?: number;
  /** Fraction (0–1) of tokenBudget after which "budget_spike" fires. Default: 0.90 */
  budgetTokenThreshold?: number;
  /** Fraction (0–1) of maxIterations after which "runaway_loop" fires. Default: 0.80 */
  iterationThreshold?: number;
  /** Fraction (0–1) of toolCallLimit after which "excessive_tool_calls" fires. Default: 0.80 */
  toolCallThreshold?: number;
  /** Number of errors in errorHistory that triggers "repeated_errors". Default: 5 */
  repeatedErrorThreshold?: number;
  /** Maximum delegation depth before "unbounded_delegation" fires. Default: 8 */
  delegationDepthThreshold?: number;
}

const DEFAULTS: Required<WatchdogConfig> = {
  heartbeatStaleMs: 30_000,
  budgetTokenThreshold: 0.9,
  iterationThreshold: 0.8,
  toolCallThreshold: 0.8,
  repeatedErrorThreshold: 5,
  delegationDepthThreshold: 8,
};

// ---------------------------------------------------------------------------
// ACB Provider types
// ---------------------------------------------------------------------------

/** Function that returns the current ACB for an instance, or undefined if gone. */
export type ACBProvider = () => AgentControlBlock | undefined;

/** Optional function that returns the delegation depth for an instance. */
export type DepthProvider = (instanceId: string) => number;

// ---------------------------------------------------------------------------
// Internal registration record
// ---------------------------------------------------------------------------

interface WatchedInstance {
  instanceId: string;
  getACB: ACBProvider;
  registeredAt: string;
}

// ---------------------------------------------------------------------------
// AgentWatchdog
// ---------------------------------------------------------------------------

export class AgentWatchdog {
  private readonly config: Required<WatchdogConfig>;
  private readonly watched = new Map<string, WatchedInstance>();
  private readonly alerts = new Map<string, WatchdogAlert>(); // keyed by alertId
  /**
   * Tracks open (unresolved) alerts per (instanceId, alertType) pair to
   * prevent alert storms for the same condition.
   */
  private readonly openAlertKeys = new Map<string, string>(); // key → alertId

  private depthProvider?: DepthProvider;

  constructor(config: WatchdogConfig = {}) {
    this.config = { ...DEFAULTS, ...config };
  }

  /**
   * Optionally supply a function that returns the delegation depth for an
   * instance.  Without it, the "unbounded_delegation" check is skipped.
   */
  setDepthProvider(fn: DepthProvider): void {
    this.depthProvider = fn;
  }

  // -------------------------------------------------------------------------
  // Registration
  // -------------------------------------------------------------------------

  /**
   * Register an agent instance for watchdog monitoring.
   * `getACB` is a live provider — it is called on every `tick()`.
   */
  register(instanceId: string, getACB: ACBProvider): void {
    this.watched.set(instanceId, {
      instanceId,
      getACB,
      registeredAt: new Date().toISOString(),
    });
  }

  /**
   * Stop monitoring an instance.  Any open alerts are left in place for
   * post-mortem inspection; call `resolveAlert` to clear them.
   */
  unregister(instanceId: string): void {
    this.watched.delete(instanceId);
  }

  // -------------------------------------------------------------------------
  // Tick — run all checks
  // -------------------------------------------------------------------------

  /**
   * Run all health checks against every registered instance.
   * Returns only the *new* alerts raised during this tick.
   */
  tick(): WatchdogAlert[] {
    const newAlerts: WatchdogAlert[] = [];

    for (const entry of this.watched.values()) {
      const acb = entry.getACB();
      if (!acb) continue;

      // Skip terminal instances — remove them from monitoring.
      const terminal = new Set(["completed", "terminated", "quarantined"]);
      if (terminal.has(acb.state)) {
        this.watched.delete(entry.instanceId);
        continue;
      }

      const checks: Array<() => WatchdogAlert | null> = [
        () => this.checkMissedHeartbeat(acb),
        () => this.checkBudgetSpike(acb),
        () => this.checkRunawayLoop(acb),
        () => this.checkExcessiveToolCalls(acb),
        () => this.checkRepeatedErrors(acb),
        () => this.checkUnboundedDelegation(acb),
      ];

      for (const check of checks) {
        const alert = check();
        if (alert) {
          const key = this.alertKey(alert.instanceId, alert.type);
          if (!this.openAlertKeys.has(key)) {
            this.alerts.set(alert.alertId, alert);
            this.openAlertKeys.set(key, alert.alertId);
            newAlerts.push(alert);
          }
        }
      }
    }

    return newAlerts;
  }

  // -------------------------------------------------------------------------
  // Individual checks
  // -------------------------------------------------------------------------

  /**
   * Fires "missed_heartbeat" if lastHeartbeatAt is older than heartbeatStaleMs.
   */
  checkMissedHeartbeat(acb: AgentControlBlock): WatchdogAlert | null {
    const lastBeat = new Date(acb.lastHeartbeatAt).getTime();
    const staleness = Date.now() - lastBeat;

    if (staleness < this.config.heartbeatStaleMs) return null;

    const staleSeconds = Math.round(staleness / 1000);
    return this.buildAlert({
      instanceId: acb.instanceId,
      agentId: acb.agentId,
      severity: staleness > this.config.heartbeatStaleMs * 3 ? "critical" : "warning",
      type: "missed_heartbeat",
      message:
        `Agent instance "${acb.instanceId}" has not sent a heartbeat in ${staleSeconds}s ` +
        `(threshold: ${this.config.heartbeatStaleMs / 1000}s). Last heartbeat: ${acb.lastHeartbeatAt}.`,
    });
  }

  /**
   * Fires "budget_spike" if token usage exceeds `budgetTokenThreshold` of the
   * allocated token budget.
   */
  checkBudgetSpike(acb: AgentControlBlock): WatchdogAlert | null {
    const budget = acb.budget.tokenBudget;
    if (!budget || budget <= 0) return null;

    const ratio = acb.usage.tokensUsed / budget;
    if (ratio < this.config.budgetTokenThreshold) return null;

    const pct = Math.round(ratio * 100);
    return this.buildAlert({
      instanceId: acb.instanceId,
      agentId: acb.agentId,
      severity: ratio >= 1.0 ? "critical" : "warning",
      type: "budget_spike",
      message:
        `Agent instance "${acb.instanceId}" has consumed ${pct}% of its token budget ` +
        `(${acb.usage.tokensUsed} / ${budget} tokens).`,
    });
  }

  /**
   * Fires "runaway_loop" if iteration count exceeds `iterationThreshold` of
   * maxIterations (from the ACB metadata — callers must store it there).
   */
  checkRunawayLoop(acb: AgentControlBlock): WatchdogAlert | null {
    const maxIterations = this.extractMaxIterations(acb);
    if (!maxIterations || maxIterations <= 0) return null;

    const ratio = acb.usage.iterations / maxIterations;
    if (ratio < this.config.iterationThreshold) return null;

    const pct = Math.round(ratio * 100);
    return this.buildAlert({
      instanceId: acb.instanceId,
      agentId: acb.agentId,
      severity: ratio >= 1.0 ? "critical" : "warning",
      type: "runaway_loop",
      message:
        `Agent instance "${acb.instanceId}" has used ${pct}% of its iteration budget ` +
        `(${acb.usage.iterations} / ${maxIterations} iterations).`,
    });
  }

  /**
   * Fires "excessive_tool_calls" if toolCallsMade exceeds toolCallThreshold
   * fraction of toolCallLimit.
   */
  checkExcessiveToolCalls(acb: AgentControlBlock): WatchdogAlert | null {
    const limit = acb.budget.toolCallLimit;
    if (!limit || limit <= 0) return null;

    const ratio = acb.usage.toolCallsMade / limit;
    if (ratio < this.config.toolCallThreshold) return null;

    const pct = Math.round(ratio * 100);
    return this.buildAlert({
      instanceId: acb.instanceId,
      agentId: acb.agentId,
      severity: ratio >= 1.0 ? "critical" : "warning",
      type: "excessive_tool_calls",
      message:
        `Agent instance "${acb.instanceId}" has made ${pct}% of its allowed tool calls ` +
        `(${acb.usage.toolCallsMade} / ${limit}).`,
    });
  }

  /**
   * Fires "repeated_errors" when the error history length reaches the threshold.
   */
  checkRepeatedErrors(acb: AgentControlBlock): WatchdogAlert | null {
    const errorCount = acb.errorHistory.length;
    if (errorCount < this.config.repeatedErrorThreshold) return null;

    const recent = acb.errorHistory.slice(-3).map((e) => e.message).join("; ");

    return this.buildAlert({
      instanceId: acb.instanceId,
      agentId: acb.agentId,
      severity: errorCount >= this.config.repeatedErrorThreshold * 2 ? "critical" : "warning",
      type: "repeated_errors",
      message:
        `Agent instance "${acb.instanceId}" has accumulated ${errorCount} errors ` +
        `(threshold: ${this.config.repeatedErrorThreshold}). Recent: [${recent}].`,
    });
  }

  /**
   * Fires "unbounded_delegation" when the delegation depth reaches the threshold.
   * Requires a `depthProvider` to be set; silently skips otherwise.
   */
  checkUnboundedDelegation(acb: AgentControlBlock): WatchdogAlert | null {
    if (!this.depthProvider) return null;

    const depth = this.depthProvider(acb.instanceId);
    if (depth < this.config.delegationDepthThreshold) return null;

    return this.buildAlert({
      instanceId: acb.instanceId,
      agentId: acb.agentId,
      severity: "critical",
      type: "unbounded_delegation",
      message:
        `Agent instance "${acb.instanceId}" has a delegation depth of ${depth}, ` +
        `which meets or exceeds the threshold of ${this.config.delegationDepthThreshold}.`,
    });
  }

  // -------------------------------------------------------------------------
  // Alert management
  // -------------------------------------------------------------------------

  /**
   * Return all alerts, optionally filtered to a specific instance.
   */
  getAlerts(instanceId?: string): WatchdogAlert[] {
    const all = Array.from(this.alerts.values());
    if (!instanceId) return all.map((a) => ({ ...a }));
    return all.filter((a) => a.instanceId === instanceId).map((a) => ({ ...a }));
  }

  /**
   * Return all currently open (unresolved) alerts.
   */
  getOpenAlerts(instanceId?: string): WatchdogAlert[] {
    return this.getAlerts(instanceId).filter((a) => !a.resolvedAt);
  }

  /**
   * Mark an alert as resolved and record what action was taken.
   */
  resolveAlert(alertId: string, action: WatchdogAlertAction): void {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Watchdog alert not found: "${alertId}"`);
    }
    if (alert.resolvedAt) {
      return; // idempotent
    }

    alert.resolvedAt = new Date().toISOString();
    alert.action = action;

    // Unblock the (instanceId, type) key so the same alert can be re-raised
    // if the condition persists on the next tick.
    const key = this.alertKey(alert.instanceId, alert.type);
    const openId = this.openAlertKeys.get(key);
    if (openId === alertId) {
      this.openAlertKeys.delete(key);
    }
  }

  /**
   * Return aggregate statistics about alert activity.
   */
  getStats(): {
    total: number;
    open: number;
    resolved: number;
    byType: Record<WatchdogAlertType, number>;
    bySeverity: Record<WatchdogAlertSeverity, number>;
  } {
    const all = Array.from(this.alerts.values());
    const open = all.filter((a) => !a.resolvedAt).length;

    const byType = {} as Record<WatchdogAlertType, number>;
    const bySeverity = {} as Record<WatchdogAlertSeverity, number>;

    for (const alert of all) {
      byType[alert.type] = (byType[alert.type] ?? 0) + 1;
      bySeverity[alert.severity] = (bySeverity[alert.severity] ?? 0) + 1;
    }

    return {
      total: all.length,
      open,
      resolved: all.length - open,
      byType,
      bySeverity,
    };
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private buildAlert(params: {
    instanceId: string;
    agentId: string;
    severity: WatchdogAlertSeverity;
    type: WatchdogAlertType;
    message: string;
  }): WatchdogAlert {
    return {
      alertId: randomUUID(),
      instanceId: params.instanceId,
      agentId: params.agentId,
      severity: params.severity,
      type: params.type,
      message: params.message,
      detectedAt: new Date().toISOString(),
    };
  }

  private alertKey(instanceId: string, type: WatchdogAlertType): string {
    return `${instanceId}::${type}`;
  }

  /**
   * Try to extract the max iterations for an instance.
   * The kernel stores the definition's maxIterations in acb.metadata when
   * spawning (convention: acb.metadata.maxIterations).
   */
  private extractMaxIterations(acb: AgentControlBlock): number | undefined {
    const val = acb.metadata["maxIterations"];
    if (typeof val === "number") return val;
    if (acb.budget.maxIterations !== undefined) return acb.budget.maxIterations;
    return undefined;
  }
}
