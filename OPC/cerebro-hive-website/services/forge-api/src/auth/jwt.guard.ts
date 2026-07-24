/**
 * forge-api — JwtGuard (NestJS guard wrapping @cerebro/auth JWT verification)
 */

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { safeVerifyJWT, isSystemAdmin, type CerebroJWTPayload } from "@cerebro/auth";
import type { Request } from "express";

@Injectable()
export class JwtGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & {
      auth?: {
        userId:  string;
        orgId:   string | null;
        orgRole: string | null;
        email:   string | null;
        name:    string | null;
        isAdmin: boolean;
        authType: "jwt";
        jwtPayload: CerebroJWTPayload;
        traceId: string | null;
      };
    }>();

    const header = req.headers["authorization"];
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Bearer token required");
    }

    const token = header.slice(7);
    const result = await safeVerifyJWT(token);

    if ("error" in result) {
      throw new UnauthorizedException(
        result.isExpired ? "Token expired" : "Invalid token"
      );
    }

    const p = result.payload;
    req.auth = {
      userId:     p.sub,
      orgId:      p.org_id ?? null,
      orgRole:    p.org_role ?? null,
      email:      p.email   ?? null,
      name:       p.name    ?? null,
      isAdmin:    isSystemAdmin(p),
      authType:   "jwt",
      jwtPayload: p,
      traceId:    req.headers["x-trace-id"] as string ?? null,
    };

    return true;
  }
}
