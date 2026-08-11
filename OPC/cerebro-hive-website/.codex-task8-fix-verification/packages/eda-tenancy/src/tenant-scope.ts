/**
 * Tenant scoping — ADR 0010 (D7).
 *
 * RLS is database-enforced containment, but it only engages if
 * `app.current_org` is set on the connection, inside the transaction, from a
 * verified context. This module is the only place that setting is written.
 *
 * The structural rule: there is no repository constructor and no query path that
 * does not take a VerifiedTenantContext. Anonymous queries are not expressible.
 */

import type { TenantContext, VerifiedTenantContext } from '@cerebro/eda-domain';
import { markVerified } from '@cerebro/eda-domain';

export class MissingTenantContextError extends Error {
  constructor(operation: string) {
    super(`${operation} attempted without a verified tenant context (ADR 0010).`);
    this.name = 'MissingTenantContextError';
  }
}

/**
 * Issued only after the identity provider has validated the subject and its
 * org membership. Never construct a context from request-supplied values —
 * that is precisely the path RLS exists to backstop.
 */
export function verifyFromIdentity(ctx: TenantContext, proof: IdentityProof): VerifiedTenantContext {
  if (proof.orgId !== ctx.orgId) throw new MissingTenantContextError('Tenant context/identity mismatch');
  return markVerified(ctx);
}

export interface IdentityProof {
  readonly orgId: string;
  readonly subject: string;
  readonly issuedAt: Date;
}

export interface TenantScopedTransaction {
  /**
   * Sets `app.current_org` and `app.clearances` for the transaction's lifetime.
   *
   * A connection returned to the pool with stale settings is a genuine leak path,
   * so the pool's release hook resets them and transaction start asserts them.
   */
  run<T>(ctx: VerifiedTenantContext, fn: (tx: QueryRunner) => Promise<T>): Promise<T>;
}

export interface QueryRunner {
  query<R>(sql: string, params?: readonly unknown[]): Promise<readonly R[]>;
}

/**
 * Base for all tenant-scoped repositories. Taking the context in the constructor
 * rather than per-method means a repository instance cannot be reused across
 * tenants by accident.
 */
export abstract class TenantScopedRepository {
  protected constructor(
    protected readonly ctx: VerifiedTenantContext,
    protected readonly tx: TenantScopedTransaction,
  ) {}
}
