/**
 * Generated gate status.
 *
 * Exists because the status table was transcribed by hand twice and drifted both
 * times — once conflating "no gVisor measurement exists" with "a measurement
 * exists but was too noisy", and once reporting infrastructure as provisioned
 * when it was only provisionable. Both are the same class of error the criteria
 * fingerprinting was introduced to prevent: a second source of truth.
 *
 * This derives status from the harness itself. It is deliberately cheap — it
 * probes dependency availability and reads recorded evidence, but never runs a
 * benchmark. A status command nobody runs because it takes ten minutes is a
 * status command that gets transcribed by hand again.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Why a gate is not green. The distinction that matters most:
 * EVIDENCE_ABSENT means no measurement was taken at all; EVIDENCE_UNUSABLE
 * means one was taken and could not be interpreted. Collapsing them
 * systematically understates how much is unknown.
 */
export const BLOCKER = Object.freeze({
  NONE: 'none',
  DEPENDENCY_MISSING: 'dependency-missing',
  EVIDENCE_ABSENT: 'evidence-absent',
  EVIDENCE_UNUSABLE: 'evidence-unusable',
  NEVER_RUN: 'never-run',
  PHASE_NOT_REACHED: 'phase-not-reached',
});

/**
 * What each gate has already established, independent of its blocked dependency.
 *
 * Added after the first status output read "no measurement collected" for all
 * three gates — technically true of the blocked portion, but it understates
 * Gate B (semantics enforced) and Gate C (probe suite validated). That is the
 * mirror image of the error this command exists to prevent: overstating
 * uncertainty is as inaccurate as overstating confidence.
 */
const ESTABLISHED = {
  'gate-a-sandbox-overhead': [],
  'gate-b-workflow-scale': [
    'Outcome-vs-infrastructure classification enforced (16 checks, unit-test confidence)',
    'History budget derived: ~4,000 activities/child cap (analytical-model confidence)',
  ],
  'gate-c-tenant-isolation': [
    'Probe suite validated: 16 probes, 7 negative controls (unit-test confidence)',
    'Evidence and confidence model enforced (18 checks)',
  ],
};

/** Cheap, side-effect-free availability probes. */
const DEPENDENCIES = {
  'gate-a-sandbox-overhead': {
    label: 'gVisor runtime (runsc)',
    check() {
      try {
        const out = execFileSync('docker', ['info', '--format', '{{json .Runtimes}}'], {
          encoding: 'utf8',
          timeout: 5_000,
          stdio: ['ignore', 'pipe', 'ignore'],
        });
        return out.includes('runsc');
      } catch {
        return false;
      }
    },
  },
  'gate-b-workflow-scale': {
    label: 'Temporal cluster (TEMPORAL_ADDRESS)',
    check: () => Boolean(process.env.TEMPORAL_ADDRESS),
  },
  'gate-c-tenant-isolation': {
    label: 'PostgreSQL (DATABASE_URL)',
    check: () => Boolean(process.env.DATABASE_URL),
  },
};

function lastEvidence(caseId, measurementsDir) {
  if (!existsSync(measurementsDir)) return null;
  const files = readdirSync(measurementsDir)
    .filter((f) => f.startsWith(caseId) && f.endsWith('.json'))
    .sort();
  const latest = files.at(-1);
  if (!latest) return null;
  try {
    const { record } = JSON.parse(readFileSync(join(measurementsDir, latest), 'utf8'));
    return record ?? null;
  } catch {
    return null;
  }
}

export function computeStatus(cases, { measurementsDir, currentPhase = 0 }) {
  return cases.map((c) => {
    const dep = DEPENDENCIES[c.id];
    const available = dep ? dep.check() : true;
    const evidence = lastEvidence(c.id, measurementsDir);

    let verdict;
    let blocker;
    let detail;

    if (c.phase > currentPhase) {
      verdict = 'PENDING';
      blocker = BLOCKER.PHASE_NOT_REACHED;
      detail = `Validates Phase ${String(c.phase)}; repository at Phase ${String(currentPhase)}.`;
    } else if (!available) {
      verdict = 'INCONCLUSIVE';
      // The precise claim: not "the measurement was bad" but "there is no
      // measurement, because the thing being measured is not present."
      blocker = BLOCKER.EVIDENCE_ABSENT;
      const est = ESTABLISHED[c.id] ?? [];
      detail =
        est.length > 0
          ? `${dep.label} not available — blocked portion unmeasured; ${String(est.length)} finding(s) already established.`
          : `${dep.label} not available — no measurement collected.`;
    } else if (!evidence) {
      verdict = 'INCONCLUSIVE';
      blocker = BLOCKER.NEVER_RUN;
      detail = 'Dependency available; gate has not been executed yet.';
    } else {
      verdict = evidence.verdict;
      blocker = verdict === 'PASS' ? BLOCKER.NONE : BLOCKER.EVIDENCE_UNUSABLE;
      detail = evidence.findings?.[0] ?? '';
    }

    return {
      caseId: c.id,
      title: c.title,
      adrs: c.adrs,
      phase: c.phase,
      verdict,
      blocker,
      detail,
      dependency: dep?.label ?? null,
      dependencyAvailable: available,
      established: ESTABLISHED[c.id] ?? [],
      lastRunAt: evidence?.ranAt ?? null,
      evidenceKind: evidence?.evidenceKind ?? null,
      confidence: evidence?.confidence ?? null,
    };
  });
}

export function renderStatusTable(rows) {
  const lines = [
    '| Gate | Verdict | Blocked on | Established | Last run |',
    '|---|---|---|---|---|',
  ];
  for (const r of rows) {
    const gate = r.caseId.replace(/^gate-([a-z])-.*/, (_, l) => l.toUpperCase());
    lines.push(
      `| ${gate} | ${r.verdict} | ${r.blocker === BLOCKER.NONE ? '—' : r.detail} | ${String(r.established.length)} | ${r.lastRunAt ?? 'never'} |`,
    );
  }
  return lines.join('\n');
}
