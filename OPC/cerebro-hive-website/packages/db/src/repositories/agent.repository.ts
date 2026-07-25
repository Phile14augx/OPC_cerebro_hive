/**
 * @cerebro/db — Agent & AgentRun Repositories
 * Aligned to actual Prisma schema field names.
 */

import { type Agent, type AgentRun, type Prisma, type ExecutionStatus, prisma } from "../client/index.js";
import { randomUUID } from "node:crypto";

// Agent schema: id, orgId, name, slug, version, description, capabilities, tools (Json),
// model (String), systemPrompt (String), maxIterations, timeoutMs, status, isBuiltin, tags,
// metrics (Json), createdById, updatedById, createdAt, updatedAt

export interface CreateAgentInput {
  orgId:         string;
  name:          string;
  slug:          string;
  description?:  string;
  model:         string;   // schema field is `model`, not `modelId`
  systemPrompt:  string;
  tools?:        Prisma.InputJsonValue;
  capabilities?: string[];
  tags?:         string[];
  maxIterations?: number;
  timeoutMs?:    number;
  createdById?:  string;
  version?:      string;
}

export interface UpdateAgentInput {
  name?:          string;
  description?:   string;
  systemPrompt?:  string;
  model?:         string;
  tools?:         Prisma.InputJsonValue;
  capabilities?:  string[];
  tags?:          string[];
  maxIterations?: number;
  timeoutMs?:     number;
  updatedById?:   string;
}

export const agentRepository = {
  async create(input: CreateAgentInput): Promise<Agent> {
    return prisma.agent.create({
      data: {
        orgId:         input.orgId,
        name:          input.name,
        slug:          input.slug,
        description:   input.description ?? "",
        model:         input.model,
        systemPrompt:  input.systemPrompt,
        tools:         input.tools ?? [],
        capabilities:  input.capabilities ?? [],
        tags:          input.tags ?? [],
        maxIterations: input.maxIterations,
        timeoutMs:     input.timeoutMs,
        createdById:   input.createdById,
        updatedById:   input.createdById,
        version:       input.version ?? "1.0.0",
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

  async updateMetrics(id: string, _runDurationMs: number, _success: boolean): Promise<void> {
    // Metrics are tracked in the `metrics` Json field — update via application layer
    // The schema has no totalRuns/successfulRuns scalar columns
  },

  async deprecate(id: string, orgId: string, userId: string): Promise<Agent> {
    void orgId;
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
// AgentRun schema: id, agentId, orgId, executionId, sessionId (required), status,
// input (String), output (String?), messages (Json), toolCalls (Json),
// iterations, inputTokens, outputTokens, costUsd, startedAt, completedAt, durationMs, error

export interface CreateAgentRunInput {
  agentId:       string;
  orgId:         string;
  sessionId?:    string;   // required by schema — auto-generated if not provided
  executionId?:  string;
  input:         string;   // schema field is String, not JsonValue
}

export interface CompleteAgentRunInput {
  status:       string;
  output?:      string;
  messages?:    Prisma.InputJsonValue;
  toolCalls?:   Prisma.InputJsonValue;
  completedAt:  Date;
  durationMs:   number;
  inputTokens:  number;
  outputTokens: number;
  costUsd:      number | string;
  error?:       string;
}

export const agentRunRepository = {
  async create(input: CreateAgentRunInput): Promise<AgentRun> {
    return prisma.agentRun.create({
      data: {
        agentId:     input.agentId,
        orgId:       input.orgId,
        sessionId:   input.sessionId ?? randomUUID(),
        executionId: input.executionId,
        input:       input.input,
        status:      "RUNNING",
      },
    });
  },

  async findById(id: string, orgId: string): Promise<AgentRun | null> {
    return prisma.agentRun.findFirst({ where: { id, orgId } });
  },

  async complete(id: string, data: CompleteAgentRunInput): Promise<AgentRun> {
    return prisma.agentRun.update({
      where: { id },
      data: {
        status:       data.status as ExecutionStatus,
        output:       data.output,
        messages:     data.messages ?? [],
        toolCalls:    data.toolCalls ?? [],
        completedAt:  data.completedAt,
        durationMs:   data.durationMs,
        inputTokens:  data.inputTokens,
        outputTokens: data.outputTokens,
        costUsd:      data.costUsd,
        error:        data.error,
      },
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
      ...(agentId        && { agentId }),
      ...(status?.length && { status: { in: status as Prisma.EnumExecutionStatusFilter["in"] } }),
    };

    const [items, total] = await Promise.all([
      prisma.agentRun.findMany({ where, skip, take: limit, orderBy: { startedAt: "desc" } }),
      prisma.agentRun.count({ where }),
    ]);

    return { items, total };
  },
};
