import { OptimizedPolicyBundle, PolicyRule } from '@cerebro/policy-core';
import type {
  OrganizationId,
  TenantId,
  ProjectId,
  WorkspaceId,
} from '@cerebro/domain-model';

/**
 * The four levels ADR-038 defines, in the fixed evaluation order (rule 3):
 * Organization -> Tenant -> Project -> Workspace. This is HiveForge's own
 * domain-model hierarchy (01-DOMAIN-MODEL.md), not identity-core's
 * `TenancyScope` — that type has organizationId/workspaceId/projectId/
 * environmentId with no explicit Tenant level, so it doesn't map cleanly
 * onto this ADR. Kept as a distinct type rather than silently reusing
 * TenancyScope's shape; reconciling the two remains a separate, flagged
 * gap (ADR-038 "Implementation status", 08-ROADMAP.md §2) — a genuine
 * architectural question (how does a Tenant get derived when TenancyScope
 * has none?), not a mechanical typing fix, so it is deliberately NOT
 * touched by this reconciliation pass. What *is* mechanical, and done here:
 * each level's optional identifier is now typed against
 * @cerebro/domain-model's branded IDs instead of a plain string, so a
 * Workspace-level entry can no longer be constructed with an
 * OrganizationId by mistake.
 */
export const HIERARCHY_LEVELS = ['Organization', 'Tenant', 'Project', 'Workspace'] as const;
export type HierarchyLevelName = (typeof HIERARCHY_LEVELS)[number];

type PolicyBundleInput = OptimizedPolicyBundle | PolicyRule[];

/**
 * One level's worth of Policy, expressed as whatever the underlying
 * @cerebro/policy-core PolicyEngine already accepts (a raw rule array for
 * simple/test cases, or a compiled OptimizedPolicyBundle for production).
 * A level with no policies attached is a valid, common case (most
 * Organizations will have exactly one Tenant with few or no Project/
 * Workspace-level overrides per 01-DOMAIN-MODEL.md §2) — represented as
 * an empty array, not an optional/undefined level, so the evaluation
 * order (§ADR-038 rule 3) never has to special-case a missing level.
 *
 * `id` is optional and purely for tracing/audit (it flows into
 * HierarchicalPolicyEngine's evaluationPath, nothing else) — this is a
 * typing/contract addition, not a semantic change: evaluation behavior is
 * unchanged whether `id` is supplied or omitted. A discriminated union,
 * not one interface with four optional id fields, so a Tenant-level entry
 * can only ever carry a TenantId, never an OrganizationId by mistake —
 * the actual point of "typed IDs," not just cosmetic renaming.
 */
export type HierarchyLevelPolicies =
  | { level: 'Organization'; id?: OrganizationId; bundle: PolicyBundleInput }
  | { level: 'Tenant'; id?: TenantId; bundle: PolicyBundleInput }
  | { level: 'Project'; id?: ProjectId; bundle: PolicyBundleInput }
  | { level: 'Workspace'; id?: WorkspaceId; bundle: PolicyBundleInput };

/**
 * The full four-level chain for one evaluation, always in top-down order.
 * Callers resolve which bundle (and, optionally now, which typed instance
 * id) applies at each level before calling HierarchicalPolicyEngine —
 * resolution/storage of Policy-per-level is a PolicyRepository concern
 * (packages/policy-core/src/administration), not this package's.
 */
export type PolicyHierarchy = [
  Extract<HierarchyLevelPolicies, { level: 'Organization' }>,
  Extract<HierarchyLevelPolicies, { level: 'Tenant' }>,
  Extract<HierarchyLevelPolicies, { level: 'Project' }>,
  Extract<HierarchyLevelPolicies, { level: 'Workspace' }>
];
