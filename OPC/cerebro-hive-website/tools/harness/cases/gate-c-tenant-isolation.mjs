/**
 * Case 3 — adversarial tenant isolation (ADR 0010).
 *
 * The one gate CI can fully provision. Isolation is binary — no thresholds,
 * no tolerances. Any probe reaching another tenant's data fails outright.
 *
 * PASS requires integration-test evidence. A fake that models RLS correctly
 * proves only that the fake is correct, so unit-level evidence downgrades to
 * INCONCLUSIVE via the evidence model rather than being accepted.
 */
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerCase, VERDICT } from '../kernel.mjs';
import { EVIDENCE, qualify } from '../evidence.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const GATE_C = join(HERE, '..', '..', 'arch', 'gate-c');

registerCase({
  id: 'gate-c-tenant-isolation',
  title: 'Cross-tenant isolation under adversarial probing',
  adrs: ['0010'],
  phase: 1,
  criteriaPath: join(GATE_C, 'criteria.json'),

  async measure() {
    const out = { selfTest: null, controls: null, probes: null, hasDb: Boolean(process.env.DATABASE_URL) };
    const run = (script) => {
      try { return { ok: true, log: execFileSync('node', [join(GATE_C, script)], { encoding: 'utf8' }) }; }
      catch (e) { return { ok: false, log: `${e.stdout ?? ''}${e.stderr ?? ''}` }; }
    };
    out.selfTest = run('self-test.mjs');
    if (out.hasDb) {
      out.controls = run('verify-controls.mjs');
      out.probes = run('run-gate-c.mjs');
    }
    return out;
  },

  analyse(obs, criteria) {
    const findings = [];
    if (!obs.selfTest?.ok) {
      findings.push('Gate C harness self-test FAILED — the probe suite itself is broken.');
      return { verdict: VERDICT.FAIL, findings, rows: [] };
    }
    findings.push('Harness self-test passed (18 checks: probe completeness, evidence model, criteria integrity).');

    if (!obs.hasDb) {
      findings.push('DATABASE_URL not set — no probe executed against real infrastructure.');
      const q = qualify('PASS', EVIDENCE.STATIC_ANALYSIS, criteria.minimumEvidenceForPass);
      findings.push(q.reason);
      return { verdict: VERDICT.INCONCLUSIVE, findings, rows: [] };
    }

    // Controls run first and gate everything after them: if a probe cannot
    // detect a deliberately broken policy, its pass carries no information.
    if (!obs.controls?.ok) {
      findings.push('NEGATIVE CONTROLS FAILED — one or more probes passed against a broken schema and are vacuous.');
      return { verdict: VERDICT.FAIL, findings, rows: [] };
    }
    findings.push('Negative controls passed — probes demonstrably detect real breaches.');

    if (!obs.probes?.ok) {
      findings.push('BREACH DETECTED — a probe reached another tenant\'s data. See evidence table.');
      return { verdict: VERDICT.FAIL, findings, rows: [], markdown: obs.probes?.log };
    }
    if (obs.probes.log.includes('INCONCLUSIVE')) {
      findings.push('Postgres plane validated; other planes not provisioned.');
      return { verdict: VERDICT.INCONCLUSIVE, findings, rows: [], markdown: obs.probes.log };
    }
    return { verdict: VERDICT.PASS, findings, rows: [], markdown: obs.probes.log };
  },
});
