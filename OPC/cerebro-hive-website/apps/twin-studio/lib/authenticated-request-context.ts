import type { NextRequest } from "next/server";

type VerifiedIdentity = { sub?: string; org_id?: string };
type WorkspaceAuthorization = { authorized: boolean; role: string | null };

export type RequestAccess = "READ" | "WRITE";
export type AuthenticatedScope = { tenantId: string; workspaceId: string; userId: string };

export interface AuthenticatedRequestDependencies {
  verifyToken(token: string): Promise<VerifiedIdentity>;
  authorizeWorkspace(input: AuthenticatedScope): Promise<WorkspaceAuthorization>;
}

const WRITE_ROLES = new Set(["OWNER", "ADMIN", "DEVELOPER"]);

function bearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (match?.[1]) return match[1].trim();
  return request.cookies.get("access_token")?.value;
}

export class AuthenticatedRequestContext {
  constructor(private readonly dependencies: AuthenticatedRequestDependencies) {}

  async resolve(request: NextRequest, access: RequestAccess): Promise<AuthenticatedScope> {
    const token = bearerToken(request);
    if (!token) throw new Error("UNAUTHENTICATED");

    let identity: VerifiedIdentity;
    try {
      identity = await this.dependencies.verifyToken(token);
    } catch {
      throw new Error("UNAUTHENTICATED");
    }
    if (!identity.sub || !identity.org_id) throw new Error("UNAUTHENTICATED");

    const workspaceId = request.headers.get("x-workspace-id");
    if (!workspaceId) throw new Error("WORKSPACE_REQUIRED");
    const scope = { tenantId: identity.org_id, workspaceId, userId: identity.sub };
    const authorization = await this.dependencies.authorizeWorkspace(scope);
    if (!authorization.authorized) throw new Error("FORBIDDEN");
    if (access === "WRITE" && !WRITE_ROLES.has(authorization.role?.toUpperCase() ?? ""))
      throw new Error("FORBIDDEN");
    return scope;
  }
}
