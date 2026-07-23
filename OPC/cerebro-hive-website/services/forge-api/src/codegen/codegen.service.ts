import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { projectGraph, PHASE_AGENTS } from '@cerebro/workflow';
import type { ForgeAgentType, GeneratedFile } from '@cerebro/workflow';
import { AgentOrchestratorService } from '../agent/agent-orchestrator.service';

export interface CodegenEvent {
  type: 'agent_start' | 'chunk' | 'file_complete' | 'phase_complete' | 'error' | 'done';
  agentType?: ForgeAgentType;
  filePath?: string;
  chunk?: string;
  file?: GeneratedFile;
  error?: string;
}

@Injectable()
export class CodegenService {
  private readonly logger = new Logger(CodegenService.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly orchestrator: AgentOrchestratorService,
  ) {}

  /** Returns an AsyncGenerator that yields SSE-ready events */
  async *generateCode(projectId: string): AsyncGenerator<CodegenEvent> {
    const ctx = projectGraph.getOrThrow(projectId);
    const agents = PHASE_AGENTS['implementation'];

    projectGraph.advancePhase(projectId, 'implementation');

    await this.prisma.project.update({
      where: { id: projectId },
      data: { forgePhase: 'implementation', forgeStatus: 'generating' },
    });

    for (const agentType of agents) {
      yield { type: 'agent_start', agentType };

      const fileList = this.buildFileList(agentType, ctx.plan?.modules.map(m => m.name) ?? []);

      for (const filePath of fileList) {
        // Add pending file to graph
        projectGraph.addFile(projectId, {
          filePath,
          language: this.languageFor(filePath),
          content: '',
          agentType,
          status: 'generating',
          lineCount: 0,
        });

        const userPrompt = this.buildCodegenPrompt(agentType, filePath, ctx);

        let content = '';
        try {
          for await (const chunk of this.orchestrator.streamAgent({
            projectId,
            agentType,
            phase: 'implementation',
            userPrompt,
          })) {
            content += chunk;
            yield { type: 'chunk', agentType, filePath, chunk };
          }

          // Mark file done
          projectGraph.updateFileStatus(projectId, filePath, 'done', content);

          // Persist artifact
          await this.prisma.generatedArtifact.upsert({
            where: { projectId_filePath: { projectId, filePath } },
            create: {
              projectId,
              type: 'file',
              filePath,
              language: this.languageFor(filePath),
              content,
              lineCount: content.split('\n').length,
              agentType,
              status: 'done',
            },
            update: { content, lineCount: content.split('\n').length, status: 'done' },
          });

          const file = projectGraph.getOrThrow(projectId).generatedFiles.find(f => f.filePath === filePath);
          yield { type: 'file_complete', agentType, filePath, file };
        } catch (err: unknown) {
          const error = err instanceof Error ? err.message : String(err);
          this.logger.error(`Codegen failed for ${filePath}: ${error}`);
          projectGraph.updateFileStatus(projectId, filePath, 'failed');
          yield { type: 'error', agentType, filePath, error };
        }
      }

      yield { type: 'phase_complete', agentType };
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: { forgeStatus: 'generated', forgePhase: 'testing' },
    });

    yield { type: 'done' };
  }

  private buildFileList(agentType: ForgeAgentType, modules: string[]): string[] {
    switch (agentType) {
      case 'frontend':
        return [
          'apps/web/app/layout.tsx',
          'apps/web/app/page.tsx',
          ...modules.slice(0, 3).map(m => `apps/web/app/${m.toLowerCase().replace(/\s+/g, '-')}/page.tsx`),
          'apps/web/components/ui/Button.tsx',
          'apps/web/components/ui/Card.tsx',
        ];
      case 'backend':
        return [
          'services/api/src/main.ts',
          'services/api/src/app.module.ts',
          ...modules.slice(0, 3).map(m => `services/api/src/${m.toLowerCase().replace(/\s+/g, '-')}/${m.toLowerCase().replace(/\s+/g, '-')}.module.ts`),
        ];
      case 'database':
        return [
          'packages/database/prisma/schema.prisma',
          'packages/database/prisma/seed.ts',
        ];
      case 'devops':
        return [
          'Dockerfile',
          'docker-compose.yml',
          '.github/workflows/ci.yml',
        ];
      default:
        return [`src/${agentType}/index.ts`];
    }
  }

  private languageFor(filePath: string): string {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) return 'typescript';
    if (filePath.endsWith('.prisma')) return 'prisma';
    if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) return 'yaml';
    if (filePath.endsWith('.json')) return 'json';
    if (filePath.endsWith('Dockerfile')) return 'dockerfile';
    return 'text';
  }

  private buildCodegenPrompt(agentType: ForgeAgentType, filePath: string, ctx: ReturnType<typeof projectGraph.getOrThrow>): string {
    return `Generate the complete, production-ready file for: ${filePath}

Project: ${ctx.prompt}
${ctx.plan ? `Stack: ${JSON.stringify(ctx.plan.stack)}` : ''}
${ctx.architecture ? `Architecture pattern: ${ctx.architecture.pattern}` : ''}

Requirements:
- TypeScript strict mode, no any
- Follow project conventions
- Include all necessary imports
- Production quality — no TODOs or placeholder comments
- Complete implementation, not pseudocode

Output ONLY the file content, no markdown code fences, no explanation.`;
  }
}
