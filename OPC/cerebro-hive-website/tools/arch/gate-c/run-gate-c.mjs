#!/usr/bin/env node
/**
 * Gate C runner — ADR 0010 (D7).
 *
 * Executes adversarial probes against real infrastructure and emits structured
 * IsolationEvidence. Isolation is binary: any probe that reaches another
 * tenant's data fails the gate outright.
 *
 * Requires DATABASE_URL. Without it the gate is INCONCLUSIVE — never PASS,
 * because a fake that models RLS correctly proves only that the fake is correct.
 *
 * Usage: DATABASE_URL=postgres://... node run-gate-c.mjs [--markdown out.md]
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_PROBES, POSTGRES_PROBES, EXCLUDED_PROBES, PROBE_EVIDENCE_KIND } from './probes.mjs';
import { isolationEvidence, renderEvidenceTable, qualify } from '../../harness/evidence.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CRITERIA = JSON.parse(readFileSync(join(HERE, 'criteria.json'), 'utf8'));
const args = process.argv.slice(2);
const argOf = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

const DB = process.env.DATABASE_URL ?? null;

/** Targets whose infrastructure is not yet provisioned report INCONCLUSIVE per target, not silently absent. */
const TARGET_AVAILABLE = {
  postgres: Boolean(DB),
  'object-storage': Boolean(process.env.S3_ENDPOINT),
  vector: Boolean(process.env.VECTOR_URL),
  cache: Boolean(process.env.REDIS_URL),
  execution: Boolean(process.env.RUNNER_ENDPOINT),
};

async function makePostgresContext() {
  const { default: pg } = await import('pg');
  const admin = new pg.Pool({ connectionString: DB });
  await admin.query(readFileSync(join(HERE, 'schema.sql'), 'utf8'));
  await admin.query(`
    INSERT INTO projects (id, org_id, name) VALUES
      ('prj_a','org_A','A'), ('prj_b','org_B','B') ON CONFLICT DO NOTHING;
    INSERT INTO artifacts (id, org_id, project_id, logical_path, export_class) VALUES
      ('art_a1','org_A','prj_a','/a/1.gds','none'),
      ('art_a2','org_A','prj_a','/a/2.gds','itar'),
      ('art_b1','org_B','prj_b','/b/1.gds','none') ON CONFLICT DO NOTHING;`);

  // Probes connect as the unprivileged application role. Running them as owner
  // or superuser would bypass RLS and make every probe pass trivially — the
  // most likely way to build a Gate C that proves nothing.
  const appUrl = new URL(DB);
  appUrl.username = 'eda_app';
  appUrl.password = 'gate_c_test';
  const app = new pg.Pool({ connectionString: appUrl.toString(), max: 4 });

  const query = (client) => async (sql, params) => {
    const res = typeof sql === 'string' ? await client.query(sql, params) : await client.query(sql, params);
    return res.rows;
  };

  return {
    admin,
    async asTenant(org, fn) {
      const c = await app.connect();
      try {
        await c.query(`SELECT set_config('app.current_org', $1, false)`, [org]);
        await c.query(`SELECT set_config('app.clearances', 'none,ear,itar', false)`);
        return await fn(query(c));
      } finally {
        await c.query(`SELECT set_config('app.current_org', '', false)`).catch(() => {});
        c.release();
      }
    },
    async asTenantWithClearance(org, clearances, fn) {
      const c = await app.connect();
      try {
        await c.query(`SELECT set_config('app.current_org', $1, false)`, [org]);
        await c.query(`SELECT set_config('app.clearances', $1, false)`, [clearances]);
        return await fn(query(c));
      } finally { c.release(); }
    },
    async raw(sql, params) {
      const c = await app.connect();
      try { return await query(c)(sql, params); } finally { c.release(); }
    },
    async sameConnection(fn) {
      const c = await app.connect();
      try { return await fn(query(c)); } finally { c.release(); }
    },
    async close() { await app.end(); await admin.end(); },
  };
}

const records = [];
let ctx = null;

if (TARGET_AVAILABLE.postgres) {
  ctx = await makePostgresContext();
  for (const probe of POSTGRES_PROBES) {
    let result;
    try {
      result = await probe.run(ctx);
    } catch (e) {
      result = { blocked: false, observed: `probe error: ${String(e.message).slice(0, 80)}` };
    }
    records.push(isolationEvidence({
      gate: 'C',
      target: probe.target,
      attack: probe.attack,
      expected: probe.expected,
      observed: result.observed,
      verdict: result.blocked ? 'PASS' : 'FAIL',
      adr: CRITERIA.adr,
      evidenceKind: PROBE_EVIDENCE_KIND,
      detail: result.blocked ? null : probe.breach,
    }));
  }
  await ctx.close();
}

const unavailable = Object.entries(TARGET_AVAILABLE).filter(([, v]) => !v).map(([k]) => k);
const breaches = records.filter((r) => r.verdict === 'FAIL');

let verdict;
if (breaches.length > 0) verdict = 'FAIL';
else if (unavailable.length > 0 || records.length === 0) verdict = 'INCONCLUSIVE';
else verdict = 'PASS';

const q = qualify(verdict, PROBE_EVIDENCE_KIND, CRITERIA.minimumEvidenceForPass);

const lines = [];
lines.push('# Gate C — Tenant Isolation Under Adversarial Probing (ADR 0010)');
lines.push('');
lines.push(`**Verdict:** ${q.verdict}`);
lines.push(`**Evidence:** ${q.evidenceKind}  **Confidence:** ${q.confidence}`);
lines.push(`**Criteria fixed:** ${CRITERIA.fixedAt}`);
lines.push(`**Probes executed:** ${String(records.length)} of ${String(ALL_PROBES.length)}`);
lines.push('');
if (unavailable.length) {
  lines.push(`> Targets not provisioned: **${unavailable.join(', ')}**. Their probes did not run,`);
  lines.push('> so this run cannot establish isolation for those planes.');
  lines.push('');
}
if (records.length) {
  lines.push('## Evidence');
  lines.push('');
  lines.push(renderEvidenceTable(records));
  lines.push('');
}
if (breaches.length) {
  lines.push('## BREACHES');
  lines.push('');
  for (const b of breaches) {
    lines.push(`### ${b.target} — ${b.attack}`);
    lines.push(`- Expected: ${b.expected}`);
    lines.push(`- Observed: **${b.observed}**`);
    lines.push(`- Breach: ${b.detail}`);
    lines.push('');
  }
  lines.push(CRITERIA.outcome.onFail);
} else if (q.verdict === 'PASS') {
  lines.push(CRITERIA.outcome.onPass);
} else {
  lines.push('Isolation not disproven, but not established either. See unprovisioned targets above.');
}
lines.push('');
lines.push('## Excluded probes');
lines.push('');
for (const e of EXCLUDED_PROBES) lines.push(`- **${e.id}** — ${e.reason}`);
lines.push('');

const report = lines.join('\n');
const md = argOf('--markdown', null);
if (md) { mkdirSync(dirname(md), { recursive: true }); writeFileSync(md, report); }
console.info(report);

process.exit(q.verdict === 'FAIL' ? 1 : 0);
