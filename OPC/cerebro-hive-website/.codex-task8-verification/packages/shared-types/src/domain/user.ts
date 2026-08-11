// ── User domain types ─────────────────────────────────────────────────────────

export type UserId   = string & { readonly __brand: "UserId" };
export type OrgId    = string & { readonly __brand: "OrgId" };
export type ApiKeyId = string & { readonly __brand: "ApiKeyId" };

export type UserRole = "owner" | "admin" | "member" | "viewer" | "billing_admin";
export type UserStatus = "active" | "invited" | "suspended" | "deleted";
export type AuthProvider = "keycloak" | "google" | "github" | "microsoft" | "email";

export interface User {
  id:             UserId;
  email:          string;
  name:           string;
  avatarUrl:      string | null;
  status:         UserStatus;
  emailVerified:  boolean;
  authProvider:   AuthProvider;
  externalId:     string | null;         // Keycloak sub / OAuth subject
  lastLoginAt:    string | null;         // ISO 8601
  createdAt:      string;
  updatedAt:      string;
  metadata:       Record<string, unknown>;
}

export interface OrganizationMembership {
  userId:  UserId;
  orgId:   OrgId;
  role:    UserRole;
  joinedAt: string;
}

export interface UserWithMemberships extends User {
  memberships: OrganizationMembership[];
}

export interface ApiKey {
  id:          ApiKeyId;
  orgId:       OrgId;
  userId:      UserId;            // created by
  name:        string;
  keyPrefix:   string;            // "ch_live_abc..." first 12 chars (display only)
  keyHash:     string;            // bcrypt hash — never expose plaintext after creation
  scopes:      ApiKeyScope[];
  expiresAt:   string | null;
  lastUsedAt:  string | null;
  revokedAt:   string | null;
  createdAt:   string;
}

export type ApiKeyScope =
  | "workflows:read"
  | "workflows:write"
  | "workflows:execute"
  | "agents:read"
  | "agents:write"
  | "knowledge:read"
  | "knowledge:write"
  | "ai:chat"
  | "billing:read"
  | "admin:read"
  | "admin:write";

export interface Session {
  id:          string;
  userId:      UserId;
  orgId:       OrgId;
  role:        UserRole;
  scopes:      ApiKeyScope[];
  expiresAt:   string;
  isApiKey:    boolean;
  ipAddress:   string | null;
  userAgent:   string | null;
}

// ── Type guards ───────────────────────────────────────────────────────────────
export const isUserId   = (v: string): v is UserId   => v.startsWith("usr_");
export const isOrgId    = (v: string): v is OrgId    => v.startsWith("org_");
export const isApiKeyId = (v: string): v is ApiKeyId => v.startsWith("key_");
