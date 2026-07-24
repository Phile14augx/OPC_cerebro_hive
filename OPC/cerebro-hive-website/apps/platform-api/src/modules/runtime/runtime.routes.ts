import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

const runtimeRoutes: FastifyPluginAsyncTypebox = async (server) => {
  // Execute
  server.post(
    '/execute',
    {
      schema: {
        description: 'Start a new execution',
        tags: ['Runtime'],
        body: Type.Object({
          type: Type.String(), // e.g., 'Agent', 'Workflow'
          id: Type.String(), // ID of the Agent or Workflow
          variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
        }),
        response: {
          202: Type.Object({
            executionId: Type.String(),
            status: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      // In a real implementation, this would push a command to the bus
      // and the Execution Scheduler would pick it up.
      return reply.code(202).send({
        executionId: 'mock-uuid-execution-id',
        status: 'Queued',
      });
    }
  );

  // Pause
  server.post(
    '/pause',
    {
      schema: {
        description: 'Pause a running execution',
        tags: ['Runtime'],
        body: Type.Object({
          executionId: Type.String(),
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
          }),
        },
      },
    },
    async (request, reply) => {
      return { success: true };
    }
  );

  // Resume
  server.post(
    '/resume',
    {
      schema: {
        description: 'Resume a paused execution',
        tags: ['Runtime'],
        body: Type.Object({
          executionId: Type.String(),
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
          }),
        },
      },
    },
    async (request, reply) => {
      return { success: true };
    }
  );

  // Cancel
  server.post(
    '/cancel',
    {
      schema: {
        description: 'Cancel an execution',
        tags: ['Runtime'],
        body: Type.Object({
          executionId: Type.String(),
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
          }),
        },
      },
    },
    async (request, reply) => {
      return { success: true };
    }
  );

  // Get Executions
  server.get(
    '/executions',
    {
      schema: {
        description: 'List executions',
        tags: ['Runtime'],
        response: {
          200: Type.Array(Type.Any()),
        },
      },
    },
    async (request, reply) => {
      return [];
    }
  );

  // Get Execution by ID
  server.get(
    '/executions/:id',
    {
      schema: {
        description: 'Get execution details',
        tags: ['Runtime'],
        params: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: Type.Any(),
        },
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      return { id: params.id, status: 'Completed' };
    }
  );

  // Server-Sent Events stream
  server.get(
    '/events/stream',
    {
      schema: {
        description: 'Stream runtime events via SSE',
        tags: ['Runtime'],
        querystring: Type.Object({
          executionId: Type.Optional(Type.String()),
        })
      },
    },
    async (request, reply) => {
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');
      
      reply.raw.write(`data: ${JSON.stringify({ type: 'Connected' })}\n\n`);

      // Mock streaming
      const interval = setInterval(() => {
        const event = {
          type: 'TokenStream',
          payload: { text: '...' }
        };
        reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
      }, 2000);

      request.raw.on('close', () => {
        clearInterval(interval);
      });
    }
  );
};

export default runtimeRoutes;
