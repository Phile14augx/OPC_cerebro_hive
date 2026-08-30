/**
 * PrismaService — thin wrapper around PrismaClient for NestJS injection.
 *
 * Uses an in-memory store when DATABASE_URL is not set (test / CI mode),
 * so tests never require a real Postgres instance.
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TenantContext } from './tenant-context';

// ─── Domain Types (mirrors Prisma schema, kept framework-free) ──────────────

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type TaskStatus = 'pending' | 'annotated' | 'skipped';

export interface LearningCampaign {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnotationTask {
  id: string;
  tenantId: string;
  campaignId: string;
  dataPayload: Record<string, unknown>;
  /** Uncertainty score in [0, 1]; higher = more uncertain = higher priority */
  uncertaintyScore: number;
  status: TaskStatus;
  assignedTo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── In-memory store (used when DATABASE_URL is absent) ────────────────────

class InMemoryStore {
  campaigns = new Map<string, LearningCampaign>();
  tasks = new Map<string, AnnotationTask>();
}

let _store: InMemoryStore | null = null;

function getStore(): InMemoryStore {
  if (!_store) _store = new InMemoryStore();
  return _store;
}

/** Reset the in-memory store (for test isolation). */
export function resetInMemoryStore(): void {
  _store = new InMemoryStore();
}

// ─── PrismaService ──────────────────────────────────────────────────────────

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly useInMemory: boolean;

  // We store a reference to `PrismaClient` only when a DB URL is available.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private prisma: any = null;

  constructor() {
    this.useInMemory = !process.env['DATABASE_URL'];
  }

  async onModuleInit(): Promise<void> {
    if (!this.useInMemory) {
      // Dynamic import so unit tests (no DB) don't pay the import cost
      const { PrismaClient } = (await import('@prisma/client')) as any;
      this.prisma = new PrismaClient();
      await this.prisma.$connect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }

  // ── Campaign CRUD ─────────────────────────────────────────────────────────

  async createCampaign(
    ctx: TenantContext,
    data: Omit<LearningCampaign, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Promise<LearningCampaign> {
    if (this.useInMemory) {
      const now = new Date();
      const campaign: LearningCampaign = {
        id: generateId(),
        tenantId: ctx.tenantId,
        name: data.name,
        description: data.description ?? null,
        status: data.status,
        createdAt: now,
        updatedAt: now,
      };
      getStore().campaigns.set(campaign.id, campaign);
      return campaign;
    }
    return this.prisma.learningCampaign.create({
      data: { tenantId: ctx.tenantId, ...data },
    }) as Promise<LearningCampaign>;
  }

  async findCampaignById(
    ctx: TenantContext,
    id: string,
  ): Promise<LearningCampaign | null> {
    if (this.useInMemory) {
      const c = getStore().campaigns.get(id) ?? null;
      if (c && c.tenantId !== ctx.tenantId) return null; // tenant isolation
      return c;
    }
    return this.prisma.learningCampaign.findFirst({
      where: { id, tenantId: ctx.tenantId },
    }) as Promise<LearningCampaign | null>;
  }

  async listCampaigns(ctx: TenantContext): Promise<LearningCampaign[]> {
    if (this.useInMemory) {
      return Array.from(getStore().campaigns.values()).filter(
        (c) => c.tenantId === ctx.tenantId,
      );
    }
    return this.prisma.learningCampaign.findMany({
      where: { tenantId: ctx.tenantId },
    }) as Promise<LearningCampaign[]>;
  }

  async updateCampaign(
    ctx: TenantContext,
    id: string,
    data: Partial<Omit<LearningCampaign, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
    expectedState?: Partial<LearningCampaign>,
  ): Promise<LearningCampaign | null> {
    if (this.useInMemory) {
      const c = getStore().campaigns.get(id);
      if (!c || c.tenantId !== ctx.tenantId) return null;
      if (expectedState) {
        for (const [k, v] of Object.entries(expectedState)) {
          if ((c as any)[k] !== v) return null;
        }
      }
      const updated: LearningCampaign = { ...c, ...data, updatedAt: new Date() };
      getStore().campaigns.set(id, updated);
      return updated;
    }
    const result = await this.prisma.learningCampaign.updateMany({
      where: { id, tenantId: ctx.tenantId, ...expectedState },
      data: { ...data, updatedAt: new Date() },
    });
    if (result.count === 0) return null;
    return this.findCampaignById(ctx, id);
  }

  // ── Annotation Task CRUD ──────────────────────────────────────────────────

  async createTask(
    ctx: TenantContext,
    data: Omit<AnnotationTask, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Promise<AnnotationTask> {
    if (this.useInMemory) {
      const now = new Date();
      const task: AnnotationTask = {
        id: generateId(),
        tenantId: ctx.tenantId,
        campaignId: data.campaignId,
        dataPayload: data.dataPayload,
        uncertaintyScore: data.uncertaintyScore,
        status: data.status,
        assignedTo: data.assignedTo ?? null,
        createdAt: now,
        updatedAt: now,
      };
      getStore().tasks.set(task.id, task);
      return task;
    }
    return this.prisma.annotationTask.create({
      data: { tenantId: ctx.tenantId, ...data },
    }) as Promise<AnnotationTask>;
  }

  async findTaskById(
    ctx: TenantContext,
    id: string,
  ): Promise<AnnotationTask | null> {
    if (this.useInMemory) {
      const t = getStore().tasks.get(id) ?? null;
      if (t && t.tenantId !== ctx.tenantId) return null;
      return t;
    }
    return this.prisma.annotationTask.findFirst({
      where: { id, tenantId: ctx.tenantId },
    }) as Promise<AnnotationTask | null>;
  }

  async listTasksByCampaign(
    ctx: TenantContext,
    campaignId: string,
    status?: TaskStatus,
  ): Promise<AnnotationTask[]> {
    if (this.useInMemory) {
      return Array.from(getStore().tasks.values()).filter(
        (t) =>
          t.tenantId === ctx.tenantId &&
          t.campaignId === campaignId &&
          (status === undefined || t.status === status),
      );
    }
    return this.prisma.annotationTask.findMany({
      where: {
        tenantId: ctx.tenantId,
        campaignId,
        ...(status ? { status } : {}),
      },
    }) as Promise<AnnotationTask[]>;
  }

  async updateTask(
    ctx: TenantContext,
    id: string,
    data: Partial<Omit<AnnotationTask, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
    expectedState?: Partial<AnnotationTask>,
  ): Promise<AnnotationTask | null> {
    if (this.useInMemory) {
      const t = getStore().tasks.get(id);
      if (!t || t.tenantId !== ctx.tenantId) return null;
      if (expectedState) {
        for (const [k, v] of Object.entries(expectedState)) {
          if ((t as any)[k] !== v) return null;
        }
      }
      const updated: AnnotationTask = { ...t, ...data, updatedAt: new Date() };
      getStore().tasks.set(id, updated);
      return updated;
    }
    const result = await this.prisma.annotationTask.updateMany({
      where: { id, tenantId: ctx.tenantId, ...expectedState },
      data: { ...data, updatedAt: new Date() },
    });
    if (result.count === 0) return null;
    return this.findTaskById(ctx, id);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _seq = 0;
function generateId(): string {
  return `id-${Date.now()}-${++_seq}`;
}
