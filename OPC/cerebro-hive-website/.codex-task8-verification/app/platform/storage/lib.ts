// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";

export type ToolKind = "builtin" | "mcp" | "custom";

export type ToolDef = {
  id: string;
  name: string;
  description: string;
  kind: ToolKind;
  input_schema: Record<string, unknown>;
  permissions: string[];
  enabled: boolean;
  created_at: string;
};

export type InvokeResult = {
  result?: unknown;
  error?: string;
};
