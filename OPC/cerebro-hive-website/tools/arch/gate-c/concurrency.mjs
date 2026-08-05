#!/usr/bin/env node
/**
 * Gate C — concurrent write convergence (ADR 0010, ADR 0011).
 *
 * The guarantee SQLite structurally cannot prove: N genuinely simultaneous
 * writers inserting the SAME (org_id, project_id, signature) converge on
 * exactly one row, deterministically.
 *
 * The hard part is not the assertion. It is proving the writers actually
 * overlapped. A concurrency test whose operations quietly serialised will pass
 * while testing nothing — it is the same vacuous-pass failure the negative
 * controls exist to prevent elsewhere in this harness, wearing different
 * clothes. So this test measures overlap and FAILS if it did not occur.
 *
 * Requires DATABASE_URL. INCONCLUSIVE without it — never PASS.
 *
 * Usage: DATABASE_URL=postgres://... node concurrency.mjs [--writers 16] [--iterations 25]
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const argOf = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? Number(args[i + 1]) : d; };

const WRITERS = argOf('--writers', 16);
const ITERATIONS = argOf('--iterations', 25);
const DB = process.env.DATABASE_URL;

if (!DB) {
  console.info('Gate C concurrency: INCONCLUSIVE — DATABASE_URL not set.');
  console.info('This gate cannot be satisfied without real PostgreSQL. SQLite proves');
  console.info('semantics; only Postgres proves concurrent convergence.');
  process.exit(0);
}

const { default: pg } = await import('pg');

const DDL = `
CREATE TABLE IF NOT EXISTS findings (
  org_id            TEXT NOT NULL,
  project_id        TEXT NOT NULL,
  signature         TEXT NOT NULL,
  finding_type      TEXT NOT NULL,
  signature_version INTEGER NOT NULL,
  semantic_key      JSONB NOT NULL,
  payload           JSONB NOT NULL,
  state             TEXT NOT NULL DEFAULT 'open',
  first_seen_run    TEXT NOT NULL,
  last_seen_run     TEXT NOT NULL,
  version           INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (org_id, project_id, signature)
);`;

/**
 * The UPSERT under test.
 *
 * ON CONFLICT is what makes concurrent writers converge rather than one of them
 * erroring. `first_seen_run` is deliberately NOT updated: the first writer to
 * land defines it, and every later writer must leave it alone. That asymmetry
 * is the determinism property — whichever writer wins the race, the final row
 * must be the same.
 */
const UPSERT = `
INSERT INTO findings
  (org_id, project_id, signature, finding_type, signature_version,
   semantic_key, payload, state, first_seen_run, last_seen_run, version)
VALUES ($1,$2,$3,$4,$5,$6,$7,'open',$8,$8,1)
ON CONFLICT (org_id, project_id, signature) DO UPDATE
  SET payload       = EXCLUDED.payload,
      last_seen_run = EXCLUDED.last_seen_run,
      state         = 'open',
      version       = findings.version + 1
RETURNING (xmax = 0) AS inserted, version`;

let failures = 0;
const check = (n, c, d = '') => {
  if (c) console.info(`  ok   ${n}`);
  else { console.error(`  FAIL ${n}${d ? ` — ${d}` : ''}`); failures++; }
};

const admin = new pg.Pool({ connectionString: DB, max: WRITERS + 2 });
await admin.query(DDL);

console.info(`\nGate C — concurrent write convergence (${String(WRITERS)} writers x ${String(ITERATIONS)} iterations)\n`);

let totalInserts = 0;
let overlapObserved = 0;
let serialisedIterations = 0;
const versionsSeen = new Set();

for (let iter = 0; iter < ITERATIONS; iter++) {
  const sig = `sig:timing_path.v1:${iter.toString(16).padStart(32, '0')}`;
  const org = 'org_conc';
  const prj = 'prj_conc';

  await admin.query('DELETE FROM findings WHERE org_id = $1 AND project_id = $2', [org, prj]);

  // Dedicated connections: a shared pooled connection would serialise the
  // writers by construction and the test would prove nothing.
  const clients = await Promise.all(
    Array.from({ length: WRITERS }, async () => {
      const c = new pg.Client({ connectionString: DB });
      await c.connect();
      return c;
    }),
  );

  // Barrier: every writer parks until all are connected and primed, so they are
  // released into the same instant rather than drifting apart by setup cost.
  let release;
  const barrier = new Promise((r) => { release = r; });

  const timings = [];
  const work = clients.map(async (c, i) => {
    // Warm the statement so first-execution parse cost is not mistaken for
    // contention when we measure overlap.
    await c.query('SELECT 1');
    await barrier;
    const t0 = process.hrtime.bigint();
    const res = await c.query(UPSERT, [
      org, prj, sig, 'timing_path', 1,
      JSON.stringify([['startpoint', 'a'], ['endpoint', 'b']]),
      JSON.stringify({ slackPs: i }),
      `run-${String(i)}`,
    ]);
    const t1 = process.hrtime.bigint();
    timings.push({ start: t0, end: t1 });
    return res.rows[0];
  });

  release();
  const results = await Promise.all(work);
  await Promise.all(clients.map((c) => c.end()));

  // --- convergence ---------------------------------------------------------
  const rows = await admin.query(
    'SELECT count(*)::int AS n, max(version) AS v, min(first_seen_run) AS fsr, count(DISTINCT first_seen_run)::int AS fsr_n FROM findings WHERE org_id=$1 AND project_id=$2 AND signature=$3',
    [org, prj, sig],
  );
  const { n, v, fsr_n } = rows.rows[0];

  if (n !== 1) { check(`iteration ${String(iter)}: exactly one row`, false, `${String(n)} rows`); break; }
  if (fsr_n !== 1) { check(`iteration ${String(iter)}: first_seen_run is stable`, false, `${String(fsr_n)} distinct`); break; }

  const insertedCount = results.filter((r) => r.inserted).length;
  totalInserts += insertedCount;
  if (insertedCount !== 1) {
    check(`iteration ${String(iter)}: exactly one writer inserted`, false, `${String(insertedCount)} claimed insert`);
    break;
  }
  // Every writer must have applied exactly once: 1 insert + (W-1) updates.
  if (Number(v) !== WRITERS) {
    check(`iteration ${String(iter)}: all writers applied`, false, `version=${String(v)}, expected ${String(WRITERS)}`);
    break;
  }
  versionsSeen.add(Number(v));

  // --- overlap proof -------------------------------------------------------
  // Serialised execution would show max(start) >= min(end): every writer
  // starting only after some other finished. Genuine contention shows a window
  // where multiple writers were mid-statement simultaneously.
  const minEnd = timings.reduce((a, t) => (t.end < a ? t.end : a), timings[0].end);
  const maxStart = timings.reduce((a, t) => (t.start > a ? t.start : a), timings[0].start);
  if (maxStart < minEnd) overlapObserved++;
  else serialisedIterations++;
}

check('every iteration converged to exactly one row', failures === 0);
check('exactly one insert per iteration', totalInserts === ITERATIONS, `${String(totalInserts)} inserts / ${String(ITERATIONS)} iterations`);
check('final version deterministic across iterations', versionsSeen.size === 1, `versions seen: ${[...versionsSeen].join(',')}`);

// The guard that stops this from being a vacuous pass.
const overlapRatio = overlapObserved / ITERATIONS;
check(
  'writers genuinely overlapped (not serialised)',
  overlapRatio >= 0.5,
  `overlap in ${String(overlapObserved)}/${String(ITERATIONS)} iterations (${String(serialisedIterations)} serialised) — ` +
    'a passing result without overlap proves nothing about concurrency',
);

await admin.query('DELETE FROM findings WHERE org_id = $1', ['org_conc']);
await admin.end();

console.info(`\n${failures === 0 ? 'Gate C concurrency OK — convergence proven under demonstrated overlap' : `${String(failures)} failure(s)`}\n`);
process.exit(failures === 0 ? 0 : 1);
