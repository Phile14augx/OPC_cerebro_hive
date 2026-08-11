#!/usr/bin/env node
/**
 * Harness invariants.
 *
 * The status command earned these the hard way: it was built to eliminate
 * hand-transcribed evidence, then shipped with a hand-typed `established` map.
 * These assertions make that regression a build failure instead of something
 * caught by re-reading the source months later.
 *
 * Invariants:
 *   1. declared <= gateCount           — manual config cannot outgrow the gate model
 *   2. declared fields originate in WIRING — and nowhere else
 *   3. every established finding carries provenance and a source
 */
import { listCases } from './kernel.mjs';
import { computeStatus, provenanceSummary, PROVENANCE, WIRING_SOURCE } from './status.mjs';
import './cases/index.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const measurementsDir = join(HERE, '..', '..', 'docs', 'architecture', 'measurements');

let failures = 0;
const check = (n, c, d = '') => { if (c) console.info(`  ok   ${n}`); else { console.error(`  FAIL ${n}${d ? ` — ${d}` : ''}`); failures++; } };

console.info('\nharness invariants\n');

const cases = listCases();
// --shallow: invariants are about field shape, not about running every self-test.
const rows = await computeStatus(cases, { measurementsDir, currentPhase: 1, deep: false });
const allFields = rows.flatMap((r) => [r.verdict, r.dependency, r.dependencyAvailable, r.lastRunAt, ...r.established]);

{
  const p = provenanceSummary(rows);
  check(
    `declared (${String(p.declared)}) <= gateCount (${String(cases.length)})`,
    p.declared <= cases.length,
    'manual configuration has outgrown the gate model',
  );
}
{
  const strays = allFields.filter((f) => f?.provenance === PROVENANCE.DECLARED && f.from !== WIRING_SOURCE);
  check(
    'every declared field originates in WIRING',
    strays.length === 0,
    strays.map((f) => `${String(f.value)} ← ${String(f.from)}`).join('; '),
  );
}
{
  const untagged = rows.flatMap((r) => r.established).filter((f) => !f?.provenance || !f?.from);
  check('every established finding carries provenance and source', untagged.length === 0, JSON.stringify(untagged));
}
{
  const valid = new Set(Object.values(PROVENANCE));
  const bad = allFields.filter((f) => f?.provenance && !valid.has(f.provenance));
  check('no unknown provenance values', bad.length === 0, bad.map((f) => f.provenance).join(','));
}
{
  // Guard the guard: if computeStatus stopped producing fields, the invariants
  // above would all pass vacuously.
  check('status produced fields to check', allFields.length >= cases.length * 4, `${String(allFields.length)} fields`);
}

console.info(`\n${failures === 0 ? 'harness invariants OK' : `${String(failures)} invariant violation(s)`}\n`);
process.exit(failures === 0 ? 0 : 1);
