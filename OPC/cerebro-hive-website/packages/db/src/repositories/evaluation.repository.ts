/**
 * @cerebro/db — Evaluation Repository
 * Typed data-access layer for EvalDataset + EvalRun entities.
 */

import { type EvalDataset, type EvalRun, type Prisma, prisma } from "../client/index.js";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface CreateEvalDatasetInput {
  orgId:        string;
  name:         string;
  description?: string;
  rowCount?:    number;
  schema?:      Record<string, unknown>;
  sourceType?:  string;
  storageKey?:  string;
  createdById?: string;
}

export interface CreateEvalRunInput {
  orgId:        string;
  name:         string;
  promptId?:    string;
  promptSlug?:  string;
  datasetId?:   string;
  model:        string;
  createdById?: string;
}

export interface EvalRunMetrics {
  accuracy?:         number;
  faithfulness?:     number;
  answer_relevance?: number;
  context_recall?:   number;
  toxicity?:         number;
  latency_p50?:      number;
  [key: string]:     number | undefined;
}

export interface UpdateEvalRunInput {
  status?:      string;
  samples?:     number;
  passed?:      number;
  metrics?:     EvalRunMetrics;
  errorMsg?:    string;
  startedAt?:   Date;
  completedAt?: Date;
}

export interface ListEvalRunsOptions {
  orgId:      string;
  promptId?:  string;
  datasetId?: string;
  status?:    string;
  page?:      number;
  limit?:     number;
}

// ── Repository ────────────────────────────────────────────────────────────────

export const evaluationRepository = {
  // ── Datasets ─────────────────────────────────────────────────────────────────

  async createDataset(input: CreateEvalDatasetInput): Promise<EvalDataset> {
    return prisma.evalDataset.create({
      data: {
        orgId:       input.orgId,
        name:        input.name,
        description: input.description ?? "",
        rowCount:    input.rowCount ?? 0,
        schema:      (input.schema ?? {}) as Prisma.InputJsonValue,
        sourceType:  input.sourceType ?? "manual",
        storageKey:  input.storageKey,
        createdById: input.createdById,
      },
    });
  },

  async listDatasets(orgId: string): Promise<EvalDataset[]> {
    return prisma.evalDataset.findMany({
      where:   { orgId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findDatasetById(id: string, orgId: string): Promise<EvalDataset | null> {
    return prisma.evalDataset.findFirst({ where: { id, orgId } });
  },

  // ── Eval Runs ─────────────────────────────────────────────────────────────────

  async createRun(input: CreateEvalRunInput): Promise<EvalRun> {
    return prisma.evalRun.create({
      data: {
        orgId:        input.orgId,
        name:         input.name,
        promptId:     input.promptId,
        promptSlug:   input.promptSlug ?? "",
        datasetId:    input.datasetId,
        model:        input.model,
        status:       "QUEUED",
        createdById:  input.createdById,
      },
    });
  },

  async findRunById(id: string, orgId: string): Promise<(EvalRun & { dataset: EvalDataset | null }) | null> {
    return prisma.evalRun.findFirst({
      where:   { id, orgId },
      include: { dataset: true },
    });
  },

  async findRunByIdOrThrow(id: string, orgId: string): Promise<EvalRun & { dataset: EvalDataset | null }> {
    const run = await this.findRunById(id, orgId);
    if (!run) throw Object.assign(new Error(`EvalRun ${id} not found`), { code: "NOT_FOUND" });
    return run;
  },

  async listRuns(options: ListEvalRunsOptions): Promise<{ items: (EvalRun & { dataset: EvalDataset | null })[]; total: number }> {
    const { orgId, promptId, datasetId, status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = {
      orgId,
      ...(promptId  && { promptId }),
      ...(datasetId && { datasetId }),
      ...(status    && { status }),
    };

    const [items, total] = await Promise.all([
      prisma.evalRun.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { startedAt: "desc" },
        include: { dataset: true },
      }),
      prisma.evalRun.count({ where }),
    ]);

    return { items, total };
  },

  async updateRun(id: string, input: UpdateEvalRunInput): Promise<EvalRun> {
    return prisma.evalRun.update({ where: { id }, data: input });
  },

  async startRun(id: string): Promise<EvalRun> {
    return prisma.evalRun.update({
      where: { id },
      data:  { status: "RUNNING", startedAt: new Date() },
    });
  },

  async completeRun(id: string, metrics: EvalRunMetrics, passed: number, samples: number): Promise<EvalRun> {
    return prisma.evalRun.update({
      where: { id },
      data:  { status: "COMPLETED", completedAt: new Date(), metrics, passed, samples },
    });
  },

  async failRun(id: string, errorMsg: string): Promise<EvalRun> {
    return prisma.evalRun.update({
      where: { id },
      data:  { status: "FAILED", completedAt: new Date(), errorMsg },
    });
  },

  async cancelRun(id: string): Promise<EvalRun> {
    return prisma.evalRun.update({
      where: { id },
      data:  { status: "CANCELLED", completedAt: new Date() },
    });
  },

  async deleteRun(id: string): Promise<void> {
    await prisma.evalRun.delete({ where: { id } });
  },

  async deleteDataset(id: string): Promise<void> {
    await prisma.evalDataset.delete({ where: { id } });
  },
};
