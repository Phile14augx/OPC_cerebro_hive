/**
 * @cerebro/db — Audit Event & AI Usage Repositories
 */

import { type AIUsageRecord, type AuditEvent, type Prisma, prisma } from "../client/index.js";

// ── Audit Event repository ────────────────────────────────────────────────────

export interface CreateAuditEventInput {
  orgId:       string;
  actorId?:    string;
  actorType?:  string;
  actorEmail?: string;
  actorIp?:    string;
  userAgent?:  string;
  eventType:   string;
  resourceType?: string;
  resourceId?:   string;
  action:      string;
  outcome:     string;
  severity?:   string;
  details?:    Prisma.JsonValue;
  traceId?:    string;
}

export const auditRepository = {
  async create(input: CreateAuditEventInput): Promise<AuditEvent> {
    return prisma.auditEvent.create({
      data: {
        ...input,
        severity: input.severity ?? "info",
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
      ...(eventType  && { eventType }),
      ...(resourceId && { resourceId }),
      ...(severity?.length && { severity: { in: severity } }),
      ...(from || to) && {
        timestamp: {
          ...(from && { gte: from }),
          ...(to   && { lte: to }),
        },
      },
    };

    const [items, total] = await Promise.all([
      prisma.auditEvent.findMany({ where, skip, take: limit, orderBy: { timestamp: "desc" } }),
      prisma.auditEvent.count({ where }),
    ]);

    return { items, total };
  },
};

// ── AI Usage repository ───────────────────────────────────────────────────────

export interface CreateAIUsageInput {
  orgId:           string;
  userId?:         string;
  workflowId?:     string;
  executionId?:    string;
  agentId?:        string;
  provider:        string;
  modelId:         string;
  promptTokens:    number;
  completionTokens: number;
  totalTokens:     number;
  costUsd:         number | string;
  durationMs?:     number;
  cacheHit?:       boolean;
  cacheTokens?:    number;
  requestId?:      string;
  traceId?:        string;
}

export const aiUsageRepository = {
  async create(input: CreateAIUsageInput): Promise<AIUsageRecord> {
    return prisma.aIUsageRecord.create({ data: input as Prisma.AIUsageRecordCreateInput });
  },

  /** Batch insert for high-throughput pipelines. */
  async createMany(records: CreateAIUsageInput[]): Promise<number> {
    const result = await prisma.aIUsageRecord.createMany({
      data:           records as Prisma.AIUsageRecordCreateManyInput[],
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
        timestamp:  { gte: from, lte: to },
        ...(modelId  && { modelId }),
        ...(provider && { provider }),
      },
      _sum:   { totalTokens: true, promptTokens: true, completionTokens: true, cacheTokens: true },
      _count: { id: true },
      _avg:   { durationMs: true },
    });

    const cacheHits = await prisma.aIUsageRecord.count({
      where: { orgId, timestamp: { gte: from, lte: to }, cacheHit: true },
    });

    // costUsd is Decimal — must use raw aggregation for sum
    const costRow = await prisma.$queryRaw<[{ total_cost: string }]>`
      SELECT COALESCE(SUM(cost_usd), 0)::text AS total_cost
      FROM "ai_usage_records"
      WHERE org_id = ${orgId}
        AND timestamp >= ${from}
        AND timestamp <= ${to}
        ${modelId  ? prisma.$queryRaw`AND model_id  = ${modelId}`  : prisma.$queryRaw``}
        ${provider ? prisma.$queryRaw`AND provider = ${provider}` : prisma.$queryRaw``}
    `;

    const requestCount = agg._count.id;

    return {
      totalTokens:  agg._sum.totalTokens ?? 0,
      totalCostUsd: parseFloat(costRow[0]?.total_cost ?? "0"),
      requestCount,
      avgLatencyMs: agg._avg.durationMs,
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
      ...((from || to) && { timestamp: { ...(from && { gte: from }), ...(to && { lte: to }) } }),
      ...(workflowId && { workflowId }),
      ...(agentId    && { agentId }),
    };

    const [items, total] = await Promise.all([
      prisma.aIUsageRecord.findMany({ where, skip, take: limit, orderBy: { timestamp: "desc" } }),
      prisma.aIUsageRecord.count({ where }),
    ]);

    return { items, total };
  },
};
