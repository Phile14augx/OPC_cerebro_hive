// ── Workflow domain types ─────────────────────────────────────────────────────

import type { OrgId, UserId } from "./user.js";

export type WorkflowId          = string & { readonly __brand: "WorkflowId" };
export type WorkflowExecutionId = string & { readonly __brand: "WorkflowExecutionId" };
export type WorkflowStepId      = string & { readonly __brand: "WorkflowStepId" };

export type WorkflowStatus = "draft" | "published" | "archived" | "deprecated";
export type ExecutionStatus =
  | "queued"
  | "running"
  | "waiting_for_human"
  | "completed"
  | "failed"
  | "timeout"
  | "cancelled";

export type StepType =
  | "llm"                 // LLM call via ai-gateway
  | "agent"               // Delegate to a registered agent
  | "knowledge_retrieval" // RAG retrieval from knowledge base
  | "code"                // Execute code (sandboxed)
  | "http"                // HTTP request to external API
  | "transform"           // Data transformation (jq / JSONata)
  | "condition"           // Branching logic
  | "loop"                // Iterate over a collection
  | "parallel"            // Fan-out / fan-in parallel steps
  | "human_in_the_loop"   // Wait for human approval/input
  | "wait"                // Timed delay
  | "email"               // Send email notification
  | "webhook"             // Emit webhook event
  | "subworkflow";        // Invoke another workflow

export interface WorkflowStep {
  id:           WorkflowStepId;
  type:         StepType;
  name:         string;
  description:  string;
  config:       Record<string, unknown>;  // step-type specific config
  position:     { x: number; y: number };
  inputs:       WorkflowConnection[];
  outputs:      WorkflowConnection[];
  retryPolicy:  RetryPolicy;
  timeout:      number;       // ms
  onError:      "fail" | "continue" | "retry" | "fallback";
  fallbackStepId?: WorkflowStepId;
  metadata:     Record<string, unknown>;
}

export interface WorkflowConnection {
  stepId:    WorkflowStepId;
  outputKey: string;
  inputKey:  string;
  condition?: string;         // JMESPath expression for conditional routing
}

export interface RetryPolicy {
  maxAttempts:    number;
  backoffType:    "fixed" | "exponential" | "linear";
  initialDelayMs: number;
  maxDelayMs:     number;
  jitterMs:       number;
  retryOn:        string[];   // error codes to retry on
}

export interface WorkflowDefinition {
  id:          WorkflowId;
  orgId:       OrgId;
  name:        string;
  description: string;
  version:     number;
  status:      WorkflowStatus;
  steps:       WorkflowStep[];
  variables:   WorkflowVariable[];
  triggers:    WorkflowTrigger[];
  settings:    WorkflowSettings;
  tags:        string[];
  createdBy:   UserId;
  updatedBy:   UserId;
  createdAt:   string;
  updatedAt:   string;
  publishedAt: string | null;
}

export interface WorkflowVariable {
  name:         string;
  type:         "string" | "number" | "boolean" | "object" | "array" | "secret";
  required:     boolean;
  default:      unknown;
  description:  string;
  validation?:  string;       // JSON Schema string
}

export interface WorkflowTrigger {
  type:    "manual" | "schedule" | "webhook" | "event" | "api";
  config:  Record<string, unknown>;
  enabled: boolean;
}

export interface WorkflowSettings {
  maxConcurrentExecutions: number;
  executionTimeout:        number;  // ms
  retainExecutionLogs:     number;  // days
  notifyOnFailure:         boolean;
  notifyEmail:             string | null;
  costBudgetUsd:           number | null;
}

export interface WorkflowExecution {
  id:               WorkflowExecutionId;
  workflowId:       WorkflowId;
  orgId:            OrgId;
  triggeredBy:      UserId | "schedule" | "webhook" | "api";
  status:           ExecutionStatus;
  input:            Record<string, unknown>;
  output:           Record<string, unknown> | null;
  steps:            StepExecution[];
  startedAt:        string;
  completedAt:      string | null;
  durationMs:       number | null;
  aiCallsCount:     number;
  totalTokensUsed:  number;
  totalCostUsd:     number;
  error:            ExecutionError | null;
  parentExecutionId?: WorkflowExecutionId;  // for subworkflows
  temporalWorkflowId: string;
  temporalRunId:      string;
}

export interface StepExecution {
  stepId:        WorkflowStepId;
  stepName:      string;
  stepType:      StepType;
  status:        "pending" | "running" | "completed" | "failed" | "skipped";
  input:         Record<string, unknown>;
  output:        Record<string, unknown> | null;
  error:         ExecutionError | null;
  startedAt:     string | null;
  completedAt:   string | null;
  durationMs:    number | null;
  attempts:      number;
  aiCallsCount:  number;
  tokenCost:     { inputTokens: number; outputTokens: number; costUsd: number } | null;
  logs:          StepLog[];
}

export interface StepLog {
  timestamp: string;
  level:     "debug" | "info" | "warn" | "error";
  message:   string;
  data?:     Record<string, unknown>;
}

export interface ExecutionError {
  code:       string;
  message:    string;
  stepId?:    WorkflowStepId;
  retryable:  boolean;
  stack?:     string;
}

// ── Type guards ───────────────────────────────────────────────────────────────
export const isWorkflowId = (v: string): v is WorkflowId =>
  v.startsWith("wf_");
export const isExecutionId = (v: string): v is WorkflowExecutionId =>
  v.startsWith("exec_");
