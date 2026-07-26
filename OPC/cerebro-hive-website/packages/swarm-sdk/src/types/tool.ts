/**
 * HiveSwarm — Tool Types
 *
 * Mirrors the Go types in services/tool-gateway/internal/{registry,executor}.
 * Agents use ToolGatewayClient to discover and invoke tools.
 */

export type ToolParamType = "string" | "number" | "boolean" | "object" | "array";

export type ToolCategory =
  | "code"
  | "search"
  | "comms"
  | "project"
  | "cloud"
  | "data";

export interface ToolParam {
  name:        string;
  type:        ToolParamType;
  description: string;
  required:    boolean;
  enum?:       string[];
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  burstSize:         number;
}

/** Public descriptor returned by GET /api/v1/tools */
export interface ToolDefinition {
  id:           string;
  name:         string;
  description:  string;
  category:     ToolCategory;
  params:       ToolParam[];
  rateLimit:    RateLimitConfig;
  requiresAuth: boolean;
}

/** Inbound call from an agent to the tool-gateway. */
export interface ToolCall {
  callId:  string;
  toolId:  string;
  agentId: string;
  runId?:  string;
  input:   Record<string, unknown>;
}

/** Result returned by the gateway after executing a tool call. */
export interface ToolResult {
  callId:     string;
  toolId:     string;
  output?:    unknown;
  isError:    boolean;
  errorCode?: string;
  message?:   string;
  durationMs: number;
}
