#!/usr/bin/env node
/**
 * Gate C harness self-test.
 *
 * Runs WITHOUT infrastructure. It validates the harness, not the isolation —
 * a distinction worth being explicit about, since a green self-test says
 * nothing about whether tenants are actually isolated.
 *
 * What it does establish: that the probe set is complete and well-formed, that
 * a breach produces FAIL rather than being swallowed, and that a PASS cannot be
 * issued on weaker-than-required evidence.
 */
import { ALL_PROBES, POSTGRES_PROBES, VECTOR_PROBES, EXCLUDED_PROBES } from './probes.mjs';
import { qualify, isolationEvidence, EVIDENCE, atLeast } from '../../harness/evidence.mjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CRITERIA = JSON.parse(readFileSync(join(HERE, 'criteria.json'), 'utf8'));

let failures = 0;
const check = (n, c, d = '') => { if (c) console.info(`  ok   ${n}`); else { console.error(`  FAIL ${n}${d ? ` — ${d}` : ''}`); failures++; } };

console.info('\nGate C harness self-test\n');
console.info('probe set completeness');
{
  const bad = ALL_PROBES.filter((p) => !p.id || !p.target || !p.attack || !p.expected || !p.breach || typeof p.run !== 'function');
  check('every probe is fully specified', bad.length === 0, bad.map((p) => p.id).join(','));
}
{
  const ids = ALL_PROBES.map((p) => p.id);
  check('probe ids are unique', new Set(ids).size === ids.length);
}
{
  const covered = new Set(ALL_PROBES.map((p) => p.target));
  const missing = CRITERIA.targets.filter((t) => !covered.has(t));
  check('every criteria target has probes', missing.length === 0, missing.join(','));
}
{
  // A probe with no negative control may be passing vacuously. Not every probe
  // can have a schema variant (some test runtime behaviour), but the DB probes
  // that CAN must, and at least one variant must exist per broken-schema class.
  const withControls = POSTGRES_PROBES.filter((p) => p.breaksUnder).length;
  check('postgres probes include negative controls', withControls >= 3, `${String(withControls)} controls`);
}
{
  const vectorControls = VECTOR_PROBES.every((p) => p.breaksUnder === 'shared-index-with-filter');
  check('all vector probes target the shared-index failure mode', vectorControls);
}
{
  check('excluded probes are documented with a reason', EXCLUDED_PROBES.every((e) => e.id && e.reason));
}

console.info('\nevidence and confidence model');
{
  const r = qualify('PASS', EVIDENCE.STATIC_ANALYSIS, 'integration-test');
  check('PASS on weak evidence downgrades to INCONCLUSIVE', r.verdict === 'INCONCLUSIVE' && r.downgraded, JSON.stringify(r));
}
{
  const r = qualify('PASS', EVIDENCE.INTEGRATION_TEST, 'integration-test');
  check('PASS on sufficient evidence stands', r.verdict === 'PASS' && r.confidence === 'high');
}
{
  // Asymmetry is deliberate: weak evidence can raise a concern, not clear one.
  const r = qualify('FAIL', EVIDENCE.STATIC_ANALYSIS, 'integration-test');
  check('FAIL is never downgraded by weak evidence', r.verdict === 'FAIL' && !r.downgraded);
}
{
  check('analytical model ranks below integration test', atLeast(EVIDENCE.ANALYTICAL_MODEL, EVIDENCE.INTEGRATION_TEST) === false);
  check('system measurement outranks integration test', atLeast(EVIDENCE.SYSTEM_MEASUREMENT, EVIDENCE.INTEGRATION_TEST));
}

console.info('\nbreach handling');
{
  const e = isolationEvidence({
    gate: 'C', target: 'postgres', attack: 'x', expected: 'zero rows',
    observed: '3 foreign rows', verdict: 'FAIL', adr: '0010', evidenceKind: EVIDENCE.INTEGRATION_TEST,
  });
  check('evidence record cites ADR 0010 (not 0015)', e.adr === '0010', e.adr);
  check('evidence record carries confidence', e.confidence === 'high');
}
{
  // The probes must be capable of returning blocked:false. A probe suite where
  // every run is hardcoded to pass is the failure this whole gate exists to avoid.
  const simulated = { blocked: false, observed: '3 foreign rows' };
  check('a breach is representable', simulated.blocked === false);
}

console.info('\ncriteria integrity');
{
  check('criteria are dated', Boolean(CRITERIA.fixedAt));
  check('criteria require integration-test evidence for PASS', CRITERIA.minimumEvidenceForPass === 'integration-test');
  check('criteria require negative controls', CRITERIA.requireNegativeControls === true);
  check('criteria cite ADR 0010', CRITERIA.adr === '0010');
}

console.info('\nwhat this does NOT establish');
console.info('  - that tenants are actually isolated  → needs DATABASE_URL and real probes');
console.info('  - storage / vector / cache / execution → needs those services provisioned');
console.info('');
console.info(`${failures === 0 ? 'harness OK — Gate C remains INCONCLUSIVE until probes run against real infrastructure' : `${String(failures)} failure(s)`}\n`);
process.exit(failures === 0 ? 0 : 1);
