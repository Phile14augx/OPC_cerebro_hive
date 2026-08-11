/**
 * HiveSwarm — Agent Interface (HS-001)
 *
 * Every HiveSwarm agent implements this contract. It separates the four
 * cognitive phases of agent execution into distinct lifecycle methods
 * so the runtime can instrument, intercept, and govern each phase.
 *
 *   plan()    → produce a structured execution plan for the task
 *   execute() → carry out the plan and return a result
 *   observe() → evaluate its own output (self-critique)
 *   reflect() → surface learnings for the memory / evaluation layer
 */

import type { SwarmCapability } from "./capability.js";
import type { SwarmTask, TaskOutput } from "./task.js";
import type { AgentHealth } from "./health.js";
import type { AgentMetrics } from "./metrics.js";
import type { SwarmSpan } from "./tracing.js";

// ── Agent identity ─────────────────────────────────────────────────────────────

export interface AgentIdentity {
  /** Globally unique, stable across restarts (e.g. "research-agent-v1") */
  id:           string;
  /** Human-readable display name */
  name:         string;
  /** Semantic version string */
  version:      string;
  /** Team / service that owns this agent */
  owner:        string;
  /** Capabilities this agent can satisfy */
  capabilities: SwarmCapability[];
  /** Free-form tags for routing and discovery */
  tags:         string[];
  /** Concurrency limit (how many tasks this agent can run simultaneously) */
  concurrency:  number;
}

// ── Execution context ─────────────────────────────────────────────────────────

export interface AgentExecutionContext {
  /** Globally unique execution ID (trace root) */
  executionId:   string;
  /** The specific task being executed */
  task:          SwarmTask;
  /** Active tracing span for the agent's work */
  span:          SwarmSpan;
  /** Signal that can be polled to detect cancellation */
  signal:        AbortSignal;
  /** Access to memory APIs (working, semantic, episodic) */
  memory:        AgentMemoryAccess;
  /** Access to tool APIs (injected by tool-gateway) */
  tools:         AgentToolAccess;
  /** Structured logger bound to this execution */
  logger:        AgentLogger;
}

// ── Memory access (injected by runtime) ──────────────────────────────────────

export interface AgentMemoryAccess {
  /** Retrieve a value from working memory (current run scope) */
  get(key: string): Promise<unknown | null>;
  /** Write a value to working memory */
  set(key: string, value: unknown): Promise<void>;
  /** Semantic search over long-term memory */
  recall(query: string, topK?: number): Promise<Array<{ content: string; score: number }>>;
  /** Persist a fact to long-term memory */
  remember(content: string, metadata?: Record<string, unknown>): Promise<void>;
}

// ── Tool access (injected by tool-gateway) ────────────────────────────────────

export interface AgentToolAccess {
  /** Invoke a registered tool by name */
  invoke<TInput = unknown, TOutput = unknown>(
    toolName: string,
    input: TInput,
  ): Promise<TOutput>;
  /** List tools available to this agent in this execution context */
  list(): Promise<Array<{ name: string; description: string }>>;
}

// ── Logger ────────────────────────────────────────────────────────────────────

export interface AgentLogger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, error?: unknown, meta?: Record<string, unknown>): void;
}

// ── Plan ─────────────────────────────────────────────────────────────────────

export interface AgentPlan {
  /** Ordered list of steps the agent intends to take */
  steps: Array<{
    id:          string;
    description: string;
    toolName?:   string;    // If this step invokes a tool
    reasoning:   string;    // Why this step is needed
  }>;
  estimatedTokens:  number;
  estimatedCostUsd: number;
  risks:            string[];
}

// ── Observation ──────────────────────────────────────────────────────────────

export interface AgentObservation {
  /** Self-assessed quality score 0.0–1.0 */
  qualityScore:     number;
  /** Were all success criteria from the task met? */
  criteriaMet:      boolean;
  /** Issues found during self-evaluation */
  issues:           string[];
  /** Suggested revisions if quality is below threshold */
  revisions?:       string[];
}

// ── Reflection ────────────────────────────────────────────────────────────────

export interface AgentReflection {
  /** Lessons learned from this execution */
  learnings:        string[];
  /** Patterns to avoid in future runs */
  antiPatterns:     string[];
  /** Tool calls that produced unexpected results */
  toolAnomalies:    string[];
  /** Suggested improvements for the agent's system prompt */
  promptSuggestions?: string[];
}

// ── Agent lifecycle state ─────────────────────────────────────────────────────

export type AgentState =
  | "idle"          // Running but not assigned a task
  | "planning"      // Executing plan()
  | "executing"     // Executing execute()
  | "observing"     // Executing observe()
  | "reflecting"    // Executing reflect()
  | "paused"        // Suspended by the runtime (e.g. waiting for tool result)
  | "terminated";   // Shutdown (graceful or forced)

// ── Core Agent interface ──────────────────────────────────────────────────────

export interface Agent {
  /** Static identity — never changes at runtime */
  readonly identity: AgentIdentity;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /**
   * Called once by the runtime before the agent accepts any tasks.
   * Load models, warm caches, connect to external services here.
   */
  initialize(): Promise<void>;

  /**
   * Called by the runtime during graceful shutdown.
   * Flush buffers, close connections, persist state here.
   */
  shutdown(): Promise<void>;

  // ── Health ─────────────────────────────────────────────────────────────────

  /** Invoked by the runtime on a configurable interval (default 30s) */
  healthCheck(): Promise<AgentHealth>;

  // ── Metrics ────────────────────────────────────────────────────────────────

  /** Returns current performance counters — scraped by Prometheus */
  getMetrics(): AgentMetrics;

  // ── Cognitive phases ───────────────────────────────────────────────────────

  /**
   * Phase 1 — Planning.
   * Produce a structured step-by-step plan before executing.
   * The runtime may submit the plan to the Governance layer before allowing
   * execution to proceed.
   */
  plan(ctx: AgentExecutionContext): Promise<AgentPlan>;

  /**
   * Phase 2 — Execution.
   * Carry out the plan. Has access to tools, memory, and the task input.
   * Must respect ctx.signal for cooperative cancellation.
   */
  execute(ctx: AgentExecutionContext, plan: AgentPlan): Promise<TaskOutput>;

  /**
   * Phase 3 — Observation (self-critique).
   * Evaluate the output produced by execute() against the task's success
   * criteria. Called by the runtime before marking the task completed.
   * A low quality score can trigger a retry.
   */
  observe(
    ctx:    AgentExecutionContext,
    output: TaskOutput,
  ): Promise<AgentObservation>;

  /**
   * Phase 4 — Reflection.
   * Post-execution introspection. Runs asynchronously after observe()
   * so it doesn't block the task completion signal.
   * Results are persisted to the learning / evaluation layer.
   */
  reflect(
    ctx:         AgentExecutionContext,
    output:      TaskOutput,
    observation: AgentObservation,
  ): Promise<AgentReflection>;
}
