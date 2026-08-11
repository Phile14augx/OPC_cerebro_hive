/**
 * Generated gate status.
 *
 * Exists because the status table was transcribed by hand twice and drifted both
 * times — once conflating "no gVisor measurement exists" with "a measurement
 * exists but was too noisy", and once reporting infrastructure as provisioned
 * when it was only provisionable.
 *
 * The first version of this file then committed the same sin: `established` was
 * a hand-typed literal listing "16 checks" and "~4,000 activities/child". Those
 * numbers are now derived from the artifacts that produce them, so they change
 * when the evidence changes rather than when someone remembers to edit a string.
 *
 * Every field carries provenance:
 *   observed — discovered live from the environment or by executing a check
 *   derived  — computed from a recorded artifact (matrix, model, probe module)
 *   declared — authored, because it cannot be inferred
 *
 * `declared` is the category to keep near zero. Where one survives, it says so.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const MATRIX = join(ROOT, 'docs/architecture/CEREBROEDA-VERIFICATION-MATRIX.md');

export const PROVENANCE = Object.freeze({
  OBSERVED: 'observed',
  DERIVED: 'derived',
  DECLARED: 'declared',
});

const field = (value, provenance, from) => ({ value, provenance, from });

/**
 * The ONLY approved origin for a declared field.
 *
 * Exported so the invariant can be asserted rather than trusted. The numeric
 * limit (declared <= gateCount) alone would not catch a new hand-authored field
 * introduced elsewhere while some other declared field was removed.
 */
export const WIRING_SOURCE = 'status.mjs WIRING';

/**
 * Why a gate is not green. EVIDENCE_ABSENT means no measurement was taken at
 * all; EVIDENCE_UNUSABLE means one was taken and could not be interpreted.
 * Collapsing them systematically understates how much is unknown.
 */
export const BLOCKER = Object.freeze({
  NONE: 'none',
  EVIDENCE_ABSENT: 'evidence-absent',
  EVIDENCE_UNUSABLE: 'evidence-unusable',
  NEVER_RUN: 'never-run',
  PHASE_NOT_REACHED: 'phase-not-reached',
});

/**
 * Structural wiring — which runtime each gate needs and which script carries its
 * self-verification. This is DECLARED: it is configuration, not evidence, and
 * cannot be inferred from artifacts. Kept minimal and marked as such.
 */
const WIRING = {
  'gate-a-sandbox-overhead': {
    dependencyLabel: 'gVisor runtime (runsc)',
    selfTest: 'tools/arch/gate-a/self-test.mjs',
    check() {
      try {
        return execFileSync('docker', ['info', '--format', '{{json .Runtimes}}'], {
          encoding: 'utf8', timeout: 5_000, stdio: ['ignore', 'pipe', 'ignore'],
        }).includes('runsc');
      } catch { return false; }
    },
  },
  'gate-b-workflow-scale': {
    dependencyLabel: 'Temporal cluster (TEMPORAL_ADDRESS)',
    selfTest: 'tools/arch/gate-b/semantics-test.mjs',
    check: () => Boolean(process.env.TEMPORAL_ADDRESS),
  },
  'gate-c-tenant-isolation': {
    dependencyLabel: 'PostgreSQL (DATABASE_URL)',
    selfTest: 'tools/arch/gate-c/self-test.mjs',
    check: () => Boolean(process.env.DATABASE_URL),
  },
};

// ---------------------------------------------------------------------------
// Derivations
// ---------------------------------------------------------------------------

/** Count matrix rows per ADR by enforcement status. Derived from the matrix file. */
function matrixRowsFor(adrs) {
  if (!existsSync(MATRIX)) return null;
  const text = readFileSync(MATRIX, 'utf8');
  const rows = text
    .split('\n')
    .filter((l) => /^\|\s*\*\*\d{4}\*\*/.test(l))
    .map((l) => l.split('|').map((c) => c.trim()))
    .filter((cells) => adrs.some((a) => cells[1]?.includes(a)));

  const enforced = rows.filter((c) => /^\*?\*?Enforced\*?\*?$/i.test(c[5] ?? '')).length;
  const typesOnly = rows.filter((c) => /Enforced \(types\)/i.test(c[5] ?? '')).length;
  const modelOnly = rows.filter((c) => /Model only/i.test(c[5] ?? '')).length;
  return { total: rows.length, enforced, typesOnly, modelOnly };
}

/** Execute a gate's self-test and count passing assertions. Observed, not assumed. */
function runSelfTest(relPath) {
  const abs = join(ROOT, relPath);
  if (!existsSync(abs)) return null;
  try {
    const out = execFileSync('node', [abs], { encoding: 'utf8', timeout: 60_000 });
    return { passed: (out.match(/^\s{2}ok\s{3}/gm) ?? []).length, failed: 0, exitOk: true };
  } catch (e) {
    const out = `${e.stdout ?? ''}`;
    return {
      passed: (out.match(/^\s{2}ok\s{3}/gm) ?? []).length,
      failed: (out.match(/^\s{2}FAIL/gm) ?? []).length,
      exitOk: false,
    };
  }
}

/** Parse the derived activity cap out of the history model. */
function historyCap() {
  const script = join(ROOT, 'tools/arch/gate-b/history-model.mjs');
  if (!existsSync(script)) return null;
  let out = '';
  try {
    out = execFileSync('node', [script], { encoding: 'utf8', timeout: 30_000 });
  } catch (e) {
    out = `${e.stdout ?? ''}`; // exit 2 = actionable finding, not failure
  }
  const m = out.match(/Maximum activities in a single workflow[^*]*\*\*([\d,]+)\*\*/);
  return m ? Number(m[1].replaceAll(',', '')) : null;
}

/** Count probes and negative controls by importing the module. */
async function probeInventory() {
  const mod = join(ROOT, 'tools/arch/gate-c/probes.mjs');
  if (!existsSync(mod)) return null;
  try {
    const p = await import(`file://${mod}`);
    return {
      probes: p.ALL_PROBES.length,
      negativeControls: p.ALL_PROBES.filter((x) => x.breaksUnder).length,
      excluded: p.EXCLUDED_PROBES.length,
    };
  } catch { return null; }
}

/** Count deliberately broken schema variants. */
function brokenVariants() {
  const f = join(ROOT, 'tools/arch/gate-c/broken-variants.sql');
  if (!existsSync(f)) return null;
  return (readFileSync(f, 'utf8').match(/^-- V\d+:/gm) ?? []).length;
}

// ---------------------------------------------------------------------------

function lastEvidence(caseId, measurementsDir) {
  if (!existsSync(measurementsDir)) return null;
  const latest = readdirSync(measurementsDir)
    .filter((f) => f.startsWith(caseId) && f.endsWith('.json'))
    .sort()
    .at(-1);
  if (!latest) return null;
  try {
    return JSON.parse(readFileSync(join(measurementsDir, latest), 'utf8')).record ?? null;
  } catch { return null; }
}

async function establishedFor(caseId, adrs, wiring, deep) {
  const out = [];
  const matrix = matrixRowsFor(adrs);
  if (matrix) {
    if (matrix.enforced > 0) {
      out.push(field(`${String(matrix.enforced)} enforcement mechanism(s) proven`, PROVENANCE.DERIVED, 'verification-matrix'));
    }
    if (matrix.typesOnly > 0) {
      out.push(field(`${String(matrix.typesOnly)} enforced at compile time only`, PROVENANCE.DERIVED, 'verification-matrix'));
    }
    if (matrix.modelOnly > 0) {
      out.push(field(`${String(matrix.modelOnly)} finding(s) at analytical-model confidence`, PROVENANCE.DERIVED, 'verification-matrix'));
    }
  }

  if (deep) {
    const st = runSelfTest(wiring.selfTest);
    if (st) {
      out.push(field(
        `${String(st.passed)} self-test check(s) passing${st.failed ? `, ${String(st.failed)} FAILING` : ''}`,
        PROVENANCE.OBSERVED,
        wiring.selfTest,
      ));
    }
  }

  if (caseId === 'gate-b-workflow-scale' && deep) {
    const cap = historyCap();
    if (cap) out.push(field(`History budget: ${cap.toLocaleString('en-US')} activities per workflow`, PROVENANCE.DERIVED, 'gate-b/history-model.mjs'));
  }

  if (caseId === 'gate-c-tenant-isolation') {
    const inv = await probeInventory();
    if (inv) {
      out.push(field(`${String(inv.probes)} adversarial probes, ${String(inv.negativeControls)} with negative controls`, PROVENANCE.DERIVED, 'gate-c/probes.mjs'));
      if (inv.excluded) out.push(field(`${String(inv.excluded)} probe(s) documented as excluded`, PROVENANCE.DERIVED, 'gate-c/probes.mjs'));
    }
    const bv = brokenVariants();
    if (bv) out.push(field(`${String(bv)} deliberately broken schema variants`, PROVENANCE.DERIVED, 'gate-c/broken-variants.sql'));
  }

  return out;
}

export async function computeStatus(cases, { measurementsDir, currentPhase = 0, deep = true }) {
  const rows = [];
  for (const c of cases) {
    const wiring = WIRING[c.id];
    const available = wiring ? wiring.check() : true;
    const evidence = lastEvidence(c.id, measurementsDir);
    const established = wiring ? await establishedFor(c.id, c.adrs, wiring, deep) : [];

    let verdict, blocker, detail;
    if (c.phase > currentPhase) {
      verdict = 'PENDING';
      blocker = BLOCKER.PHASE_NOT_REACHED;
      detail = `Validates Phase ${String(c.phase)}; repository at Phase ${String(currentPhase)}.`;
    } else if (!available) {
      verdict = 'INCONCLUSIVE';
      blocker = BLOCKER.EVIDENCE_ABSENT;
      detail = established.length
        ? `${wiring.dependencyLabel} not available — blocked portion unmeasured; ${String(established.length)} finding(s) established.`
        : `${wiring.dependencyLabel} not available — no measurement collected.`;
    } else if (!evidence) {
      verdict = 'INCONCLUSIVE';
      blocker = BLOCKER.NEVER_RUN;
      detail = 'Dependency available; gate has not been executed yet.';
    } else {
      verdict = evidence.verdict;
      blocker = verdict === 'PASS' ? BLOCKER.NONE : BLOCKER.EVIDENCE_UNUSABLE;
      detail = evidence.findings?.[0] ?? '';
    }

    rows.push({
      caseId: c.id,
      title: c.title,
      adrs: c.adrs,
      phase: c.phase,
      verdict: field(verdict, evidence ? PROVENANCE.DERIVED : PROVENANCE.OBSERVED, evidence ? 'recorded-evidence' : 'dependency-probe'),
      blocker,
      detail,
      dependency: field(wiring?.dependencyLabel ?? null, PROVENANCE.DECLARED, WIRING_SOURCE),
      dependencyAvailable: field(available, PROVENANCE.OBSERVED, 'live probe'),
      established,
      lastRunAt: field(evidence?.ranAt ?? null, PROVENANCE.DERIVED, 'recorded-evidence'),
      evidenceKind: evidence?.evidenceKind ?? null,
      confidence: evidence?.confidence ?? null,
    });
  }
  return rows;
}

export function renderStatusTable(rows) {
  const lines = ['| Gate | Verdict | Blocked on | Established | Last run |', '|---|---|---|---|---|'];
  for (const r of rows) {
    const gate = r.caseId.replace(/^gate-([a-z])-.*/, (_, l) => l.toUpperCase());
    lines.push(
      `| ${gate} | ${r.verdict.value} | ${r.blocker === BLOCKER.NONE ? '—' : r.detail} | ` +
        `${String(r.established.length)} | ${r.lastRunAt.value ?? 'never'} |`,
    );
  }
  return lines.join('\n');
}

/** Provenance audit — how much of the output is authored rather than evidenced. */
export function provenanceSummary(rows) {
  const counts = { observed: 0, derived: 0, declared: 0 };
  for (const r of rows) {
    for (const f of [r.verdict, r.dependency, r.dependencyAvailable, r.lastRunAt, ...r.established]) {
      if (f?.provenance) counts[f.provenance]++;
    }
  }
  return counts;
}
