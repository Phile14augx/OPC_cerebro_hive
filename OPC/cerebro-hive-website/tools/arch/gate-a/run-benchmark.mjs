#!/usr/bin/env node
/**
 * Gate A runner — ADR 0013 (D2).
 *
 * Executes each workload under each available runtime, collecting wall-clock,
 * CPU time, peak RSS and output digests. Emits raw observations only; all
 * judgement happens in analyse.mjs, so the measurement step cannot be
 * accidentally tuned toward a desired verdict.
 *
 * Usage:
 *   node run-benchmark.mjs --runtimes native,docker,gvisor [--out results.json]
 *   node run-benchmark.mjs --runtimes native --quick        (harness smoke test)
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import os from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const { WORKLOADS, CORPUS } = await import(join(HERE, 'workloads.mjs'));
const CRITERIA = JSON.parse(readFileSync(join(HERE, 'criteria.json'), 'utf8'));

const args = process.argv.slice(2);
const argOf = (flag, dflt) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const QUICK = args.includes('--quick');
const RUNTIMES = argOf('--runtimes', 'native').split(',');
const OUT = argOf('--out', join(HERE, 'results', `gate-a-${new Date().toISOString().slice(0, 10)}.json`));
const WORK = argOf('--work', join(os.tmpdir(), 'gate-a-work'));

const IMAGE = 'node:22-slim';

// ---------------------------------------------------------------------------
// Environment capture — results are meaningless without knowing the host.
// A ratio measured on a noisy 2-core VM is not comparable to one from a
// dedicated runner node, and six months later nobody will remember which it was.
// ---------------------------------------------------------------------------
function captureEnvironment() {
  const readOr = (f, d = 'unknown') => { try { return readFileSync(f, 'utf8').trim(); } catch { return d; } };
  const cpuModel = os.cpus()[0]?.model ?? 'unknown';
  return {
    hostname: createHash('sha256').update(os.hostname()).digest('hex').slice(0, 12),
    kernel: os.release(),
    arch: os.arch(),
    cpuModel,
    cpuCount: os.cpus().length,
    totalMemGiB: Math.round(os.totalmem() / 1024 ** 3),
    loadAvgAtStart: os.loadavg(),
    virtualised: readOr('/sys/hypervisor/type', 'none'),
    nodeVersion: process.version,
    capturedAt: new Date().toISOString(),
  };
}

function runtimeAvailable(rt) {
  if (rt === 'native') return true;
  if (rt === 'docker') return spawnSync('docker', ['info'], { stdio: 'ignore' }).status === 0;
  if (rt === 'gvisor') {
    const r = spawnSync('docker', ['info', '--format', '{{json .Runtimes}}'], { encoding: 'utf8' });
    return r.status === 0 && r.stdout.includes('runsc');
  }
  if (rt === 'kata') {
    const r = spawnSync('docker', ['info', '--format', '{{json .Runtimes}}'], { encoding: 'utf8' });
    return r.status === 0 && r.stdout.includes('kata');
  }
  return false;
}

/** Build the argv for one workload under one runtime. */
function commandFor(runtime, workload, workDir) {
  const inner = workload.command.map((c) => c.replace('/work', workDir));
  if (runtime === 'native') return { file: inner[0], args: inner.slice(1) };

  const runtimeFlag =
    runtime === 'gvisor' ? ['--runtime', 'runsc'] : runtime === 'kata' ? ['--runtime', 'kata'] : [];
  return {
    file: 'docker',
    args: [
      'run', '--rm',
      ...runtimeFlag,
      '-v', `${workDir}:/work`,
      '--network', 'none',        // matches SandboxPolicy default (ADR 0013)
      '-w', '/work',
      IMAGE,
      ...workload.command,
    ],
  };
}

/**
 * One measured execution.
 *
 * Uses /usr/bin/time for CPU and peak RSS. Reading them from the child rather
 * than wrapping in JS avoids attributing the harness's own overhead to the
 * workload — a mistake that would systematically favour whichever runtime ran
 * first, when the harness was warm.
 */
function measure(runtime, workload, workDir) {
  const { file, args: cmdArgs } = commandFor(runtime, workload, workDir);
  const timeFile = join(workDir, '.time');
  const wrapped = ['-f', '%e %U %S %M', '-o', timeFile, file, ...cmdArgs];

  const t0 = process.hrtime.bigint();
  const res = spawnSync('/usr/bin/time', wrapped, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const t1 = process.hrtime.bigint();

  if (res.status !== 0) {
    const stderr = (res.stderr ?? '').slice(-2000);
    return {
      ok: false,
      // ADR 0013 names unimplemented syscalls as a real gVisor failure mode.
      // Distinguishing it from a generic failure matters: it blocks the workload
      // entirely rather than merely slowing it.
      unsupportedSyscall: /not implemented|ENOSYS|unsupported syscall|function not implemented/i.test(stderr),
      exitCode: res.status,
      stderr,
    };
  }

  let cpuUser = null, cpuSys = null, peakRssKb = null, wallFromTime = null;
  try {
    const [e, u, s, m] = readFileSync(timeFile, 'utf8').trim().split(/\s+/).map(Number);
    wallFromTime = e * 1000; cpuUser = u; cpuSys = s; peakRssKb = m;
  } catch { /* /usr/bin/time unavailable — wall clock from hrtime still valid */ }

  return {
    ok: true,
    wallclockMs: Number(t1 - t0) / 1e6,
    wallclockFromTimeMs: wallFromTime,
    cpuUserSec: cpuUser,
    cpuSysSec: cpuSys,
    peakRssKb,
    // Normalised: trailing whitespace differs harmlessly across runtimes.
    outputDigest: createHash('sha256').update((res.stdout ?? '').trim()).digest('hex'),
  };
}

function prepareCorpus(kind, workDir) {
  const gen = join(HERE, 'bench', 'gen-corpus.mjs');
  if (kind === 'corpus:rtl') {
    const dest = join(workDir, 'corpus', 'rtl');
    if (existsSync(dest)) return;
    const n = QUICK ? 50 : CORPUS.rtl.modules;
    const l = QUICK ? 40 : CORPUS.rtl.linesPerModule;
    execFileSync('node', [gen, 'rtl', dest, String(n), String(l)], { stdio: 'inherit' });
  } else if (kind === 'corpus:tree') {
    const dest = join(workDir, 'corpus', 'tree');
    if (existsSync(dest)) return;
    const d = QUICK ? 100 : CORPUS.tree.dirs;
    execFileSync('node', [gen, 'tree', dest, String(d), String(CORPUS.tree.filesPerDir), String(CORPUS.tree.depth)], {
      stdio: 'inherit',
    });
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const available = RUNTIMES.filter(runtimeAvailable);
const unavailable = RUNTIMES.filter((r) => !available.includes(r));

if (unavailable.length) {
  console.warn(`! unavailable runtimes (skipped): ${unavailable.join(', ')}`);
}
if (!available.includes('native')) {
  console.error('native baseline is required — every ratio is computed against it.');
  process.exit(2);
}

mkdirSync(WORK, { recursive: true });
mkdirSync(join(WORK, 'bench'), { recursive: true });
for (const f of ['parse-hdl.mjs', 'lint.mjs', 'traverse.mjs', 'mixed.mjs']) {
  writeFileSync(join(WORK, 'bench', f), readFileSync(join(HERE, 'bench', f)));
}

const warmup = QUICK ? 1 : CRITERIA.iterations.warmup;
const measured = QUICK ? 3 : CRITERIA.iterations.measured;

const results = {
  gate: 'A',
  adr: '0013',
  criteriaVersion: CRITERIA.version,
  quick: QUICK,
  environment: captureEnvironment(),
  runtimesRequested: RUNTIMES,
  runtimesMeasured: available,
  runtimesUnavailable: unavailable,
  iterations: { warmup, measured },
  observations: [],
};

for (const w of WORKLOADS) {
  if (w.prepare) prepareCorpus(w.prepare, WORK);

  for (const rt of available) {
    process.stderr.write(`\n${w.id} / ${rt}: `);
    const samples = [];
    let failure = null;

    for (let i = 0; i < warmup + measured; i++) {
      // Artifact outputs are cleared between iterations so each run does the
      // same work — otherwise later iterations benefit from existing files.
      if (w.producesArtifacts) rmSync(join(WORK, 'out'), { recursive: true, force: true });

      const r = measure(rt, w, WORK);
      if (!r.ok) { failure = r; break; }
      if (i >= warmup) samples.push(r);
      process.stderr.write(i < warmup ? '.' : '#');
    }

    results.observations.push({
      workload: w.id,
      axis: w.axis,
      runtime: rt,
      failed: failure !== null,
      failure,
      samples,
    });
  }
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(results, null, 2));
process.stderr.write(`\n\nraw observations → ${OUT}\n`);
process.stderr.write(`next: node ${join(HERE, 'analyse.mjs')} ${OUT}\n`);
