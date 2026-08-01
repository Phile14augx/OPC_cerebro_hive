#!/usr/bin/env node
/**
 * Validation harness CLI.
 *
 *   node tools/harness/cli.mjs list
 *   node tools/harness/cli.mjs run [caseId] [--phase n] [--out dir]
 *   node tools/harness/cli.mjs gate  [--phase n]     # CI mode: exit non-zero on FAIL
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listCases, getCase, runCase, summarise, VERDICT } from './kernel.mjs';
import { computeStatus, renderStatusTable } from './status.mjs';
import './cases/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const cmd = args[0] ?? 'list';
const argOf = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const phase = Number(argOf('--phase', process.env.EDA_PHASE ?? '0'));
const outDir = argOf('--out', join(HERE, '..', '..', 'docs', 'architecture', 'measurements'));

if (cmd === 'list') {
  console.info('\nvalidation cases\n');
  for (const c of listCases()) {
    const state = c.phase > phase ? `pending (phase ${String(c.phase)})` : 'runnable';
    console.info(`  ${c.id.padEnd(30)} ADR ${c.adrs.join(',')}  ${state}`);
    console.info(`  ${' '.repeat(30)} ${c.title}\n`);
  }
  process.exit(0);
}

if (cmd === 'status') {
  // Derived, never transcribed. This is the authoritative answer to
  // "where do the gates stand"; anything hand-copied will drift from it.
  const rows = computeStatus(listCases(), { measurementsDir: outDir, currentPhase: phase });
  if (args.includes('--json')) {
    console.info(JSON.stringify({ generatedAt: new Date().toISOString(), phase, gates: rows }, null, 2));
    process.exit(0);
  }
  console.info(`\ngate status (phase ${String(phase)}, generated ${new Date().toISOString()})\n`);
  console.info(renderStatusTable(rows));
  console.info('');
  for (const r of rows) {
    console.info(`  ${r.caseId}  ADR ${r.adrs.join(',')}`);
    console.info(`    verdict:   ${r.verdict}  [${r.blocker}]`);
    console.info(`    ${r.detail}`);
    if (r.confidence) console.info(`    evidence:  ${r.evidenceKind} (confidence: ${r.confidence})`);
    for (const e of r.established) console.info(`    established: ${e}`);
    console.info('');
  }
  process.exit(0);
}

if (cmd === 'run' || cmd === 'gate') {
  const only = args[1] && !args[1].startsWith('--') ? args[1] : null;
  const cases = only ? [getCase(only)].filter(Boolean) : listCases();
  if (only && cases.length === 0) { console.error(`unknown case: ${only}`); process.exit(2); }

  const records = [];
  for (const c of cases) {
    try {
      records.push(await runCase(c, { outDir, currentPhase: phase }));
    } catch (e) {
      records.push({ id: c.id, verdict: VERDICT.INCONCLUSIVE, findings: [String(e.message)], adrs: c.adrs });
    }
  }

  const { counts, reopenedAdrs } = summarise(records);
  console.info('\nverdicts\n');
  for (const r of records) console.info(`  ${r.verdict.padEnd(13)} ${r.caseId ?? r.id}${r.findings?.length ? ` — ${r.findings[0]}` : ''}`);
  console.info(`\n  ${Object.entries(counts).map(([k, v]) => `${k}:${String(v)}`).join('  ')}`);
  if (reopenedAdrs.length) console.error(`\n  ADRs REOPENED by failure: ${reopenedAdrs.join(', ')}`);

  // `gate` fails CI on FAIL only. INCONCLUSIVE and PENDING are reported but do
  // not block — a missing runtime is an environment problem, not a design defect,
  // and conflating them trains people to ignore the gate.
  process.exit(cmd === 'gate' && counts.FAIL > 0 ? 1 : 0);
}

console.error('usage: cli.mjs [list|status|run|gate] [caseId] [--phase n] [--out dir] [--json]');
process.exit(2);
