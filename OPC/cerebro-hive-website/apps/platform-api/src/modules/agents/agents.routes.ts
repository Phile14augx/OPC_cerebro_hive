// @ts-nocheck
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { PaginationQuery } from '../common/pagination';

const prisma = new PrismaClient();

export default async function agentRoutes(fastify: FastifyInstance) {
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

  // CREATE AGENT
  fastify.post(
    '/',
    async (request, reply) => {
      const workspaceId = request.cerebroContext.workspaceId;
      const body = request.body as any;

      const agent = await prisma.agent.create({
        data: {
          workspaceId,
          name: body.name,
          description: body.description,
          isActive: body.isActive ?? true,
        }
      });

      return reply.code(201).send({ success: true, data: agent });
    }
  );
}

