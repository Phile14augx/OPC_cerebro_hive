/**
 * Case 1 — sandbox overhead (ADR 0013).
 *
 * Wraps the existing Gate A harness rather than reimplementing it. The kernel
 * was extracted FROM this case, so the fit should be exact; if it ever stops
 * being exact, the kernel is wrong, not the case.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerCase, VERDICT } from '../kernel.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const GATE_A = join(HERE, '..', '..', 'arch', 'gate-a');

registerCase({
  id: 'gate-a-sandbox-overhead',
  title: 'Sandbox runtime overhead on EDA workloads',
  adrs: ['0013'],
  phase: 1,
  criteriaPath: join(GATE_A, 'criteria.json'),

  async measure({ criteria }) {
    const out = join(GATE_A, 'results', `harness-${Date.now()}.json`);
    const runtimes = ['native', ...criteria.runtimes.compare].join(',');
    execFileSync('node', [join(GATE_A, 'run-benchmark.mjs'), '--runtimes', runtimes, '--out', out], {
      stdio: 'inherit',
    });
    return JSON.parse(readFileSync(out, 'utf8'));
  },

  analyse(observations) {
    // Delegate to the Gate A analyser — one implementation of the verdict logic,
    // for the same reason signature hashing has one implementation (ADR 0011).
    const tmp = join(GATE_A, 'results', '.harness-analyse.json');
    writeFileSync(tmp, JSON.stringify(observations));
    let markdown = '', verdict = VERDICT.FAIL;
    try {
      markdown = execFileSync('node', [join(GATE_A, 'analyse.mjs'), tmp], { encoding: 'utf8' });
      verdict = VERDICT.PASS;
    } catch (e) {
      markdown = `${e.stdout ?? ''}`;
      verdict = markdown.includes('INCONCLUSIVE') ? VERDICT.INCONCLUSIVE : VERDICT.FAIL;
    }
    const findings = markdown
      .split('\n')
      .filter((l) => l.startsWith('- '))
      .map((l) => l.slice(2));
    return { verdict, findings, rows: [], markdown };
  },
});
