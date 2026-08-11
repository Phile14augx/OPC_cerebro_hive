import type {
  OperatingTaskArtifact as OperatingTaskArtifactContract,
  OperatingTaskDetail,
  OperatingTaskStatus,
  OperatingTaskStep as OperatingTaskStepContract,
  OperatingTaskSummary,
} from "../../../shared-types/src/domain/operating-system";

import { BaseRepository } from "./BaseRepository";
import type { IRepositoryOptions } from "./BaseRepository";

const ALLOWED: Record<OperatingTaskStatus, OperatingTaskStatus[]> = {
  QUEUED: ["RUNNING", "CANCELLED"],
  RUNNING: ["PAUSED", "COMPLETED", "FAILED", "CANCELLED"],
  PAUSED: ["RUNNING", "CANCELLED"],
  COMPLETED: [],
  FAILED: ["QUEUED"],
  CANCELLED: ["QUEUED"],
};

type TaskRow = {
  id: string;
  workspaceId: string;
  title: string;
  prompt: string | null;
  status: OperatingTaskStatus;
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
  steps?: StepRow[];
  artifacts?: ArtifactRow[];
  _count?: { artifacts: number };
};

type StepRow = {
  id: string;
  taskId: string;
  position: number;
  label: string;
  status: OperatingTaskStatus;
  detail: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
};

type ArtifactRow = {
  id: string;
  taskId: string;
  name: string;
  mediaType: string;
  uri: string;
  sizeBytes: bigint | null;
  metadata: unknown;
  createdAt: Date;
};

export interface CreateOperatingTaskInput {
  title: string;
  prompt?: string | null;
  targetType: string;
  targetId: string;
  input: unknown;
}

export interface AppendOperatingTaskStepInput {
  position: number;
  label: string;
  status?: OperatingTaskStatus;
  detail?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export interface AppendOperatingTaskArtifactInput {
  name: string;
  mediaType: string;
  uri: string;
  sizeBytes?: bigint | null;
  metadata?: unknown;
}

function iso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

function toSummary(row: TaskRow): OperatingTaskSummary {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    title: row.title,
    prompt: row.prompt,
    status: row.status,
    targetType: row.targetType,
    targetId: row.targetId,
    createdById: row.createdById,
    executionId: row.executionId,
    version: row.version,
    startedAt: iso(row.startedAt),
    completedAt: iso(row.completedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    artifactCount: row._count?.artifacts ?? row.artifacts?.length ?? 0,
  };
}

function toStep(row: StepRow): OperatingTaskStepContract {
  return {
    ...row,
    startedAt: iso(row.startedAt),
    completedAt: iso(row.completedAt),
  };
}

function toArtifact(row: ArtifactRow): OperatingTaskArtifactContract {
  return {
    ...row,
    sizeBytes: row.sizeBytes?.toString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

function toDetail(row: TaskRow): OperatingTaskDetail {
  return {
    ...toSummary(row),
    input: row.input,
    output: row.output,
    error: row.error,
    steps: (row.steps ?? []).map(toStep),
    artifacts: (row.artifacts ?? []).map(toArtifact),
  };
}

export class OperatingTaskRepository extends BaseRepository {
  private async verifiedWorkspace(options: IRepositoryOptions): Promise<string> {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);
    const { tenantId } = this.tenantFilter(options.context);
    const workspace = await db.workspace.findFirst({
      where: { id: workspaceId, tenantId },
      select: { id: true },
    });
    if (!workspace) throw new Error("Workspace not found or unauthorized");
    return workspaceId;
  }

  async create(
    input: CreateOperatingTaskInput,
    options: IRepositoryOptions,
  ): Promise<OperatingTaskDetail> {
    const db = this.getClient(options);
    const workspaceId = await this.verifiedWorkspace(options);
    const createdById = options.context.userId;
    if (!createdById) throw new Error("RequestContext must provide a userId to create a task.");

    const row = await db.operatingTask.create({
      data: {
        workspaceId,
        createdById,
        title: input.title,
        prompt: input.prompt ?? null,
        targetType: input.targetType,
        targetId: input.targetId,
        input: input.input as never,
      },
      include: { steps: true, artifacts: true },
    });
    return toDetail(row as unknown as TaskRow);
  }

  async list(options: IRepositoryOptions): Promise<OperatingTaskSummary[]> {
    const db = this.getClient(options);
    const workspaceId = await this.verifiedWorkspace(options);
    const rows = await db.operatingTask.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { artifacts: true } } },
    });
    return (rows as unknown as TaskRow[]).map(toSummary);
  }

  async getById(
    id: string,
    options: IRepositoryOptions,
  ): Promise<OperatingTaskDetail | null> {
    const db = this.getClient(options);
    const workspaceId = await this.verifiedWorkspace(options);
    const row = await db.operatingTask.findFirst({
      where: { id, workspaceId },
      include: {
        steps: { orderBy: { position: "asc" } },
        artifacts: { orderBy: { createdAt: "asc" } },
      },
    });
    return row ? toDetail(row as unknown as TaskRow) : null;
  }

  async transition(
    id: string,
    status: OperatingTaskStatus,
    options: IRepositoryOptions,
  ): Promise<OperatingTaskDetail> {
    const current = await this.getById(id, options);
    if (!current) throw new Error("Operating task not found");
    if (!ALLOWED[current.status].includes(status)) {
      throw new Error(`${current.status} cannot transition to ${status}`);
    }

    const db = this.getClient(options);
    const now = new Date();
    const timestamps =
      status === "RUNNING"
        ? { startedAt: current.startedAt ? undefined : now, completedAt: null }
        : status === "COMPLETED" || status === "FAILED" || status === "CANCELLED"
          ? { completedAt: now }
          : status === "QUEUED"
            ? { startedAt: null, completedAt: null }
            : {};
    const result = await db.operatingTask.updateMany({
      where: { id, workspaceId: current.workspaceId, version: current.version },
      data: { status, version: { increment: 1 }, ...timestamps },
    });
    if (result.count !== 1) throw new Error("Operating task update conflict");

    const updated = await this.getById(id, options);
    if (!updated) throw new Error("Operating task not found after transition");
    return updated;
  }

  async appendStep(
    taskId: string,
    input: AppendOperatingTaskStepInput,
    options: IRepositoryOptions,
  ): Promise<OperatingTaskStepContract> {
    const task = await this.getById(taskId, options);
    if (!task) throw new Error("Operating task not found");
    const row = await this.getClient(options).operatingTaskStep.create({
      data: { taskId, ...input },
    });
    return toStep(row as unknown as StepRow);
  }

  async appendArtifact(
    taskId: string,
    input: AppendOperatingTaskArtifactInput,
    options: IRepositoryOptions,
  ): Promise<OperatingTaskArtifactContract> {
    const task = await this.getById(taskId, options);
    if (!task) throw new Error("Operating task not found");
    const row = await this.getClient(options).operatingTaskArtifact.create({
      data: { ...input, taskId, metadata: input.metadata as never },
    });
    return toArtifact(row as unknown as ArtifactRow);
  }
}
