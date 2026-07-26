/**
 * HiveSwarm — Distributed Tracing Types
 *
 * Aligns with OpenTelemetry semantics. The runtime creates a root span per
 * DAG run, and a child span per task. Each cognitive phase (plan/execute/
 * observe/reflect) gets its own child span.
 */

export type SpanKind = "server" | "client" | "producer" | "consumer" | "internal";
export type SpanStatus = "unset" | "ok" | "error";

export interface SpanContext {
  traceId:    string;
  spanId:     string;
  traceFlags: number;  // 0x01 = sampled
  isRemote?:  boolean;
}

export interface SwarmSpan {
  context:    SpanContext;
  name:       string;
  kind:       SpanKind;
  startTime:  bigint;  // nanoseconds since Unix epoch
  endTime?:   bigint;
  status:     SpanStatus;
  statusMessage?: string;
  attributes: Record<string, string | number | boolean | string[]>;
  events:     SpanEvent[];

  // ── Convenience methods ──────────────────────────────────────────────────
  addEvent(name: string, attributes?: Record<string, unknown>): void;
  setStatus(status: SpanStatus, message?: string): void;
  setAttribute(key: string, value: string | number | boolean): void;
  end(): void;
}

export interface SpanEvent {
  name:       string;
  timestamp:  bigint;
  attributes: Record<string, unknown>;
}

export interface SwarmTrace {
  traceId:  string;
  runId:    string;
  spans:    SwarmSpan[];
}

// Standard HiveSwarm span attribute keys
export const SPAN_ATTRS = {
  AGENT_ID:       "swarm.agent.id",
  TASK_ID:        "swarm.task.id",
  RUN_ID:         "swarm.run.id",
  DAG_ID:         "swarm.dag.id",
  TENANT_ID:      "swarm.tenant.id",
  CAPABILITY:     "swarm.capability",
  PHASE:          "swarm.phase",   // plan | execute | observe | reflect
  MODEL_ID:       "swarm.model.id",
  PROMPT_TOKENS:  "swarm.tokens.prompt",
  COMP_TOKENS:    "swarm.tokens.completion",
  COST_USD:       "swarm.cost.usd",
  RETRY_COUNT:    "swarm.retry.count",
} as const;
