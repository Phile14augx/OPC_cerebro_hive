export const API = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8090";
export const KEY = process.env.NEXT_PUBLIC_PLATFORM_DEMO_KEY || "";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      authorization: `Bearer ${KEY}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function checkOnline(): Promise<boolean> {
  try { return await fetch(`${API}/health`).then(r => r.ok); } catch { return false; }
}

export interface Workspace { id: string; name: string; description: string; createdAt: string }
export interface PromptVersion { version: number; template: string; createdAt: string }
export interface Prompt { id: string; workspaceId: string; name: string; template: string; variables: string[]; versions: PromptVersion[]; updatedAt: string }
export interface Agent { id: string; workspaceId: string; name: string; systemPrompt: string; model: string; tools: string[]; memoryEnabled: boolean; createdAt: string }
export interface FlowStep { id: string; kind: "prompt" | "agent"; refId: string; order: number }
export interface Flow { id: string; workspaceId: string; name: string; steps: FlowStep[]; createdAt: string }
export interface NotebookCell { id: string; type: "markdown" | "code"; content: string; output?: string }
export interface Notebook { id: string; workspaceId: string; name: string; cells: NotebookCell[]; createdAt: string }
export interface Dataset { id: string; workspaceId: string; name: string; format: string; rows: number; sizeKb: number; sampleRows: Record<string, unknown>[]; createdAt: string }
export interface Run { id: string; workspaceId: string; targetType: "prompt" | "agent" | "flow"; targetId: string; targetName: string; input: string; output: string; tokensUsed: number; latencyMs: number; status: string; createdAt: string }
