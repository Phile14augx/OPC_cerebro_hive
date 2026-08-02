/**
 * Tenant context — ADR 0010 (D7).
 *
 * RLS is the containment mechanism, but it only engages if `app.current_org` is
 * set on the connection. This type is the carrier for that value and for the
 * export clearances that filter controlled results at the query layer.
 *
 * The design intent: there is no way to construct a repository or execute a query
 * without one of these. `packages/eda-tenancy` enforces that structurally; this
 * package defines the value.
 */

import type { OrgId, ProjectId, UserId } from './identity.js';

/** ITAR/EAR classification. Propagates PDK → project → run → artifact → fact → embedding. */
export type ExportClass = 'none' | 'ear' | 'itar';

export const EXPORT_CLASS_ORDER: readonly ExportClass[] = ['none', 'ear', 'itar'] as const;

export interface TenantContext {
  readonly orgId: OrgId;
  /** Absent for org-scoped operations (admin, billing). Most reads are project-scoped. */
  readonly projectId?: ProjectId;
  readonly userId: UserId;
  /** Export classes this subject may see. Never widened at runtime. */
  readonly clearances: readonly ExportClass[];
  /** Propagated to the DB session for audit triggers and to OTel baggage. */
  readonly correlationId: string;
}

/**
 * A context that has been verified against the identity provider.
 *
 * The distinction matters: a TenantContext shape can be constructed by anyone,
 * including from a request body. Only `eda-tenancy`'s middleware issues a
 * VerifiedTenantContext, and only that type is accepted by repositories — so an
 * attacker-supplied org id cannot reach a database session.
 */
export interface VerifiedTenantContext extends TenantContext {
  readonly [verified]: true;
}

declare const verified: unique symbol;

/** Internal — `eda-tenancy` only. Exported for that package's use, not for services. */
export function markVerified(ctx: TenantContext): VerifiedTenantContext {
  return ctx as VerifiedTenantContext;
}

export function canAccess(ctx: TenantContext, resourceClass: ExportClass): boolean {
  return ctx.clearances.includes(resourceClass);
}

/**
 * Derived export class when combining inputs.
 *
 * Classification only ever ratchets upward: an artifact derived from an ITAR PDK
 * is ITAR regardless of what else went into it. Getting this backwards is a
 * compliance incident, so the operation is a max, never an override.
 */
export function combineExportClass(...classes: readonly ExportClass[]): ExportClass {
  return classes.reduce<ExportClass>(
    (acc, c) => (EXPORT_CLASS_ORDER.indexOf(c) > EXPORT_CLASS_ORDER.indexOf(acc) ? c : acc),
    'none',
  );
}
