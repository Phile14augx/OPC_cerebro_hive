import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type {
  AgentDraftService,
  AgentLifecycleService,
  AgentPublicationService,
  AgentRegistryActorContext,
  AgentRegistryService,
  Result,
} from '@cerebro/domain';
import {
  AgentIdParams,
  AgentVersionParams,
  CreateAgentBody,
  LifecycleBody,
  PublishDraftBody,
  UpdateDraftBody,
} from './agents.schemas';

export interface AgentsRouteOptions {
  registryService: AgentRegistryService;
  draftService: AgentDraftService;
  publicationService: AgentPublicationService;
  lifecycleService: AgentLifecycleService;
}

function actor(request: FastifyRequest): AgentRegistryActorContext {
  const context = request.cerebroContext;
  return {
    tenantId: context.tenantId,
    workspaceId: context.workspaceId!,
    userId: context.userId,
    permissions: context.permissions ?? [],
    traceId: context.traceId,
    correlationId: context.correlationId,
  };
}

function statusFor(code: string): number {
  if (code === 'AGENT_FORBIDDEN') return 403;
  if (code === 'AGENT_NOT_FOUND') return 404;
  if (code.includes('CONFLICT')) return 409;
  if (code === 'AGENT_DEFINITION_INVALID' || code === 'AGENT_DRAFT_INVALID') return 422;
  return 400;
}

function sendResult(reply: FastifyReply, request: FastifyRequest, result: Result<unknown>, successStatus = 200) {
  if (result.isSuccess) return reply.code(successStatus).send({ success: true, data: result.data });
  const error = result.error! as typeof result.error & { details?: Record<string, unknown> };
  return reply.code(statusFor(error.code)).send({
    success: false,
    error: { code: error.code, message: error.message, details: error.details ?? {}, requestId: request.cerebroContext.traceId },
  });
}

export default async function agentRoutes(fastify: FastifyInstance, services: AgentsRouteOptions) {
  fastify.get('/', async (request, reply) => sendResult(reply, request, await services.registryService.list(actor(request))));

  fastify.post('/', { schema: { body: CreateAgentBody } }, async (request, reply) => (
    sendResult(reply, request, await services.registryService.create(request.body as { name: string; description?: string }, actor(request)), 201)
  ));

  fastify.get('/:id', { schema: { params: AgentIdParams } }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return sendResult(reply, request, await services.registryService.get(id, actor(request)));
  });

  fastify.get('/:id/draft', { schema: { params: AgentIdParams } }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return sendResult(reply, request, await services.draftService.get(id, actor(request)));
  });

  fastify.patch('/:id/draft', { schema: { params: AgentIdParams, body: UpdateDraftBody } }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return sendResult(reply, request, await services.draftService.update(id, request.body as any, actor(request)));
  });

  fastify.get('/:id/versions', { schema: { params: AgentIdParams } }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return sendResult(reply, request, await services.registryService.listVersions(id, actor(request)));
  });

  fastify.get('/:id/versions/:versionId', { schema: { params: AgentVersionParams } }, async (request, reply) => {
    const { id, versionId } = request.params as { id: string; versionId: string };
    return sendResult(reply, request, await services.registryService.getVersion(id, versionId, actor(request)));
  });

  fastify.post('/:id/publish', { schema: { params: AgentIdParams, body: PublishDraftBody } }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const rawKey = request.headers['idempotency-key'];
    const idempotencyKey = Array.isArray(rawKey) ? rawKey[0] : rawKey;
    if (!idempotencyKey?.trim()) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'AGENT_IDEMPOTENCY_KEY_REQUIRED',
          message: 'An Idempotency-Key header is required for publication',
          details: {},
          requestId: request.cerebroContext.traceId,
        },
      });
    }
    return sendResult(
      reply,
      request,
      await services.publicationService.publish(
        id,
        { expectedDraftRevision: (request.body as { expectedDraftRevision: number }).expectedDraftRevision, idempotencyKey },
        actor(request),
      ),
      201,
    );
  });

  fastify.post('/:id/lifecycle', { schema: { params: AgentIdParams, body: LifecycleBody } }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return sendResult(reply, request, await services.lifecycleService.transition(id, request.body as any, actor(request)));
  });
}
