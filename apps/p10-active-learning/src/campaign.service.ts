/**
 * CampaignService — campaign lifecycle management.
 *
 * Transitions:
 *   draft ──► active ──► paused ──► active
 *                    └──► completed
 *
 * All operations are tenant-scoped via mandatory TenantContext.
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService, LearningCampaign, CampaignStatus } from './prisma.service';
import { TenantContext } from './tenant-context';

export interface CreateCampaignDto {
  name: string;
  description?: string;
}

export interface CampaignTransitionResult {
  campaign: LearningCampaign;
  previousStatus: CampaignStatus;
}

/** Valid lifecycle transitions: Map<from, Set<to>> */
const ALLOWED_TRANSITIONS = new Map<CampaignStatus, Set<CampaignStatus>>([
  ['draft', new Set<CampaignStatus>(['active'])],
  ['active', new Set<CampaignStatus>(['paused', 'completed'])],
  ['paused', new Set<CampaignStatus>(['active', 'completed'])],
  ['completed', new Set<CampaignStatus>()],
]);

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new campaign in 'draft' status for the given tenant.
   */
  async createCampaign(
    ctx: TenantContext,
    dto: CreateCampaignDto,
  ): Promise<LearningCampaign> {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Campaign name must not be empty');
    }
    return this.prisma.createCampaign(ctx, {
      name: dto.name.trim(),
      description: dto.description?.trim() ?? null,
      status: 'draft',
    });
  }

  /**
   * Retrieve a single campaign belonging to the tenant.
   * Throws NotFoundException when not found (tenant-safe: cross-tenant IDs also 404).
   */
  async getCampaign(ctx: TenantContext, id: string): Promise<LearningCampaign> {
    const campaign = await this.prisma.findCampaignById(ctx, id);
    if (!campaign) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }
    return campaign;
  }

  /**
   * List all campaigns for the tenant.
   */
  async listCampaigns(ctx: TenantContext): Promise<LearningCampaign[]> {
    return this.prisma.listCampaigns(ctx);
  }

  /**
   * Transition a campaign to the target status.
   * Enforces the state machine; throws BadRequestException for illegal moves.
   */
  async transitionStatus(
    ctx: TenantContext,
    id: string,
    targetStatus: CampaignStatus,
  ): Promise<CampaignTransitionResult> {
    const campaign = await this.getCampaign(ctx, id);
    const allowed = ALLOWED_TRANSITIONS.get(campaign.status) ?? new Set();

    if (!allowed.has(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition campaign from '${campaign.status}' to '${targetStatus}'`,
      );
    }

    const updated = await this.prisma.updateCampaign(ctx, id, { status: targetStatus });
    if (!updated) {
      throw new NotFoundException(`Campaign ${id} not found during update`);
    }
    return { campaign: updated, previousStatus: campaign.status };
  }

  /**
   * Activate a draft campaign.
   */
  async activateCampaign(ctx: TenantContext, id: string): Promise<LearningCampaign> {
    const { campaign } = await this.transitionStatus(ctx, id, 'active');
    return campaign;
  }

  /**
   * Pause an active campaign.
   */
  async pauseCampaign(ctx: TenantContext, id: string): Promise<LearningCampaign> {
    const { campaign } = await this.transitionStatus(ctx, id, 'paused');
    return campaign;
  }

  /**
   * Complete a campaign (from active or paused).
   */
  async completeCampaign(ctx: TenantContext, id: string): Promise<LearningCampaign> {
    const { campaign } = await this.transitionStatus(ctx, id, 'completed');
    return campaign;
  }
}
