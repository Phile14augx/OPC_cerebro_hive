import { FastifyInstance } from 'fastify';
import { ExecutionStore } from '@cerebro/runtime-core/src/execution/ExecutionStore';
import { ExecutionRuntimeKernel } from '@cerebro/runtime-core/src/execution/kernel/ExecutionRuntimeKernel';
import { StartExecutionCommand, ResumeExecutionCommand, CancelExecutionCommand } from '@cerebro/runtime-contracts/src/commands/ExecutionCommand';

export interface ExecutionsRoutesDeps {
  executionKernel: ExecutionRuntimeKernel;
  executionStore: ExecutionStore;
}

export async function executionsRoutes(
  fastify: FastifyInstance,
  deps: ExecutionsRoutesDeps
) {
  fastify.post('/', async (request, reply) => {
    const { agentId, agentVersionId, input } = request.body as any;
    if (!agentId || !agentVersionId || !input) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }

    const command: StartExecutionCommand = {
      id: crypto.randomUUID(),
      type: 'StartExecutionCommand',
      executionId: crypto.randomUUID(),
      timestamp: new Date(),
      tenantId: request.cerebroContext?.tenantId || 'system',
      payload: {
        agentId,
        agentVersionId,
        input,
      }
    };

    const executionId = await deps.executionKernel.dispatchCommand(command);
    return reply.code(201).send({ executionId });
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const execution = await deps.executionStore.getExecution(id);
    if (!execution) {
      return reply.code(404).send({ error: 'Execution not found' });
    }
    return reply.send(execution);
  });

  fastify.post('/:id/resume', async (request, reply) => {
    const { id } = request.params as any;
    const { expectedSequence } = request.body as any;

    if (expectedSequence === undefined) {
      return reply.code(400).send({ error: 'Missing expectedSequence for idempotent resume' });
    }

    const command: ResumeExecutionCommand = {
      id: crypto.randomUUID(),
      type: 'ResumeExecutionCommand',
      executionId: id,
      timestamp: new Date(),
      tenantId: request.cerebroContext?.tenantId || 'system',
      payload: {
        expectedSequence: BigInt(expectedSequence)
      }
    };

    try {
      await deps.executionKernel.dispatchCommand(command);
      return reply.send({ success: true, status: 'resumed' });
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        return reply.code(400).send({ error: err.message });
      }
      if (err.message.includes('Idempotency')) {
        return reply.code(409).send({ error: err.message });
      }
      return reply.code(500).send({ error: err.message });
    }
  });

  fastify.post('/:id/cancel', async (request, reply) => {
    const { id } = request.params as any;
    
    const command: CancelExecutionCommand = {
      id: crypto.randomUUID(),
      type: 'CancelExecutionCommand',
      executionId: id,
      timestamp: new Date(),
      tenantId: request.cerebroContext?.tenantId || 'system',
      payload: {
        reason: 'API cancellation request',
        requestedBy: request.cerebroContext?.userId || 'system'
      }
    };

    try {
      await deps.executionKernel.dispatchCommand(command);
      return reply.send({ success: true, status: 'CANCELLED' });
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        return reply.code(400).send({ error: err.message });
      }
      return reply.code(500).send({ error: err.message });
    }
  });

  fastify.get('/:id/events', async (request, reply) => {
    const { id } = request.params as any;
    const events = await deps.executionStore.getEvents(id);
    // Convert bigint sequences to string for JSON serialization
    const serialized = events.map(e => ({
      ...e,
      sequence: e.sequence.toString()
    }));
    return reply.send(serialized);
  });

  fastify.get('/:id/snapshot', async (request, reply) => {
    const { id } = request.params as any;
    const snapshot = await deps.executionStore.getLatestSnapshot(id);
    if (!snapshot) {
      return reply.code(404).send({ error: 'Snapshot not found' });
    }
    
    return reply.send({
      ...snapshot,
      sequence: snapshot.sequence.toString()
    });
  });
}
