#!/usr/bin/env node
/**
 * Gate A analysis and verdict — ADR 0013 (D2).
 *
 * Separated from the runner so measurement and judgement cannot be entangled.
 * Thresholds come from criteria.json, which was fixed before any measurement.
 *
 * Exits non-zero if the gate fails, which reopens ADR 0013.
 *
 * Usage: node analyse.mjs results.json [--markdown out.md]
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CRITERIA = JSON.parse(readFileSync(join(HERE, 'criteria.json'), 'utf8'));

const [, , resultsPath, ...rest] = process.argv;
if (!resultsPath) {
  console.error('usage: analyse.mjs <results.json> [--markdown <out.md>]');
  process.exit(2);
}
const R = JSON.parse(readFileSync(resultsPath, 'utf8'));

// ---------------------------------------------------------------------------
// Statistics
//
// Median and IQR rather than mean and standard deviation. Benchmark timings are
// right-skewed — a single scheduler hiccup or page-cache miss adds a long tail
// that drags the mean but not the median. Reporting means here would overstate
// variance and could flip a verdict on noise.
// ---------------------------------------------------------------------------

const quantile = (sorted, q) => {
  if (sorted.length === 0) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
};

function describe(values) {
  const s = [...values].sort((a, b) => a - b);
  const median = quantile(s, 0.5);
  const q1 = quantile(s, 0.25);
  const q3 = quantile(s, 0.75);
  const mean = s.reduce((a, b) => a + b, 0) / s.length;
  const sd = Math.sqrt(s.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, s.length - 1));
  return {
    n: s.length,
    min: s[0],
    median,
    q1,
    q3,
    p95: quantile(s, 0.95),
    max: s[s.length - 1],
    mean,
    sd,
    // CV on the median, not the mean — consistent with using the median as the
    // point estimate everywhere else.
    cv: median === 0 ? 0 : sd / median,
  };
}

/**
 * Bootstrap CI for the ratio of medians.
 *
 * A point ratio of 1.28 against a 1.30 threshold is not a pass if the interval
 * spans 1.15–1.45. Reporting the interval is what stops a marginal result from
 * being read as a clean one — and marginal results are exactly where the
 * temptation to wave something through is strongest.
 */
function bootstrapRatioCI(a, b, iterations = 2000, seedInit = 42) {
  if (a.length === 0 || b.length === 0) return { lo: NaN, hi: NaN };
  let seed = seedInit;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const resampleMedian = (arr) => {
    const out = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) out[i] = arr[Math.floor(rnd() * arr.length)];
    return quantile(out.sort((x, y) => x - y), 0.5);
  };
  const ratios = [];
  for (let i = 0; i < iterations; i++) {
    const mb = resampleMedian(b);
    ratios.push(mb === 0 ? NaN : resampleMedian(a) / mb);
  }
  ratios.sort((x, y) => x - y);
  return { lo: quantile(ratios, 0.025), hi: quantile(ratios, 0.975) };
}

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

const byKey = new Map();
for (const o of R.observations) byKey.set(`${o.workload}/${o.runtime}`, o);

const findings = [];
const rows = [];
let verdict = 'PASS';
const failGate = (msg) => { findings.push(msg); verdict = 'FAIL'; };
const warn = (msg) => findings.push(`(warning) ${msg}`);

const compareRuntimes = R.runtimesMeasured.filter((r) => r !== 'native');

for (const [workloadId, threshold] of Object.entries(CRITERIA.thresholds)) {
  const nativeObs = byKey.get(`${workloadId}/native`);
  if (!nativeObs || nativeObs.failed) {
    failGate(`${workloadId}: native baseline missing or failed — no ratio can be computed.`);
    continue;
  }
  const nativeWall = nativeObs.samples.map((s) => s.wallclockMs);
  const nativeStats = describe(nativeWall);
  const nativeDigest = nativeObs.samples[0]?.outputDigest;

  if (nativeStats.cv > CRITERIA.globalCriteria.stability.maxCoefficientOfVariation) {
    failGate(
      `${workloadId}/native: CV ${nativeStats.cv.toFixed(3)} exceeds ` +
        `${String(CRITERIA.globalCriteria.stability.maxCoefficientOfVariation)}. ` +
        'Host is too noisy for a meaningful comparison — rerun on a quiet machine.',
    );
  }

  rows.push({
    workload: workloadId, runtime: 'native', stats: nativeStats,
    ratio: 1, ci: { lo: 1, hi: 1 }, threshold: null, status: 'baseline',
    peakRssKb: describe(nativeObs.samples.map((s) => s.peakRssKb ?? 0)).median,
  });

  for (const rt of compareRuntimes) {
    const obs = byKey.get(`${workloadId}/${rt}`);
    if (!obs) continue;

    if (obs.failed) {
      if (obs.failure?.unsupportedSyscall && CRITERIA.globalCriteria.noUnsupportedSyscalls.required) {
        failGate(`${workloadId}/${rt}: UNSUPPORTED SYSCALL — workload cannot run under this sandbox at all.`);
      } else {
        failGate(`${workloadId}/${rt}: execution failed (exit ${String(obs.failure?.exitCode)}).`);
      }
      rows.push({ workload: workloadId, runtime: rt, stats: null, status: 'failed' });
      continue;
    }

    const wall = obs.samples.map((s) => s.wallclockMs);
    const stats = describe(wall);
    const ratio = stats.median / nativeStats.median;
    const ci = bootstrapRatioCI(wall, nativeWall);

    if (stats.cv > CRITERIA.globalCriteria.stability.maxCoefficientOfVariation) {
      warn(`${workloadId}/${rt}: CV ${stats.cv.toFixed(3)} is high; treat the ratio as indicative only.`);
    }

    // Correctness before performance: a fast sandbox that changes results is
    // disqualifying, and would otherwise be reported as a pass.
    if (CRITERIA.globalCriteria.correctness.requireIdenticalOutputHash) {
      const digest = obs.samples[0]?.outputDigest;
      if (nativeDigest && digest && digest !== nativeDigest) {
        failGate(`${workloadId}/${rt}: OUTPUT DIFFERS from native (${digest.slice(0, 12)} vs ${nativeDigest.slice(0, 12)}).`);
      }
    }

    const peak = describe(obs.samples.map((s) => s.peakRssKb ?? 0)).median;
    const nativePeak = describe(nativeObs.samples.map((s) => s.peakRssKb ?? 0)).median;
    const memRatio = nativePeak > 0 ? peak / nativePeak : NaN;
    if (Number.isFinite(memRatio) && memRatio > CRITERIA.globalCriteria.peakMemoryRatio.maxRatioVsNative) {
      failGate(
        `${workloadId}/${rt}: peak RSS ratio ${memRatio.toFixed(2)} exceeds ` +
          `${String(CRITERIA.globalCriteria.peakMemoryRatio.maxRatioVsNative)}.`,
      );
    }

    // Only gVisor is gated. Docker is context: it separates containerisation
    // cost from sandboxing cost, and those have different remedies.
    let status = 'info';
    if (rt === 'gvisor') {
      if (ratio > threshold.maxRatioVsNative) {
        failGate(
          `${workloadId}/gvisor: ratio ${ratio.toFixed(2)}x exceeds threshold ` +
            `${String(threshold.maxRatioVsNative)}x (95% CI ${ci.lo.toFixed(2)}–${ci.hi.toFixed(2)}).`,
        );
        status = 'fail';
      } else if (ci.hi > threshold.maxRatioVsNative) {
        warn(
          `${workloadId}/gvisor: point estimate ${ratio.toFixed(2)}x passes, but the CI upper bound ` +
            `${ci.hi.toFixed(2)}x crosses the ${String(threshold.maxRatioVsNative)}x threshold. Marginal — ` +
            'rerun with more iterations before relying on this.',
        );
        status = 'marginal';
      } else {
        status = 'pass';
      }
    }

    rows.push({ workload: workloadId, runtime: rt, stats, ratio, ci, threshold: threshold.maxRatioVsNative, status, peakRssKb: peak });
  }
}

if (!compareRuntimes.includes('gvisor')) {
  verdict = 'INCONCLUSIVE';
  findings.push(
    'gVisor was not measured. Gate A cannot be satisfied without it — this run establishes ' +
      'a baseline only and does NOT confirm ADR 0013.',
  );
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '—');
const lines = [];
lines.push(`# Gate A — Sandbox Overhead Measurement (ADR 0013)`);
lines.push('');
lines.push(`**Verdict:** ${verdict}`);
lines.push(`**Criteria version:** ${String(R.criteriaVersion)} (fixed ${CRITERIA.fixedAt}, before measurement)`);
lines.push(`**Measured:** ${R.environment.capturedAt}`);
lines.push(`**Runtimes:** ${R.runtimesMeasured.join(', ')}${R.runtimesUnavailable.length ? ` (unavailable: ${R.runtimesUnavailable.join(', ')})` : ''}`);
lines.push(`**Iterations:** ${String(R.iterations.warmup)} warmup + ${String(R.iterations.measured)} measured`);
if (R.quick) lines.push('', '> **QUICK MODE — harness smoke test, not a valid measurement.**');
lines.push('');
lines.push('## Environment');
lines.push('');
lines.push('| Property | Value |');
lines.push('|---|---|');
for (const [k, v] of Object.entries(R.environment)) {
  lines.push(`| ${k} | ${Array.isArray(v) ? v.map((x) => fmt(x)).join(', ') : String(v)} |`);
}
lines.push('');
lines.push('## Results');
lines.push('');
lines.push('| Workload | Runtime | n | median ms | IQR | CV | ratio | 95% CI | threshold | status |');
lines.push('|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  if (!r.stats) { lines.push(`| ${r.workload} | ${r.runtime} | — | — | — | — | — | — | — | FAILED |`); continue; }
  lines.push(
    `| ${r.workload} | ${r.runtime} | ${String(r.stats.n)} | ${fmt(r.stats.median, 1)} | ` +
      `${fmt(r.stats.q1, 1)}–${fmt(r.stats.q3, 1)} | ${fmt(r.stats.cv, 3)} | ${fmt(r.ratio)}x | ` +
      `${r.ci ? `${fmt(r.ci.lo)}–${fmt(r.ci.hi)}` : '—'} | ${r.threshold ? `${fmt(r.threshold)}x` : '—'} | ${r.status} |`,
  );
}
lines.push('');
lines.push('## Findings');
lines.push('');
if (findings.length === 0) lines.push('None. All thresholds met.');
for (const f of findings) lines.push(`- ${f}`);
lines.push('');
lines.push('## Outcome');
lines.push('');
lines.push(verdict === 'PASS' ? CRITERIA.outcome.onPass : verdict === 'FAIL' ? CRITERIA.outcome.onFail : 'Inconclusive — see findings. ADR 0013 remains unvalidated.');
lines.push('');

const report = lines.join('\n');
const mdIdx = rest.indexOf('--markdown');
if (mdIdx >= 0 && rest[mdIdx + 1]) {
  mkdirSync(dirname(rest[mdIdx + 1]), { recursive: true });
  writeFileSync(rest[mdIdx + 1], report);
  console.error(`report → ${rest[mdIdx + 1]}`);
}
console.info(report);

process.exit(verdict === 'PASS' ? 0 : 1);
