/**
 * Signature computation — ADR 0011 (D9).
 *
 * The single permitted implementation. Parsers supply canonicalised semantic
 * keys; only this module turns them into identity.
 *
 * HASH ALGORITHM DEVIATION — tracked, not hidden:
 * ADR 0011 specifies BLAKE3-128. Node has no built-in BLAKE3 and this build
 * adds no runtime dependencies, so the default digest is SHA-256 truncated to
 * 128 bits. The signature string records which algorithm produced it, so a
 * later switch to BLAKE3 is detectable rather than silent — and because the
 * algorithm participates in the version, switching requires a version bump and
 * an equivalence map exactly like any other identity change.
 */

import { createHash } from 'node:crypto';

import type { FindingSignature, SemanticKey } from '@cerebro/eda-domain';
import { EXCLUDED_KEY_FIELDS, ExcludedFieldError } from '@cerebro/eda-domain';

import { canonicalForm } from './signature.js';
import type { CollisionReport, SignatureComputer, SignatureRegistry } from './signature.js';

/** Pluggable so the BLAKE3 swap is a constructor argument, not a rewrite. */
export interface Digest {
  readonly name: string;
  hash128(input: string): string;
}

export const SHA256_TRUNCATED: Digest = {
  name: 'sha256t',
  hash128: (input) => createHash('sha256').update(input, 'utf8').digest('hex').slice(0, 32),
};

export class CanonicalSignatureComputer implements SignatureComputer {
  // Explicit field rather than a constructor parameter property: parameter
  // properties are TypeScript-only syntax that Node's type stripper cannot
  // erase, and keeping these files runnable without a build step is what lets
  // the invariant suite execute directly in CI.
  private readonly digest: Digest;

  constructor(digest: Digest = SHA256_TRUNCATED) {
    this.digest = digest;
  }

  compute(findingType: string, version: number, key: SemanticKey): FindingSignature {
    if (key.length === 0) {
      // An empty key would collapse every finding of this type into one
      // signature — silently, and only visibly once waivers started suppressing
      // unrelated violations.
      throw new Error(`Empty semantic key for ${findingType}.v${String(version)} (ADR 0011).`);
    }
    for (const [f] of key) {
      if (EXCLUDED_KEY_FIELDS.has(f.toLowerCase())) throw new ExcludedFieldError(f);
    }
    const body = canonicalForm(key);
    return `sig:${findingType}.v${String(version)}:${this.digest.hash128(body)}` as FindingSignature;
  }
}

/**
 * In-memory registry with collision detection.
 *
 * Stores the full semantic key alongside the signature so a collision is
 * *detectable*. At 128 bits over ~10^7 project-scoped findings, accidental
 * collision is negligible; this exists to catch the far likelier case of a
 * parser emitting identical keys for genuinely different findings.
 */
export class InMemorySignatureRegistry implements SignatureRegistry {
  readonly #seen = new Map<string, SemanticKey>();

  async checkAndRecord(sig: FindingSignature, key: SemanticKey): Promise<CollisionReport | null> {
    const existing = this.#seen.get(sig);
    if (!existing) {
      this.#seen.set(sig, key);
      return null;
    }
    if (canonicalForm(existing) === canonicalForm(key)) return null;
    return { signature: sig, existingKey: existing, incomingKey: key };
  }

  get size(): number {
    return this.#seen.size;
  }
}
