import { FastifyRequest, FastifyReply } from 'fastify';
import {
  safeVerifyJWT,
  isSystemAdmin,
  getRealmRoles,
  getClientRoles,
  getPermissions,
  type CerebroJWTPayload,
  type OrgRole,
} from '@cerebro/auth/server';

/**
 * Real authentication, replacing the mock header-based identity that used to
 * live in RequestContextMiddleware (see the comment that was there: "In a
 * real scenario, these would come from authentication (JWTs) and API
 * gateways. We mock them here for demonstration of the architecture.").
 *
 * This mirrors the pattern services/forge-api's JwtGuard already uses
 * correctly via the same @cerebro/auth package — same safeVerifyJWT call,
 * same Bearer extraction, same shape of verified identity. Registered as a
 * preHandler on a protected route group in bootstrap.ts; health routes are
 * registered outside that group and never hit this hook.
 *
 * tenantId and userId now come exclusively from the verified JWT payload
 * (org_id / sub) — no longer spoofable via x-tenant-id / x-user-id headers.
 * workspaceId is a known, tracked gap: the JWT carries org-level identity,
 * not workspace-level, so it's still read from a header below. That value
 * is NOT proof of access to that workspace by itself — every route that
 * uses it already checks `resource.workspaceId !== workspaceId` against the
 * DB record, which at least confirms the resource belongs to *a* workspace
 * matching the header, but nothing here yet confirms the authenticated
 * tenant is *entitled* to that workspace. Closing that fully needs a
 * workspace-to-tenant ownership check in the database layer, which hasn't
 * been added yet — tracked as a follow-up, not silently treated as solved.
 */
export async function requireAuthHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = request.headers['authorization'];

  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: 'Bearer token required',
      requestId: request.cerebroContext?.traceId,
    });
    return;
  }

  const token = header.slice(7);
  const result = await safeVerifyJWT(token);

  if ('error' in result) {
    reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: result.isExpired ? 'Token expired' : 'Invalid token',
      requestId: request.cerebroContext?.traceId,
    });
    return;
  }

  const payload: CerebroJWTPayload = result.payload;
  const roles = [...getRealmRoles(payload), ...getClientRoles(payload)];
  const isAdmin = isSystemAdmin(payload);

  // getPermissions() is @cerebro/auth's own RBAC map (packages/auth/src/rbac/permissions.ts)
  // — already built, just never called from platform-api before this. '*' for
  // system admins mirrors how @cerebro/auth's own requirePermission/requireRole
  // treat req.auth.isAdmin (short-circuit, bypass the permission map).
  const permissions = isAdmin
    ? ['*']
    : payload.org_role
      ? getPermissions(payload.org_role as OrgRole)
      : [];

  // Overwrite the mock identity fields with verified values. workspaceId is
  // deliberately left alone here — see the gap noted above.
  request.cerebroContext.tenantId = payload.org_id ?? payload.sub;
  request.cerebroContext.userId = payload.sub;
  request.cerebroContext.roles = roles;
  request.cerebroContext.permissions = permissions;
}

/**
 * Fastify equivalent of @cerebro/auth's requirePermission() Express
 * middleware (packages/auth/src/middleware/express.ts) — same semantics
 * (403 if the permission isn't in the caller's set, '*' bypasses), just
 * adapted to a preHandler since platform-api runs Fastify, not Express.
 * Must run after requireAuthHook. Apply per-route to mutating/sensitive
 * endpoints, not globally — most GET routes don't need a specific
 * permission beyond "authenticated + owns the workspace."
 */
export function requirePermission(permission: string) {
  return async function requirePermissionHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const permissions = request.cerebroContext.permissions ?? [];
    if (permissions.includes('*') || permissions.includes(permission)) return;

    reply.code(403).send({
      error: 'FORBIDDEN',
      message: `Missing permission: ${permission}`,
      requestId: request.cerebroContext.traceId,
    });
  };
}
