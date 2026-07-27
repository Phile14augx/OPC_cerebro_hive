import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { AgentRuntimeService } from '@cerebro/agent-builder-capability';
import { AgentRepository } from '@cerebro/database';
import { AgentExecutionContext } from '@cerebro/domain';

export interface ConversationsRouteOptions extends FastifyPluginOptions {
  agentRuntimeService: AgentRuntimeService;
  agentRepository: AgentRepository;
}

/**
 * M10.1 (Real Agent Execution): both handlers now do real work instead of
 * returning hardcoded responses. Conversation persistence is explicitly
 * deferred to M10.4 — see AGENT-RUNTIME-BACKLOG.md — so there is no
 * Conversation/Message store behind this yet:
 *  - POST / returns a transient handle; nothing is written to the DB.
 *  - POST /:id/messages treats `id` as the agentId directly (there is no
 *    persisted conversation to resolve it through yet). From M10.4 onward
 *    `id` becomes a real AgentConversation id and this route will load the
 *    agent through that relation instead.
 */
export default async function conversationsRoutes(fastify: FastifyInstance, opts: ConversationsRouteOptions) {
  const { agentRuntimeService, agentRepository } = opts;

  fastify.post(
    '/',
    { schema: { body: Type.Object({ agentId: Type.String() }) } },
    async (request, reply) => {
      const { agentId } = request.body as { agentId: string };
      return reply.status(201).send({
        id: `conv-${Math.random().toString(36).slice(2)}`,
        agentId,
        status: 'started',
      });
    }
  );

  fastify.post(
    '/:id/messages',
    { schema: { body: Type.Object({ message: Type.String() }) } },
    async (request, reply) => {
      const { id: agentId } = request.params as { id: string };
      const { message } = request.body as { message: string };
      const cerebroContext = request.cerebroContext;

      const version = await agentRepository.getLatestVersion(agentId, { context: cerebroContext });
      if (!version) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: `No published version found for agent ${agentId}`,
            requestId: cerebroContext.traceId,
          },
        });
      }

      const executionContext: AgentExecutionContext = {
        conversationId: `conv-${agentId}`,
        tenantId: cerebroContext.tenantId,
        workspaceId: cerebroContext.workspaceId,
        userId: cerebroContext.userId ?? 'anonymous',
        traceId: cerebroContext.traceId,
        correlationId: cerebroContext.correlationId,
        agentVersionId: version.id,
        promptVersionId: version.id, // placeholder until PromptTemplate wiring exists
        modelId: version.modelId,
        memory: { workingMemory: {}, conversationHistory: [] },
        availableTools: [],
        tokenBudget: { maxTokens: 4096, tokensUsed: 0 },
        executionMode: 'sync',
      };

      const result = await agentRuntimeService.execute(executionContext, message, version.instructions);
      return reply.send(result);
    }
  );
}
