
import { FastifyInstance } from 'fastify';
import { prisma } from '@cerebro/db';
import { PaginationQuery } from '../common/pagination';
import { AgentRepository } from '@cerebro/db';
import { requirePermission } from '../../middleware/AuthMiddleware';

export interface AgentsRouteOptions {
  agentRepository: AgentRepository;
}

export default async function agentRoutes(fastify: FastifyInstance, opts: AgentsRouteOptions) {
  const { agentRepository } = opts;

  // LIST AGENTS
  fastify.get(
    '/',
    { schema: { querystring: PaginationQuery } },
    async (request, reply) => {
      const workspaceId = request.cerebroContext.workspaceId;
      const { page = 1, limit = 20, sort, search } = request.query as any;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = { workspaceId };
      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }

      let orderBy: any = { createdAt: 'desc' };
      if (sort) {
        if (sort.startsWith('-')) orderBy = { [sort.substring(1)]: 'desc' };
        else orderBy = { [sort]: 'asc' };
      }

      const [total, data] = await Promise.all([
        prisma.agent.count({ where }),
        prisma.agent.findMany({
          where,
          skip,
          take,
          orderBy,
          include: { versions: { take: 1, orderBy: { version: 'desc' } } }
        })
      ]);

      return reply.send({
        success: true,
        data,
        meta: { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) }
      });
    }
  );

  // GET AGENT
  fastify.get(
    '/:id',
    async (request, reply) => {
      const workspaceId = request.cerebroContext.workspaceId;
      const { id } = request.params as { id: string };

      const agent = await prisma.agent.findUnique({
        where: { id },
        include: { versions: { orderBy: { version: 'desc' } } }
      });

      if (!agent || agent.workspaceId !== workspaceId) {
        return reply.code(404).send({
          success: false,
          error: { code: 'AGENT_NOT_FOUND', message: 'Agent not found.', requestId: request.cerebroContext.traceId }
        });
      }

      return reply.send({ success: true, data: agent });
    }
  );

  // CREATE AGENT — goes through AgentRepository.createAgent() so every
  // agent is created together with a runnable initial AgentVersion
  // (modelId + instructions), instead of a bare Agent row with nothing
  // behind it. That repository already wraps both writes in one call.
  fastify.post(
    '/',
    { preHandler: requirePermission('agents:create') },
    async (request, reply) => {
      const cerebroContext = request.cerebroContext;
      const body = request.body as any;

      if (!body.name || !body.modelId || !body.instructions) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'INVALID_AGENT_INPUT',
            message: 'name, modelId, and instructions are required to create an agent with a runnable version.',
            requestId: cerebroContext.traceId,
          }
        });
      }

      const { agent, initialVersion } = await agentRepository.createAgent(
        {
          name: body.name,
          description: body.description,
          avatarUrl: body.avatarUrl,
          modelId: body.modelId,
          instructions: body.instructions,
        },
        { context: cerebroContext }
      );

      return reply.code(201).send({ success: true, data: { ...agent, versions: [initialVersion] } });
    }
  );
}
