import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FORGE_ARCHITECTURE_SCHEMA } from '@cerebro/ai';
import { projectGraph } from '@cerebro/workflow';
import type { ForgeArchitecture } from '@cerebro/workflow';
import { AgentOrchestratorService } from '../agent/agent-orchestrator.service';

@Injectable()
export class ArchitectService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly orchestrator: AgentOrchestratorService,
  ) {}

  async design(projectId: string): Promise<ForgeArchitecture> {
    const ctx = projectGraph.getOrThrow(projectId);

    const userPrompt = `Design the complete system architecture for this application:
Prompt: ${ctx.prompt}
${ctx.plan ? `
Modules: ${ctx.plan.modules.map(m => m.name).join(', ')}
Recommended stack: Frontend=${ctx.plan.stack.frontend}, Backend=${ctx.plan.stack.backend}, DB=${ctx.plan.stack.database}
` : ''}${ctx.requirements ? `
Entities: ${ctx.requirements.entities.map(e => e.name).join(', ')}
API Endpoints: ${ctx.requirements.apiContracts.length} contracts
` : ''}
Select the optimal architecture pattern and design all services with their responsibilities,
ports, databases, tech stack per layer, and Architecture Decision Records.`;

    projectGraph.advancePhase(projectId, 'architecture');

    const result = await this.orchestrator.runAgent<ForgeArchitecture>({
      projectId,
      agentType: 'architect',
      phase: 'architecture',
      userPrompt,
      schema: FORGE_ARCHITECTURE_SCHEMA,
      schemaDescription: 'ForgeArchitecture — pattern, services, tech stack, ADRs',
    });

    const arch = result.output;

    // Persist ADRs as ArchitectureDecision records
    await this.prisma.$transaction([
      this.prisma.project.update({
        where: { id: projectId },
        data: { archJson: arch as any, forgePhase: 'architecture' },
      }),
      this.prisma.architectureDecision.deleteMany({ where: { projectId } }),
      ...arch.decisions.map(d =>
        this.prisma.architectureDecision.create({
          data: {
            projectId,
            title: d.title,
            context: d.context,
            decision: d.decision,
            status: d.status,
          },
        }),
      ),
    ]);

    projectGraph.setArchitecture(projectId, arch);

    return arch;
  }
}
