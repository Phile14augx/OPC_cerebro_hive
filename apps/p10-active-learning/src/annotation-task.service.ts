/**
 * AnnotationTaskService — annotation task assignment with uncertainty-sampling.
 *
 * Uncertainty Sampling strategy:
 *   Tasks with higher uncertaintyScore are prioritised for assignment.
 *   When multiple annotators are competing the topK pending tasks are
 *   returned sorted descending by uncertaintyScore (least confident samples
 *   first, maximising information gain per annotation).
 *
 * All operations are tenant-scoped via mandatory TenantContext.
 */
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService, AnnotationTask, TaskStatus } from './prisma.service';
import { TenantContext } from './tenant-context';

export interface CreateTaskDto {
  campaignId: string;
  dataPayload: Record<string, unknown>;
  /** Uncertainty score in [0, 1].  Defaults to 0.5 if omitted. */
  uncertaintyScore?: number;
}

export interface AssignTaskResult {
  task: AnnotationTask;
  strategy: 'uncertainty-sampling';
}

@Injectable()
export class AnnotationTaskService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Seed a batch of tasks for a campaign.
   */
  async createTask(ctx: TenantContext, dto: CreateTaskDto): Promise<AnnotationTask> {
    if (!dto.campaignId || dto.campaignId.trim().length === 0) {
      throw new BadRequestException('campaignId must be provided');
    }

    const score = dto.uncertaintyScore ?? 0.5;
    if (score < 0 || score > 1) {
      throw new BadRequestException('uncertaintyScore must be in [0, 1]');
    }

    return this.prisma.createTask(ctx, {
      campaignId: dto.campaignId.trim(),
      dataPayload: dto.dataPayload,
      uncertaintyScore: score,
      status: 'pending',
      assignedTo: null,
    });
  }

  /**
   * Assign the highest-uncertainty pending task in a campaign to `annotatorId`.
   *
   * Returns null when there are no pending tasks remaining — callers should
   * treat null as "campaign exhausted" and stop requesting assignments.
   */
  async assignNextTask(
    ctx: TenantContext,
    campaignId: string,
    annotatorId: string,
  ): Promise<AssignTaskResult | null> {
    if (!annotatorId || annotatorId.trim().length === 0) {
      throw new BadRequestException('annotatorId must be provided');
    }

    const pending = await this.prisma.listTasksByCampaign(ctx, campaignId, 'pending');

    if (pending.length === 0) {
      return null;
    }

    // Uncertainty-sampling: pick the task with the highest uncertainty score
    const topTask = pending.reduce(
      (best, t) => (t.uncertaintyScore > best.uncertaintyScore ? t : best),
      pending[0],
    );

    const assigned = await this.prisma.updateTask(
      ctx,
      topTask.id,
      { assignedTo: annotatorId.trim() },
      { assignedTo: null, status: 'pending' },
    );

    if (!assigned) {
      throw new ConflictException(`Task ${topTask.id} was modified concurrently and could not be assigned`);
    }

    return { task: assigned, strategy: 'uncertainty-sampling' };
  }

  /**
   * Mark a task as annotated.
   */
  async completeTask(
    ctx: TenantContext,
    taskId: string,
    annotation: Record<string, unknown>,
  ): Promise<AnnotationTask> {
    const task = await this.prisma.findTaskById(ctx, taskId);
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    if (task.status !== 'pending') {
      throw new BadRequestException(
        `Task ${taskId} is already '${task.status}', cannot annotate`,
      );
    }

    const updated = await this.prisma.updateTask(
      ctx,
      taskId,
      {
        status: 'annotated',
        dataPayload: { ...task.dataPayload, annotation },
      },
      { status: 'pending' },
    );

    if (!updated) {
      throw new ConflictException(`Task ${taskId} was modified concurrently`);
    }

    return updated!;
  }

  /**
   * Mark a task as skipped.
   */
  async skipTask(ctx: TenantContext, taskId: string): Promise<AnnotationTask> {
    const task = await this.prisma.findTaskById(ctx, taskId);
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    if (task.status !== 'pending') {
      throw new BadRequestException(
        `Task ${taskId} is already '${task.status}', cannot skip`,
      );
    }

    const updated = await this.prisma.updateTask(
      ctx,
      taskId,
      { status: 'skipped' },
      { status: 'pending' },
    );

    if (!updated) {
      throw new ConflictException(`Task ${taskId} was modified concurrently`);
    }
    
    return updated!;
  }

  /**
   * Return all tasks for a campaign (optionally filtered by status).
   */
  async listTasks(
    ctx: TenantContext,
    campaignId: string,
    status?: TaskStatus,
  ): Promise<AnnotationTask[]> {
    return this.prisma.listTasksByCampaign(ctx, campaignId, status);
  }

  /**
   * Return completion stats for a campaign.
   * Returns { total, pending, annotated, skipped, completionRate }.
   */
  async getCampaignStats(
    ctx: TenantContext,
    campaignId: string,
  ): Promise<{
    total: number;
    pending: number;
    annotated: number;
    skipped: number;
    completionRate: number;
  }> {
    const all = await this.prisma.listTasksByCampaign(ctx, campaignId);
    const total = all.length;
    const annotated = all.filter((t) => t.status === 'annotated').length;
    const skipped = all.filter((t) => t.status === 'skipped').length;
    const pending = all.filter((t) => t.status === 'pending').length;
    const completionRate = total === 0 ? 0 : (annotated + skipped) / total;
    return { total, pending, annotated, skipped, completionRate };
  }
}
