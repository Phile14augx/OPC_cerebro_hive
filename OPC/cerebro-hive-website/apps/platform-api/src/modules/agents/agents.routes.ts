import { FastifyInstance } from 'fastify';
import { PublishAgentDto, AgentResponseDto } from './dto/agents.dto';
import { CreateAgentCommand } from './agents.commands';
import { CommandBus } from '@cerebro/core-bus';

export default async function agentRoutes(fastify: FastifyInstance, options: { bus: CommandBus }) {
  const { bus } = options;

  fastify.post(
    '/:agentId/publish',
    {
      schema: {
        body: PublishAgentDto,
        response: {
          201: AgentResponseDto,
        },
      },
    },
    async (request, reply) => {
      const { agentId } = request.params as { agentId: string };
      const body = request.body as any;
      const idempotencyKey = request.headers['idempotency-key'] as string | undefined;

      const command = new CreateAgentCommand(agentId, body, idempotencyKey);
      
      const result = await bus.execute(command, request.cerebroContext);

      if (result.isFailure) {
        // Will be caught by the global error handler which maps it to Problem Details
        throw result.error;
      }

      return reply.code(201).send(result.data);
    }
  );
}
