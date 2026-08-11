// ── Organization domain types ─────────────────────────────────────────────────

import type { OrgId, UserId } from "./user.js";

export type PlanTier = "free" | "starter" | "pro" | "enterprise" | "enterprise_plus";
export type OrgStatus = "active" | "suspended" | "pending_deletion" | "deleted";

export interface Organization {
  id:            OrgId;
  name:          string;
  slug:          string;            // URL-safe unique identifier
  logoUrl:       string | null;
  status:        OrgStatus;
  plan:          PlanTier;
  ownerId:       UserId;
  billingEmail:  string | null;
  taxId:         string | null;     // VAT/EIN — encrypted at rest
  settings:      OrgSettings;
  limits:        OrgLimits;
  createdAt:     string;
  updatedAt:     string;
}

export interface OrgSettings {
  allowedAuthProviders:  string[];
  requireMfa:            boolean;
  ssoEnabled:            boolean;
  ssoProvider:           string | null;      // SAML/OIDC issuer URL
  defaultAIProvider:     string;
  defaultModel:          string;
  dataResidency:         "us" | "eu" | "ap";
  auditLogRetentionDays: number;
  allowExternalAgents:   boolean;
  webhookSecret:         string | null;
}

export interface OrgLimits {
  maxMembers:            number;
  maxWorkflows:          number;
  maxExecutionsPerMonth: number;
  maxStorageGb:          number;
  maxApiKeysPerMember:   number;
  aiTokensPerMonth:      number;
  maxAgents:             number;
  maxKnowledgeCollections: number;
  maxKnowledgeChunks:    number;
  // null = unlimited
}

export interface OrgUsage {
  orgId:           OrgId;
  periodStart:     string;
  periodEnd:       string;
  executionsUsed:  number;
  aiTokensUsed:    number;
  storageUsedGb:   number;
  members:         number;
  workflows:       number;
  aiCostUsd:       number;
}

export interface Invitation {
  id:          string;
  orgId:       OrgId;
  email:       string;
  role:        string;
  invitedBy:   UserId;
  token:       string;            // secure random token in email link
  expiresAt:   string;
  acceptedAt:  string | null;
  createdAt:   string;
}
