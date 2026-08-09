import { RequestContext } from "@cerebro/db";
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    cerebroContext: RequestContext;
  }
}

export function requestContextHook(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
) {
  // tenantId / userId / roles / permissions are NOT set here anymore — they
  // used to be read straight from x-tenant-id / x-user-id headers with no
  // verification, which meant any caller could claim to be any tenant. Real
  // identity is now established by requireAuthHook (AuthMiddleware.ts),
  // which runs after this hook on every protected route and overwrites
  // these fields from a verified JWT. This hook only sets up the parts that
  // are legitimately fine to take from the client (tracing) and a
  // placeholder tenantId so the type is satisfied before auth runs.
  //
  // workspaceId still comes from a header — the JWT doesn't carry
  // workspace-level identity, only org-level (see AuthMiddleware.ts). This
  // header value is NOT trusted on its own anymore: WorkspaceAccessMiddleware
  // (registered after requireAuthHook in bootstrap.ts) looks it up against
  // the verified tenantId via WorkspaceRepository.getWorkspaceById and 403s
  // if it doesn't belong to that tenant. No default here on purpose — a
  // missing header should fail that check explicitly (400) rather than
  // silently resolve to a fake 'default-workspace' id that was never a real
  // row and would previously have passed every downstream ownership check
  // by definition.
  const workspaceId = request.headers["x-workspace-id"] as string | undefined;

  const traceId = (request.headers["x-trace-id"] as string) || `trace-${Date.now()}`;
  const correlationId = (request.headers["x-correlation-id"] as string) || traceId;

  request.cerebroContext = {
    tenantId: "unauthenticated", // overwritten by requireAuthHook on protected routes
    workspaceId,
    userId: undefined,
    traceId,
    correlationId,
    timestamp: new Date(),
  };

  done();
}
