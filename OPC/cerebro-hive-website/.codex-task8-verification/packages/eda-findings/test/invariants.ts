/**
 * Repository and signature invariants — ADR 0010, ADR 0011.
 *
 * Properties, not implementations. Each states a rule the system must obey
 * regardless of how it is built, so they survive the SQLite → Postgres swap
 * unchanged.
 *
 * Run: node --experimental-strip-types packages/eda-findings/test/invariants.ts
 */

import { SqliteFindingRepository } from '../src/sqlite-finding-repository.js';
import { StaleWriteError } from '../src/finding-repository.js';
import { CanonicalSignatureComputer } from '../src/signature-computer.js';
import { OpenStaTimingParser } from '@cerebro/eda-parsers';
import {
  assertKeyMatchesContract,
  SIGNATURE_KEY_FIELDS_V1,
  SignatureContractViolation,
} from '@cerebro/eda-domain';
import type { FindingSignature, ProjectId, VerifiedTenantContext } from '@cerebro/eda-domain';

let failures = 0;
const check = (n: string, c: boolean, d = ''): void => {
  if (c) console.info(`  ok   ${n}`);
  else {
    console.error(`  FAIL ${n}${d ? ` — ${d}` : ''}`);
    failures++;
  }
};

const ctxA = { orgId: 'org_A', userId: 'usr_1', clearances: ['none'], correlationId: 'c1' } as unknown as VerifiedTenantContext;
const ctxB = { orgId: 'org_B', userId: 'usr_2', clearances: ['none'], correlationId: 'c2' } as unknown as VerifiedTenantContext;
const prj = 'prj_x' as ProjectId;
const sig = (s: string): FindingSignature => s as FindingSignature;
const SIG_A = 'sig:timing_path.v1:aaa';

const mk = (signature: string, payload: Record<string, unknown>, runId: string) => ({
  signature: sig(signature),
  findingType: 'timing_path',
  signatureVersion: 1,
  semanticKey: [['startpoint', 'a'], ['endpoint', 'b']] as ReadonlyArray<readonly [string, string]>,
  payload,
  runId,
});

console.info('\nrepository invariants\n');
{
  const repo = new SqliteFindingRepository();

  const r1 = await repo.recordRun(ctxA, prj, 'run-1', [mk(SIG_A, { slackPs: 120 }, 'run-1')]);
  check('new signature inserts', r1[0]?.action === 'inserted', JSON.stringify(r1));

  const r2 = await repo.recordRun(ctxA, prj, 'run-2', [mk(SIG_A, { slackPs: -80 }, 'run-2')]);
  check('same signature updates, does not duplicate', r2[0]?.action === 'updated');

  const open = await repo.listOpen(ctxA, prj);
  check('exactly one row for a repeated signature', open.length === 1, `${String(open.length)} rows`);
  check('first_seen preserved across updates', open[0]?.firstSeenRun === 'run-1');
  check('last_seen advances', open[0]?.lastSeenRun === 'run-2');
  check('payload reflects the latest run', (open[0]?.payload as { slackPs: number }).slackPs === -80);

  // Replaying an identical report must be a no-op in everything an engineer sees.
  const before = await repo.findBySignature(ctxA, prj, sig(SIG_A));
  await repo.recordRun(ctxA, prj, 'run-2', [mk(SIG_A, { slackPs: -80 }, 'run-2')]);
  const after = await repo.findBySignature(ctxA, prj, sig(SIG_A));
  check(
    'replaying an identical run is payload-idempotent',
    JSON.stringify(before?.payload) === JSON.stringify(after?.payload),
  );

  check('absent signature marks resolved', (await repo.markResolved(ctxA, prj, 'run-3', [sig(SIG_A)])) === 1);
  check('resolved leaves the open list', (await repo.listOpen(ctxA, prj)).length === 0);

  // A fix that regressed is materially different from a violation that never left.
  const back = await repo.recordRun(ctxA, prj, 'run-4', [mk(SIG_A, { slackPs: -90 }, 'run-4')]);
  check('a returning finding is reopened, not re-inserted', back[0]?.action === 'reopened', JSON.stringify(back));

  // Tenant scoping: identical signature, different org.
  await repo.recordRun(ctxB, prj, 'run-1', [mk(SIG_A, { slackPs: 999 }, 'run-1')]);
  const aRow = await repo.findBySignature(ctxA, prj, sig(SIG_A));
  const bRow = await repo.findBySignature(ctxB, prj, sig(SIG_A));
  check(
    'identical signature in two tenants stays two rows',
    (aRow?.payload as { slackPs: number }).slackPs === -90 && (bRow?.payload as { slackPs: number }).slackPs === 999,
  );
  check('tenant A never observes tenant B values', (aRow?.payload as { slackPs: number }).slackPs !== 999);

  // Version column advances with every recordRun update (M8 gap — discovered
  // by mutation testing: removing the increment from recordRun went undetected
  // because updatePayload was the only version exerciser. This assertion closes
  // that gap without depending on updatePayload).
  {
    const repo2 = new SqliteFindingRepository();
    await repo2.recordRun(ctxA, prj, 'r1', [mk(SIG_A, { slackPs: 1 }, 'r1')]);
    await repo2.recordRun(ctxA, prj, 'r2', [mk(SIG_A, { slackPs: 2 }, 'r2')]);
    await repo2.recordRun(ctxA, prj, 'r3', [mk(SIG_A, { slackPs: 3 }, 'r3')]);
    const v = (await repo2.findBySignature(ctxA, prj, sig(SIG_A)))?.version;
    check('recordRun increments version on each update', v === 3, `version=${String(v)}`);
    repo2.close();
  }

  // Optimistic concurrency: the second write built on a stale read must lose.
  const cur = await repo.findBySignature(ctxA, prj, sig(SIG_A));
  await repo.updatePayload(ctxA, prj, sig(SIG_A), { slackPs: 1 }, cur?.version ?? 0);
  let stale = false;
  try {
    await repo.updatePayload(ctxA, prj, sig(SIG_A), { slackPs: 2 }, cur?.version ?? 0);
  } catch (e) {
    stale = e instanceof StaleWriteError;
  }
  check('stale write rejected by version check', stale);

  repo.close();
}

console.info('\nsignature contract (frozen v1)\n');
{
  check(
    'timing_path key set is exactly the frozen contract',
    JSON.stringify(SIGNATURE_KEY_FIELDS_V1['timing_path']) ===
      JSON.stringify(['startpoint', 'endpoint', 'path_type', 'corner', 'mode', 'path_group', 'clock_launch', 'clock_capture']),
  );

  // Both directions: a missing field collapses findings, an extra field splits them.
  let missing = false;
  let extra = false;
  try {
    assertKeyMatchesContract('timing_path', ['startpoint', 'endpoint']);
  } catch (e) {
    missing = e instanceof SignatureContractViolation;
  }
  try {
    assertKeyMatchesContract('timing_path', [
      'startpoint', 'endpoint', 'path_type', 'corner', 'mode', 'path_group', 'clock_launch', 'clock_capture', 'slack',
    ]);
  } catch (e) {
    extra = e instanceof SignatureContractViolation;
  }
  check('a missing key field is rejected', missing);
  check('an extra key field is rejected', extra);
}

console.info('\nparser property invariants\n');
{
  const parser = new OpenStaTimingParser();
  const computer = new CanonicalSignatureComputer();

  const host = (text: string) => {
    let pos = 0;
    const buf = Buffer.from(text, 'utf8');
    return {
      async readChunk(n: number) {
        if (pos >= buf.length) return null;
        const s = buf.subarray(pos, pos + n);
        pos += s.length;
        return new Uint8Array(s);
      },
      log(): void {},
    };
  };
  const input = { artifactId: 'art_x' as never, contentType: 'text/plain', sizeBytes: 0 };

  const sigOf = async (report: string): Promise<string[]> => {
    const out: string[] = [];
    for await (const f of parser.parse(input, host(report))) {
      out.push(computer.compute('timing_path', 1, f.semanticKey));
    }
    return out;
  };

  const base = `
Startpoint: u_dma/fifo/wptr_reg[3]/CK
Endpoint: u_dma/fifo/rdata_reg[7]/D
Path Group: reg2reg
Path Type: setup
Corner: ss_125c_1v62
Mode: func
  clock clk_core (rise edge)   0.000   0.000
   2.620   data arrival time
   2.500   data required time
  0.120   slack (MET)
`;
  const baseline = (await sigOf(base))[0];
  check('baseline report yields exactly one path', (await sigOf(base)).length === 1);

  // Properties: formatting and measurement must never change identity.
  check('whitespace changes → same signature', (await sigOf(base.replace(/  +/g, '    ')))[0] === baseline);
  check(
    'column alignment changes → same signature',
    (await sigOf(base.replace(/ {3}(data (arrival|required) time)/g, '        $1')))[0] === baseline,
  );
  check(
    'slack change → same signature',
    (await sigOf(base.replace('0.120   slack (MET)', '-0.480   slack (VIOLATED)').replace('2.620   data arrival', '2.020   data arrival')))[0] ===
      baseline,
  );
  check(
    'hierarchy alias (dot vs slash) → same signature',
    (await sigOf(base.replace(/u_dma\/fifo\/(\w+)\[(\d)\]\/(\w+)/g, 'u_dma.fifo.$1[$2].$3')))[0] === baseline,
  );
  check(
    'escaped hierarchy → same signature',
    (await sigOf(base.replace('u_dma/fifo/wptr_reg[3]/CK', 'u_dma/\\fifo/wptr_reg[3]/CK')))[0] === baseline,
  );

  // Negative controls: identity MUST change when an identity field changes.
  check('corner change → DIFFERENT signature', (await sigOf(base.replace('ss_125c_1v62', 'ff_m40c_1v98')))[0] !== baseline);
  check('endpoint change → DIFFERENT signature', (await sigOf(base.replace('rdata_reg[7]/D', 'rdata_reg[8]/D')))[0] !== baseline);
  check('path type change → DIFFERENT signature', (await sigOf(base.replace('Path Type: setup', 'Path Type: hold')))[0] !== baseline);


  // M7 fixture — NFC normalisation.
  // precomposed á (U+00E1) vs decomposed á (U+0061 U+0301) in hierarchy name.
  // NFC must collapse both to the same bytes before hashing; without it a
  // non-ASCII toolchain produces a false regression on every run.
  {
    const epPre = base.replace('u_dma/fifo/rdata_reg[7]/D', 'u_dma/fifo/reg_á_out');
    const epDec = base.replace('u_dma/fifo/rdata_reg[7]/D', 'u_dma/fifo/reg_á_out');
    const sigPre = (await sigOf(epPre))[0];
    const sigDec = (await sigOf(epDec))[0];
    check(
      'decomposed and precomposed Unicode hierarchy → same signature (M7 fixture)',
      sigPre === sigDec,
      `pre=${sigPre ?? 'none'} dec=${sigDec ?? 'none'}`,
    );
  }

  // M15 fixture — sort-order divergence.
  // 'z_field'='aardvark' + 'a_field'='zebra':
  //   field-name sort → a_field=zebraz_field=aardvark
  //   value sort      → z_field=aardvarka_field=zebra   (different string)
  // canonicalForm is tested directly; the parser always emits the fixed
  // timing-path key set so a parser report cannot exercise this divergence.
  {
    const { canonicalForm } = await import('../src/signature.js') as
      { canonicalForm: (k: ReadonlyArray<readonly [string, string]>) => string };
    const key: ReadonlyArray<readonly [string, string]> = [
      ['z_field', 'aardvark'],
      ['a_field', 'zebra'],
    ];
    const canonical = canonicalForm(key);
    check(
      'canonical form sorts by field name not value (M15 fixture)',
      canonical === 'a_field=zebra\u001fz_field=aardvark',
      `got: ${canonical}`,
    );
  }
}

console.info(`\n${failures === 0 ? 'all invariants OK' : `${String(failures)} failure(s)`}\n`);
process.exit(failures === 0 ? 0 : 1);
