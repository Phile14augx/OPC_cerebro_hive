/**
 * @cerebro/auth — Express middleware
 * requireAuth, optionalAuth, requireRole, requirePermission
 */

import type { NextFunction, Request, Response } from "express";
import { apiKeyRepository } from "@cerebro/db";
import { createHash, timingSafeEqual } from "node:crypto";
import { safeVerifyJWT, type CerebroJWTPayload, hasRealmRole, isSystemAdmin } from "../jwt/verify.js";
import { PERMISSION_MAP, type Permission, type OrgRole } from "../rbac/permissions.js";

// ── Augment Express Request ───────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      auth?: CerebroAuth;
    }
  }
}

export interface CerebroAuth {
  userId:    string;
  orgId:     string | null;
  orgRole:   OrgRole | null;
  email:     string | null;
  name:      string | null;
  isAdmin:   boolean;
  /** "jwt" | "api-key" */
  authType:  "jwt" | "api-key";
  /** Raw payload (jwt only) */
  jwtPayload?: CerebroJWTPayload;
  /** API key scopes (api-key only) */
  apiKeyScopes?: string[];
  traceId:   string | null;
}

// ── Token extraction ──────────────────────────────────────────────────────────

function extractBearerToken(req: Request): string | null {
  const header = req.headers["authorization"];
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
}

function extractApiKey(req: Request): string | null {
  const header = req.headers["x-api-key"];
  if (typeof header === "string" && header.length > 0) return header;
  if (typeof req.query["api_key"] === "string") return req.query["api_key"];
  return null;
}

// ── API key authentication ────────────────────────────────────────────────────

function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

async function authenticateApiKey(rawKey: string): Promise<CerebroAuth | null> {
  // Keys are formatted as: ck_<prefix>_<secret>
  const parts = rawKey.split("_");
  if (parts.length < 3 || parts[0] !== "ck") return null;

  const prefix = parts[1];
  if (!prefix) return null;

  const record = await apiKeyRepository.findByPrefix(prefix);
  if (!record) return null;

  // Constant-time comparison to prevent timing attacks
  const inputHash  = Buffer.from(hashApiKey(rawKey), "hex");
  const storedHash = Buffer.from(record.keyHash, "hex");

  if (inputHash.length !== storedHash.length) return null;
  if (!timingSafeEqual(inputHash, storedHash)) return null;

  // Check expiry
  if (record.expiresAt && record.expiresAt < new Date()) return null;

  // Fire-and-forget usage record
  void apiKeyRepository.recordUsage(record.id);

  return {
    userId:       record.userId,
    orgId:        record.orgId,
    orgRole:      null, // API keys don't carry org role; enforced by scopes
    email:        null,
    name:         null,
    isAdmin:      false,
    authType:     "api-key",
    apiKeyScopes: record.scopes,
    traceId:      null,
  };
}

// ── Core middleware ───────────────────────────────────────────────────────────

function unauthorized(res: Response, message: string = "Unauthorized"): void {
  res.status(401).json({ error: "UNAUTHORIZED", message });
}

function forbidden(res: Response, message: string = "Forbidden"): void {
  res.status(403).json({ error: "FORBIDDEN", message });
}

/**
 * Attaches `req.auth` if any valid credential present.
 * Does NOT reject if no credential — use `requireAuth` for that.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const traceId = req.headers["x-trace-id"] as string | undefined ?? null;

  const apiKey = extractApiKey(req);
  if (apiKey) {
    const auth = await authenticateApiKey(apiKey);
    if (auth) {
      req.auth = { ...auth, traceId };
    }
    return next();
  }

  const token = extractBearerToken(req);
  if (token) {
    const result = await safeVerifyJWT(token);
    if ("payload" in result) {
      const p = result.payload;
      req.auth = {
        userId:     p.sub,
        orgId:      p.org_id ?? null,
        orgRole:    (p.org_role as OrgRole) ?? null,
        email:      p.email ?? null,
        name:       p.name  ?? null,
        isAdmin:    isSystemAdmin(p),
        authType:   "jwt",
        jwtPayload: p,
        traceId,
      };
    }
  }

  next();
}

/**
 * Requires a valid credential; 401 otherwise.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  void (async () => {
    await optionalAuth(req, res, () => {
      if (!req.auth) {
        unauthorized(res);
      } else {
        next();
      }
    });
  })();
}

/**
 * Requires a specific realm/client role.
 * Must be composed after requireAuth.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) { unauthorized(res); return; }
    if (req.auth.isAdmin) { next(); return; }

    const userRole = req.auth.orgRole;
    if (userRole && roles.includes(userRole)) {
      next();
    } else {
      forbidden(res, `Requires one of: ${roles.join(", ")}`);
    }
  };
}

/**
 * Requires a fine-grained permission (RBAC).
 * Must be composed after requireAuth.
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) { unauthorized(res); return; }
    if (req.auth.isAdmin) { next(); return; }

    const role = req.auth.orgRole;
    if (!role) { forbidden(res); return; }

    const allowed = PERMISSION_MAP[role] ?? new Set<Permission>();
    if (allowed.has(permission)) {
      next();
    } else {
      forbidden(res, `Missing permission: ${permission}`);
    }
  };
}

/**
 * Requires API key auth specifically (for machine-to-machine endpoints).
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  if (!req.auth || req.auth.authType !== "api-key") {
    unauthorized(res, "API key required");
  } else {
    next();
  }
}

/**
 * Checks that the API key has a required scope.
 */
export function requireScope(scope: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth || req.auth.authType !== "api-key") { unauthorized(res); return; }
    const scopes = req.auth.apiKeyScopes ?? [];
    if (scopes.includes(scope) || scopes.includes("*")) {
      next();
    } else {
      forbidden(res, `Missing scope: ${scope}`);
    }
  };
}

/**
 * Validates that the org in the route param matches the authenticated org.
 */
export function requireOrgAccess(req: Request, res: Response, next: NextFunction): void {
  if (!req.auth) { unauthorized(res); return; }
  if (req.auth.isAdmin) { next(); return; }

  const paramOrgId = req.params["orgId"];
  if (paramOrgId && req.auth.orgId !== paramOrgId) {
    forbidden(res, "Access denied to this organization");
  } else {
    next();
  }
}
