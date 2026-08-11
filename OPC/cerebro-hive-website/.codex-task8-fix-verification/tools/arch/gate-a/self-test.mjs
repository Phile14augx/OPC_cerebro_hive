#!/usr/bin/env node
/**
 * Gate A self-test.
 *
 * A benchmark harness that always reports PASS is worse than no harness: it
 * launders an unvalidated assumption into an apparently evidenced decision.
 * These cases feed synthetic observations engineered to trip each criterion and
 * assert the analyser catches them.
 *
 * Also verifies the statistics against inputs whose answers are known by hand —
 * a bootstrap CI or quantile off by one index is silent and would shift verdicts
 * on marginal results, which is exactly where the harness needs to be right.
 *
 * Usage: node self-test.mjs
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TMP = mkdtempSync(join(tmpdir(), 'gate-a-selftest-'));

let failures = 0;
const check = (name, cond, detail = '') => {
  if (cond) console.info(`  ok   ${name}`);
  else { console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`); failures++; }
};

// ---------------------------------------------------------------------------
// Synthetic observation builder
// ---------------------------------------------------------------------------
const sample = (ms, { digest = 'D_NATIVE', rss = 100000 } = {}) => ({
  ok: true,
  wallclockMs: ms,
  wallclockFromTimeMs: ms,
  cpuUserSec: ms / 1000,
  cpuSysSec: 0.01,
  peakRssKb: rss,
  outputDigest: digest,
});

/** Tight jitter so CV stays well below the stability threshold unless we want it not to. */
const series = (base, n = 25, jitter = 0.01, opts) =>
  Array.from({ length: n }, (_, i) => sample(base * (1 + ((i % 5) - 2) * jitter), opts));

function build(observations, overrides = {}) {
  return {
    gate: 'A', adr: '0013', criteriaVersion: 2, quick: false,
    environment: { capturedAt: '2026-08-01T00:00:00Z', kernel: 'test', cpuCount: 8 },
    runtimesRequested: ['native', 'gvisor'],
    runtimesMeasured: ['native', 'gvisor'],
    runtimesUnavailable: [],
    iterations: { warmup: 3, measured: 25 },
    observations,
    ...overrides,
  };
}

const WORKLOADS = ['startup', 'hdl_parse_large', 'lint_tool', 'file_tree_traversal', 'mixed_parse_write'];

/** All workloads passing comfortably. */
function healthy(gvisorFactor = 1.1) {
  const obs = [];
  for (const w of WORKLOADS) {
    obs.push({ workload: w, axis: 'x', runtime: 'native', failed: false, failure: null, samples: series(100) });
    obs.push({ workload: w, axis: 'x', runtime: 'gvisor', failed: false, failure: null, samples: series(100 * gvisorFactor) });
  }
  return obs;
}

function runAnalyser(results) {
  const f = join(TMP, `case-${Math.random().toString(36).slice(2)}.json`);
  writeFileSync(f, JSON.stringify(results));
  try {
    const out = execFileSync('node', [join(HERE, 'analyse.mjs'), f], { encoding: 'utf8' });
    return { exit: 0, out };
  } catch (e) {
    return { exit: e.status ?? -1, out: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

// ---------------------------------------------------------------------------
console.info('\nGate A self-test\n');
console.info('positive control');
{
  const r = runAnalyser(build(healthy(1.1)));
  check('healthy data passes', r.exit === 0 && r.out.includes('**Verdict:** PASS'), `exit ${String(r.exit)}`);
}

console.info('\nnegative controls — each must FAIL the gate');
{
  // 1.6x on lint_tool, threshold 1.3x
  const obs = healthy(1.1).map((o) =>
    o.workload === 'lint_tool' && o.runtime === 'gvisor'
      ? { ...o, samples: series(160) }
      : o,
  );
  const r = runAnalyser(build(obs));
  check('threshold breach detected', r.exit !== 0 && r.out.includes('exceeds threshold'), r.out.slice(0, 120));
}
{
  const obs = healthy(1.1).map((o) =>
    o.workload === 'mixed_parse_write' && o.runtime === 'gvisor'
      ? { ...o, samples: series(110, 25, 0.01, { digest: 'D_DIFFERENT' }) }
      : o,
  );
  const r = runAnalyser(build(obs));
  check('output divergence detected', r.exit !== 0 && r.out.includes('OUTPUT DIFFERS'), r.out.slice(0, 120));
}
{
  const obs = healthy(1.1).map((o) =>
    o.workload === 'file_tree_traversal' && o.runtime === 'gvisor'
      ? { ...o, failed: true, failure: { ok: false, unsupportedSyscall: true, exitCode: 1, stderr: 'function not implemented' }, samples: [] }
      : o,
  );
  const r = runAnalyser(build(obs));
  check('unsupported syscall detected', r.exit !== 0 && r.out.includes('UNSUPPORTED SYSCALL'), r.out.slice(0, 120));
}
{
  // Native noise > 15% CV invalidates the comparison entirely.
  const obs = healthy(1.1).map((o) =>
    o.workload === 'startup' && o.runtime === 'native'
      ? { ...o, samples: Array.from({ length: 25 }, (_, i) => sample(100 * (i % 2 === 0 ? 0.6 : 1.5))) }
      : o,
  );
  const r = runAnalyser(build(obs));
  check('unstable host detected', r.exit !== 0 && r.out.includes('too noisy'), r.out.slice(0, 120));
}
{
  const obs = healthy(1.1).map((o) =>
    o.workload === 'hdl_parse_large' && o.runtime === 'gvisor'
      ? { ...o, samples: series(110, 25, 0.01, { rss: 200000 }) }
      : o,
  );
  const r = runAnalyser(build(obs));
  check('memory blowup detected', r.exit !== 0 && r.out.includes('peak RSS ratio'), r.out.slice(0, 120));
}
{
  const r = runAnalyser(build(healthy(1.1).filter((o) => o.runtime !== 'gvisor'), {
    runtimesMeasured: ['native'], runtimesUnavailable: ['gvisor'],
  }));
  check('missing gvisor is INCONCLUSIVE, not PASS', r.exit !== 0 && r.out.includes('INCONCLUSIVE'), r.out.slice(0, 120));
}

console.info('\nmarginal-result handling');
{
  // Point estimate under threshold, but wide spread pushes the CI across it.
  const obs = healthy(1.1).map((o) => {
    if (o.workload !== 'lint_tool' || o.runtime !== 'gvisor') return o;
    const samples = Array.from({ length: 25 }, (_, i) => sample(128 * (1 + ((i % 7) - 3) * 0.055)));
    return { ...o, samples };
  });
  const r = runAnalyser(build(obs));
  check('marginal CI produces a warning', r.out.includes('Marginal') || r.out.includes('marginal'), r.out.slice(0, 200));
}

console.info('\nstatistics (hand-checkable inputs)');
{
  // Identical series ⇒ ratio exactly 1.0 and a CI that contains 1.0.
  const obs = [];
  for (const w of WORKLOADS) {
    const s = series(100, 25, 0);
    obs.push({ workload: w, axis: 'x', runtime: 'native', failed: false, failure: null, samples: s });
    obs.push({ workload: w, axis: 'x', runtime: 'gvisor', failed: false, failure: null, samples: s });
  }
  const r = runAnalyser(build(obs));
  check('identical series ⇒ ratio 1.00x', r.out.includes('1.00x'), '');
  check('zero-variance series ⇒ CV 0.000', r.out.includes('0.000'), '');
  check('identical series passes', r.exit === 0, `exit ${String(r.exit)}`);
}
{
  // Exact 2x: gvisor 200 vs native 100 on startup, threshold exactly 2.0.
  // Boundary case — must NOT fail, since the criterion is "exceeds".
  const obs = healthy(1.1).map((o) => {
    if (o.workload !== 'startup') return o;
    return { ...o, samples: series(o.runtime === 'gvisor' ? 200 : 100, 25, 0) };
  });
  const r = runAnalyser(build(obs));
  check('ratio exactly at threshold is not a failure', !r.out.includes('startup/gvisor: ratio'), r.out.slice(0, 160));
}

console.info(`\n${failures === 0 ? 'self-test OK' : `${String(failures)} self-test failure(s)`}\n`);
process.exit(failures === 0 ? 0 : 1);
