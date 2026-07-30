import { createIdentifierFactory, type Identifier } from './Identifier';

/**
 * One identifier per aggregate fixed in hiveforge/01-DOMAIN-MODEL.md
 * (containment-hierarchy aggregates, §1, plus cross-cutting aggregates,
 * §1/§2, including `User` added per Phase 5 — 05-BUSINESS-PLATFORM.md §1a).
 *
 * Deliberately flat, deliberately not exported as a single "IdentifierKind"
 * union — this slice does not encode aggregate relationships (e.g. "a
 * WorkspaceId belongs to a ProjectId"), only that each aggregate has its
 * own distinct identifier type. Relationship modeling is deferred to
 * whichever slice actually builds the aggregates themselves.
 */

// Containment hierarchy (hiveforge/01-DOMAIN-MODEL.md §1)
export type OrganizationId = Identifier<'OrganizationId'>;
export const OrganizationId = createIdentifierFactory<'OrganizationId'>('OrganizationId');

export type TenantId = Identifier<'TenantId'>;
export const TenantId = createIdentifierFactory<'TenantId'>('TenantId');

export type ProjectId = Identifier<'ProjectId'>;
export const ProjectId = createIdentifierFactory<'ProjectId'>('ProjectId');

export type WorkspaceId = Identifier<'WorkspaceId'>;
export const WorkspaceId = createIdentifierFactory<'WorkspaceId'>('WorkspaceId');

export type DeploymentId = Identifier<'DeploymentId'>;
export const DeploymentId = createIdentifierFactory<'DeploymentId'>('DeploymentId');

export type ResourceId = Identifier<'ResourceId'>;
export const ResourceId = createIdentifierFactory<'ResourceId'>('ResourceId');

export type OperationId = Identifier<'OperationId'>;
export const OperationId = createIdentifierFactory<'OperationId'>('OperationId');

// Cross-cutting aggregates (hiveforge/01-DOMAIN-MODEL.md §1, "not part of
// the containment hierarchy above but referenced by it")
export type ProviderId = Identifier<'ProviderId'>;
export const ProviderId = createIdentifierFactory<'ProviderId'>('ProviderId');

export type RegionId = Identifier<'RegionId'>;
export const RegionId = createIdentifierFactory<'RegionId'>('RegionId');

export type AvailabilityZoneId = Identifier<'AvailabilityZoneId'>;
export const AvailabilityZoneId = createIdentifierFactory<'AvailabilityZoneId'>('AvailabilityZoneId');

export type PolicyId = Identifier<'PolicyId'>;
export const PolicyId = createIdentifierFactory<'PolicyId'>('PolicyId');

export type UsageRecordId = Identifier<'UsageRecordId'>;
export const UsageRecordId = createIdentifierFactory<'UsageRecordId'>('UsageRecordId');

export type BillingAccountId = Identifier<'BillingAccountId'>;
export const BillingAccountId = createIdentifierFactory<'BillingAccountId'>('BillingAccountId');

// Added Phase 5 (hiveforge/05-BUSINESS-PLATFORM.md §1a), propagated into
// 01-DOMAIN-MODEL.md §1/§2.
export type UserId = Identifier<'UserId'>;
export const UserId = createIdentifierFactory<'UserId'>('UserId');
