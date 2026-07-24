/**
 * @cerebro/db — Agent & AgentRun Repositories
 */

import { type Agent, type AgentRun, type Prisma, prisma } from "../client/index.js";

export interface CreateAgentInput {
  orgId:       string;
  name:        string;
  slug:        string;
  description?: string;
  definition:  Prisma.JsonValue;
  systemPrompt?: string;
  tools:       Prisma.JsonValue;
  createdById: string;
  version?:    string;
  modelId?:    string;
  temperature?: number;
  maxTokens?:  number;
  memoryEnabled?: boolean;
  memoryConfig?:  Prisma.JsonValue;
}

export interface UpdateAgentInput {
  name?:         string;
  description?:  string;
  definition?:   Prisma.JsonValue;
  systemPrompt?: string;
  tools?:        Prisma.JsonValue;
  modelId?:      string;
  temperature?:  number;
  maxTokens?:    number;
  updatedById:   string;
}

export const agentRepository = {
  async create(input: CreateAgentInput): Promise<Agent> {
    return prisma.agent.create({
      data: {
        ...input,
        updatedById: input.createdById,
        version:     input.version ?? "1.0.0",
      },
    });
  },

  async findById(id: string, orgId: string): Promise<Agent | null> {
    return prisma.agent.findFirst({ where: { id, orgId } });
  },

  async findBySlug(orgId: string, slug: string, version?: string): Promise<Agent | null> {
    return prisma.agent.findFirst({
      where: { orgId, slug, ...(version && { version }) },
    });
  },

  async findByIdOrThrow(id: string, orgId: string): Promise<Agent> {
    const agent = await this.findById(id, orgId);
    if (!agent) throw Object.assign(new Error(`Agent ${id} not found`), { code: "NOT_FOUND" });
    return agent;
  },

  async list(orgId: string, options: {
    status?: string[];
    search?: string;
    page?:   number;
    limit?:  number;
  } = {}): Promise<{ items: Agent[]; total: number }> {
    const { status, search, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.AgentWhereInput = {
      orgId,
      ...(status?.length && { status: { in: status as Prisma.EnumAgentStatusFilter["in"] } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.agent.findMany({ where, skip, take: limit, orderBy: { updatedAt: "desc" } }),
      prisma.agent.count({ where }),
    ]);

    return { items, total };
  },

  async update(id: string, input: UpdateAgentInput): Promise<Agent> {
    return prisma.agent.update({
      where: { id },
      data:  { ...input, updatedAt: new Date() },
    });
  },

  async updateMetrics(id: string, runDurationMs: number, success: boolean): Promise<void> {
    await prisma.agent.update({
      where: { id },
      data: {
        totalRuns:     { increment: 1 },
        successfulRuns: success ? { increment: 1 } : undefined,
        failedRuns:    !success ? { increment: 1 } : undefined,
        avgDurationMs: undefined, // handled in application layer
      },
    });
  },

  async deprecate(id: string, orgId: string, userId: string): Promise<Agent> {
    return prisma.agent.update({
      where: { id },
      data:  { status: "DEPRECATED", updatedById: userId, updatedAt: new Date() },
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.agent.delete({ where: { id } });
  },
};

// ── Agent Run repository ──────────────────────────────────────────────────────

export interface CreateAgentRunInput {
  agentId:         string;
  orgId:           string;
  workflowExecId?: string;
  triggeredById?:  string;
  input:           Prisma.JsonValue;
  modelId:         string;
}

export interface CompleteAgentRunInput {
  status:         string;
  output?:        Prisma.JsonValue;
  messages:       Prisma.JsonValue;
  toolCalls?:     Prisma.JsonValue;
  completedAt:    Date;
  durationMs:     number;
  inputTokens:    number;
  outputTokens:   number;
  totalTokens:    number;
  costUsd:        number | string;
  toolCallsCount: number;
  memoryReads:    number;
  memoryWrites:   number;
  error?:         Prisma.JsonValue;
}

export const agentRunRepository = {
  async create(input: CreateAgentRunInput): Promise<AgentRun> {
    return prisma.agentRun.create({
      data: {
        ...input,
        status: "RUNNING",
      },
    });
  },

  async findById(id: string, orgId: string): Promise<AgentRun | null> {
    return prisma.agentRun.findFirst({ where: { id, orgId } });
  },

  async complete(id: string, data: CompleteAgentRunInput): Promise<AgentRun> {
    return prisma.agentRun.update({
      where: { id },
      data:  data as Prisma.AgentRunUpdateInput,
    });
  },

  async list(orgId: string, options: {
    agentId?: string;
    status?:  string[];
    page?:    number;
    limit?:   number;
  } = {}): Promise<{ items: AgentRun[]; total: number }> {
    const { agentId, status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.AgentRunWhereInput = {
      orgId,
      ...(agentId         && { agentId }),
      ...(status?.length  && { status: { in: status as Prisma.EnumRunStatusFilter["in"] } }),
    };

    const [items, total] = await Promise.all([
      prisma.agentRun.findMany({ where, skip, take: limit, orderBy: { startedAt: "desc" } }),
      prisma.agentRun.count({ where }),
    ]);

    return { items, total };
  },
};
