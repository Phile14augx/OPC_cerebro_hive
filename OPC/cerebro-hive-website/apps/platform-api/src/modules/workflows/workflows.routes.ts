import { FastifyInstance } from 'fastify';

export async function workflowsRoutes(fastify: FastifyInstance) {
  fastify.post('/:templateId/execute', async (request, reply) => {
    // Scaffold: Trigger a workflow
    // 1. Fetch template
    // 2. Invoke TemporalWorkflowEngine
    // 3. Return Execution ID
    return reply.status(201).send({
      executionId: `exec-${Math.random().toString(36).substring(7)}`,
      status: 'running'
    });
  });

  fastify.get('/executions/:id', async (request, reply) => {
    // Scaffold: Get workflow status
    return reply.send({
      status: 'RUNNING',
      progress: 50
    });
  });
}
