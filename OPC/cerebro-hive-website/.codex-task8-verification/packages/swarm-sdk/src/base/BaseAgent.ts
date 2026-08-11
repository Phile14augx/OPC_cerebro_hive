/**
 * HiveSwarm — BaseAgent
 *
 * Abstract base class that all HiveSwarm agents should extend.
 * Provides:
 *   - Boilerplate for identity, state management, and metrics tracking
 *   - Default implementations for healthCheck() and getMetrics()
 *   - Wiring of the plan → execute → observe → reflect lifecycle
 *   - No-op reflect() that subclasses can override when needed
 *
 * Concrete agents override:
 *   - plan()
 *   - execute()
 *   - observe()      (optional: default returns qualityScore = output.confidence)
 *   - reflect()      (optional: default returns empty learnings)
 *   - initialize()   (optional)
 *   - shutdown()     (optional)
 */

import type {
  Agent,
  AgentIdentity,
  AgentExecutionContext,
  AgentPlan,
  AgentObservation,
  AgentReflection,
  AgentState,
} from "../types/agent.js";
import type { AgentHealth } from "../types/health.js";
import type { AgentMetrics } from "../types/metrics.js";
import type { TaskOutput } from "../types/task.js";

export abstract class BaseAgent implements Agent {
  // ── Internal state ─────────────────────────────────────────────────────────

  private _state:      AgentState = "idle";
  private _activeRuns: number     = 0;

  private readonly _metrics: AgentMetrics;

  // ── Constructor ───────────────────────────────────────────────────────────

  constructor(public readonly identity: AgentIdentity) {
    this._metrics = {
      agentId:          identity.id,
      tasksStarted:     0,
      tasksCompleted:   0,
      tasksFailed:      0,
      tasksCancelled:   0,
      p50LatencyMs:     0,
      p90LatencyMs:     0,
      p99LatencyMs:     0,
      totalTokensUsed:  0,
      totalCostUsd:     0,
      avgQualityScore:  0,
      avgConfidence:    0,
      totalToolCalls:   0,
      toolErrorRate:    0,
      memoryWriteCount: 0,
      memoryReadCount:  0,
      collectedAt:      new Date().toISOString(),
    };
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    // Default: no-op. Subclasses override to load models, warm caches, etc.
  }

  async shutdown(): Promise<void> {
    // Default: no-op. Subclasses override to flush buffers, close connections.
    this._state = "terminated";
  }

  // ── Health ────────────────────────────────────────────────────────────────

  async healthCheck(): Promise<AgentHealth> {
    const loadFactor = this._activeRuns / Math.max(1, this.identity.concurrency);
    return {
      agentId:    this.identity.id,
      status:     this._state === "terminated" ? "unhealthy" : loadFactor >= 1.0 ? "degraded" : "healthy",
      checks:     [],
      activeRuns: this._activeRuns,
      loadFactor,
      checkedAt:  new Date().toISOString(),
    };
  }

  // ── Metrics ───────────────────────────────────────────────────────────────

  getMetrics(): AgentMetrics {
    return { ...this._metrics, collectedAt: new Date().toISOString() };
  }

  // ── Cognitive phases (subclasses must implement) ──────────────────────────

  abstract plan(ctx: AgentExecutionContext): Promise<AgentPlan>;

  abstract execute(ctx: AgentExecutionContext, plan: AgentPlan): Promise<TaskOutput>;

  // ── Default observe — uses output.confidence as quality proxy ─────────────

  async observe(
    _ctx:   AgentExecutionContext,
    output: TaskOutput,
  ): Promise<AgentObservation> {
    return {
      qualityScore: output.confidence,
      criteriaMet:  output.confidence >= 0.7,
      issues:       output.confidence < 0.7 ? ["Output confidence is below 0.7 threshold"] : [],
    };
  }

  // ── Default reflect — no-op ───────────────────────────────────────────────

  async reflect(
    _ctx:        AgentExecutionContext,
    _output:     TaskOutput,
    _observation: AgentObservation,
  ): Promise<AgentReflection> {
    return {
      learnings:     [],
      antiPatterns:  [],
      toolAnomalies: [],
    };
  }

  // ── State accessors (used by runtime) ────────────────────────────────────

  get state(): AgentState { return this._state; }

  /** Called by the runtime before dispatching a task */
  protected _beginTask(): void {
    this._activeRuns++;
    this._metrics.tasksStarted++;
    this._state = "planning";
  }

  /** Called by the runtime after a task completes (success or failure) */
  protected _endTask(success: boolean, latencyMs: number, output?: TaskOutput): void {
    this._activeRuns = Math.max(0, this._activeRuns - 1);
    if (this._activeRuns === 0) this._state = "idle";

    if (success) {
      this._metrics.tasksCompleted++;
    } else {
      this._metrics.tasksFailed++;
    }

    if (output) {
      this._metrics.totalTokensUsed  += output.usage.totalTokens;
      this._metrics.totalCostUsd     += output.usage.costUsd;

      // Exponential moving average for confidence
      const alpha = 0.1;
      this._metrics.avgConfidence =
        this._metrics.avgConfidence * (1 - alpha) + output.confidence * alpha;
    }

    // Rolling latency (simplified — production should use a ring buffer)
    const prev = this._metrics.p50LatencyMs;
    this._metrics.p50LatencyMs = prev === 0 ? latencyMs : (prev * 0.9 + latencyMs * 0.1);
  }
}
