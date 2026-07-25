/**
 * @cerebro/db — Workflow Repository
 * Typed data-access layer for Workflow + WorkflowExecution entities.
 */

import { type Prisma, type Workflow, type WorkflowExecution, prisma } from "../client/index.js";

// ── Workflow repository ────────────────────────────────────────────────────────

export interface CreateWorkflowInput {
  orgId:        string;
  name:         string;
  description?: string;
  definition:   Prisma.JsonValue;
  tags?:        string[];
  createdById:  string;
}

export interface UpdateWorkflowInput {
  name?:        string;
  description?: string;
  definition?:  Prisma.InputJsonValue;
  variables?:   Prisma.InputJsonValue;
  triggers?:    Prisma.InputJsonValue;
  settings?:    Prisma.InputJsonValue;
  tags?:        string[];
  updatedById:  string;
}

export interface ListWorkflowsOptions {
  orgId:    string;
  status?:  string[];
  tags?:    string[];
  search?:  string;
  page?:    number;
  limit?:   number;
}

export const workflowRepository = {
  async create(input: CreateWorkflowInput): Promise<Workflow> {
    return prisma.workflow.create({
      data: {
        ...input,
        definition: input.definition ?? {},
        updatedById: input.createdById,
      },
    });
  },

  async findById(id: string, orgId: string): Promise<Workflow | null> {
    return prisma.workflow.findFirst({
      where: { id, orgId },
    });
  },

  async findByIdOrThrow(id: string, orgId: string): Promise<Workflow> {
    const workflow = await this.findById(id, orgId);
    if (!workflow) {
      throw Object.assign(new Error(`Workflow ${id} not found`), { code: "NOT_FOUND" });
    }
    return workflow;
  },

  async list(options: ListWorkflowsOptions): Promise<{ items: Workflow[]; total: number }> {
    const { orgId, status, tags, search, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkflowWhereInput = {
      orgId,
      ...(status?.length && { status: { in: status as Prisma.EnumWorkflowStatusFilter["in"] } }),
      ...(tags?.length   && { tags:   { hasSome: tags } }),
      ...(search         && {
        OR: [
          { name:        { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.workflow.count({ where }),
    ]);

    return { items, total };
  },

  async update(id: string, orgId: string, input: UpdateWorkflowInput): Promise<Workflow> {
    return prisma.workflow.update({
      where: { id },
      data:  { ...input, updatedAt: new Date() },
    });
  },

  async publish(id: string, orgId: string, userId: string): Promise<Workflow> {
    return prisma.workflow.update({
      where: { id },
      data: {
        status:      "PUBLISHED",
        publishedAt: new Date(),
        version:     { increment: 1 },
        updatedById: userId,
        updatedAt:   new Date(),
      },
    });
  },

  async archive(id: string, orgId: string, userId: string): Promise<Workflow> {
    return prisma.workflow.update({
      where: { id },
      data:  { status: "ARCHIVED", updatedById: userId, updatedAt: new Date() },
    });
  },

  async delete(id: string, orgId: string): Promise<void> {
    await prisma.workflow.delete({ where: { id } });
  },
};

// ── Execution repository ──────────────────────────────────────────────────────

export interface CreateExecutionInput {
  workflowId:          string;
  orgId:               string;
  triggeredById?:      string;
  triggerType?:        string;
  input?:              Prisma.JsonValue;
  testMode?:           boolean;
  temporalWorkflowId?: string;
  temporalRunId?:      string;
}

export interface UpdateExecutionInput {
  status?:            string;
  output?:            Prisma.JsonValue;
  stepExecutions?:    Prisma.JsonValue;
  completedAt?:       Date;
  durationMs?:        number;
  aiCallsCount?:      number;
  totalTokensUsed?:   number;
  totalCostUsd?:      number | string;
  error?:             Prisma.JsonValue;
}

export const executionRepository = {
  async create(input: CreateExecutionInput): Promise<WorkflowExecution> {
    return prisma.workflowExecution.create({
      data: {
        workflowId:         input.workflowId,
        orgId:              input.orgId,
        triggeredById:      input.triggeredById,
        triggerType:        input.triggerType ?? "manual",
        input:              (input.input as Prisma.JsonValue) ?? {},
        status:             "QUEUED",
        testMode:           input.testMode ?? false,
        temporalWorkflowId: input.temporalWorkflowId,
        temporalRunId:      input.temporalRunId,
      },
    });
  },

  async findById(id: string, orgId: string): Promise<WorkflowExecution | null> {
    return prisma.workflowExecution.findFirst({ where: { id, orgId } });
  },

  async findByTemporalId(temporalWorkflowId: string): Promise<WorkflowExecution | null> {
    return prisma.workflowExecution.findFirst({ where: { temporalWorkflowId } });
  },

  async update(id: string, input: UpdateExecutionInput): Promise<WorkflowExecution> {
    return prisma.workflowExecution.update({
      where: { id },
      data:  input as Prisma.WorkflowExecutionUpdateInput,
    });
  },

  async list(orgId: string, options: {
    workflowId?: string;
    status?:     string[];
    page?:       number;
    limit?:      number;
  } = {}): Promise<{ items: WorkflowExecution[]; total: number }> {
    const { workflowId, status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkflowExecutionWhereInput = {
      orgId,
      ...(workflowId          && { workflowId }),
      ...(status?.length      && { status: { in: status as Prisma.EnumExecutionStatusFilter["in"] } }),
    };

    const [items, total] = await Promise.all([
      prisma.workflowExecution.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { startedAt: "desc" },
      }),
      prisma.workflowExecution.count({ where }),
    ]);

    return { items, total };
  },
};
