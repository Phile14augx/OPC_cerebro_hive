/**
 * Frozen signature contract — ADR 0011 (D9).
 *
 * The signature stopped being an implementation detail the moment the spine
 * proved cross-run identity works. It is now the system's stable identity
 * primitive, and every layer above it — repository, diff engine, waivers,
 * agent retrieval — treats it as immutable.
 *
 * This file freezes v1. The key sets below are the contract, not a convenience
 * constant: `signature-contract.test` asserts they are exactly this, so a parser
 * improvement cannot silently widen a key and orphan every historical finding.
 *
 * Changing any FROZEN set requires:
 *   1. a new version entry (v1 stays, untouched, forever)
 *   2. a migration plan with an equivalence map
 *   3. an ADR amendment
 *
 * There is no fourth option. A silent change here invalidates every trend,
 * waiver, and comparison ever recorded.
 */

/** Fields that constitute identity, per finding type. Order-independent; sorted at encode time. */
export const SIGNATURE_KEY_FIELDS_V1: Readonly<Record<string, readonly string[]>> = Object.freeze({
  timing_path: Object.freeze([
    'startpoint',
    'endpoint',
    'path_type',
    'corner',
    'mode',
    'path_group',
    'clock_launch',
    'clock_capture',
  ]),
  drc_violation: Object.freeze([
    'rule_id',
    'layer',
    'cell_context',
    'location_bucket',
    'net_context',
  ]),
  lint_finding: Object.freeze(['rule_id', 'design_unit', 'construct_path']),
  test_failure: Object.freeze(['test_name', 'seed_class', 'failure_class', 'assertion_id', 'message_template']),
  coverage_hole: Object.freeze(['coverage_type', 'scope', 'bin_name']),
});

/**
 * Categories that may never enter a key, restated here as contract rather than
 * only as a runtime check. Two failure modes, asymmetric in consequence:
 *
 *   over-inclusive  → every run reports 100% new findings; feature is useless
 *   under-inclusive → distinct findings collapse; a waiver hides a real violation
 *
 * The second reaches silicon. That is why the excluded list is exhaustive and
 * the included list is explicit.
 */
export const SIGNATURE_EXCLUDED_CATEGORIES_V1 = Object.freeze({
  measured: Object.freeze(['slack', 'arrival', 'required', 'delta', 'violation_amount', 'transition', 'power']),
  runMetadata: Object.freeze(['run_id', 'job_id', 'timestamp', 'tool_version', 'host', 'duration']),
  positional: Object.freeze(['line', 'rank', 'index', 'byte_offset']),
  presentation: Object.freeze(['formatted', 'display', 'units', 'precision']),
  environmental: Object.freeze(['user', 'cwd', 'seed']),
});

export const CURRENT_SIGNATURE_VERSION = Object.freeze({
  timing_path: 1,
  drc_violation: 1,
  lint_finding: 1,
  test_failure: 1,
  coverage_hole: 1,
} as const);

/**
 * Digest algorithm participates in identity.
 *
 * The current build uses SHA-256 truncated to 128 bits because Node has no
 * built-in BLAKE3 (ADR 0011 specifies BLAKE3). Swapping the algorithm changes
 * every signature, so it is a version bump like any other identity change —
 * recording it here makes that unavoidable rather than a quiet substitution.
 */
export const SIGNATURE_DIGEST_V1 = 'sha256t128' as const;

export class SignatureContractViolation extends Error {
  constructor(findingType: string, detail: string) {
    super(`Signature contract violation for ${findingType}: ${detail} (ADR 0011).`);
    this.name = 'SignatureContractViolation';
  }
}

/**
 * Assert a parser-supplied key matches the frozen contract exactly.
 *
 * Both directions matter. A missing field collapses distinct findings; an extra
 * field splits one finding into many. Checking only one direction catches only
 * one of the two failure modes.
 */
export function assertKeyMatchesContract(findingType: string, fields: readonly string[]): void {
  const expected = SIGNATURE_KEY_FIELDS_V1[findingType];
  if (!expected) throw new SignatureContractViolation(findingType, 'unknown finding type');

  const got = [...fields].sort();
  const want = [...expected].sort();
  const missing = want.filter((f) => !got.includes(f));
  const extra = got.filter((f) => !want.includes(f));

  if (missing.length || extra.length) {
    throw new SignatureContractViolation(
      findingType,
      `key mismatch — missing [${missing.join(', ')}], unexpected [${extra.join(', ')}]`,
    );
  }
}
