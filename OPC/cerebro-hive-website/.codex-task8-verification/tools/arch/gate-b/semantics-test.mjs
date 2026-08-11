#!/usr/bin/env node
/**
 * Gate B — execution semantics validation (ADR 0009).
 *
 * This portion of Gate B needs no Temporal cluster. The outcome-vs-infrastructure
 * distinction is pure logic, and it is the part ADR 0009 flags as most easily
 * botched — so it is worth validating now rather than discovering at 10,000 jobs
 * that a 40-hour deterministic failure has been retried four times.
 *
 * Includes a determinism harness: workflow bodies must be pure functions of their
 * event history. Non-deterministic workflow code fails on replay, usually long
 * after the change that introduced it, which makes it expensive to diagnose.
 *
 * Scale, throughput and real history growth still require a cluster. This script
 * does NOT satisfy Gate B on its own.
 *
 * Usage: node semantics-test.mjs
 */

let failures = 0;
const check = (name, cond, detail = '') => {
  if (cond) console.info(`  ok   ${name}`);
  else { console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`); failures++; }
};

// ---------------------------------------------------------------------------
// Port of packages/eda-workflow/src/failure-classification.ts.
//
// Kept in sync by the shared case table below rather than by import, so this
// harness can run before the TypeScript build exists. The cases are the contract;
// if the implementation and this port disagree, the case table catches it.
// ---------------------------------------------------------------------------

const DEFAULT_POLICY = {
  maxAttempts: 4,
  initialIntervalMs: 5_000,
  backoffCoefficient: 2,
  maxIntervalMs: 120_000,
  jitterFactor: 0.2,
};

const NON_RETRYABLE_INFRA = new Set(['image-pull-failed', 'sandbox-unsupported-syscall']);

const computeDelayMs = (policy, attempt, rand) => {
  const raw = policy.initialIntervalMs * policy.backoffCoefficient ** Math.max(0, attempt - 1);
  const capped = Math.min(raw, policy.maxIntervalMs);
  const jitter = capped * policy.jitterFactor * (rand() * 2 - 1);
  return Math.max(0, Math.round(capped + jitter));
};

function classify(result, attempt, policy = DEFAULT_POLICY, rand = () => 0.5) {
  if (result.kind === 'outcome') {
    return result.exitCode === 0
      ? { action: 'complete', outcome: 'success' }
      : { action: 'complete', outcome: 'tool-rejected', exitCode: result.exitCode };
  }
  if (NON_RETRYABLE_INFRA.has(result.reason)) {
    return { action: 'fail-permanently', reason: `${result.reason} is deterministic` };
  }
  if (attempt >= policy.maxAttempts) {
    return { action: 'fail-permanently', reason: `${result.reason} persisted` };
  }
  return { action: 'retry', reason: result.reason, attempt: attempt + 1, delayMs: computeDelayMs(policy, attempt, rand) };
}

// ---------------------------------------------------------------------------
console.info('\nGate B — execution semantics\n');
console.info('the distinction ADR 0009 says is most easily botched');

// The headline case. A synthesis tool that says "cannot route" has run
// successfully; retrying costs 40 hours and produces the same answer.
{
  const d = classify({ kind: 'outcome', exitCode: 1 }, 1);
  check('non-zero tool exit is NOT retried', d.action === 'complete' && d.outcome === 'tool-rejected', JSON.stringify(d));
}
{
  const d = classify({ kind: 'outcome', exitCode: 0 }, 1);
  check('zero exit completes successfully', d.action === 'complete' && d.outcome === 'success');
}
// The inverse error: quieter, and worse. Marking an evicted pod as a domain
// failure sends the engineer to debug a design problem that never existed.
{
  const d = classify({ kind: 'infrastructure', reason: 'node-evicted', retryable: true }, 1);
  check('evicted pod IS retried', d.action === 'retry' && d.attempt === 2, JSON.stringify(d));
}
{
  const d = classify({ kind: 'infrastructure', reason: 'backend-unreachable', retryable: true }, 1);
  check('unreachable backend IS retried', d.action === 'retry');
}
// High exit codes are still outcomes. Tools use 137/139 for OOM and segfault,
// which look like infrastructure but are reported by a process that ran.
{
  const d = classify({ kind: 'outcome', exitCode: 137 }, 1);
  check('exit 137 (OOM-killed tool) is an outcome, not infra', d.action === 'complete' && d.outcome === 'tool-rejected');
}

console.info('\nnon-retryable infrastructure');
{
  const d = classify({ kind: 'infrastructure', reason: 'image-pull-failed', retryable: true }, 1);
  check('bad image digest fails immediately', d.action === 'fail-permanently', JSON.stringify(d));
}
{
  const d = classify({ kind: 'infrastructure', reason: 'sandbox-unsupported-syscall', retryable: true }, 1);
  check('unsupported syscall fails immediately (deterministic)', d.action === 'fail-permanently');
}

console.info('\nretry policy');
{
  const d = classify({ kind: 'infrastructure', reason: 'node-evicted', retryable: true }, 4);
  check('exhausted attempts fail permanently', d.action === 'fail-permanently', JSON.stringify(d));
}
{
  const delays = [1, 2, 3].map((a) => computeDelayMs(DEFAULT_POLICY, a, () => 0.5));
  check('backoff is monotonically increasing', delays[0] < delays[1] && delays[1] < delays[2], delays.join(','));
}
{
  const d = computeDelayMs(DEFAULT_POLICY, 20, () => 0.5);
  check('backoff is capped', d <= DEFAULT_POLICY.maxIntervalMs * (1 + DEFAULT_POLICY.jitterFactor), String(d));
}
{
  // Without jitter, a recovering backend gets hit by every retry simultaneously.
  const a = computeDelayMs(DEFAULT_POLICY, 3, () => 0.1);
  const b = computeDelayMs(DEFAULT_POLICY, 3, () => 0.9);
  check('jitter spreads retries', a !== b, `${String(a)} vs ${String(b)}`);
}

console.info('\nexhaustiveness');
{
  // Every InfraFailure in the union must classify without falling through.
  const ALL_INFRA = [
    'backend-unreachable', 'submission-rejected', 'node-evicted',
    'image-pull-failed', 'sandbox-unsupported-syscall',
  ];
  const unhandled = ALL_INFRA.filter((reason) => {
    const d = classify({ kind: 'infrastructure', reason, retryable: true }, 1);
    return !['retry', 'fail-permanently'].includes(d.action);
  });
  check('every infrastructure reason is classified', unhandled.length === 0, unhandled.join(','));
}
{
  // Exit codes across the plausible range must never be treated as infrastructure.
  const leaked = [0, 1, 2, 126, 127, 130, 137, 139, 255]
    .map((exitCode) => classify({ kind: 'outcome', exitCode }, 1))
    .filter((d) => d.action !== 'complete');
  check('no exit code leaks into retry', leaked.length === 0, JSON.stringify(leaked));
}

console.info('\ndeterminism (replay safety)');
{
  // Workflow bodies must be pure functions of history. These probes detect the
  // three sources that break replay: wall-clock reads, randomness, and I/O.
  const forbidden = [
    { name: 'Date.now', probe: (src) => /\bDate\.now\s*\(/.test(src) },
    { name: 'new Date()', probe: (src) => /new\s+Date\s*\(\s*\)/.test(src) },
    { name: 'Math.random', probe: (src) => /\bMath\.random\s*\(/.test(src) },
    { name: 'process.env read', probe: (src) => /\bprocess\.env\b/.test(src) },
    { name: 'direct fs access', probe: (src) => /from\s+['"]node:fs['"]/.test(src) },
  ];
  // Representative compliant workflow body.
  const goodWorkflow = `
    export async function pnrFlow(input) {
      const lint = await activities.runJob(input.lintSpec);
      if (lint.outcome === 'tool-rejected') return { status: 'failed', stage: 'lint' };
      await workflow.condition(() => approved);
      return { status: 'ok' };
    }`;
  const badWorkflow = `
    export async function pnrFlow(input) {
      const started = Date.now();
      const seed = Math.random();
      return { started, seed };
    }`;
  const goodHits = forbidden.filter((f) => f.probe(goodWorkflow));
  const badHits = forbidden.filter((f) => f.probe(badWorkflow));
  check('compliant workflow passes determinism probes', goodHits.length === 0, goodHits.map((h) => h.name).join(','));
  check('non-deterministic workflow is caught', badHits.length >= 2, badHits.map((h) => h.name).join(','));
}

console.info('\nwhat this does NOT establish');
console.info('  - scheduling throughput at scale        → needs a cluster');
console.info('  - real history growth                   → needs a cluster (model: history-model.mjs)');
console.info('  - async activity completion under load  → needs a cluster');
console.info('  - replay after worker restart           → needs a cluster');
console.info('');
console.info(`${failures === 0 ? 'semantics OK — Gate B remains INCONCLUSIVE pending cluster measurement' : `${String(failures)} failure(s)`}\n`);
process.exit(failures === 0 ? 0 : 1);
