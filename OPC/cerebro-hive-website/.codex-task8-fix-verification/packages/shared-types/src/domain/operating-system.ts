export const OPERATING_NODE_TYPES = [
  "department",
  "agent",
  "tool",
  "model",
  "skill",
  "data-source",
  "memory",
  "workflow",
  "task",
  "output",
  "human",
  "system",
  "integration",
] as const;

export type OperatingNodeType = (typeof OPERATING_NODE_TYPES)[number];
export type OperatingStatus =
  | "healthy"
  | "idle"
  | "running"
  | "degraded"
  | "failed"
  | "offline";
export type OperatingRelationship =
  | "REPORTS_TO"
  | "COLLABORATES_WITH"
  | "USES"
  | "DELEGATES_TO"
  | "READS_FROM"
  | "WRITES_TO"
  | "SHARES_MEMORY_WITH"
  | "TRIGGERS"
  | "DEPENDS_ON"
  | "PRODUCES";

export interface OperatingNode {
  id: string;
  type: OperatingNodeType;
  label: string;
  status: OperatingStatus;
  departmentId: string | null;
  detailUrl: string;
  tags: string[];
  health: { score: number | null; lastActivityAt: string | null };
  summary: Record<string, string | number | boolean | null>;
}

export interface OperatingEdge {
  id: string;
  source: string;
  target: string;
  relationship: OperatingRelationship;
  status: OperatingStatus;
  lastActivityAt: string | null;
  intensity: number;
}

export interface OperatingGraphSnapshot {
  revision: string;
  generatedAt: string;
  mode: "live" | "demo";
  nodes: OperatingNode[];
  edges: OperatingEdge[];
}

export type DemoMode = "live" | "demo";

export interface OperatingCommand {
  id: string;
  kind: "local" | "create-task" | "execute-agent";
  text: string;
  targetType: OperatingNodeType | null;
  targetId: string | null;
  state:
    | "parsing"
    | "validating"
    | "dispatched"
    | "running"
    | "completed"
    | "failed"
    | "cancelled";
}

export interface OperatingEvent {
  id: string;
  type: string;
  workspaceId: string;
  entityType: OperatingNodeType | "command" | "funnel-item";
  entityId: string;
  occurredAt: string;
  status: OperatingStatus;
  summary: Record<string, string | number | boolean | null>;
}

export interface EntityDetail {
  node: OperatingNode;
  metrics: Record<string, number | null>;
  relationships: OperatingEdge[];
  actions: Array<{ id: string; label: string; href?: string }>;
}

export const OPERATING_TASK_STATUSES = [
  "QUEUED",
  "RUNNING",
  "PAUSED",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;

export type OperatingTaskStatus = (typeof OPERATING_TASK_STATUSES)[number];

export interface OperatingTaskStep {
  id: string;
  taskId: string;
  position: number;
  label: string;
  status: OperatingTaskStatus;
  detail: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface OperatingTaskArtifact {
  id: string;
  taskId: string;
  name: string;
  mediaType: string;
  uri: string;
  sizeBytes: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface OperatingTaskSummary {
  id: string;
  workspaceId: string;
  title: string;
  prompt: string | null;
  status: OperatingTaskStatus;
  targetType: string;
  targetId: string;
  createdById: string;
  executionId: string | null;
  version: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  artifactCount: number;
}

export interface OperatingTaskDetail extends OperatingTaskSummary {
  input: unknown;
  output: unknown;
  error: unknown;
  steps: OperatingTaskStep[];
  artifacts: OperatingTaskArtifact[];
}

export function isOperatingNodeType(
  value: unknown,
): value is OperatingNodeType {
  return (
    typeof value === "string" &&
    (OPERATING_NODE_TYPES as readonly string[]).includes(value)
  );
}
