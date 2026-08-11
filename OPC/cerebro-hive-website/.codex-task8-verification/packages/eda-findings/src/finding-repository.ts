/**
 * Finding repository — ADR 0010 (tenancy), ADR 0011 (identity).
 *
 * Deliberately thin. It owns exactly five things:
 *
 *   1. tenant scoping        — no query without a verified context
 *   2. transactional writes  — a run's findings land atomically or not at all
 *   3. optimistic concurrency — version column, stale writes rejected
 *   4. uniqueness            — exactly one row per (tenant, project, signature)
 *   5. retrieval by signature
 *
 * It owns NO diff logic and NO business rules. `compareRuns` lives in the
 * pipeline and operates on retrieved data. Keeping the repository dumb is what
 * lets the storage engine change (SQLite → Postgres) without dragging domain
 * behaviour along with it.
 */

import type { FindingSignature, ProjectId, SemanticKey, VerifiedTenantContext } from '@cerebro/eda-domain';

export type FindingState = 'open' | 'resolved';

export interface StoredFinding {
  readonly signature: FindingSignature;
  readonly projectId: ProjectId;
  readonly findingType: string;
  readonly signatureVersion: number;
  readonly semanticKey: SemanticKey;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly state: FindingState;
  readonly firstSeenRun: string;
  readonly lastSeenRun: string;
  /** Optimistic concurrency token. Incremented on every write. */
  readonly version: number;
}

export interface UpsertInput {
  readonly signature: FindingSignature;
  readonly findingType: string;
  readonly signatureVersion: number;
  readonly semanticKey: SemanticKey;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly runId: string;
}

export interface UpsertOutcome {
  readonly signature: FindingSignature;
  /** `inserted` on first sight, `updated` when the same identity reappears. */
  readonly action: 'inserted' | 'updated' | 'reopened';
}

export class StaleWriteError extends Error {
  constructor(signature: string, expected: number, actual: number) {
    super(`Stale write for ${signature}: expected version ${String(expected)}, found ${String(actual)}.`);
    this.name = 'StaleWriteError';
  }
}

export interface FindingRepository {
  /**
   * Record findings observed in a run.
   *
   * Same signature ⇒ updates the existing row. New signature ⇒ inserts. This is
   * the persistence expression of ADR 0011: identity is what makes "the same
   * finding, changed" distinguishable from "a different finding".
   */
  recordRun(
    ctx: VerifiedTenantContext,
    projectId: ProjectId,
    runId: string,
    findings: readonly UpsertInput[],
  ): Promise<readonly UpsertOutcome[]>;

  /** Signatures present in a prior run but absent from `runId` become resolved. */
  markResolved(
    ctx: VerifiedTenantContext,
    projectId: ProjectId,
    runId: string,
    absent: readonly FindingSignature[],
  ): Promise<number>;

  findBySignature(
    ctx: VerifiedTenantContext,
    projectId: ProjectId,
    signature: FindingSignature,
  ): Promise<StoredFinding | null>;

  listOpen(ctx: VerifiedTenantContext, projectId: ProjectId): Promise<readonly StoredFinding[]>;

  /** Explicit version check — rejects a write built on a stale read. */
  updatePayload(
    ctx: VerifiedTenantContext,
    projectId: ProjectId,
    signature: FindingSignature,
    payload: Readonly<Record<string, unknown>>,
    expectedVersion: number,
  ): Promise<StoredFinding>;
}

/** DDL. Uniqueness is a database constraint, not an application convention. */
export const FINDINGS_DDL = `
CREATE TABLE IF NOT EXISTS findings (
  org_id            TEXT NOT NULL,
  project_id        TEXT NOT NULL,
  signature         TEXT NOT NULL,
  finding_type      TEXT NOT NULL,
  signature_version INTEGER NOT NULL,
  semantic_key      TEXT NOT NULL,
  payload           TEXT NOT NULL,
  state             TEXT NOT NULL DEFAULT 'open',
  first_seen_run    TEXT NOT NULL,
  last_seen_run     TEXT NOT NULL,
  version           INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (org_id, project_id, signature)
);
CREATE INDEX IF NOT EXISTS findings_by_state ON findings (org_id, project_id, state);
CREATE INDEX IF NOT EXISTS findings_by_type  ON findings (org_id, project_id, finding_type);
`;
