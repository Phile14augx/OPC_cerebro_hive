// =============================================================================
// AgentOrchestratorService
// Runs a single agent for a project phase, persists the run to the DB,
// and updates the ProjectGraph with agent status + result artefacts.
// =============================================================================
import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaClient } from '@prisma/client';
import type { AIService } from '@cerebro/ai';
import { FORGE_SYSTEM_PROMPTS } from '@cerebro/ai';
import { projectGraph } from '@cerebro/workflow';
import type { ForgeAgentType, ForgePhase } from '@cerebro/workflow';
import { AI_SERVICE } from './ai.provider';

export interface RunAgentOptions {
  projectId: string;
  agentType: ForgeAgentType;
  phase: ForgePhase;
  userPrompt: string;
  schema?: string;
  schemaDescription?: string;
}

export interface AgentRunResult<T = string> {
  runId: string;
  agentType: ForgeAgentType;
  output: T;
  tokensIn: number;
  tokensOut: number;
  durationMs: number;
}

@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);

  constructor(
    @Inject(AI_SERVICE) private readonly ai: AIService,
    private readonly prisma: PrismaClient,
    private readonly events: EventEmitter2,
  ) {}

  async runAgent<T = string>(opts: RunAgentOptions): Promise<AgentRunResult<T>> {
    const { projectId, agentType, phase, userPrompt, schema, schemaDescription } = opts;
    const systemPrompt = FORGE_SYSTEM_PROMPTS[agentType];

    // Mark agent as running
    projectGraph.setAgentStatus(projectId, agentType, 'running');
    this.events.emit('agent.started', { projectId, agentType, phase });

    // Create DB run record
    const run = await this.prisma.forgeAgentRun.create({
      data: {
        projectId,
        agentType,
        phase,
        systemPrompt,
        userPrompt,
        status: 'running',
        startedAt: new Date(),
      },
    });

    const startedAt = Date.now();

    try {
      let output: T;
      let tokensIn = 0;
      let tokensOut = 0;

      if (schema && schemaDescription) {
        // Structured JSON output
        const result = await this.ai.generateStructured<T>({
          systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          schema,
          schemaDescription,
        });
        output = result;
        tokensIn = 0;
        tokensOut = 0;
      } else {
        // Plain text
        const result = await this.ai.generateText({ 
          systemPrompt, 
          messages: [{ role: 'user', content: userPrompt }] 
        });
        output = result.text as unknown as T;
        tokensIn = result.tokensIn;
        tokensOut = result.tokensOut;
      }

      const durationMs = Date.now() - startedAt;

      // Persist result
      await this.prisma.forgeAgentRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          response: typeof output === 'string' ? output : JSON.stringify(output),
          tokensIn,
          tokensOut,
          durationMs,
          completedAt: new Date(),
        },
      });

      projectGraph.setAgentStatus(projectId, agentType, 'completed');
      this.events.emit('agent.completed', { projectId, agentType, phase, durationMs });

      return { runId: run.id, agentType, output, tokensIn, tokensOut, durationMs };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Agent ${agentType} failed for project ${projectId}: ${message}`);

      await this.prisma.forgeAgentRun.update({
        where: { id: run.id },
        data: { status: 'failed', errorMessage: message, completedAt: new Date() },
      });

      projectGraph.setAgentStatus(projectId, agentType, 'failed');
      this.events.emit('agent.failed', { projectId, agentType, phase, error: message });
      throw err;
    }
  }

  /** Stream text from an agent, emitting chunks via EventEmitter */
  async *streamAgent(opts: Omit<RunAgentOptions, 'schema' | 'schemaDescription'>): AsyncGenerator<string> {
    const { projectId, agentType, phase, userPrompt } = opts;
    const systemPrompt = FORGE_SYSTEM_PROMPTS[agentType];

    projectGraph.setAgentStatus(projectId, agentType, 'running');
    this.events.emit('agent.started', { projectId, agentType, phase });

    const run = await this.prisma.forgeAgentRun.create({
      data: {
        projectId,
        agentType,
        phase,
        systemPrompt,
        userPrompt,
        status: 'running',
        startedAt: new Date(),
      },
    });

    const chunks: string[] = [];
    const startedAt = Date.now();

    try {
      for await (const chunk of this.ai.streamText({ 
        systemPrompt, 
        messages: [{ role: 'user', content: userPrompt }] 
      })) {
        if (chunk.delta) {
          chunks.push(chunk.delta);
          yield chunk.delta;
        }
      }

      const response = chunks.join('');
      const durationMs = Date.now() - startedAt;

      await this.prisma.forgeAgentRun.update({
        where: { id: run.id },
        data: { status: 'completed', response, durationMs, completedAt: new Date() },
      });

      projectGraph.setAgentStatus(projectId, agentType, 'completed');
      this.events.emit('agent.completed', { projectId, agentType, phase, durationMs });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      await this.prisma.forgeAgentRun.update({
        where: { id: run.id },
        data: { status: 'failed', errorMessage: message, completedAt: new Date() },
      });
      projectGraph.setAgentStatus(projectId, agentType, 'failed');
      throw err;
    }
  }
}
