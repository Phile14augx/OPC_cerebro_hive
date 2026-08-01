/**
 * Gate C adversarial probes — ADR 0010 (D7).
 *
 * Organised by attack objective rather than by implementation, because the
 * question is "can an attacker reach tenant B's data" — not "does function X
 * behave". Each probe states what it attempts, what containment looks like, and
 * what a breach looks like.
 *
 * Every probe declares `breaksUnder`: the broken schema variant it must fail
 * against. A probe with no negative control is not admitted, because a probe
 * that has never been observed failing may be passing vacuously.
 */

import { EVIDENCE } from '../../harness/evidence.mjs';

const ORG_A = 'org_A';
const ORG_B = 'org_B';

/**
 * @typedef {object} Probe
 * @property {string} id
 * @property {string} target
 * @property {string} attack       what an attacker is attempting
 * @property {string} expected     containment
 * @property {string} breach       what a successful attack looks like
 * @property {string|null} breaksUnder  broken variant this must fail against
 * @property {(ctx) => Promise<{blocked: boolean, observed: string}>} run
 */

export const POSTGRES_PROBES = [
  {
    id: 'pg-missing-predicate',
    target: 'postgres',
    attack: 'Query without any tenant predicate, relying on RLS alone',
    expected: 'Only tenant A rows visible',
    breach: 'Any tenant B row returned',
    breaksUnder: 'v2_artifacts',
    async run({ asTenant }) {
      // The application forgetting `WHERE org_id = ?` is the single most common
      // cause of real cross-tenant breaches. RLS exists to make that omission
      // survivable rather than fatal.
      const rows = await asTenant(ORG_A, (q) => q('SELECT id, org_id FROM artifacts'));
      const foreign = rows.filter((r) => r.org_id !== ORG_A);
      return { blocked: foreign.length === 0, observed: `${String(rows.length)} rows, ${String(foreign.length)} foreign` };
    },
  },
  {
    id: 'pg-forged-predicate',
    target: 'postgres',
    attack: 'Explicitly request another tenant by id',
    expected: 'Zero rows — policy intersects, never unions',
    breach: 'Tenant B rows returned',
    breaksUnder: 'v2_artifacts',
    async run({ asTenant }) {
      const rows = await asTenant(ORG_A, (q) => q('SELECT id FROM artifacts WHERE org_id = $1', [ORG_B]));
      return { blocked: rows.length === 0, observed: `${String(rows.length)} rows` };
    },
  },
  {
    id: 'pg-unset-session',
    target: 'postgres',
    attack: 'Query with app.current_org unset',
    expected: 'Zero rows — must fail closed',
    breach: 'Any rows returned (policy failed open)',
    breaksUnder: 'v3_artifacts',
    async run({ raw }) {
      // Fail-open is worse than no policy: it looks protected and is not.
      const rows = await raw('SELECT id FROM artifacts');
      return { blocked: rows.length === 0, observed: `${String(rows.length)} rows with no tenant set` };
    },
  },
  {
    id: 'pg-connection-reuse',
    target: 'postgres',
    attack: 'Reuse a pooled connection whose session still carries tenant A',
    expected: 'Tenant B context sees only B rows',
    breach: 'Stale setting leaks A rows into a B request',
    breaksUnder: null,
    async run({ asTenant, sameConnection }) {
      // The realistic version of this bug: a pool release hook that forgets to
      // RESET, so the next borrower inherits the previous tenant.
      const rows = await sameConnection(async (q) => {
        await q(`SELECT set_config('app.current_org', $1, false)`, [ORG_A]);
        await q(`SELECT set_config('app.current_org', $1, false)`, [ORG_B]);
        return q('SELECT id, org_id FROM artifacts');
      });
      const foreign = rows.filter((r) => r.org_id !== ORG_B);
      return { blocked: foreign.length === 0, observed: `${String(foreign.length)} foreign rows after context switch` };
    },
  },
  {
    id: 'pg-prepared-statement-plan-cache',
    target: 'postgres',
    attack: 'Execute the same prepared statement 10x across alternating tenants to force a generic cached plan',
    expected: 'Each execution respects the current session tenant',
    breach: 'A cached generic plan binds one tenant and serves it to the other',
    breaksUnder: null,
    async run({ asTenant }) {
      // This is the subtle one. Postgres switches to a generic plan after ~5
      // executions. If the RLS policy folds current_setting() into that plan,
      // a connection serving multiple tenants can return the wrong rows. The
      // schema wraps the call in (SELECT ...) specifically to prevent it; this
      // probe is what proves the mitigation works.
      let leaked = 0;
      for (let i = 0; i < 10; i++) {
        const org = i % 2 === 0 ? ORG_A : ORG_B;
        const rows = await asTenant(org, (q) =>
          q({ name: 'gate_c_prepared', text: 'SELECT id, org_id FROM artifacts WHERE logical_path LIKE $1' }, ['%']),
        );
        leaked += rows.filter((r) => r.org_id !== org).length;
      }
      return { blocked: leaked === 0, observed: `${String(leaked)} foreign rows across 10 alternating executions` };
    },
  },
  {
    id: 'pg-write-into-foreign-tenant',
    target: 'postgres',
    attack: 'Insert a row stamped with another tenant id',
    expected: 'Rejected by WITH CHECK',
    breach: 'Row planted in tenant B',
    breaksUnder: 'v4_artifacts',
    async run({ asTenant }) {
      // Read-only isolation tests miss this entirely, which is why USING-without-
      // WITH-CHECK survives review so often.
      try {
        await asTenant(ORG_A, (q) =>
          q('INSERT INTO artifacts (id, org_id, project_id, logical_path) VALUES ($1,$2,$3,$4)', [
            'art_probe', ORG_B, 'prj_x', '/probe',
          ]),
        );
        return { blocked: false, observed: 'insert into foreign tenant SUCCEEDED' };
      } catch {
        return { blocked: true, observed: 'insert rejected by WITH CHECK' };
      }
    },
  },
  {
    id: 'pg-export-class-without-clearance',
    target: 'postgres',
    attack: 'Read an ITAR-classified artifact without the clearance',
    expected: 'Zero rows, and no indication that something was withheld',
    breach: 'Controlled row returned, or count discloses its existence',
    breaksUnder: null,
    async run({ asTenantWithClearance }) {
      const rows = await asTenantWithClearance(ORG_A, 'none', (q) =>
        q(`SELECT id FROM artifacts WHERE export_class = 'itar'`),
      );
      return { blocked: rows.length === 0, observed: `${String(rows.length)} controlled rows` };
    },
  },
  {
    id: 'pg-transaction-rollback-residue',
    target: 'postgres',
    attack: 'Abort a transaction mid-way and inspect whether tenant context survives the rollback',
    expected: 'Context restored or cleared; no cross-tenant visibility',
    breach: 'Post-rollback session retains a foreign tenant',
    breaksUnder: null,
    async run({ sameConnection }) {
      const rows = await sameConnection(async (q) => {
        await q(`SELECT set_config('app.current_org', $1, false)`, [ORG_A]);
        await q('BEGIN');
        await q(`SELECT set_config('app.current_org', $1, true)`, [ORG_B]); // local = true
        await q('ROLLBACK');
        return q('SELECT id, org_id FROM artifacts');
      });
      const foreign = rows.filter((r) => r.org_id !== ORG_A);
      return { blocked: foreign.length === 0, observed: `${String(foreign.length)} foreign rows after rollback` };
    },
  },
];

/**
 * Vector probes — ADR 0010's most-emphasised leak class.
 *
 * The naive version of an isolation test uses dissimilar vectors and passes even
 * when isolation is completely broken, because ANN search never surfaces the
 * foreign vectors anyway. These probes use *adversarially similar* vectors so
 * that a missing boundary actually shows.
 */
export const VECTOR_PROBES = [
  {
    id: 'vec-adversarial-neighbour',
    target: 'vector',
    attack: 'Query with a vector engineered to sit closer to tenant B chunks than to any tenant A chunk',
    expected: 'Zero results, or A-only — collections are physically separate',
    breach: 'Any tenant B chunk returned',
    breaksUnder: 'shared-index-with-filter',
    async run({ vectorSearch, nearestTo }) {
      const probe = await nearestTo(ORG_B);
      const hits = await vectorSearch(ORG_A, probe, 10);
      const foreign = hits.filter((h) => h.orgId !== ORG_A);
      return { blocked: foreign.length === 0, observed: `${String(foreign.length)} foreign chunks in top-10` };
    },
  },
  {
    id: 'vec-underfilled-topk',
    target: 'vector',
    attack: 'Request top-k larger than the tenant\'s own corpus, forcing the index to reach further',
    expected: 'Fewer than k results returned, never padded from another tenant',
    breach: 'Result set padded with foreign chunks',
    breaksUnder: 'shared-index-with-filter',
    async run({ vectorSearch, randomVector, corpusSize }) {
      // Post-filtered ANN is where this bites: the engine traverses and scores
      // foreign vectors, then filters. Under-filled results reveal whether the
      // filter is applied before or after traversal.
      const k = (await corpusSize(ORG_A)) + 50;
      const hits = await vectorSearch(ORG_A, randomVector(), k);
      const foreign = hits.filter((h) => h.orgId !== ORG_A);
      return { blocked: foreign.length === 0, observed: `${String(hits.length)} hits, ${String(foreign.length)} foreign` };
    },
  },
  {
    id: 'vec-score-only-inference',
    target: 'vector',
    attack: 'Infer the existence of foreign content from similarity scores alone, without retrieving text',
    expected: 'Scores derive only from the tenant\'s own collection',
    breach: 'Score distribution shifts measurably when foreign content is added',
    breaksUnder: 'shared-index-with-filter',
    async run({ vectorSearch, randomVector, seedForeign }) {
      const before = await vectorSearch(ORG_A, randomVector(), 5);
      await seedForeign(ORG_B, 200);
      const after = await vectorSearch(ORG_A, randomVector(), 5);
      const shifted = JSON.stringify(before.map((h) => h.score)) !== JSON.stringify(after.map((h) => h.score));
      return {
        blocked: !shifted,
        observed: shifted ? 'scores changed after seeding foreign content' : 'scores unaffected',
      };
    },
  },
];

export const STORAGE_PROBES = [
  {
    id: 'obj-cross-tenant-presign',
    target: 'object-storage',
    attack: 'Generate a presigned URL for tenant B\'s blob under tenant A\'s context',
    expected: 'Refused before a URL is minted',
    breach: 'A usable URL is returned',
    breaksUnder: null,
    async run({ presign }) {
      try {
        await presign(ORG_A, { orgId: ORG_B, key: 'designs/top.gds' });
        return { blocked: false, observed: 'presigned URL ISSUED for foreign blob' };
      } catch {
        return { blocked: true, observed: 'refused' };
      }
    },
  },
  {
    id: 'obj-path-traversal',
    target: 'object-storage',
    attack: 'Escape the tenant prefix with ../ segments in a logical path',
    expected: 'Normalised and refused',
    breach: 'Key resolves outside the tenant prefix',
    breaksUnder: null,
    async run({ resolveKey }) {
      const resolved = await resolveKey(ORG_A, '../../org_B/designs/top.gds');
      const escaped = !resolved.startsWith(`${ORG_A}/`);
      return { blocked: !escaped, observed: resolved };
    },
  },
  {
    id: 'obj-stale-presigned-url',
    target: 'object-storage',
    attack: 'Reuse a presigned URL after its TTL has elapsed',
    expected: 'Rejected by the storage layer',
    breach: 'Expired URL still serves content',
    breaksUnder: null,
    async run({ presign, fetchUrl, advanceClock }) {
      const url = await presign(ORG_A, { orgId: ORG_A, key: 'designs/a.gds' }, 1);
      await advanceClock(5_000);
      const res = await fetchUrl(url);
      return { blocked: res.status === 403, observed: `HTTP ${String(res.status)} after expiry` };
    },
  },
];

export const CACHE_PROBES = [
  {
    id: 'cache-key-collision',
    target: 'cache',
    attack: 'Two tenants cache the same logical key; read across',
    expected: 'Keys namespaced per tenant — B never sees A\'s value',
    breach: 'Tenant B reads tenant A\'s cached value',
    breaksUnder: null,
    async run({ cacheSet, cacheGet }) {
      await cacheSet(ORG_A, 'project:summary', 'SECRET_A');
      await cacheSet(ORG_B, 'project:summary', 'VALUE_B');
      const got = await cacheGet(ORG_B, 'project:summary');
      return { blocked: got !== 'SECRET_A', observed: String(got) };
    },
  },
];

export const EXECUTION_PROBES = [
  {
    id: 'exec-workspace-reuse',
    target: 'execution',
    attack: 'Run a tenant B job on a worker that previously ran tenant A, and read the scratch directory',
    expected: 'Per-run volume, wiped — nothing of A remains',
    breach: 'Tenant A files readable from tenant B\'s run',
    breaksUnder: null,
    async run({ runJob }) {
      await runJob(ORG_A, 'echo SECRET_A > /work/scratch/leak.txt');
      const out = await runJob(ORG_B, 'cat /work/scratch/leak.txt 2>&1 || echo CLEAN');
      return { blocked: !out.includes('SECRET_A'), observed: out.trim().slice(0, 40) };
    },
  },
];

export const ALL_PROBES = [
  ...POSTGRES_PROBES,
  ...VECTOR_PROBES,
  ...STORAGE_PROBES,
  ...CACHE_PROBES,
  ...EXECUTION_PROBES,
];

export const PROBE_EVIDENCE_KIND = EVIDENCE.INTEGRATION_TEST;

/**
 * Deliberately NOT implemented: timing side channels.
 *
 * Timing attacks against vector search are real, but a CI timing test on shared
 * runners is dominated by scheduler noise. It would be flaky, and a flaky
 * security test gets muted — leaving a disabled probe that reads as coverage.
 * The honest position is to exclude it here and address timing separately with
 * a rate-limiting and response-padding control, tested where the environment is
 * controlled enough for the result to mean something.
 */
export const EXCLUDED_PROBES = [
  {
    id: 'vec-timing-side-channel',
    reason:
      'Not reliably testable in CI — scheduler noise exceeds the signal. Excluded rather than ' +
      'implemented flakily. Mitigation tracked separately as rate limiting + response padding.',
  },
];
