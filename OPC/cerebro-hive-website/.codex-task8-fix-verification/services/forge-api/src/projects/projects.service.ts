import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@cerebro/db';
import { projectGraph } from '@cerebro/workflow';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService implements OnModuleInit {
  private readonly logger = new Logger(ProjectsService.name);
  private defaultWorkspaceId: string | null = null;

  constructor(private readonly prisma: PrismaClient) {}

  // ── Bootstrap: ensure at least one Tenant + Workspace exists ──────────────
  async onModuleInit() {
    // If a workspace ID is pinned in env, use it
    if (process.env.FORGE_DEFAULT_WORKSPACE_ID) {
      this.defaultWorkspaceId = process.env.FORGE_DEFAULT_WORKSPACE_ID;
      return;
    }

    // Otherwise auto-provision a dev workspace
    const p = this.prisma as any;
    let workspace = await p.workspace.findFirst({
      where: { slug: 'forge-dev' },
    });

    if (!workspace) {
      this.logger.log('Provisioning default forge-dev workspace…');
      let tenant = await p.tenant.findFirst({ where: { slug: 'forge-dev' } });
      if (!tenant) {
        tenant = await p.tenant.create({
          data: { name: 'CerebroForge Dev', slug: 'forge-dev', billingPlan: 'enterprise' },
        });
      }
      workspace = await p.workspace.create({
        data: { name: 'Forge Dev', slug: 'forge-dev', tenantId: tenant.id },
      });
      this.logger.log(`Created workspace ${workspace.id}`);
    }

    this.defaultWorkspaceId = workspace.id;
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  async create(dto: CreateProjectDto) {
    const workspaceId = dto.workspaceId ?? this.defaultWorkspaceId;
    if (!workspaceId) throw new Error('No workspace available — set FORGE_DEFAULT_WORKSPACE_ID');

    const p = this.prisma as any;
    const project = await p.project.create({
      data: {
        name: dto.name,
        prompt: dto.prompt,
        forgeStatus: 'draft',
        forgePhase: 'idea',
        frameworks: dto.frameworks ?? [],
        workspaceId,
      },
    });

    if (dto.prompt) {
      projectGraph.init(project.id, project.name, dto.prompt);
    }

    return project;
  }

  async findAll(workspaceId?: string) {
    const wsId = workspaceId ?? this.defaultWorkspaceId;
    const p = this.prisma as any;
    return p.project.findMany({
      where: {
        forgeStatus: { not: 'deleted' },
        ...(wsId ? { workspaceId: wsId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        prompt: true,
        forgeStatus: true,
        forgePhase: true,
        frameworks: true,
        totalModules: true,
        totalStories: true,
        totalApis: true,
        activeAgents: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const p = this.prisma as any;
    const project = await p.project.findUnique({
      where: { id },
      include: {
        modules: true,
        requirements: true,
        agentRuns:  { orderBy: { createdAt: 'desc' }, take: 20 },
        artifacts:  { orderBy: { createdAt: 'desc' }, take: 50 },
        archDecisions: { orderBy: { id: 'asc' } },
      },
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async updatePhase(id: string, phase: string) {
    const p = this.prisma as any;
    return p.project.update({ where: { id }, data: { forgePhase: phase } });
  }

  async updateStatus(id: string, status: string) {
    const p = this.prisma as any;
    return p.project.update({ where: { id }, data: { forgeStatus: status } });
  }

  async delete(id: string) {
    const p = this.prisma as any;
    return p.project.update({ where: { id }, data: { forgeStatus: 'deleted' } });
  }
}
