import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@cerebro/db';
import { FORGE_REQUIREMENTS_SCHEMA } from '@cerebro/ai';
import { projectGraph } from '@cerebro/workflow';
import type { ForgeRequirements } from '@cerebro/workflow';
import { AgentOrchestratorService } from '../agent/agent-orchestrator.service';

@Injectable()
export class RequirementsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly orchestrator: AgentOrchestratorService,
  ) {}

  async generate(projectId: string): Promise<ForgeRequirements> {
    const ctx = projectGraph.getOrThrow(projectId);
    const plan = ctx.plan;

    const userPrompt = `Based on this project:
Prompt: ${ctx.prompt}
${plan ? `Modules: ${plan.modules.map(m => m.name).join(', ')}
Actors: ${plan.actors.join(', ')}` : ''}

Generate comprehensive requirements including functional requirements, non-functional requirements,
actors with permissions, database entities, API contracts, and user stories.`;

    projectGraph.advancePhase(projectId, 'requirements');

    const result = await this.orchestrator.runAgent<ForgeRequirements>({
      projectId,
      agentType: 'pm',
      phase: 'requirements',
      userPrompt,
      schema: FORGE_REQUIREMENTS_SCHEMA,
      schemaDescription: 'ForgeRequirements — structured requirements with functional, non-functional, actors, entities, api contracts, user stories',
    });

    const reqs = result.output;

    // Persist requirements rows
    const reqRows = [
      ...reqs.functional.map(r => ({ projectId, title: r, type: 'functional', priority: 'medium' })),
      ...reqs.nonFunctional.map(r => ({ projectId, title: r, type: 'non_functional', priority: 'medium' })),
      ...reqs.userStories.map(s => ({
        projectId,
        title: `As a ${s.actor}, I want to ${s.action} so that ${s.benefit}`,
        type: 'user_story',
        priority: 'medium',
      })),
      ...reqs.apiContracts.map(c => ({
        projectId,
        title: `${c.method} ${c.path}`,
        description: c.description,
        type: 'api_contract',
        priority: 'medium',
      })),
    ];

    const p = this.prisma;
    await p.$transaction([
      p.project.update({
        where: { id: projectId },
        data: { forgePhase: 'requirements' },
      }),
      p.requirement.deleteMany({ where: { projectId } }),
      p.requirement.createMany({ data: reqRows }),
    ]);

    projectGraph.setRequirements(projectId, reqs);

    return reqs;
  }
}
