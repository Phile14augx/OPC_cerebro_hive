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

// ---------------- Flow (workflow orchestration) ----------------

export interface WorkflowNode { id: string; type: "task" | "agent" | "approval" | "branch" | "delay" | "compensation"; name: string; config: Record<string, unknown>; next: string[] }
export interface WorkflowDefinition { entry: string; nodes: WorkflowNode[]; triggers: { type: string; config: Record<string, unknown> }[] }
export interface Workflow { id: string; organizationId: string; name: string; version: number; definition: WorkflowDefinition; status: "active" | "disabled"; createdAt: string; updatedAt: string }
export interface WorkflowRun {
  id: string; workflowId: string; organizationId: string;
  status: "running" | "waiting_approval" | "completed" | "failed" | "compensated";
  trigger: string; input: Record<string, unknown>;
  state: { completed: string[]; outputs: Record<string, string>; pendingApproval?: { nodeId: string; approvalId: string } };
  error?: string; startedAt: string; finishedAt?: string;
}

/** Build a single-task workflow definition — the simplest valid, schema-compliant shape. */
export function singleTaskDefinition(taskName: string): WorkflowDefinition {
  return { entry: "start", nodes: [{ id: "start", type: "task", name: taskName, config: { goal: taskName }, next: [] }], triggers: [{ type: "manual", config: {} }] };
}
/** Build a two-step workflow with a human approval gate before the task runs. */
export function approvalGatedDefinition(taskName: string, approverRole: string): WorkflowDefinition {
  return {
    entry: "gate",
    nodes: [
      { id: "gate", type: "approval", name: `Approve: ${taskName}`, config: { approverRole }, next: ["run"] },
      { id: "run", type: "task", name: taskName, config: { goal: taskName }, next: [] },
    ],
    triggers: [{ type: "manual", config: {} }],
  };
}

// ---------------- Connect (integration hub) ----------------

export interface ConnectorDescriptor { kind: string; title: string; category: "chat" | "dev" | "crm" | "erp" | "cloud" | "storage" | "generic"; auth: "none" | "token" | "oauth"; operations: string[] }
export interface ConnectorInstance { id: string; organizationId: string; kind: string; name: string; config: Record<string, string>; status: "configured" | "error" }

// ---------------- Governance (approvals — reused from HiveShield) ----------------

export type ApprovalStatus = "pending" | "approved" | "rejected";
export interface Approval {
  id: string; organizationId: string; subjectKind: string; subjectId: string;
  requestedBy: string; approverRole: string; status: ApprovalStatus;
  reason?: string; decidedBy?: string; decidedAt?: string; createdAt: string;
}
