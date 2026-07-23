import { FastifyInstance } from 'fastify';

export async function conversationsRoutes(fastify: FastifyInstance) {
  fastify.post('/', async (request, reply) => {
    // Scaffold: Start a new conversation with an Agent
    // 1. Create AgentConversation in DB
    // 2. Return Conversation ID
    return reply.status(201).send({
      id: `conv-${Math.random().toString(36).substring(7)}`,
      status: 'started'
    });
  });

  fastify.post('/:id/messages', async (request, reply) => {
    // Scaffold: Send a message to an Agent
    // 1. Extract context, load conversation
    // 2. Invoke AgentRuntimeService
    // 3. Return results or stream
    return reply.send({
      status: 'completed',
      messages: [
        { role: 'assistant', content: 'This is a mock response from the Agent Runtime scaffolding.' }
      ]
    });
  });
}
