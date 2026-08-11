/**
 * Validation harness kernel.
 *
 * Extracted from Gate A rather than designed up front. Gate A established a
 * pattern worth reusing:
 *
 *   pre-commit criteria → measure → analyse → verdict → gate CI → record evidence
 *
 * The kernel is deliberately small. It owns the *protocol* — how a validation
 * case declares its criteria, reports observations, and produces a verdict — and
 * nothing about any particular domain. Domain harnesses (sandbox, workflow,
 * isolation, RAG, …) are plugins that arrive when the phase needing them arrives.
 *
 * What this deliberately does NOT do: run benchmarks, know about Docker, know
 * about LLMs, or own a dashboard. Those belong to cases and to existing platform
 * products (see docs/architecture/CEREBROEDA-VALIDATION-HARNESS.md §2 on overlap
 * with evaluation-sdk, policy-core and the existing CI gates).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const VERDICT = Object.freeze({
  PASS: 'PASS',
  FAIL: 'FAIL',
  /** Ran, but cannot answer the question — e.g. the runtime under test was unavailable. */
  INCONCLUSIVE: 'INCONCLUSIVE',
  /** Not yet implementable; the phase it validates has not arrived. */
  PENDING: 'PENDING',
});

/**
 * A validation case.
 *
 * @typedef {object} ValidationCase
 * @property {string}   id            stable slug, e.g. 'gate-a-sandbox-overhead'
 * @property {string}   title
 * @property {string[]} adrs          ADRs this case validates — the link that stops
 *                                    cases and decisions drifting apart
 * @property {number}   phase         phase from which this case must pass
 * @property {string}   criteriaPath  JSON file of thresholds, fixed BEFORE measurement
 * @property {() => Promise<object>}  measure   produce raw observations only
 * @property {(obs: object, criteria: object) => Analysis} analyse
 */

/**
 * @typedef {object} Analysis
 * @property {string}   verdict
 * @property {string[]} findings
 * @property {object[]} rows
 * @property {string}   [markdown]
 */

/**
 * Criteria must be fixed before measurement, and the kernel enforces the part it
 * can: a criteria file records `fixedAt`, and its hash is stamped into every
 * result. If the thresholds move after results exist, the mismatch is visible in
 * the evidence record rather than discoverable only by someone re-reading git log.
 */
export function loadCriteria(path) {
  if (!existsSync(path)) throw new Error(`criteria file not found: ${path}`);
  const raw = readFileSync(path, 'utf8');
  const criteria = JSON.parse(raw);
  if (!criteria.fixedAt) {
    throw new Error(`${path} has no "fixedAt" — criteria must be dated to be credible.`);
  }
  return { criteria, raw };
}

/** Simple FNV-1a; only needs to detect change, not resist attack. */
export function fingerprint(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

const registry = new Map();

export function registerCase(c) {
  for (const field of ['id', 'title', 'adrs', 'phase', 'criteriaPath', 'measure', 'analyse']) {
    if (!(field in c)) throw new Error(`validation case is missing "${field}"`);
  }
  if (registry.has(c.id)) throw new Error(`duplicate validation case id: ${c.id}`);
  registry.set(c.id, c);
  return c;
}

export function listCases() {
  return [...registry.values()].sort((a, b) => a.phase - b.phase || a.id.localeCompare(b.id));
}

export function getCase(id) {
  return registry.get(id);
}

/**
 * Execute one case end to end.
 *
 * Measurement and analysis stay separate — the same discipline Gate A uses — so
 * that a measurement step can never be quietly tuned toward a desired verdict.
 */
export async function runCase(c, { outDir, currentPhase = 0 }) {
  const { criteria, raw } = loadCriteria(c.criteriaPath);

  if (c.phase > currentPhase) {
    return {
      id: c.id,
      verdict: VERDICT.PENDING,
      findings: [`Validates Phase ${String(c.phase)}; repository is at Phase ${String(currentPhase)}.`],
      adrs: c.adrs,
    };
  }

  const observations = await c.measure({ criteria });
  const analysis = c.analyse(observations, criteria);

  const record = {
    caseId: c.id,
    title: c.title,
    adrs: c.adrs,
    phase: c.phase,
    criteriaFingerprint: fingerprint(raw),
    criteriaFixedAt: criteria.fixedAt,
    ranAt: new Date().toISOString(),
    verdict: analysis.verdict,
    findings: analysis.findings,
    rows: analysis.rows ?? [],
  };

  if (outDir) {
    mkdirSync(outDir, { recursive: true });
    const base = join(outDir, `${c.id}-${record.ranAt.slice(0, 10)}`);
    writeFileSync(`${base}.json`, JSON.stringify({ record, observations }, null, 2));
    if (analysis.markdown) {
      mkdirSync(dirname(`${base}.md`), { recursive: true });
      writeFileSync(`${base}.md`, analysis.markdown);
    }
  }

  return record;
}

/**
 * A verdict is only actionable if failure has a defined consequence. Cases
 * declare which ADR they reopen, so a red result routes to a decision rather
 * than to a dashboard nobody owns.
 */
export function summarise(records) {
  const counts = { PASS: 0, FAIL: 0, INCONCLUSIVE: 0, PENDING: 0 };
  for (const r of records) counts[r.verdict] = (counts[r.verdict] ?? 0) + 1;
  const reopened = records.filter((r) => r.verdict === VERDICT.FAIL).flatMap((r) => r.adrs);
  return { counts, reopenedAdrs: [...new Set(reopened)] };
}
