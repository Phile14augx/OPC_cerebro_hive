/**
 * @cerebro/db — Audit Event & AI Usage Repositories
 */

import { type AIUsageRecord, type AuditEvent, type Prisma, prisma } from "../client/index.js";

// ── Audit Event repository ────────────────────────────────────────────────────

export interface CreateAuditEventInput {
  orgId:        string;
  actorId?:     string;
  actorType?:   string;
  actorEmail?:  string;
  type:         string;  // schema field
  severity?:    string;
  resourceType?: string;
  resourceId?:  string;
  description:  string;  // schema field (not `action`)
  metadata?:    Prisma.InputJsonValue;
  before?:      Prisma.InputJsonValue;
  after?:       Prisma.InputJsonValue;
  ipAddress?:   string;
  userAgent?:   string;
  traceId?:     string;
}

export const auditRepository = {
  async create(input: CreateAuditEventInput): Promise<AuditEvent> {
    return prisma.auditEvent.create({
      data: {
        orgId:        input.orgId,
        actorId:      input.actorId,
        actorType:    input.actorType ?? "user",
        actorEmail:   input.actorEmail,
        type:         input.type,
        severity:     (input.severity?.toUpperCase() ?? "INFO") as import("../client/index.js").AuditSeverity,
        resourceType: input.resourceType,
        resourceId:   input.resourceId,
        description:  input.description,
        metadata:     input.metadata ?? {},
        before:       input.before,
        after:        input.after,
        ipAddress:    input.ipAddress,
        userAgent:    input.userAgent,
        traceId:      input.traceId,
      },
    });
  },

  /** Fire-and-forget: does not throw, just logs failures. */
  async record(input: CreateAuditEventInput): Promise<void> {
    try {
      await this.create(input);
    } catch (err) {
      console.error("[audit] Failed to record event:", err);
    }
  },

  async list(orgId: string, options: {
    actorId?:     string;
    eventType?:   string;
    resourceId?:  string;
    severity?:    string[];
    from?:        Date;
    to?:          Date;
    page?:        number;
    limit?:       number;
  } = {}): Promise<{ items: AuditEvent[]; total: number }> {
    const { actorId, eventType, resourceId, severity, from, to, page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditEventWhereInput = {
      orgId,
      ...(actorId    && { actorId }),
      ...(eventType  && { type: eventType }),
      ...(resourceId && { resourceId }),
      ...(severity?.length && { severity: { in: severity.map(s => s.toUpperCase()) as import("../client/index.js").AuditSeverity[] } }),
      ...(from || to) && {
        createdAt: {
          ...(from && { gte: from }),
          ...(to   && { lte: to }),
        },
      },
    };

    const [items, total] = await Promise.all([
      prisma.auditEvent.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.auditEvent.count({ where }),
    ]);

    return { items, total };
  },
};

// ── AI Usage repository ───────────────────────────────────────────────────────

export interface CreateAIUsageInput {
  orgId:        string;
  userId?:      string;
  workflowId?:  string;
  executionId?: string;
  agentId?:     string;
  provider:     string;
  model:        string;   // schema field is `model`, not `modelId`
  inputTokens:  number;   // schema field
  outputTokens: number;   // schema field
  totalTokens:  number;
  costUsd:      number | string;
  durationMs:   number;
  cached?:      boolean;  // schema field is `cached`, not `cacheHit`
  requestId:    string;
  traceId?:     string;
}

export const aiUsageRepository = {
  async create(input: CreateAIUsageInput): Promise<AIUsageRecord> {
    return prisma.aIUsageRecord.create({ data: input as unknown as Prisma.AIUsageRecordUncheckedCreateInput });
  },

  /** Batch insert for high-throughput pipelines. */
  async createMany(records: CreateAIUsageInput[]): Promise<number> {
    const result = await prisma.aIUsageRecord.createMany({
      data:           records as unknown as Prisma.AIUsageRecordCreateManyInput[],
      skipDuplicates: true,
    });
    return result.count;
  },

  async getUsageSummary(orgId: string, options: {
    from:     Date;
    to:       Date;
    modelId?: string;
    provider?: string;
  }): Promise<{
    totalTokens:  number;
    totalCostUsd: number;
    requestCount: number;
    avgLatencyMs: number | null;
    cacheHitRate: number;
  }> {
    const { from, to, modelId, provider } = options;

    const agg = await prisma.aIUsageRecord.aggregate({
      where: {
        orgId,
        createdAt:  { gte: from, lte: to },
        ...(modelId  && { model: modelId }),
        ...(provider && { provider }),
      },
      _sum:   { totalTokens: true, inputTokens: true, outputTokens: true },
      _count: { id: true },
      _avg:   { durationMs: true },
    });

    const cacheHits = await prisma.aIUsageRecord.count({
      where: { orgId, createdAt: { gte: from, lte: to }, cached: true },
    });

    // costUsd is Decimal — must use raw aggregation for sum
    const costRow = await prisma.$queryRaw<[{ total_cost: string }]>`
      SELECT COALESCE(SUM(cost_usd), 0)::text AS total_cost
      FROM "ai_usage_records"
      WHERE org_id = ${orgId}
        AND created_at >= ${from}
        AND created_at <= ${to}
        ${modelId  ? prisma.$queryRaw`AND model     = ${modelId}`  : prisma.$queryRaw``}
        ${provider ? prisma.$queryRaw`AND provider = ${provider}` : prisma.$queryRaw``}
    `;

    const requestCount = agg._count?.id ?? 0;

    return {
      totalTokens:  agg._sum?.totalTokens ?? 0,
      totalCostUsd: parseFloat(costRow[0]?.total_cost ?? "0"),
      requestCount,
      avgLatencyMs: agg._avg?.durationMs ?? null,
      cacheHitRate: requestCount > 0 ? cacheHits / requestCount : 0,
    };
  },

  async list(orgId: string, options: {
    from?:        Date;
    to?:          Date;
    workflowId?:  string;
    agentId?:     string;
    page?:        number;
    limit?:       number;
  } = {}): Promise<{ items: AIUsageRecord[]; total: number }> {
    const { from, to, workflowId, agentId, page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.AIUsageRecordWhereInput = {
      orgId,
      ...((from || to) && { createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) } }),
      ...(workflowId && { workflowId }),
      ...(agentId    && { agentId }),
    };

    const [items, total] = await Promise.all([
      prisma.aIUsageRecord.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.aIUsageRecord.count({ where }),
    ]);

    return { items, total };
  },
};
