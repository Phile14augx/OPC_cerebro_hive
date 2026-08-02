/**
 * Evidence and confidence model.
 *
 * Generalised from the model-vs-measurement distinction that Gate B forced.
 * The history-growth model produced a real, actionable finding — but it is
 * arithmetic over documented defaults, not an observation of our cluster. Left
 * unlabelled, it would be quoted six months from now as though someone had
 * measured it.
 *
 * So every verdict carries the kind of evidence behind it and a confidence
 * derived from that kind. A PASS backed by static analysis and a PASS backed by
 * production telemetry are not the same claim and must not render identically.
 */

/**
 * Ordered weakest → strongest. The ordering is meaningful: `atLeast()` compares
 * by index, and a gate can require a minimum confidence before its verdict counts.
 */
export const EVIDENCE = Object.freeze({
  /** Type checks, lint rules, dependency-cruiser. Proves shape, not behaviour. */
  STATIC_ANALYSIS: 'static-analysis',
  /** Arithmetic over documented or assumed parameters. Gate B's history model. */
  ANALYTICAL_MODEL: 'analytical-model',
  /** Logic exercised in isolation with fakes. Gate B's semantics tests. */
  UNIT_TEST: 'unit-test',
  /** Measured on a developer machine. Indicative; environment not controlled. */
  LOCAL_BENCHMARK: 'local-benchmark',
  /** Real dependencies in a controlled environment. Gate C's target. */
  INTEGRATION_TEST: 'integration-test',
  /** Full-scale on representative infrastructure. Gate A and B's target. */
  SYSTEM_MEASUREMENT: 'system-measurement',
  /** Observed in production over time. The only evidence that survives contact with reality. */
  PRODUCTION_TELEMETRY: 'production-telemetry',
});

const ORDER = [
  EVIDENCE.STATIC_ANALYSIS,
  EVIDENCE.ANALYTICAL_MODEL,
  EVIDENCE.UNIT_TEST,
  EVIDENCE.LOCAL_BENCHMARK,
  EVIDENCE.INTEGRATION_TEST,
  EVIDENCE.SYSTEM_MEASUREMENT,
  EVIDENCE.PRODUCTION_TELEMETRY,
];

export const CONFIDENCE = Object.freeze({
  [EVIDENCE.STATIC_ANALYSIS]: 'low',
  [EVIDENCE.ANALYTICAL_MODEL]: 'medium',
  [EVIDENCE.UNIT_TEST]: 'medium',
  [EVIDENCE.LOCAL_BENCHMARK]: 'medium',
  [EVIDENCE.INTEGRATION_TEST]: 'high',
  [EVIDENCE.SYSTEM_MEASUREMENT]: 'high',
  [EVIDENCE.PRODUCTION_TELEMETRY]: 'highest',
});

export function atLeast(actual, required) {
  return ORDER.indexOf(actual) >= ORDER.indexOf(required);
}

/**
 * Guard against a strong verdict resting on weak evidence.
 *
 * A gate declares the minimum evidence its PASS requires. Passing on weaker
 * evidence downgrades to INCONCLUSIVE rather than being quietly accepted — which
 * is the same discipline that makes Gate A refuse to confirm ADR 0013 without
 * gVisor, applied to evidence quality instead of missing runtimes.
 *
 * Note the asymmetry: FAIL is not downgraded. Weak evidence is sufficient to
 * raise a concern, only insufficient to clear one. A static check that catches a
 * real cross-tenant leak is a genuine finding regardless of its tier.
 */
export function qualify(verdict, evidenceKind, minimumForPass) {
  const confidence = CONFIDENCE[evidenceKind];
  if (verdict !== 'PASS') return { verdict, evidenceKind, confidence, downgraded: false };
  if (minimumForPass && !atLeast(evidenceKind, minimumForPass)) {
    return {
      verdict: 'INCONCLUSIVE',
      evidenceKind,
      confidence,
      downgraded: true,
      reason:
        `PASS requires at least ${minimumForPass} evidence; this run produced ` +
        `${evidenceKind}. The result is consistent with the decision but does not establish it.`,
    };
  }
  return { verdict, evidenceKind, confidence, downgraded: false };
}

/**
 * Structured record of a single adversarial attempt.
 *
 * Shaped for audit: a reader who was not present should be able to tell exactly
 * what was attempted, what was expected, what happened, and which decision the
 * result bears on.
 */
export function isolationEvidence({ gate, target, attack, expected, observed, verdict, adr, evidenceKind, detail }) {
  return {
    gate,
    target,
    attack,
    expected,
    observed,
    verdict,
    adr,
    evidenceKind,
    confidence: CONFIDENCE[evidenceKind],
    detail: detail ?? null,
    at: new Date().toISOString(),
  };
}

export function renderEvidenceTable(records) {
  const lines = [
    '| Target | Attack | Expected | Observed | Verdict | Confidence |',
    '|---|---|---|---|---|---|',
  ];
  for (const r of records) {
    lines.push(
      `| ${r.target} | ${r.attack} | ${r.expected} | ${r.observed} | ` +
        `${r.verdict === 'PASS' ? 'blocked' : `**${r.verdict}**`} | ${r.confidence} |`,
    );
  }
  return lines.join('\n');
}
