/**
 * Canonical finding signatures — ADR 0011 (D9).
 *
 * This module is the ONLY permitted implementation of signature hashing.
 * Parsers supply canonicalised semantic keys; they never compute hashes
 * (ADR 0014). A second implementation anywhere could invent incompatible
 * identity, which is the failure this centralisation prevents.
 */

import type { FindingSignature, SemanticKey } from '@cerebro/eda-domain';
import { EXCLUDED_KEY_FIELDS, ExcludedFieldError } from '@cerebro/eda-domain';

/**
 * Canonical encoding. Deliberately boring and fully specified, so two
 * independent implementations (ours, and a third-party parser's tests) agree
 * byte for byte.
 *
 * Sort by field name → `field=value` → join → NFC UTF-8.
 */
export function canonicalForm(key: SemanticKey): string {
  for (const [field] of key) {
    if (EXCLUDED_KEY_FIELDS.has(field.toLowerCase())) throw new ExcludedFieldError(field);
  }
  return [...key]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([f, v]) => `${f}=${v.normalize('NFC')}`)
    .join('');
}

export interface SignatureComputer {
  /**
   * @param findingType e.g. `timing_path`, `drc_violation`
   * @param version     bumped only with a migration plan and equivalence map
   */
  compute(findingType: string, version: number, key: SemanticKey): FindingSignature;
}

/**
 * Raised when two findings share a signature but carry different semantic keys.
 *
 * At 128 bits over ~10^7 findings scoped per project, accidental collision is
 * ~10^-24 — not a practical concern. This exists to catch the far likelier case:
 * a parser bug producing identical keys for genuinely different findings.
 * Without it, that bug is an invisible correctness failure.
 */
export interface CollisionReport {
  readonly signature: FindingSignature;
  readonly existingKey: SemanticKey;
  readonly incomingKey: SemanticKey;
}

export interface SignatureRegistry {
  checkAndRecord(sig: FindingSignature, key: SemanticKey): Promise<CollisionReport | null>;
}
