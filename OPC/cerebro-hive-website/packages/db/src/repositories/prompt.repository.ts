/**
 * @cerebro/db — Prompt Repository
 * Typed data-access layer for Prompt + PromptVersion entities.
 */

import { type Prompt, type PromptVersion, prisma } from "../client/index.js";
import { createHash } from "node:crypto";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface CreatePromptInput {
  orgId:        string;
  name:         string;
  slug:         string;
  description?: string;
  category?:    string;
  tags?:        string[];
  createdById?: string;
}

export interface CreatePromptVersionInput {
  promptId:    string;
  orgId:       string;
  version:     number;
  content:     string;
  model:       string;
  variables?:  string[];
  description?: string;
  changelog?:  string;
  tags?:       string[];
  createdBy?:  string;
}

export interface UpdatePromptInput {
  name?:          string;
  description?:   string;
  status?:        string;
  category?:      string;
  tags?:          string[];
  activeVersion?: number;
  updatedById?:   string;
}

export interface ListPromptsOptions {
  orgId:     string;
  status?:   string;
  category?: string;
  search?:   string;
  tags?:     string[];
  page?:     number;
  limit?:    number;
}

// ── Metric update ─────────────────────────────────────────────────────────────

export interface PromptVersionMetrics {
  [key: string]: number | undefined; // index signature required for Prisma InputJsonObject
  successRate:  number;
  avgTokens:    number;
  avgLatencyMs: number;
  runs:         number;
}

// ── Repository ────────────────────────────────────────────────────────────────

export const promptRepository = {
  async create(input: CreatePromptInput): Promise<Prompt> {
    return prisma.prompt.create({
      data: {
        orgId:       input.orgId,
        name:        input.name,
        slug:        input.slug,
        description: input.description ?? "",
        category:    input.category ?? "general",
        tags:        input.tags ?? [],
        createdById: input.createdById,
        updatedById: input.createdById,
      },
    });
  },

  async findById(id: string, orgId: string): Promise<(Prompt & { versions: PromptVersion[] }) | null> {
    return prisma.prompt.findFirst({
      where:   { id, orgId },
      include: { versions: { orderBy: { version: "desc" } } },
    });
  },

  async findByIdOrThrow(id: string, orgId: string): Promise<Prompt & { versions: PromptVersion[] }> {
    const prompt = await this.findById(id, orgId);
    if (!prompt) throw Object.assign(new Error(`Prompt ${id} not found`), { code: "NOT_FOUND" });
    return prompt;
  },

  async findBySlug(slug: string, orgId: string): Promise<(Prompt & { versions: PromptVersion[] }) | null> {
    return prisma.prompt.findFirst({
      where:   { slug, orgId },
      include: { versions: { orderBy: { version: "desc" } } },
    });
  },

  async list(options: ListPromptsOptions): Promise<{ items: (Prompt & { versions: PromptVersion[] })[]; total: number }> {
    const { orgId, status, category, search, tags, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = {
      orgId,
      ...(status   && { status }),
      ...(category && { category }),
      ...(tags?.length && { tags: { hasSome: tags } }),
      ...(search && {
        OR: [
          { name:        { contains: search, mode: "insensitive" as const } },
          { slug:        { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { updatedAt: "desc" },
        include: { versions: { orderBy: { version: "desc" } } },
      }),
      prisma.prompt.count({ where }),
    ]);

    return { items, total };
  },

  async update(id: string, orgId: string, input: UpdatePromptInput): Promise<Prompt> {
    return prisma.prompt.update({
      where: { id },
      data:  {
        ...input,
        updatedAt: new Date(),
      },
    });
  },

  async publish(id: string, orgId: string, updatedById: string): Promise<Prompt> {
    return prisma.prompt.update({
      where: { id },
      data:  { status: "PUBLISHED", updatedById, updatedAt: new Date() },
    });
  },

  async deprecate(id: string, orgId: string, updatedById: string): Promise<Prompt> {
    return prisma.prompt.update({
      where: { id },
      data:  { status: "DEPRECATED", updatedById, updatedAt: new Date() },
    });
  },

  async delete(id: string, orgId: string): Promise<void> {
    await prisma.prompt.delete({ where: { id } });
  },

  // ── Versions ──────────────────────────────────────────────────────────────────

  async createVersion(input: CreatePromptVersionInput): Promise<PromptVersion> {
    const contentHash = createHash("sha256").update(input.content).digest("hex").slice(0, 16);

    return prisma.promptVersion.create({
      data: {
        promptId:    input.promptId,
        orgId:       input.orgId,
        version:     input.version,
        content:     input.content,
        model:       input.model,
        variables:   input.variables ?? [],
        description: input.description ?? "",
        changelog:   input.changelog ?? "",
        contentHash,
        tags:        input.tags ?? [],
        isActive:    false,
        createdBy:   input.createdBy,
      },
    });
  },

  async getVersion(promptId: string, version: number): Promise<PromptVersion | null> {
    return prisma.promptVersion.findFirst({ where: { promptId, version } });
  },

  async listVersions(promptId: string): Promise<PromptVersion[]> {
    return prisma.promptVersion.findMany({
      where:   { promptId },
      orderBy: { version: "desc" },
    });
  },

  async setActiveVersion(promptId: string, version: number): Promise<void> {
    await prisma.$transaction([
      // Deactivate all versions
      prisma.promptVersion.updateMany({
        where: { promptId },
        data:  { isActive: false },
      }),
      // Activate the target version
      prisma.promptVersion.updateMany({
        where: { promptId, version },
        data:  { isActive: true },
      }),
      // Update activeVersion on prompt
      prisma.prompt.update({
        where: { id: promptId },
        data:  { activeVersion: version, updatedAt: new Date() },
      }),
    ]);
  },

  async updateVersionMetrics(promptId: string, version: number, metrics: PromptVersionMetrics): Promise<void> {
    await prisma.promptVersion.updateMany({
      where: { promptId, version },
      data:  { metrics },
    });
  },

  async nextVersionNumber(promptId: string): Promise<number> {
    const latest = await prisma.promptVersion.findFirst({
      where:   { promptId },
      orderBy: { version: "desc" },
      select:  { version: true },
    });
    return (latest?.version ?? 0) + 1;
  },
};
