/**
 * @cerebro/queue — NATS JetStream subject registry
 * All subjects follow the pattern: cerebro.<domain>.<entity>.<action>
 * Wildcards: * = single token, > = multi-token suffix
 */

// ── Subject constants ─────────────────────────────────────────────────────────

export const SUBJECTS = {
  // Workflow execution lifecycle
  WORKFLOW: {
    EXECUTION_STARTED:        "cerebro.workflow.execution.started",
    EXECUTION_STEP_COMPLETED: "cerebro.workflow.execution.step_completed",
    EXECUTION_STEP_FAILED:    "cerebro.workflow.execution.step_failed",
    EXECUTION_COMPLETED:      "cerebro.workflow.execution.completed",
    EXECUTION_FAILED:         "cerebro.workflow.execution.failed",
    EXECUTION_CANCELLED:      "cerebro.workflow.execution.cancelled",
    EXECUTION_TIMEOUT:        "cerebro.workflow.execution.timeout",
    /** Wildcard — subscribe to all execution events */
    EXECUTION_ALL:            "cerebro.workflow.execution.>",
  },

  // Agent events
  AGENT: {
    RUN_STARTED:    "cerebro.agent.run.started",
    RUN_COMPLETED:  "cerebro.agent.run.completed",
    RUN_FAILED:     "cerebro.agent.run.failed",
    TOOL_CALLED:    "cerebro.agent.tool.called",
    MEMORY_UPDATED: "cerebro.agent.memory.updated",
    ALL:            "cerebro.agent.>",
  },

  // Knowledge / RAG
  KNOWLEDGE: {
    DOCUMENT_UPLOADED: "cerebro.knowledge.document.uploaded",
    DOCUMENT_INDEXED:  "cerebro.knowledge.document.indexed",
    DOCUMENT_FAILED:   "cerebro.knowledge.document.failed",
    RETRIEVED:         "cerebro.knowledge.retrieved",
    ALL:               "cerebro.knowledge.>",
  },

  // AI / LLM
  AI: {
    REQUEST_COMPLETED: "cerebro.ai.request.completed",
    BUDGET_WARNING:    "cerebro.ai.budget.warning",
    BUDGET_EXCEEDED:   "cerebro.ai.budget.exceeded",
    EVAL_COMPLETED:    "cerebro.ai.eval.completed",
    ALL:               "cerebro.ai.>",
  },

  // Billing
  BILLING: {
    SUBSCRIPTION_CREATED:   "cerebro.billing.subscription.created",
    SUBSCRIPTION_CANCELLED: "cerebro.billing.subscription.cancelled",
    PAYMENT_SUCCEEDED:      "cerebro.billing.payment.succeeded",
    PAYMENT_FAILED:         "cerebro.billing.payment.failed",
    ALL:                    "cerebro.billing.>",
  },

  // Security / audit
  SECURITY: {
    POLICY_VIOLATION:    "cerebro.security.policy_violation",
    SUSPICIOUS_ACTIVITY: "cerebro.security.suspicious_activity",
    ALL:                 "cerebro.security.>",
  },

  AUDIT: {
    EVENT: "cerebro.audit.event",
    ALL:   "cerebro.audit.>",
  },

  /** Catch-all for any cerebro event */
  ALL: "cerebro.>",
} as const;

export type Subject = (typeof SUBJECTS)[keyof typeof SUBJECTS][keyof (typeof SUBJECTS)[keyof typeof SUBJECTS]];

// ── Stream + consumer definitions ─────────────────────────────────────────────

export interface StreamConfig {
  name:       string;
  subjects:   string[];
  maxAge:     number;   // nanoseconds
  maxBytes:   number;   // bytes
  replicas:   number;
  retention:  "limits" | "interest" | "workqueue";
  storage:    "file" | "memory";
  description?: string;
}

export const STREAMS: StreamConfig[] = [
  {
    name:        "CEREBRO_WORKFLOW",
    subjects:    [SUBJECTS.WORKFLOW.EXECUTION_ALL],
    maxAge:      7 * 24 * 3600 * 1e9, // 7 days
    maxBytes:    5 * 1024 * 1024 * 1024, // 5 GB
    replicas:    3,
    retention:   "limits",
    storage:     "file",
    description: "Workflow execution event stream",
  },
  {
    name:        "CEREBRO_AGENT",
    subjects:    [SUBJECTS.AGENT.ALL],
    maxAge:      3 * 24 * 3600 * 1e9,
    maxBytes:    2 * 1024 * 1024 * 1024,
    replicas:    3,
    retention:   "limits",
    storage:     "file",
    description: "Agent run event stream",
  },
  {
    name:        "CEREBRO_KNOWLEDGE",
    subjects:    [SUBJECTS.KNOWLEDGE.ALL],
    maxAge:      14 * 24 * 3600 * 1e9,
    maxBytes:    10 * 1024 * 1024 * 1024,
    replicas:    3,
    retention:   "limits",
    storage:     "file",
    description: "Knowledge base ingestion + retrieval stream",
  },
  {
    name:        "CEREBRO_AI",
    subjects:    [SUBJECTS.AI.ALL],
    maxAge:      30 * 24 * 3600 * 1e9,
    maxBytes:    20 * 1024 * 1024 * 1024,
    replicas:    3,
    retention:   "limits",
    storage:     "file",
    description: "AI usage telemetry stream (billing, evals)",
  },
  {
    name:        "CEREBRO_AUDIT",
    subjects:    [SUBJECTS.AUDIT.ALL, SUBJECTS.SECURITY.ALL],
    maxAge:      365 * 24 * 3600 * 1e9, // 1 year
    maxBytes:    50 * 1024 * 1024 * 1024,
    replicas:    3,
    retention:   "limits",
    storage:     "file",
    description: "Immutable audit + security event stream",
  },
  {
    name:        "CEREBRO_BILLING",
    subjects:    [SUBJECTS.BILLING.ALL],
    maxAge:      90 * 24 * 3600 * 1e9,
    maxBytes:    2 * 1024 * 1024 * 1024,
    replicas:    3,
    retention:   "limits",
    storage:     "file",
    description: "Billing lifecycle event stream",
  },
];

// ── Dead-letter queue subject convention ─────────────────────────────────────

export function dlqSubject(original: string): string {
  return `cerebro.dlq.${original.replaceAll(".", "_")}`;
}
