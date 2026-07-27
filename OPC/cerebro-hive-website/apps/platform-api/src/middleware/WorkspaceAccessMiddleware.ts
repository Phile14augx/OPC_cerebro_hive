import { FastifyRequest, FastifyReply } from 'fastify';
import { WorkspaceRepository } from '@cerebro/database';

/**
 * Closes the gap noted in AuthMiddleware.ts and tracked as task #44: the
 * verified JWT proves org-level identity but carries no workspace claim, so
 * workspaceId was still being trusted from an `x-workspace-id` header with
 * no check that the authenticated tenant actually owns that workspace.
 *
 * WorkspaceRepository.getWorkspaceById() already existed and already scopes
 * its query by both workspaceId and the tenantId pulled from the request
 * context (`db.workspace.findFirst({ where: { id: workspaceId, tenantId } })`)
 * — it just wasn't being called anywhere before a request reached a route
 * handler. This wires it in as a preHandler so every protected route gets
 * the check for free, the same way requireAuthHook works.
 *
 * Must run after requireAuthHook (needs a verified tenantId already set on
 * request.cerebroContext) — registered second in bootstrap.ts's protected
 * route group.
 */
export function createRequireWorkspaceAccessHook(workspaceRepository: WorkspaceRepository) {
  return async function requireWorkspaceAccessHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { workspaceId, traceId } = request.cerebroContext;

    if (!workspaceId) {
      reply.code(400).send({
        error: 'BAD_REQUEST',
        message: 'x-workspace-id header is required',
        requestId: traceId,
      });
      return;
    }

    const workspace = await workspaceRepository.getWorkspaceById(workspaceId, {
      context: request.cerebroContext,
    });

    if (!workspace) {
      // Deliberately the same response whether the workspace doesn't exist
      // at all or exists but belongs to a different tenant — returning a
      // distinct "exists but not yours" error would let a caller enumerate
      // other tenants' workspace IDs by watching which ones 404 vs 403.
      reply.code(403).send({
        error: 'FORBIDDEN',
        message: 'Workspace not found or not accessible to this tenant',
        requestId: traceId,
      });
      return;
    }
  };
}
