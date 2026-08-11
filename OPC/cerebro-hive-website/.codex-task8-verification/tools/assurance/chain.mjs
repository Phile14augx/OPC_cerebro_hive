/**
 * tools/assurance/chain.mjs
 *
 * SHA-256 hash chain for immutable evidence linking.
 *
 * Every evidence entry contains:
 *   previousHash  — SHA-256 of the prior entry for this control (null if first)
 *   currentHash   — SHA-256 of this entry's canonical fields
 *
 * This forms a Git-commit-style chain. Tampering with any historical entry
 * breaks the chain at that point and every subsequent entry. An auditor can
 * verify the full chain independently without access to the original system.
 *
 * Canonical fields for hashing (deterministic subset — excludes currentHash
 * and signature, which are derived):
 *   schemaVersion, controlId, status, failureClass, runnerVersion,
 *   descriptorHash, startedAt, completedAt, durationMs, environment,
 *   gitSha, branch, runId, runNumber, breakTestProven, artifacts,
 *   evidenceKind, previousHash, details
 *
 * Ordering is fixed. Adding a field to a future schema version changes the
 * hash for all entries produced under that version — which is correct, because
 * the new schema version is a different contract.
 */

import { createHash, createHmac } from 'node:crypto';

const CANONICAL_FIELDS = [
  'schemaVersion',
  'controlId',
  'status',
  'failureClass',
  'runnerVersion',
  'descriptorHash',
  'startedAt',
  'completedAt',
  'durationMs',
  'environment',
  'gitSha',
  'branch',
  'runId',
  'runNumber',
  'breakTestProven',
  'artifacts',
  'evidenceKind',
  'previousHash',
  'details',
];

/**
 * Compute the canonical JSON string for hashing.
 * Field order is deterministic regardless of how the object was constructed.
 *
 * @param {object} entry — evidence entry (may include currentHash/signature; they are ignored)
 * @returns {string}
 */
export function canonicalize(entry) {
  const obj = {};
  for (const field of CANONICAL_FIELDS) {
    obj[field] = entry[field] ?? null;
  }
  return JSON.stringify(obj);
}

/**
 * Compute SHA-256 of an evidence entry's canonical fields.
 *
 * @param {object} entry
 * @returns {string} 64-character lowercase hex digest
 */
export function computeHash(entry) {
  return createHash('sha256').update(canonicalize(entry)).digest('hex');
}

/**
 * Sign an evidence entry with an HMAC-SHA256 using a shared key.
 * When ASSURANCE_SIGNING_KEY is not set, returns null — signing is optional.
 * When present, verifying the signature proves the entry was written by a
 * runner that held the key (not a prerequisite for the hash chain itself).
 *
 * @param {object} entry — must already have currentHash set
 * @param {string} [key] — signing key, defaults to process.env.ASSURANCE_SIGNING_KEY
 * @returns {string|null}
 */
export function sign(entry, key = process.env.ASSURANCE_SIGNING_KEY) {
  if (!key) return null;
  return createHmac('sha256', key).update(entry.currentHash).digest('hex');
}

/**
 * Verify that an entry's currentHash matches its canonical fields.
 *
 * @param {object} entry
 * @returns {{ valid: boolean, expected: string, found: string }}
 */
export function verifyHash(entry) {
  const expected = computeHash(entry);
  return {
    valid: expected === entry.currentHash,
    expected,
    found: entry.currentHash ?? null,
  };
}

/**
 * Verify the full hash chain for a sequence of evidence entries for one control.
 *
 * @param {object[]} entries — ordered oldest-first
 * @returns {{ valid: boolean, brokenAt: number|null, violations: string[] }}
 */
export function verifyChain(entries) {
  const violations = [];
  let previousHash = null;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // 1. Verify this entry's own hash
    const { valid, expected, found } = verifyHash(entry);
    if (!valid) {
      violations.push(
        `Entry ${i} (${entry.controlId} @ ${entry.timestamp}): ` +
        `currentHash mismatch — stored ${found}, computed ${expected}`
      );
      return { valid: false, brokenAt: i, violations };
    }

    // 2. Verify the previousHash pointer
    if (entry.previousHash !== previousHash) {
      violations.push(
        `Entry ${i} (${entry.controlId} @ ${entry.timestamp}): ` +
        `previousHash mismatch — stored ${entry.previousHash}, expected ${previousHash}`
      );
      return { valid: false, brokenAt: i, violations };
    }

    previousHash = entry.currentHash;
  }

  return { valid: true, brokenAt: null, violations };
}

/**
 * Stamp an evidence entry with its hash chain fields.
 * Mutates the entry in place and returns it.
 *
 * @param {object} entry    — evidence entry missing currentHash/signature
 * @param {string|null} previousHash — currentHash of the previous entry, or null
 * @returns {object}        — same entry with previousHash, currentHash, signature set
 */
export function stamp(entry, previousHash) {
  entry.previousHash = previousHash ?? null;
  entry.currentHash = computeHash(entry);
  entry.signature = sign(entry);
  return entry;
}
