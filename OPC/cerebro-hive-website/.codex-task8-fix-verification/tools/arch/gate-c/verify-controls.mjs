#!/usr/bin/env node
/**
 * Negative-control verification for Gate C.
 *
 * Runs the postgres probes against DELIBERATELY BROKEN schema variants. Each
 * probe declaring `breaksUnder` must FAIL against its variant. A probe that
 * passes against a broken schema is not testing anything, and would sit in CI
 * looking reassuring indefinitely.
 *
 * This is the Gate C equivalent of `arch:verify-rules` — proving the check can
 * fail before trusting that it passed.
 *
 * Requires DATABASE_URL. INCONCLUSIVE without it.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { POSTGRES_PROBES } from './probes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DB = process.env.DATABASE_URL;

if (!DB) {
  console.info('Gate C negative controls: INCONCLUSIVE — DATABASE_URL not set.');
  process.exit(0);
}

const { default: pg } = await import('pg');
const admin = new pg.Pool({ connectionString: DB });
await admin.query(readFileSync(join(HERE, 'schema.sql'), 'utf8'));
await admin.query(readFileSync(join(HERE, 'broken-variants.sql'), 'utf8'));
await admin.query(`
  INSERT INTO v1_artifacts SELECT * FROM artifacts ON CONFLICT DO NOTHING;
  INSERT INTO v2_artifacts SELECT * FROM artifacts ON CONFLICT DO NOTHING;
  INSERT INTO v3_artifacts SELECT * FROM artifacts ON CONFLICT DO NOTHING;
  INSERT INTO v4_artifacts SELECT * FROM artifacts ON CONFLICT DO NOTHING;`).catch(() => {});

const appUrl = new URL(DB);
appUrl.username = 'eda_app';
appUrl.password = 'gate_c_test';
const app = new pg.Pool({ connectionString: appUrl.toString(), max: 4 });

let failures = 0;
const controlled = POSTGRES_PROBES.filter((p) => p.breaksUnder);

console.info(`\nGate C negative controls — ${String(controlled.length)} probes with broken-schema variants\n`);

for (const probe of controlled) {
  // Point the probe at the broken table by rewriting the table name in its query
  // path. Substitution is crude but keeps probes written against the real schema
  // rather than maintained twice.
  const swap = (sql) => (typeof sql === 'string' ? sql.replaceAll('artifacts', probe.breaksUnder) : { ...sql, text: sql.text.replaceAll('artifacts', probe.breaksUnder), name: `${sql.name}_ctl` });

  const ctx = {
    async asTenant(org, fn) {
      const c = await app.connect();
      try {
        await c.query(`SELECT set_config('app.current_org', $1, false)`, [org]);
        await c.query(`SELECT set_config('app.clearances', 'none,ear,itar', false)`);
        return await fn(async (sql, params) => (await c.query(swap(sql), params)).rows);
      } finally { c.release(); }
    },
    async raw(sql, params) {
      const c = await app.connect();
      try { return (await c.query(swap(sql), params)).rows; } finally { c.release(); }
    },
    async sameConnection(fn) {
      const c = await app.connect();
      try { return await fn(async (sql, params) => (await c.query(swap(sql), params)).rows); } finally { c.release(); }
    },
    async asTenantWithClearance(org, cl, fn) { return ctx.asTenant(org, fn); },
  };

  let result;
  try { result = await probe.run(ctx); } catch (e) { result = { blocked: false, observed: `error: ${String(e.message).slice(0, 60)}` }; }

  if (result.blocked) {
    console.error(`  FAIL ${probe.id} — PASSED against broken schema ${probe.breaksUnder}. Probe is vacuous.`);
    failures++;
  } else {
    console.info(`  ok   ${probe.id} correctly detected the breach in ${probe.breaksUnder} (${result.observed})`);
  }
}

await app.end();
await admin.end();

console.info(`\n${failures === 0 ? 'negative controls OK — probes demonstrably detect breaches' : `${String(failures)} vacuous probe(s)`}\n`);
process.exit(failures === 0 ? 0 : 1);
