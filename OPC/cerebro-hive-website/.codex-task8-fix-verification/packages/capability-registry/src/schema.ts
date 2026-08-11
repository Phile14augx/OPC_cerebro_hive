/**
 * agentOS <-> MCP Capability Registry — schema (PR #25).
 *
 * A capability is a stable, named unit of functionality (e.g. "source-control")
 * that can be fulfilled by one or more providers (github, gitlab, ...). The
 * runtime (PR #26) discovers capabilities from a registry document and binds
 * to whichever provider is available; the policy engine (PR #27) evaluates
 * `policy.allow` / `policy.deny` against tool operations.
 *
 * This file is intentionally pure: Zod schemas + inferred types + a tiny
 * validation/index helper. No file IO, no agentOS coupling.
 *
 * Conventions aligned with the existing repo:
 *  - provider.kind mirrors shared-types `implementation: builtin | http | mcp`
 *  - capability.lifecycle / status mirror packages/capability-core CapabilityMetadata
 *  - zod style mirrors packages/contracts (const XSchema = z.object(...))
 */
import { z } from "zod";

/** Risk tier for a capability or a single operation. */
export const RiskLevelSchema = z.enum(["low", "medium", "high", "critical"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

/** Authentication requirement at the capability or provider level. */
export const AuthRequirementSchema = z.enum(["none", "apiKey", "oauth", "mtls", "session"]);
export type AuthRequirement = z.infer<typeof AuthRequirementSchema>;

/** Transport for an MCP provider. */
export const McpTransportSchema = z.enum(["stdio", "http", "sse"]);
export type McpTransport = z.infer<typeof McpTransportSchema>;

/** Provider kind — matches shared-types AgentToolManifest.implementation union. */
export const ProviderKindSchema = z.enum(["mcp", "builtin", "http"]);
export type ProviderKind = z.infer<typeof ProviderKindSchema>;

/** Where a provider's code/manifest comes from — aligns with PR #24 policies.yaml trust tiers. */
export const TrustTierSchema = z.enum(["catalog", "manual", "internal"]);
export type TrustTier = z.infer<typeof TrustTierSchema>;

export const LifecycleSchema = z.enum(["Experimental", "Beta", "GA"]);
export type Lifecycle = z.infer<typeof LifecycleSchema>;

export const StatusSchema = z.enum(["Active", "Deprecated", "Maintenance"]);
export type Status = z.infer<typeof StatusSchema>;

/** A single operation a capability exposes, e.g. read_repo, create_pr. */
export const ToolOperationSchema = z.object({
  id: z.string().min(1),
  description: z.string().optional(),
  /** Operation-level risk override; defaults to the capability risk. */
  risk: RiskLevelSchema.optional(),
});
export type ToolOperation = z.infer<typeof ToolOperationSchema>;

/**
 * A concrete provider that can fulfill the capability.
 * `connectionEnv` lists the env var names the provider needs (ties to the
 * `~/.hermes/.env` contract from PR #24 — never store secrets in the registry).
 */
export const CapabilityProviderSpecSchema = z.object({
  id: z.string().min(1),
  kind: ProviderKindSchema,
  transport: McpTransportSchema.optional(),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  url: z.string().url().optional(),
  auth: AuthRequirementSchema.optional(),
  scopes: z.array(z.string()).optional(),
  connectionEnv: z.array(z.string()).optional(),
  source: z.string().url().optional(),
  trustTier: TrustTierSchema.default("manual"),
});
export type CapabilityProviderSpec = z.infer<typeof CapabilityProviderSpecSchema>;

/** Allow/deny policy expressed as glob patterns over operation ids. */
export const CapabilityPolicySchema = z.object({
  allow: z.array(z.string()).default([]),
  deny: z.array(z.string()).default([]),
  /** Operations that require explicit human approval before execution. */
  requireApproval: z.array(z.string()).default([]),
  /** Highest risk tier the capability may be invoked at. */
  maxRisk: RiskLevelSchema.optional(),
});
export type CapabilityPolicy = z.infer<typeof CapabilityPolicySchema>;

/** A capability definition — the unit the runtime discovers and binds to. */
export const CapabilityDefinitionSchema = z.object({
  /** Stable, kebab-case identifier, e.g. "source-control". */
  capability: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "capability must be kebab-case"),
  displayName: z.string().optional(),
  description: z.string().min(1),
  version: z.string().min(1),
  category: z.string().optional(),
  risk: RiskLevelSchema,
  auth: AuthRequirementSchema.default("none"),
  providers: z.array(CapabilityProviderSpecSchema).min(1),
  operations: z.array(ToolOperationSchema).min(1),
  policy: CapabilityPolicySchema.default({}),
  tags: z.array(z.string()).default([]),
  owner: z.string().optional(),
  lifecycle: LifecycleSchema.default("Experimental"),
  status: StatusSchema.default("Active"),
});
export type CapabilityDefinition = z.infer<typeof CapabilityDefinitionSchema>;

/** A registry document: a versioned collection of capability definitions. */
export const CapabilityRegistryDocumentSchema = z.object({
  schemaVersion: z.string().min(1),
  generatedBy: z.string().optional(),
  capabilities: z.array(CapabilityDefinitionSchema).min(1),
});
export type CapabilityRegistryDocument = z.infer<typeof CapabilityRegistryDocumentSchema>;

/** A capability resolved against a specific chosen provider (runtime binding result). */
export const ResolvedCapabilitySchema = z.object({
  definition: CapabilityDefinitionSchema,
  provider: CapabilityProviderSpecSchema,
});
export type ResolvedCapability = z.infer<typeof ResolvedCapabilitySchema>;
