// ============================================================
// memory-sdk/src/types.ts
// ============================================================

export type MemoryTier =
  | "L0_active_context"
  | "L1_working_memory"
  | "L2_episodic"
  | "L3_semantic"
  | "L4_procedural"
  | "L5_organizational"
  | "L6_archive";

export type DataClassification =
  | "public"
  | "internal"
  | "confidential"
  | "restricted"
  | "secret";

export type ContentType = "text" | "json" | "embedding" | "artifact";

export interface MemoryRecord {
  memoryId: string;
  tier: MemoryTier;
  content: string;
  contentType: ContentType;
  embedding?: number[];
  source: string;
  agentId: string;
  instanceId?: string;
  missionId?: string;
  taskId?: string;
  tenantId: string;
  workspaceId: string;
  confidence: number; // 0-1
  sensitivity: DataClassification;
  ttlMs?: number;
  permissions: string[]; // agentIds that can read; empty = agent-private
  tags: string[];
  version: number;
  createdAt: string;
  accessedAt: string;
  expiresAt?: string;
  metadata: Record<string, unknown>;
  invalidated?: boolean;
}

export interface ResourceBudgetSummary {
  remaining: {
    tokens: number;
    costUsd: number;
  };
  percentUsed: number;
}

export interface ContextAssembly {
  systemPolicy: string;
  agentIdentity: string;
  role: string;
  missionContext?: string;
  currentTask?: string;
  relevantMemories: MemoryRecord[];
  currentState: Record<string, unknown>;
  toolSchemas?: unknown[];
  constraints: string[];
  budget: ResourceBudgetSummary;
  recentEvents: string[];
  estimatedTokens: number;
}

export interface MemoryQuery {
  tier?: MemoryTier | MemoryTier[];
  agentId?: string;
  missionId?: string;
  taskId?: string;
  tenantId: string;
  workspaceId?: string;
  tags?: string[];
  sensitivity?: DataClassification;
  query?: string; // free-text/keyword search
  topK?: number;
  includeExpired?: boolean;
  includeInvalidated?: boolean;
  permissions?: string; // agentId to check — returns records the agent can read
}
