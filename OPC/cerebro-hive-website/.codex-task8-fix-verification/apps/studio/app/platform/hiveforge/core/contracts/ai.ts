import { URD } from "./resource";

export interface AIContext {
  currentWorkspaceId?: string;
  currentResource?: URD;
  activePluginId?: string;
  telemetrySnapshot?: unknown;
}

export interface AIQueryResponse {
  answer: string;
  suggestedActions: { label: string; actionId: string; payload: unknown }[];
  confidenceScore: number;
}

export interface AICoreService {
  setContext(context: AIContext): void;
  updateContext(context: Partial<AIContext>): void;
  ask(query: string): Promise<AIQueryResponse>;
  generateTerraform(urd: URD): Promise<string>;
  explainError(errorLogs: string): Promise<string>;
  optimizeCost(workspaceId: string): Promise<string>;
}
