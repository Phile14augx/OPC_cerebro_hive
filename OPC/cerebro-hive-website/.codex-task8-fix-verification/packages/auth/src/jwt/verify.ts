/**
 * @cerebro/auth — JWT verification
 * Validates Keycloak-issued JWTs using JWKS endpoint with rotating key caching.
 */

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

// ── JWKS cache (singleton per process) ───────────────────────────────────────

let cachedJWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS(): ReturnType<typeof createRemoteJWKSet> {
  if (!cachedJWKS) {
    const realm     = process.env["KEYCLOAK_REALM"]     ?? "cerebro-hive";
    const serverUrl = process.env["KEYCLOAK_SERVER_URL"] ?? "https://auth.cerebro-hive.io";
    const jwksUrl   = `${serverUrl}/realms/${realm}/protocol/openid-connect/certs`;

    cachedJWKS = createRemoteJWKSet(new URL(jwksUrl), {
      cacheMaxAge:         15 * 60 * 1000, // 15 min
      cooldownDuration:    30 * 1000,       // 30 sec between refetches on 401
    });
  }
  return cachedJWKS;
}

// ── Payload types ─────────────────────────────────────────────────────────────

export interface KeycloakRealmAccess {
  roles: string[];
}

export interface KeycloakResourceAccess {
  [clientId: string]: { roles: string[] };
}

export interface CerebroJWTPayload extends JWTPayload {
  sub:              string;
  email?:           string;
  preferred_username?: string;
  given_name?:      string;
  family_name?:     string;
  name?:            string;
  realm_access?:    KeycloakRealmAccess;
  resource_access?: KeycloakResourceAccess;
  /** Custom claim injected by Keycloak mapper */
  org_id?:          string;
  org_role?:        string;
  /** Client ID that issued the token */
  azp?:             string;
  /** Session state */
  session_state?:   string;
}

// ── Verification ──────────────────────────────────────────────────────────────

const CLIENT_ID = process.env["KEYCLOAK_CLIENT_ID"] ?? "cerebro-platform";
const ISSUER    = (() => {
  const realm     = process.env["KEYCLOAK_REALM"]     ?? "cerebro-hive";
  const serverUrl = process.env["KEYCLOAK_SERVER_URL"] ?? "https://auth.cerebro-hive.io";
  return `${serverUrl}/realms/${realm}`;
})();

export interface VerifyResult {
  payload:  CerebroJWTPayload;
  isExpired: false;
}

export type VerifyTokenResult =
  | VerifyResult
  | { isExpired: true; error: "TOKEN_EXPIRED" }
  | { isExpired: false; error: string };

export async function verifyJWT(token: string): Promise<CerebroJWTPayload> {
  const { payload } = await jwtVerify(token, getJWKS(), {
    issuer:   ISSUER,
    audience: CLIENT_ID,
  });
  return payload as CerebroJWTPayload;
}

export async function safeVerifyJWT(token: string): Promise<VerifyTokenResult> {
  try {
    const payload = await verifyJWT(token);
    return { payload, isExpired: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("expired")) {
      return { isExpired: true, error: "TOKEN_EXPIRED" };
    }
    return { isExpired: false, error: message };
  }
}

// ── Role extractors ───────────────────────────────────────────────────────────

export function getRealmRoles(payload: CerebroJWTPayload): string[] {
  return payload.realm_access?.roles ?? [];
}

export function getClientRoles(payload: CerebroJWTPayload, clientId: string = CLIENT_ID): string[] {
  return payload.resource_access?.[clientId]?.roles ?? [];
}

export function hasRealmRole(payload: CerebroJWTPayload, role: string): boolean {
  return getRealmRoles(payload).includes(role);
}

export function hasClientRole(payload: CerebroJWTPayload, role: string, clientId?: string): boolean {
  return getClientRoles(payload, clientId).includes(role);
}

export function isSystemAdmin(payload: CerebroJWTPayload): boolean {
  return hasRealmRole(payload, "system-admin") || hasClientRole(payload, "admin");
}
