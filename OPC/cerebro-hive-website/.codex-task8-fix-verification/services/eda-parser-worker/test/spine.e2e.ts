/**
 * Phase 1 spine — end-to-end execution proof.
 *
 * Two runs of the same design. The second has one timing path deliberately
 * regressed and one genuinely new path. Asserts that signatures identify the
 * SAME path across runs despite its slack changing — the property everything
 * downstream depends on.
 */
import { mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalExecutionProvider } from '@cerebro/eda-execution';
import { OpenStaTimingParser } from '@cerebro/eda-parsers';
import { CanonicalSignatureComputer, InMemorySignatureRegistry } from '@cerebro/eda-findings';
import { runIngest, compareRuns } from '../src/ingest-pipeline.js';
import type { ExecutionSpec } from '@cerebro/eda-execution';

const root = join(tmpdir(), `p1-${String(Date.now())}`);
mkdirSync(root, { recursive: true });

function staReport(paths: { start: string; end: string; slack: number; corner?: string }[]): string {
  return paths.map((p) => `
Startpoint: ${p.start}
Endpoint: ${p.end}
Path Group: reg2reg
Path Type: setup
Corner: ${p.corner ?? 'ss_125c_1v62'}
Mode: func
  clock clk_core (rise edge)   0.000   0.000
   ${(p.slack + 2.5).toFixed(3)}   data arrival time
   ${(2.5).toFixed(3)}   data required time
  ${p.slack.toFixed(3)}   slack (${p.slack < 0 ? 'VIOLATED' : 'MET'})
`).join('\n');
}

/** A stub "tool": writes a report to the workspace, like OpenSTA would. */
function makeTool(dir: string, report: string, exitCode: number): string {
  const script = join(dir, 'fake-sta.sh');
  writeFileSync(script, `#!/bin/sh\ncat <<'EOF' > "$WORKSPACE/out/timing.rpt"\n${report}\nEOF\necho "sta done"\nexit ${String(exitCode)}\n`);
  chmodSync(script, 0o755);
  return script;
}

function spec(jobId: string, tool: string): ExecutionSpec {
  return {
    jobId: jobId as ExecutionSpec['jobId'],
    tool: { name: 'opensta', version: '2.0.1', imageDigest: 'sha256:local' },
    command: [tool],
    env: {},
    inputs: [],
    outputs: [{ glob: '/work/out/**' }],
    resources: { cpu: '1', memory: '1Gi', gpu: 0, ephemeralStorage: '1Gi' },
    licences: [],
    timeoutSec: 30,
    sandbox: { runtime: 'runc', network: 'none', readOnlyRoot: false, userNamespace: false, seccomp: 'runtime-default', serviceAccountToken: false },
  };
}

const exec = new LocalExecutionProvider({ workRoot: root, acknowledgeNoIsolation: true });
const deps = {
  execution: exec,
  parsers: [new OpenStaTimingParser()],
  signatures: new CanonicalSignatureComputer(),
  registry: new InMemorySignatureRegistry(),
};

let failures = 0;
const check = (n: string, c: boolean, d = '') => {
  if (c) console.info(`  ok   ${n}`);
  else { console.error(`  FAIL ${n}${d ? ` — ${d}` : ''}`); failures++; }
};

console.info('\nPhase 1 spine — end to end\n');

// Run 1: baseline
const r1Dir = join(root, 'r1'); mkdirSync(r1Dir, { recursive: true });
const tool1 = makeTool(r1Dir, staReport([
  { start: 'u_dma/u_fifo/wptr_reg[3]/CK', end: 'u_dma/u_fifo/rdata_reg[7]/D', slack: 0.120 },
  { start: 'u_core/state_reg[1]/CK',      end: 'u_core/out_reg[0]/D',          slack: 0.045 },
]), 0);
const run1 = await runIngest(deps, spec('job_R1', tool1), { runId: 'run-1', projectId: 'prj_x' as never });

check('run 1 executed and produced facts', run1.findings.length === 2, `${String(run1.findings.length)} findings`);
check('tool exit 0 recorded as outcome', run1.toolExitCode === 0 && run1.infrastructureFailure === null);
check('no signature collisions', run1.collisions === 0);

// Run 2: same design, one path regressed, one new path, tool exits non-zero
const r2Dir = join(root, 'r2'); mkdirSync(r2Dir, { recursive: true });
const tool2 = makeTool(r2Dir, staReport([
  { start: 'u_dma/u_fifo/wptr_reg[3]/CK', end: 'u_dma/u_fifo/rdata_reg[7]/D', slack: -0.080 }, // regressed
  { start: 'u_core/state_reg[1]/CK',      end: 'u_core/out_reg[0]/D',          slack: 0.045 }, // unchanged
  { start: 'u_new/blk_reg[0]/CK',         end: 'u_new/sink_reg[0]/D',          slack: 0.300 }, // new
]), 1);
const run2 = await runIngest(deps, spec('job_R2', tool2), { runId: 'run-2', projectId: 'prj_x' as never });

check('non-zero tool exit still ingests reports', run2.findings.length === 3, `${String(run2.findings.length)} findings`);
check('non-zero exit recorded as outcome, not infra failure',
  run2.toolExitCode === 1 && run2.infrastructureFailure === null,
  `exit=${String(run2.toolExitCode)} infra=${String(run2.infrastructureFailure)}`);

// THE property everything depends on.
const cmp = compareRuns(run1, run2);
check('regressed path keeps its identity across runs', cmp.persisting.length === 2, `${String(cmp.persisting.length)} persisting`);
check('exactly one genuinely new path', cmp.newFindings.length === 1, JSON.stringify(cmp.newFindings.map((f) => f.payload['endpoint'])));
check('regression detected on the right path', cmp.regressed.length === 1 && String(cmp.regressed[0]?.after.payload['endpoint']).includes('rdata_reg_7_'),
  JSON.stringify(cmp.regressed.map((r) => [r.after.payload['endpoint'], r.deltaPs])));
check('regression delta is correct (-200ps)', cmp.regressed[0]?.deltaPs === -200, String(cmp.regressed[0]?.deltaPs));
check('unchanged path is not reported as regressed', !cmp.regressed.some((r) => String(r.after.payload['endpoint']).includes('out_reg')));
check('nothing spuriously resolved', cmp.resolved.length === 0, `${String(cmp.resolved.length)} resolved`);

// Signature must ignore the measured value, by construction.
const sigBefore = cmp.regressed[0]?.before.signature;
const sigAfter = cmp.regressed[0]?.after.signature;
check('signature identical despite 200ps slack change', sigBefore === sigAfter, `${String(sigBefore)} vs ${String(sigAfter)}`);
check('signature carries type and version', String(sigAfter).startsWith('sig:timing_path.v1:'), String(sigAfter));

// Infrastructure failure must NOT be confused with a tool outcome.
const bad = await runIngest(deps, spec('job_R3', join(root, 'does-not-exist.sh')), { runId: 'run-3', projectId: 'prj_x' as never });
check('missing binary classified as infrastructure, not outcome',
  bad.toolExitCode === null && bad.infrastructureFailure !== null, JSON.stringify(bad.infrastructureFailure));

// Sandbox policy must be honoured or refused.
let refused = false;
try {
  const s = spec('job_R4', tool1);
  await exec.submit({ ...s, sandbox: { ...s.sandbox, runtime: 'gvisor' } });
} catch { refused = true; }
check('local backend refuses a job demanding gVisor', refused);

console.info(`\n${failures === 0 ? 'Phase 1 spine OK' : `${String(failures)} failure(s)`}\n`);
process.exit(failures === 0 ? 0 : 1);
