// ── Agent domain types ────────────────────────────────────────────────────────

import type { OrgId, UserId } from "./user.js";

export type AgentId    = string & { readonly __brand: "AgentId" };
export type AgentRunId = string & { readonly __brand: "AgentRunId" };

export type AgentStatus   = "active" | "inactive" | "deprecated" | "beta" | "draft";
export type AgentRunStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface AgentDefinition {
  id:             AgentId;
  orgId:          OrgId;
  name:           string;
  slug:           string;
  version:        string;
  description:    string;
  capabilities:   string[];
  tools:          AgentToolManifest[];
  model:          string;
  systemPrompt:   string;
  maxIterations:  number;
  timeoutMs:      number;
  status:         AgentStatus;
  isBuiltin:      boolean;     // true for platform-provided agents
  tags:           string[];
  createdBy:      UserId;
  updatedBy:      UserId;
  createdAt:      string;
  updatedAt:      string;
}

export interface AgentToolManifest {
  name:        string;
  description: string;
  parameters: {
    type:       "object";
    required:   string[];
    properties: Record<string, {
      type:        string;
      description: string;
      enum?:       string[];
      default?:    unknown;
    }>;
  };
  returns: {
    type:        string;
    description: string;
  };
  // Execution metadata
  implementation: "builtin" | "http" | "mcp";
  endpoint?:      string;     // for http implementations
  timeout?:       number;
  requiresAuth?:  boolean;
}

export interface AgentRun {
  id:             AgentRunId;
  agentId:        AgentId;
  orgId:          OrgId;
  executionId:    string | null;  // parent workflow execution
  sessionId:      string;
  status:         AgentRunStatus;
  input:          string;
  output:         string | null;
  messages:       AgentMessage[];
  toolCalls:      ToolCallRecord[];
  iterations:     number;
  inputTokens:    number;
  outputTokens:   number;
  costUsd:        number;
  startedAt:      string;
  completedAt:    string | null;
  durationMs:     number | null;
  error:          string | null;
}

export interface AgentMessage {
  role:       "user" | "assistant" | "tool";
  content:    string;
  toolCallId?: string;
  timestamp:  string;
}

export interface ToolCallRecord {
  id:           string;
  toolName:     string;
  input:        Record<string, unknown>;
  output:       unknown;
  error:        string | null;
  durationMs:   number;
  timestamp:    string;
}
