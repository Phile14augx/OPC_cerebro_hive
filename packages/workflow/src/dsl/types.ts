/**
 * CerebroFlow — Workflow DSL Types
 * Primary AI: Claude | Supporting: Codex
 */

export type NodeType =
  | 'trigger' | 'llm' | 'api' | 'condition' | 'transform'
  | 'human_approval' | 'dead_letter' | 'delay' | 'loop'
  | 'parallel' | 'notification' | 'data_lookup' | 'script';

export type TriggerType =
  | 'webhook' | 'schedule' | 'event' | 'manual'
  | 'record_created' | 'record_updated' | 'file_uploaded' | 'form_submitted';

export type ExecutionStatus =
  | 'pending' | 'running' | 'suspended' | 'completed'
  | 'failed' | 'cancelled' | 'dead_lettered';

export type ConditionOperator =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'contains' | 'not_contains' | 'starts_with'
  | 'is_null' | 'is_not_null' | 'in' | 'not_in';

export type WorkflowCategory =
  | 'hr' | 'finance' | 'sales' | 'legal' | 'ops'
  | 'it' | 'marketing' | 'procurement' | 'compliance' | 'customer_success';

export interface WorkflowDSL {
  version: '1.0';
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  tags: string[];
  trigger: TriggerConfig;
  nodes: NodeConfig[];
  edges: EdgeConfig[];
  error_handling: ErrorHandlingConfig;
  audit: AuditConfig;
  metadata: WorkflowMetadata;
}

export interface WorkflowMetadata {
  author: string;
  created_at: string;
  updated_at: string;
  template_id?: string;
  sla_minutes?: number;
  estimated_cost_usd?: number;
  compliance_tags?: string[];
}

export interface TriggerConfig {
  type: TriggerType;
  cron?: string;
  webhook?: { path: string; secret_ref?: string; method?: 'POST' | 'GET' };
  event_topic?: string;
  input_schema?: Record<string, unknown>;
}

export interface NodeConfig {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  depends_on?: string[];
  config: NodeTypeConfig;
  retry?: RetryConfig;
  timeout_seconds?: number;
  on_error?: 'fail' | 'dead_letter' | 'skip' | 'escalate';
}

export type NodeTypeConfig =
  | LLMNodeConfig | APINodeConfig | ConditionNodeConfig | TransformNodeConfig
  | HumanApprovalNodeConfig | DelayNodeConfig | LoopNodeConfig | ParallelNodeConfig
  | NotificationNodeConfig | DataLookupNodeConfig | ScriptNodeConfig;

export interface LLMNodeConfig {
  kind: 'llm';
  model: string;
  system_prompt: string;
  user_prompt_template: string;
  output_variable: string;
  temperature?: number;
  max_tokens?: number;
  audit_llm_io?: boolean;
}

export interface APINodeConfig {
  kind: 'api';
  url_template: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body_template?: string;
  auth?: { type: 'bearer' | 'basic' | 'api_key'; secret_ref: string };
  output_variable: string;
  response_path?: string;
}

export interface ConditionNodeConfig {
  kind: 'condition';
  expression: ConditionExpression;
  true_path: string[];
  false_path: string[];
}

export interface ConditionExpression {
  left: string;
  operator: ConditionOperator;
  right: string | number | boolean | null;
  and?: ConditionExpression[];
  or?: ConditionExpression[];
}

export interface TransformNodeConfig {
  kind: 'transform';
  mappings: Record<string, string>;
  output_variable: string;
}

export interface HumanApprovalNodeConfig {
  kind: 'human_approval';
  assignee_ref: string;
  task_title: string;
  task_description_template: string;
  timeout_hours?: number;
  on_timeout: 'escalate' | 'auto_approve' | 'auto_reject' | 'dead_letter';
  escalation_assignee_ref?: string;
}

export interface DelayNodeConfig {
  kind: 'delay';
  duration_seconds: number;
  backoff?: BackoffConfig;
}

export interface LoopNodeConfig {
  kind: 'loop';
  iterate_over: string;
  body_nodes: string[];
  max_iterations?: number;
  parallel?: boolean;
}

export interface ParallelNodeConfig {
  kind: 'parallel';
  branches: string[][];
  join_strategy: 'all' | 'first';
}

export interface NotificationNodeConfig {
  kind: 'notification';
  channel: 'email' | 'slack' | 'teams' | 'sms' | 'in_app';
  recipient_ref: string;
  subject_template?: string;
  body_template: string;
}

export interface DataLookupNodeConfig {
  kind: 'data_lookup';
  source: 'database' | 'api' | 'cache';
  query_template: string;
  output_variable: string;
}

export interface ScriptNodeConfig {
  kind: 'script';
  runtime: 'typescript' | 'python';
  code: string;
  output_variable: string;
}

export interface EdgeConfig {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: ConditionExpression;
}

export interface RetryConfig {
  max_attempts: number;
  strategy: 'fixed' | 'exponential' | 'fibonacci';
  delay_seconds: number;
  retry_on_status?: number[];
}

export interface BackoffConfig {
  initial_delay_seconds: number;
  multiplier: number;
  max_delay_seconds: number;
  jitter?: boolean;
}

export interface ErrorHandlingConfig {
  default_on_error: 'fail' | 'dead_letter' | 'escalate';
  dead_letter_queue?: {
    enabled: boolean;
    retention_days?: number;
    auto_retry_after_hours?: number;
  };
  escalation?: EscalationConfig;
  global_timeout_minutes?: number;
}

export interface EscalationConfig {
  tiers: EscalationTier[];
  always_notify?: string[];
}

export interface EscalationTier {
  level: number;
  assignee_ref: string;
  sla_minutes: number;
  notification_channels: ('email' | 'slack' | 'sms' | 'teams')[];
  message_template: string;
}

export interface AuditConfig {
  log_node_lifecycle: boolean;
  log_llm_io: boolean;
  log_api_io: boolean;
  redact_fields?: string[];
  retention_days: number;
  compliance_tags?: string[];
}

export interface ExecutionContext {
  executionId: string;
  workflowId: string;
  workflowVersion: number;
  tenantId: string;
  triggeredBy: TriggerType;
  startedAt: Date;
  variables: Record<string, unknown>;
  nodeStatuses: Record<string, NodeExecutionStatus>;
  loopState?: LoopState;
}

export interface NodeExecutionStatus {
  nodeId: string;
  status: ExecutionStatus;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  retryCount: number;
  output?: unknown;
}

export interface LoopState {
  nodeId: string;
  currentIndex: number;
  totalItems: number;
}

export interface ExecutionResult {
  executionId: string;
  status: ExecutionStatus;
  durationMs: number;
  output: Record<string, unknown>;
  nodeResults: NodeExecutionStatus[];
  auditTrailId?: string;
  error?: ExecutionError;
}

export interface ExecutionError {
  nodeId: string;
  message: string;
  code: string;
  retryable: boolean;
  deadLettered: boolean;
}
