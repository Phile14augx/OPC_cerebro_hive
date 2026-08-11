import { describe, expect, it } from "vitest";

import type { PrismaTransactionClient } from "./BaseRepository";
import { OperatingTaskRepository } from "./OperatingTaskRepository";

const WORKSPACE_A = "00000000-0000-4000-8000-00000000000a";
const WORKSPACE_B = "00000000-0000-4000-8000-00000000000b";
const USER_ID = "00000000-0000-4000-8000-000000000001";
const TASK_ID = "00000000-0000-4000-8000-000000000010";

type TaskRow = {
  id: string;
  workspaceId: string;
  title: string;
  prompt: string | null;
  status: "QUEUED" | "RUNNING" | "PAUSED" | "COMPLETED" | "FAILED" | "CANCELLED";
  targetType: string;
  targetId: string;
  createdById: string;
  executionId: string | null;
  input: unknown;
  output: unknown;
  error: unknown;
  version: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  steps: unknown[];
  artifacts: unknown[];
};

function fakeClient(seed: TaskRow[] = [], failUpdates = false) {
  const tasks = seed.map((task) => ({ ...task }));
  let sequence = tasks.length;

  const client = {
    workspace: {
      findFirst: async ({ where }: { where: { id: string; tenantId: string } }) =>
        where.tenantId === "tenant-a" && where.id === WORKSPACE_A
          ? { id: WORKSPACE_A }
          : null,
    },
    operatingTask: {
      create: async ({ data }: { data: Omit<TaskRow, "id" | "status" | "version" | "startedAt" | "completedAt" | "createdAt" | "updatedAt" | "steps" | "artifacts" | "output" | "error" | "executionId"> }) => {
        const now = new Date("2026-08-09T00:00:00.000Z");
        const task: TaskRow = {
          ...data,
          id: sequence++ === 0 ? TASK_ID : `00000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
          status: "QUEUED",
          version: 1,
          executionId: null,
          output: null,
          error: null,
          startedAt: null,
          completedAt: null,
          createdAt: now,
          updatedAt: now,
          steps: [],
          artifacts: [],
        };
        tasks.push(task);
        return task;
      },
      findMany: async ({ where }: { where: { workspaceId: string } }) =>
        tasks.filter((task) => task.workspaceId === where.workspaceId),
      findFirst: async ({ where }: { where: { id: string; workspaceId: string } }) =>
        tasks.find((task) => task.id === where.id && task.workspaceId === where.workspaceId) ?? null,
      updateMany: async ({ where, data }: { where: { id: string; workspaceId: string; version: number }; data: Record<string, unknown> }) => {
        if (failUpdates) return { count: 0 };
        const task = tasks.find(
          (candidate) =>
            candidate.id === where.id &&
            candidate.workspaceId === where.workspaceId &&
            candidate.version === where.version,
        );
        if (!task) return { count: 0 };
        const { version: _version, ...updates } = data;
        Object.assign(task, updates, { version: task.version + 1 });
        return { count: 1 };
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const task = tasks.find((candidate) => candidate.id === where.id);
        if (!task) throw new Error("not found");
        Object.assign(task, data, { version: task.version + 1 });
        return task;
      },
    },
    operatingTaskStep: {
      create: async ({ data }: { data: Record<string, unknown> }) => ({
        id: "00000000-0000-4000-8000-000000000020",
        status: "QUEUED",
        startedAt: null,
        completedAt: null,
        ...data,
      }),
    },
    operatingTaskArtifact: {
      create: async ({ data }: { data: Record<string, unknown> }) => ({
        id: "00000000-0000-4000-8000-000000000030",
        createdAt: new Date("2026-08-09T00:00:00.000Z"),
        ...data,
      }),
    },
  };

  return { client: client as unknown as PrismaTransactionClient, tasks };
}

function opts(tx: PrismaTransactionClient, workspaceId = WORKSPACE_A) {
  return {
    context: { tenantId: "tenant-a", workspaceId, userId: USER_ID },
    tx,
  };
}

function queuedTask(workspaceId = WORKSPACE_A): TaskRow {
  const now = new Date("2026-08-09T00:00:00.000Z");
  return {
    id: TASK_ID,
    workspaceId,
    title: "Audit docs",
    prompt: null,
    status: "QUEUED",
    targetType: "agent",
    targetId: "agent-a",
    createdById: USER_ID,
    executionId: null,
    input: {},
    output: null,
    error: null,
    version: 1,
    startedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    steps: [],
    artifacts: [],
  };
}

describe("OperatingTaskRepository", () => {
  const repository = new OperatingTaskRepository({} as never);

  it("creates a queued task in the verified workspace", async () => {
    const { client } = fakeClient();
    const task = await repository.create(
      { title: "Audit docs", targetType: "agent", targetId: "agent-a", input: {} },
      opts(client),
    );

    expect(task.status).toBe("QUEUED");
    expect(task.workspaceId).toBe(WORKSPACE_A);
    expect(task.createdById).toBe(USER_ID);
  });

  it("rejects an invalid status transition", async () => {
    const { client } = fakeClient([queuedTask()]);

    await expect(
      repository.transition(TASK_ID, "COMPLETED", opts(client)),
    ).rejects.toThrow("QUEUED cannot transition to COMPLETED");
  });

  it("increments the version when a transition succeeds", async () => {
    const { client } = fakeClient([queuedTask()]);
    const task = await repository.transition(TASK_ID, "RUNNING", opts(client));

    expect(task.status).toBe("RUNNING");
    expect(task.version).toBe(2);
    expect(Date.parse(task.startedAt ?? "")).not.toBeNaN();
  });

  it("does not reveal tasks from another workspace", async () => {
    const { client } = fakeClient([queuedTask(WORKSPACE_B)]);

    await expect(repository.getById(TASK_ID, opts(client))).resolves.toBeNull();
    await expect(repository.list(opts(client))).resolves.toEqual([]);
  });

  it("reports an optimistic concurrency conflict", async () => {
    const { client } = fakeClient([queuedTask()], true);

    await expect(
      repository.transition(TASK_ID, "RUNNING", opts(client)),
    ).rejects.toThrow("Operating task update conflict");
  });

  it("appends steps and artifact references only to a scoped task", async () => {
    const { client } = fakeClient([queuedTask()]);

    const step = await repository.appendStep(
      TASK_ID,
      { position: 1, label: "Scan" },
      opts(client),
    );
    const artifact = await repository.appendArtifact(
      TASK_ID,
      { name: "report.md", mediaType: "text/markdown", uri: "s3://reports/report.md", sizeBytes: 42n },
      opts(client),
    );

    expect(step).toMatchObject({ taskId: TASK_ID, position: 1, label: "Scan" });
    expect(artifact).toMatchObject({ taskId: TASK_ID, uri: "s3://reports/report.md" });
  });

  it("persists an execution id without losing workspace scoping", async () => {
    const { client } = fakeClient([queuedTask()]);
    const executionId = "00000000-0000-4000-8000-000000000099";

    const task = await repository.attachExecution(TASK_ID, executionId, opts(client));

    expect(task.executionId).toBe(executionId);
    await expect(repository.attachExecution(TASK_ID, executionId, opts(client, WORKSPACE_B))).rejects.toThrow("Operating task not found");
  });
});
