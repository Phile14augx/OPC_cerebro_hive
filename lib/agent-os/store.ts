// ============================================================
// Agent OS — JSON File-Based Store
// ============================================================
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  AgentOsDatabase,
  AgentDefinition,
  AgentInstance,
  Mission,
  MissionEvent,
  Task,
  ExecutionRun,
  ApprovalRequest,
  ApprovalStatus,
  AuditEvent,
  Policy,
  Tool,
  BudgetAccount,
  AgentLifecycleState,
} from "./types";
import { seedDatabase } from "./seed";

const DB_PATH = path.join(process.cwd(), "data", "agent-os.json");

// ── Write-lock primitive ────────────────────────────────────
// mirrors the same pattern used in lib/db.ts
let writeLock: Promise<void> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeLock.then(fn);
  // swallow errors on the lock chain so the lock never stays broken
  writeLock = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

// ── DB bootstrap ────────────────────────────────────────────

const EMPTY_DB: AgentOsDatabase = {
  agents: [],
  instances: [],
  missions: [],
  tasks: [],
  executions: [],
  approvals: [],
  audit: [],
  policies: [],
  budgets: [],
  tools: [],
};

function isEmpty(db: AgentOsDatabase): boolean {
  return (
    db.agents.length === 0 &&
    db.missions.length === 0 &&
    db.tools.length === 0
  );
}

export async function getDb(): Promise<AgentOsDatabase> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as AgentOsDatabase;

    // Auto-seed if the file exists but is empty / missing collections
    if (isEmpty(parsed)) {
      const seeded = seedDatabase();
      await saveDb(seeded);
      return seeded;
    }

    // Ensure all collections exist even if the schema evolved
    return { ...EMPTY_DB, ...parsed };
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      // File missing — create dir, seed, write
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      const seeded = seedDatabase();
      await saveDb(seeded);
      return seeded;
    }
    throw err;
  }
}

export async function saveDb(data: AgentOsDatabase): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// ── Helpers ─────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

// ── Agent Definitions ────────────────────────────────────────

export async function getAgents(filters?: {
  type?: string;
  riskLevel?: string;
  isDeprecated?: boolean;
}): Promise<AgentDefinition[]> {
  const db = await getDb();
  let list = db.agents;
  if (filters?.type) list = list.filter((a) => a.type === filters.type);
  if (filters?.riskLevel) list = list.filter((a) => a.riskLevel === filters.riskLevel);
  if (filters?.isDeprecated !== undefined)
    list = list.filter((a) => a.isDeprecated === filters.isDeprecated);
  return list;
}

export async function getAgent(id: string): Promise<AgentDefinition | null> {
  const db = await getDb();
  return db.agents.find((a) => a.id === id) ?? null;
}

export async function createAgent(
  def: Omit<AgentDefinition, "id" | "createdAt" | "updatedAt" | "isDeprecated">
): Promise<AgentDefinition> {
  return withLock(async () => {
    const db = await getDb();
    const agent: AgentDefinition = {
      ...def,
      id: `agent_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      createdAt: now(),
      updatedAt: now(),
      isDeprecated: false,
    };
    db.agents.push(agent);
    await saveDb(db);
    return agent;
  });
}

export async function updateAgent(
  id: string,
  updates: Partial<AgentDefinition>
): Promise<AgentDefinition | null> {
  return withLock(async () => {
    const db = await getDb();
    const idx = db.agents.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    db.agents[idx] = { ...db.agents[idx], ...updates, updatedAt: now() };
    await saveDb(db);
    return db.agents[idx];
  });
}

// ── Agent Instances ──────────────────────────────────────────

export async function getInstances(filters?: {
  missionId?: string;
  state?: AgentLifecycleState;
  agentId?: string;
}): Promise<AgentInstance[]> {
  const db = await getDb();
  let list = db.instances;
  if (filters?.missionId) list = list.filter((i) => i.missionId === filters.missionId);
  if (filters?.state) list = list.filter((i) => i.state === filters.state);
  if (filters?.agentId) list = list.filter((i) => i.agentId === filters.agentId);
  return list;
}

export async function getInstance(id: string): Promise<AgentInstance | null> {
  const db = await getDb();
  return db.instances.find((i) => i.instanceId === id) ?? null;
}

export async function createInstance(
  data: Omit<AgentInstance, "instanceId" | "startedAt" | "lastHeartbeatAt">
): Promise<AgentInstance> {
  return withLock(async () => {
    const db = await getDb();
    const instance: AgentInstance = {
      ...data,
      instanceId: `inst_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      startedAt: now(),
      lastHeartbeatAt: now(),
    };
    db.instances.push(instance);
    await saveDb(db);
    return instance;
  });
}

export async function updateInstance(
  id: string,
  updates: Partial<AgentInstance>
): Promise<AgentInstance | null> {
  return withLock(async () => {
    const db = await getDb();
    const idx = db.instances.findIndex((i) => i.instanceId === id);
    if (idx === -1) return null;
    db.instances[idx] = {
      ...db.instances[idx],
      ...updates,
      lastHeartbeatAt: now(),
    };
    await saveDb(db);
    return db.instances[idx];
  });
}

// ── Missions ────────────────────────────────────────────────

export async function getMissions(filters?: {
  status?: string;
  tenantId?: string;
}): Promise<Mission[]> {
  const db = await getDb();
  let list = db.missions;
  if (filters?.status) list = list.filter((m) => m.status === filters.status);
  if (filters?.tenantId) list = list.filter((m) => m.tenantId === filters.tenantId);
  return list;
}

export async function getMission(id: string): Promise<Mission | null> {
  const db = await getDb();
  return db.missions.find((m) => m.missionId === id) ?? null;
}

export async function createMission(
  data: Omit<Mission, "missionId" | "createdAt" | "updatedAt" | "events" | "artifacts" | "taskIds" | "assignedAgentIds">
): Promise<Mission> {
  return withLock(async () => {
    const db = await getDb();
    const mission: Mission = {
      ...data,
      missionId: `msn_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      assignedAgentIds: [],
      taskIds: [],
      events: [],
      artifacts: [],
      createdAt: now(),
      updatedAt: now(),
    };
    db.missions.push(mission);
    await saveDb(db);
    return mission;
  });
}

export async function updateMission(
  id: string,
  updates: Partial<Mission>
): Promise<Mission | null> {
  return withLock(async () => {
    const db = await getDb();
    const idx = db.missions.findIndex((m) => m.missionId === id);
    if (idx === -1) return null;
    db.missions[idx] = { ...db.missions[idx], ...updates, updatedAt: now() };
    await saveDb(db);
    return db.missions[idx];
  });
}

export async function addMissionEvent(
  missionId: string,
  event: Omit<MissionEvent, "eventId" | "timestamp">
): Promise<void> {
  return withLock(async () => {
    const db = await getDb();
    const idx = db.missions.findIndex((m) => m.missionId === missionId);
    if (idx === -1) throw new Error(`Mission ${missionId} not found`);
    const fullEvent: MissionEvent = {
      ...event,
      eventId: `evt_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      timestamp: now(),
    };
    db.missions[idx].events.push(fullEvent);
    db.missions[idx].updatedAt = now();
    await saveDb(db);
  });
}

// ── Tasks ───────────────────────────────────────────────────

export async function getTasks(missionId?: string): Promise<Task[]> {
  const db = await getDb();
  if (missionId) return db.tasks.filter((t) => t.missionId === missionId);
  return db.tasks;
}

export async function getTask(id: string): Promise<Task | null> {
  const db = await getDb();
  return db.tasks.find((t) => t.taskId === id) ?? null;
}

export async function createTask(
  data: Omit<Task, "taskId" | "createdAt" | "updatedAt" | "retryCount" | "executionRunIds">
): Promise<Task> {
  return withLock(async () => {
    const db = await getDb();
    const task: Task = {
      ...data,
      taskId: `tsk_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      retryCount: 0,
      executionRunIds: [],
      createdAt: now(),
      updatedAt: now(),
    };
    db.tasks.push(task);

    // Register taskId on the mission
    const mIdx = db.missions.findIndex((m) => m.missionId === data.missionId);
    if (mIdx !== -1 && !db.missions[mIdx].taskIds.includes(task.taskId)) {
      db.missions[mIdx].taskIds.push(task.taskId);
      db.missions[mIdx].updatedAt = now();
    }

    await saveDb(db);
    return task;
  });
}

export async function updateTask(
  id: string,
  updates: Partial<Task>
): Promise<Task | null> {
  return withLock(async () => {
    const db = await getDb();
    const idx = db.tasks.findIndex((t) => t.taskId === id);
    if (idx === -1) return null;
    db.tasks[idx] = { ...db.tasks[idx], ...updates, updatedAt: now() };
    await saveDb(db);
    return db.tasks[idx];
  });
}

// ── Execution Runs ───────────────────────────────────────────

export async function getExecutions(filters?: {
  taskId?: string;
  missionId?: string;
  agentId?: string;
}): Promise<ExecutionRun[]> {
  const db = await getDb();
  let list = db.executions;
  if (filters?.taskId) list = list.filter((e) => e.taskId === filters.taskId);
  if (filters?.missionId) list = list.filter((e) => e.missionId === filters.missionId);
  if (filters?.agentId) list = list.filter((e) => e.agentId === filters.agentId);
  return list;
}

export async function createExecution(
  data: Omit<ExecutionRun, "runId" | "createdAt">
): Promise<ExecutionRun> {
  return withLock(async () => {
    const db = await getDb();
    const run: ExecutionRun = {
      ...data,
      runId: `run_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      createdAt: now(),
    };
    db.executions.push(run);

    // Register runId on the task
    const tIdx = db.tasks.findIndex((t) => t.taskId === data.taskId);
    if (tIdx !== -1 && !db.tasks[tIdx].executionRunIds.includes(run.runId)) {
      db.tasks[tIdx].executionRunIds.push(run.runId);
      db.tasks[tIdx].updatedAt = now();
    }

    await saveDb(db);
    return run;
  });
}

// ── Approvals ───────────────────────────────────────────────

export async function getApprovals(status?: ApprovalStatus): Promise<ApprovalRequest[]> {
  const db = await getDb();
  if (status) return db.approvals.filter((a) => a.status === status);
  return db.approvals;
}

export async function getApproval(id: string): Promise<ApprovalRequest | null> {
  const db = await getDb();
  return db.approvals.find((a) => a.requestId === id) ?? null;
}

export async function createApproval(
  data: Omit<ApprovalRequest, "requestId" | "requestedAt" | "status">
): Promise<ApprovalRequest> {
  return withLock(async () => {
    const db = await getDb();
    const approval: ApprovalRequest = {
      ...data,
      requestId: `apr_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      status: "pending",
      requestedAt: now(),
    };
    db.approvals.push(approval);
    await saveDb(db);
    return approval;
  });
}

export async function updateApproval(
  id: string,
  updates: Partial<ApprovalRequest>
): Promise<ApprovalRequest | null> {
  return withLock(async () => {
    const db = await getDb();
    const idx = db.approvals.findIndex((a) => a.requestId === id);
    if (idx === -1) return null;
    db.approvals[idx] = { ...db.approvals[idx], ...updates };
    await saveDb(db);
    return db.approvals[idx];
  });
}

// ── Audit ───────────────────────────────────────────────────

export async function recordAudit(
  event: Omit<AuditEvent, "eventId" | "timestamp">
): Promise<AuditEvent> {
  return withLock(async () => {
    const db = await getDb();
    const full: AuditEvent = {
      ...event,
      eventId: `aud_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      timestamp: now(),
    };
    db.audit.push(full);
    await saveDb(db);
    return full;
  });
}

export async function getAudit(filters?: {
  agentId?: string;
  missionId?: string;
  taskId?: string;
  from?: string;
  to?: string;
  outcome?: "success" | "failure";
}): Promise<AuditEvent[]> {
  const db = await getDb();
  let list = db.audit;
  if (filters?.agentId) list = list.filter((e) => e.agentId === filters.agentId);
  if (filters?.missionId) list = list.filter((e) => e.missionId === filters.missionId);
  if (filters?.taskId) list = list.filter((e) => e.taskId === filters.taskId);
  if (filters?.outcome) list = list.filter((e) => e.outcome === filters.outcome);
  if (filters?.from) {
    const from = new Date(filters.from).getTime();
    list = list.filter((e) => new Date(e.timestamp).getTime() >= from);
  }
  if (filters?.to) {
    const to = new Date(filters.to).getTime();
    list = list.filter((e) => new Date(e.timestamp).getTime() <= to);
  }
  // newest first
  return list.slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// ── Policies ────────────────────────────────────────────────

export async function getPolicies(): Promise<Policy[]> {
  const db = await getDb();
  return db.policies.slice().sort((a, b) => a.priority - b.priority);
}

export async function getPolicy(id: string): Promise<Policy | null> {
  const db = await getDb();
  return db.policies.find((p) => p.policyId === id) ?? null;
}

export async function updatePolicy(
  id: string,
  updates: Partial<Policy>
): Promise<Policy | null> {
  return withLock(async () => {
    const db = await getDb();
    const idx = db.policies.findIndex((p) => p.policyId === id);
    if (idx === -1) return null;
    db.policies[idx] = { ...db.policies[idx], ...updates };
    await saveDb(db);
    return db.policies[idx];
  });
}

// ── Tools ───────────────────────────────────────────────────

export async function getTools(): Promise<Tool[]> {
  const db = await getDb();
  return db.tools;
}

// ── Budgets ─────────────────────────────────────────────────

export async function getBudgets(filters?: {
  agentId?: string;
  missionId?: string;
  type?: "agent" | "mission" | "tenant";
}): Promise<BudgetAccount[]> {
  const db = await getDb();
  let list = db.budgets;
  if (filters?.agentId) list = list.filter((b) => b.agentId === filters.agentId);
  if (filters?.missionId) list = list.filter((b) => b.missionId === filters.missionId);
  if (filters?.type) list = list.filter((b) => b.type === filters.type);
  return list;
}

export async function updateBudget(
  id: string,
  updates: Partial<BudgetAccount>
): Promise<BudgetAccount | null> {
  return withLock(async () => {
    const db = await getDb();
    const idx = db.budgets.findIndex((b) => b.accountId === id);
    if (idx === -1) return null;
    db.budgets[idx] = { ...db.budgets[idx], ...updates, updatedAt: now() };
    await saveDb(db);
    return db.budgets[idx];
  });
}

// ── Aggregate Metrics ────────────────────────────────────────

export async function getMetrics() {
  const db = await getDb();

  const activeAgents = db.instances.filter(
    (i) => i.state === "running" || i.state === "queued" || i.state === "waiting"
  ).length;

  const runningMissions = db.missions.filter((m) => m.status === "running").length;

  const pendingApprovals = db.approvals.filter((a) => a.status === "pending").length;

  const failedExecutions = db.executions.filter((e) => e.status === "failed").length;

  const totalCostUsd = db.executions.reduce((sum, e) => sum + (e.costUsd ?? 0), 0);

  const completedRuns = db.executions.filter((e) => e.status === "completed").length;
  const totalRuns = db.executions.length;
  const avgSuccessRate = totalRuns > 0 ? completedRuns / totalRuns : 0;

  const tokensUsed = db.executions.reduce((sum, e) => sum + (e.tokensUsed ?? 0), 0);

  const policyDenials = db.audit.filter(
    (e) => e.operation === "policy_deny" && e.outcome === "failure"
  ).length;

  return {
    activeAgents,
    runningMissions,
    pendingApprovals,
    failedExecutions,
    totalCostUsd: Number(totalCostUsd.toFixed(4)),
    avgSuccessRate: Number(avgSuccessRate.toFixed(4)),
    tokensUsed,
    policyDenials,
  };
}
