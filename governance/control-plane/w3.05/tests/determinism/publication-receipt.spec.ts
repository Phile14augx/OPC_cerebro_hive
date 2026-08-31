import { describe, it, expect } from 'vitest';
import { buildReceipt, GENESIS_RECEIPT_DIGEST, PublicationReceiptPreimage } from '../../src/publication/receipt.js';
import { canonicalJson, sha256Canonical } from '../../src/canonical/json.js';

describe('Determinism: Publication Receipt', () => {
  const createBasePreimage = (): PublicationReceiptPreimage => ({
    schema_version: '1.0.0',
    control_plane_version: 'W3.05',
    previous_epoch: 40,
    previous_live_sha256: 'a'.repeat(64),
    proposed_epoch: 41,
    proposal_sha256: 'b'.repeat(64),
    published_epoch: 41,
    resulting_live_sha256: 'c'.repeat(64),
    publisher_id: 'AGENT_X',
    publication_fencing_token: 410,
    validation_manifest_digest: 'd'.repeat(64),
    independent_verifier_verdict_digest: 'e'.repeat(64),
    publication_result: 'SUCCESS',
    post_publication_verification_result: 'SUCCESS',
    previous_receipt_digest: GENESIS_RECEIPT_DIGEST
  });

  it('Key Insertion Order Independence', () => {
    const preimage1 = createBasePreimage();
    const preimage2: Record<string, unknown> = {};
    
    // Insert keys in reverse order
    const keys = Object.keys(preimage1).reverse() as (keyof PublicationReceiptPreimage)[];
    for (const k of keys) {
      preimage2[k] = preimage1[k];
    }

    const receipt1 = buildReceipt(preimage1);
    const receipt2 = buildReceipt(preimage2 as unknown as PublicationReceiptPreimage);

    expect(receipt1.receipt_digest).toBe(receipt2.receipt_digest);
    expect(canonicalJson(preimage1)).toBe(canonicalJson(preimage2));
  });

  it('Line Ending and Encoding Stability', () => {
    const preimage = createBasePreimage();
    const receipt = buildReceipt(preimage);

    // The digest should exactly match a manually computed SHA-256 over UTF-8 LF JSON
    // Note: This relies on the canonicalJson implementation behaving deterministically
    const canonical = canonicalJson(preimage);
    const manualSha = sha256Canonical(preimage);
    
    expect(receipt.receipt_digest).toBe(manualSha);
    expect(canonical).not.toMatch(/\r\n/);
  });
});
