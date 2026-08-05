import { FastifyInstance } from 'fastify';
import { prisma } from '@cerebro/db';
import { requirePermission } from '../../middleware/AuthMiddleware';

export default async function telemetryRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requirePermission('ai:usage_read'));

  // GET OVERVIEW
  fastify.get(
    '/overview',
    async (request, reply) => {
      const workspaceId = request.cerebroContext.workspaceId;
      // In a real system, we'd aggregate AgentExecution and WorkflowExecution
      // For now, we mock some aggregated data based on pseudo queries.
      const execs = await prisma.agentExecution.findMany({
        where: { agent: { workspaceId } }
      });

      return reply.send({
        success: true,
        data: {
          rpm: execs.length * 10,
          avgLatencyMs: 650,
          avgTtftMs: 240,
          totalCostUsd: 120.50,
          errorRate: 0.01,
          cacheHitRate: 0.22,
        }
      });
    }
  );

  // LIST TRACES (Pseudo Traces from Executions)
  fastify.get(
    '/traces',
    async (request, reply) => {
      const workspaceId = request.cerebroContext.workspaceId;
      
      // Map AgentExecutions to Traces
      const agentExecs = await prisma.agentExecution.findMany({
        where: { agent: { workspaceId } },
        orderBy: { startedAt: 'desc' },
        take: 50,
        include: { agent: true }
      });

      const traces = agentExecs.map(ex => {
        // AgentExecution.metrics is a relation (AgentExecutionMetric[]), not
        // a JSON blob -- these values are real scalar fields on the model
        // itself, not nested under a "metrics" object.
        return {
          id: ex.id,
          traceId: ex.traceId ?? `tr-${ex.id}`,
          timestamp: ex.startedAt.toISOString(),
          endpoint: `/v1/agents/${ex.agentId}/execute`,
          method: 'POST',
          status: ex.status === 'SUCCESS' ? 200 : 500,
          durationMs: ex.durationMs ?? 1000,
          tokens: {
            prompt: ex.inputTokens ?? 0,
            completion: ex.outputTokens ?? 0,
            total: (ex.inputTokens ?? 0) + (ex.outputTokens ?? 0),
          },
          costUsd: ex.costUsd ?? 0,
          model: ex.model ?? 'unknown',
          provider: ex.provider ?? 'unknown'
        };
      });

      return reply.send({ success: true, data: traces });
    }
  );

  // GET TRACE DETAILS
  fastify.get(
    '/traces/:id',
    async (request, reply) => {
      const workspaceId = request.cerebroContext.workspaceId;
      const { id } = request.params as { id: string };

      const ex = await prisma.agentExecution.findUnique({
        where: { id },
        include: { agent: true }
      });

      if (!ex || ex.agent.workspaceId !== workspaceId) {
        return reply.code(404).send({
          success: false,
          error: { code: 'TRACE_NOT_FOUND', message: 'Trace not found.' }
        });
      }

      // AgentExecution.metrics is a relation (AgentExecutionMetric[]), not
      // a JSON blob -- these values are real scalar fields on the model.
      const summary = {
        id: ex.id,
        traceId: ex.traceId ?? `tr-${ex.id}`,
        timestamp: ex.startedAt.toISOString(),
        endpoint: `/v1/agents/${ex.agentId}/execute`,
        method: 'POST',
        status: ex.status === 'SUCCESS' ? 200 : 500,
        durationMs: ex.durationMs ?? 1000,
        tokens: {
          prompt: ex.inputTokens ?? 0,
          completion: ex.outputTokens ?? 0,
          total: (ex.inputTokens ?? 0) + (ex.outputTokens ?? 0),
        },
        costUsd: ex.costUsd ?? 0,
        model: ex.model ?? 'unknown',
        provider: ex.provider ?? 'unknown'
      };

      // Pseudo spans based on the single execution
      const spans = [
        {
          id: `s-${ex.id}-1`,
          parentId: null,
          name: `HTTP POST /v1/agents/${ex.agentId}/execute`,
          service: 'api-gateway',
          startTime: ex.startedAt.toISOString(),
          endTime: ex.completedAt?.toISOString() || new Date().toISOString(),
          durationMs: ex.durationMs ?? 1000,
          status: ex.status === 'SUCCESS' ? 'ok' : 'error',
          attributes: { 'http.status': summary.status }
        }
      ];

      return reply.send({
        success: true,
        data: { summary, spans }
      });
    }
  );
}
