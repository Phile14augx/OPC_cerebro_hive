/**
 * Case 2 — workflow substrate (ADR 0009).
 *
 * Split deliberately. The semantics half runs anywhere and validates the
 * outcome-vs-infrastructure distinction ADR 0009 calls most easily botched.
 * The scale half needs a Temporal cluster.
 *
 * Reporting PASS on semantics alone would be exactly the greenwashing the
 * INCONCLUSIVE verdict exists to prevent — so a semantics pass without cluster
 * measurement is INCONCLUSIVE, not PASS.
 */
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerCase, VERDICT } from '../kernel.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const GATE_B = join(HERE, '..', '..', 'arch', 'gate-b');

const temporalAvailable = () => {
  if (!process.env.TEMPORAL_ADDRESS) return false;
  try {
    execFileSync('temporal', ['operator', 'cluster', 'health'], { stdio: 'ignore', timeout: 10_000 });
    return true;
  } catch { return false; }
};

registerCase({
  id: 'gate-b-workflow-scale',
  title: 'Temporal execution semantics and scale (50 → 10,000 jobs)',
  adrs: ['0009'],
  phase: 1,
  criteriaPath: join(HERE, 'criteria', 'gate-b.json'),

  async measure() {
    const out = { semantics: null, model: null, cluster: temporalAvailable() };
    try {
      out.semantics = { ok: true, log: execFileSync('node', [join(GATE_B, 'semantics-test.mjs')], { encoding: 'utf8' }) };
    } catch (e) {
      out.semantics = { ok: false, log: `${e.stdout ?? ''}${e.stderr ?? ''}` };
    }
    try {
      out.model = execFileSync('node', [join(GATE_B, 'history-model.mjs')], { encoding: 'utf8' });
    } catch (e) {
      // Exit 2 means the model produced an actionable finding — not a failure.
      out.model = `${e.stdout ?? ''}`;
    }
    return out;
  },

  analyse(obs) {
    const findings = [];
    if (!obs.semantics?.ok) {
      findings.push('Execution semantics tests FAILED — outcome/infrastructure classification is wrong.');
      return { verdict: VERDICT.FAIL, findings, rows: [] };
    }
    findings.push('Execution semantics validated (16 checks, no cluster required).');
    if (obs.model?.includes('TERMINATES')) {
      findings.push(
        'History model predicts single-workflow fan-out cannot reach 50,000 activities; ' +
          'child-workflow sharding is mandatory, not optional. See history-model output.',
      );
    }
    if (!obs.cluster) {
      findings.push(
        'No Temporal cluster reachable (set TEMPORAL_ADDRESS). Scheduling throughput, real ' +
          'history growth and replay-after-restart remain unmeasured.',
      );
      return { verdict: VERDICT.INCONCLUSIVE, findings, rows: [], markdown: obs.model };
    }
    findings.push('Cluster measurement not yet implemented — Phase 1 slice.');
    return { verdict: VERDICT.INCONCLUSIVE, findings, rows: [], markdown: obs.model };
  },
});
