import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { RequestContext } from '@cerebro/database';

declare module 'fastify' {
  interface FastifyRequest {
    cerebroContext: RequestContext;
  }
}

export function requestContextHook(request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
  // In a real scenario, these would come from authentication (JWTs) and API gateways.
  // We mock them here for demonstration of the architecture.
  const tenantId = (request.headers['x-tenant-id'] as string) || 'default-tenant';
  const workspaceId = (request.headers['x-workspace-id'] as string) || 'default-workspace';
  const userId = request.headers['x-user-id'] as string;
  
  const traceId = (request.headers['x-trace-id'] as string) || `trace-${Date.now()}`;
  const correlationId = (request.headers['x-correlation-id'] as string) || traceId;

  request.cerebroContext = {
    tenantId,
    workspaceId,
    userId,
    traceId,
    correlationId,
    timestamp: new Date()
  };

  done();
}
