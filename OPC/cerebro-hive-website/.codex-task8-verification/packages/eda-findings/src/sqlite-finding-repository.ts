/**
 * SQLite implementation of FindingRepository — ADR 0010, ADR 0011.
 *
 * SQLite is the development and CI store. Postgres with RLS is production
 * (ADR 0010). The repository interface is what makes that swap a construction
 * change; this implementation deliberately mirrors the Postgres semantics it
 * will be replaced by:
 *
 *   - every statement carries org_id explicitly, never implicitly
 *   - uniqueness is a PRIMARY KEY, not an application check
 *   - writes run inside a transaction
 *   - optimistic concurrency via a version column
 *
 * WHAT THIS CANNOT PROVE: SQLite has no row-level security and (in this
 * embedding) no true write concurrency. Cross-tenant containment under RLS and
 * concurrent-write behaviour are Gate C questions and remain unanswered until
 * that runs against real Postgres. This implementation gives correct semantics,
 * not the security guarantee.
 */

import { DatabaseSync } from 'node:sqlite';

import type { FindingSignature, ProjectId, SemanticKey, VerifiedTenantContext } from '@cerebro/eda-domain';

import {
  FINDINGS_DDL,
  StaleWriteError,
  type FindingRepository,
  type StoredFinding,
  type UpsertInput,
  type UpsertOutcome,
} from './finding-repository.js';

export class SqliteFindingRepository implements FindingRepository {
  readonly #db: DatabaseSync;

  constructor(location = ':memory:') {
    this.#db = new DatabaseSync(location);
    this.#db.exec('PRAGMA foreign_keys = ON;');
    this.#db.exec(FINDINGS_DDL);
  }

  close(): void {
    this.#db.close();
  }

  async recordRun(
    ctx: VerifiedTenantContext,
    projectId: ProjectId,
    runId: string,
    findings: readonly UpsertInput[],
  ): Promise<readonly UpsertOutcome[]> {
    const outcomes: UpsertOutcome[] = [];

    // Atomic: a partially-recorded run would make the next comparison wrong in
    // a way that looks like real design change.
    this.#db.exec('BEGIN');
    try {
      const select = this.#db.prepare(
        'SELECT state, version FROM findings WHERE org_id = ? AND project_id = ? AND signature = ?',
      );
      const insert = this.#db.prepare(`
        INSERT INTO findings
          (org_id, project_id, signature, finding_type, signature_version,
           semantic_key, payload, state, first_seen_run, last_seen_run, version)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, 1)`);
      const update = this.#db.prepare(`
        UPDATE findings
           SET payload = ?, last_seen_run = ?, state = 'open', version = version + 1
         WHERE org_id = ? AND project_id = ? AND signature = ?`);

      for (const f of findings) {
        const existing = select.get(ctx.orgId, projectId, f.signature) as
          | { state: string; version: number }
          | undefined;

        if (!existing) {
          insert.run(
            ctx.orgId, projectId, f.signature, f.findingType, f.signatureVersion,
            JSON.stringify(f.semanticKey), JSON.stringify(f.payload), f.runId, f.runId,
          );
          outcomes.push({ signature: f.signature, action: 'inserted' });
        } else {
          update.run(JSON.stringify(f.payload), f.runId, ctx.orgId, projectId, f.signature);
          // A finding that was resolved and has come back is materially
          // different from one that never went away — an engineer wants to know
          // a fix regressed, not just that the violation is present.
          outcomes.push({
            signature: f.signature,
            action: existing.state === 'resolved' ? 'reopened' : 'updated',
          });
        }
      }
      this.#db.exec('COMMIT');
    } catch (err) {
      this.#db.exec('ROLLBACK');
      throw err;
    }
    return outcomes;
  }

  async markResolved(
    ctx: VerifiedTenantContext,
    projectId: ProjectId,
    _runId: string,
    absent: readonly FindingSignature[],
  ): Promise<number> {
    if (absent.length === 0) return 0;
    const stmt = this.#db.prepare(`
      UPDATE findings SET state = 'resolved', version = version + 1
       WHERE org_id = ? AND project_id = ? AND signature = ? AND state = 'open'`);
    let n = 0;
    this.#db.exec('BEGIN');
    try {
      for (const sig of absent) {
        const r = stmt.run(ctx.orgId, projectId, sig);
        n += Number(r.changes);
      }
      this.#db.exec('COMMIT');
    } catch (err) {
      this.#db.exec('ROLLBACK');
      throw err;
    }
    return n;
  }

  async findBySignature(
    ctx: VerifiedTenantContext,
    projectId: ProjectId,
    signature: FindingSignature,
  ): Promise<StoredFinding | null> {
    const row = this.#db
      .prepare('SELECT * FROM findings WHERE org_id = ? AND project_id = ? AND signature = ?')
      .get(ctx.orgId, projectId, signature) as Record<string, unknown> | undefined;
    return row ? hydrate(row) : null;
  }

  async listOpen(ctx: VerifiedTenantContext, projectId: ProjectId): Promise<readonly StoredFinding[]> {
    const rows = this.#db
      .prepare(`SELECT * FROM findings WHERE org_id = ? AND project_id = ? AND state = 'open'`)
      .all(ctx.orgId, projectId) as Record<string, unknown>[];
    return rows.map(hydrate);
  }

  async updatePayload(
    ctx: VerifiedTenantContext,
    projectId: ProjectId,
    signature: FindingSignature,
    payload: Readonly<Record<string, unknown>>,
    expectedVersion: number,
  ): Promise<StoredFinding> {
    // Conditional on version in the WHERE clause, so the check and the write are
    // one atomic statement. Reading then writing would leave a race between them.
    const res = this.#db
      .prepare(`
        UPDATE findings SET payload = ?, version = version + 1
         WHERE org_id = ? AND project_id = ? AND signature = ? AND version = ?`)
      .run(JSON.stringify(payload), ctx.orgId, projectId, signature, expectedVersion);

    if (Number(res.changes) === 0) {
      const current = await this.findBySignature(ctx, projectId, signature);
      throw new StaleWriteError(signature, expectedVersion, current?.version ?? -1);
    }
    const updated = await this.findBySignature(ctx, projectId, signature);
    if (!updated) throw new Error(`Finding vanished after update: ${signature}`);
    return updated;
  }
}

function hydrate(row: Record<string, unknown>): StoredFinding {
  return {
    signature: row['signature'] as FindingSignature,
    projectId: row['project_id'] as ProjectId,
    findingType: row['finding_type'] as string,
    signatureVersion: Number(row['signature_version']),
    semanticKey: JSON.parse(row['semantic_key'] as string) as SemanticKey,
    payload: JSON.parse(row['payload'] as string) as Record<string, unknown>,
    state: row['state'] as StoredFinding['state'],
    firstSeenRun: row['first_seen_run'] as string,
    lastSeenRun: row['last_seen_run'] as string,
    version: Number(row['version']),
  };
}
