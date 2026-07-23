import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FORGE_PLAN_SCHEMA } from '@cerebro/ai';
import { projectGraph } from '@cerebro/workflow';
import type { ForgePlan } from '@cerebro/workflow';
import { AgentOrchestratorService } from '../agent/agent-orchestrator.service';

@Injectable()
export class PlannerService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly orchestrator: AgentOrchestratorService,
  ) {}

  async plan(projectId: string, prompt: string): Promise<ForgePlan> {
    // Ensure graph context exists
    let ctx = projectGraph.get(projectId);
    if (!ctx) {
      const project = await this.prisma.project.findUniqueOrThrow({ where: { id: projectId } });
      ctx = projectGraph.init(projectId, project.name, prompt ?? (project.prompt ?? ''));
    }

    projectGraph.advancePhase(projectId, 'planning');

    const result = await this.orchestrator.runAgent<ForgePlan>({
      projectId,
      agentType: 'pm',
      phase: 'planning',
      userPrompt: `Create a comprehensive project plan for the following application:\n\n${prompt}`,
      schema: FORGE_PLAN_SCHEMA,
      schemaDescription: 'ForgePlan — structured project plan with modules, actors, milestones, stack',
    });

    const plan = result.output;

    // Persist plan back to project and modules
    await this.prisma.$transaction([
      this.prisma.project.update({
        where: { id: projectId },
        data: {
          planJson: plan as any,
          forgePhase: 'planning',
          forgeStatus: 'planning',
          totalModules: plan.modules.length,
          totalStories: plan.totalStories,
          totalApis: plan.totalApis,
          stack: plan.stack as any,
          actorList: plan.actors,
        },
      }),
      ...plan.modules.map(m =>
        this.prisma.module.upsert({
          where: { projectId_name: { projectId, name: m.name } },
          create: {
            projectId,
            name: m.name,
            description: m.description,
            priority: m.priority,
            storyCount: m.storyCount,
            apiCount: m.apiCount,
            status: 'pending',
          },
          update: {
            description: m.description,
            priority: m.priority,
            storyCount: m.storyCount,
            apiCount: m.apiCount,
          },
        }),
      ),
    ]);

    // Update in-memory graph
    projectGraph.setPlan(projectId, plan);

    return plan;
  }
}
