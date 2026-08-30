/**
 * ActiveLearningService — orchestration facade for L3.
 *
 * Delegates to CampaignService and AnnotationTaskService, exposing a
 * unified surface for controllers / external callers.
 */
import { Injectable } from '@nestjs/common';
import { CampaignService, CreateCampaignDto } from './campaign.service';
import { AnnotationTaskService, CreateTaskDto, AssignTaskResult } from './annotation-task.service';
import { TenantContext } from './tenant-context';
import {
  LearningCampaign,
  AnnotationTask,
  CampaignStatus,
  TaskStatus,
} from './prisma.service';

@Injectable()
export class ActiveLearningService {
  constructor(
    private readonly campaigns: CampaignService,
    private readonly tasks: AnnotationTaskService,
  ) {}

  // ── Campaign management ──────────────────────────────────────────────────

  createCampaign(ctx: TenantContext, dto: CreateCampaignDto): Promise<LearningCampaign> {
    return this.campaigns.createCampaign(ctx, dto);
  }

  getCampaign(ctx: TenantContext, id: string): Promise<LearningCampaign> {
    return this.campaigns.getCampaign(ctx, id);
  }

  listCampaigns(ctx: TenantContext): Promise<LearningCampaign[]> {
    return this.campaigns.listCampaigns(ctx);
  }

  activateCampaign(ctx: TenantContext, id: string): Promise<LearningCampaign> {
    return this.campaigns.activateCampaign(ctx, id);
  }

  pauseCampaign(ctx: TenantContext, id: string): Promise<LearningCampaign> {
    return this.campaigns.pauseCampaign(ctx, id);
  }

  completeCampaign(ctx: TenantContext, id: string): Promise<LearningCampaign> {
    return this.campaigns.completeCampaign(ctx, id);
  }

  transitionCampaignStatus(
    ctx: TenantContext,
    id: string,
    target: CampaignStatus,
  ): Promise<LearningCampaign> {
    return this.campaigns.transitionStatus(ctx, id, target).then((r) => r.campaign);
  }

  // ── Task management ──────────────────────────────────────────────────────

  createTask(ctx: TenantContext, dto: CreateTaskDto): Promise<AnnotationTask> {
    return this.tasks.createTask(ctx, dto);
  }

  /**
   * Assign the next highest-uncertainty task to an annotator.
   * Returns null when all tasks are exhausted.
   */
  assignNextTask(
    ctx: TenantContext,
    campaignId: string,
    annotatorId: string,
  ): Promise<AssignTaskResult | null> {
    return this.tasks.assignNextTask(ctx, campaignId, annotatorId);
  }

  completeTask(
    ctx: TenantContext,
    taskId: string,
    annotation: Record<string, unknown>,
  ): Promise<AnnotationTask> {
    return this.tasks.completeTask(ctx, taskId, annotation);
  }

  skipTask(ctx: TenantContext, taskId: string): Promise<AnnotationTask> {
    return this.tasks.skipTask(ctx, taskId);
  }

  listTasks(
    ctx: TenantContext,
    campaignId: string,
    status?: TaskStatus,
  ): Promise<AnnotationTask[]> {
    return this.tasks.listTasks(ctx, campaignId, status);
  }

  getCampaignStats(
    ctx: TenantContext,
    campaignId: string,
  ): Promise<{
    total: number;
    pending: number;
    annotated: number;
    skipped: number;
    completionRate: number;
  }> {
    return this.tasks.getCampaignStats(ctx, campaignId);
  }

  // ── Legacy L2 compatibility ──────────────────────────────────────────────

  /**
   * @deprecated Use `getCampaign(ctx, id).then(c => c.status)` instead.
   * Kept for L2 backward-compat.
   */
  getCampaignStatus(_campaignId: string): string {
    return 'active';
  }
}
