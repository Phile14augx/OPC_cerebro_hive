import { describe, it, expect } from 'vitest';
import { buildReceipt, verifyReceipt, verifyReceiptChain, GENESIS_RECEIPT_DIGEST, PublicationReceiptPreimage } from '../../src/publication/receipt.js';
import { sha256Canonical } from '../../src/canonical/json.js';
import type { PublicationReceipt } from '../../src/types.js';

describe('Positive: Publication Receipt Chain', () => {
  const createBasePreimage = (epoch: number, prevDigest: string): PublicationReceiptPreimage => ({
    schema_version: '1.0.0',
    control_plane_version: 'W3.05',
    previous_epoch: epoch - 1,
    previous_live_sha256: 'a'.repeat(64),
    proposed_epoch: epoch,
    proposal_sha256: 'b'.repeat(64),
    published_epoch: epoch,
    resulting_live_sha256: 'c'.repeat(64),
    publisher_id: 'AGENT_X',
    publication_fencing_token: epoch * 10,
    validation_manifest_digest: 'd'.repeat(64),
    independent_verifier_verdict_digest: 'e'.repeat(64),
    publication_result: 'SUCCESS',
    post_publication_verification_result: 'SUCCESS',
    previous_receipt_digest: prevDigest
  });

  it('Case V-01: Genesis Receipt Validation (No Predecessor)', () => {
    const preimage = createBasePreimage(41, GENESIS_RECEIPT_DIGEST);
    const genesisReceipt = buildReceipt(preimage);

    const verification = verifyReceipt(genesisReceipt);
    expect(verification.valid).toBe(true);
    expect(verification.findings).toHaveLength(0);

    const chainResult = verifyReceiptChain([genesisReceipt]);
    expect(chainResult.valid).toBe(true);
    expect(chainResult.tipEpoch).toBe(41);
    
    // Check manual canonical
    const manualDigest = sha256Canonical(preimage);
    expect(genesisReceipt.receipt_digest).toBe(manualDigest);
  });

  it('Case V-02: Valid Continuation Receipt (Correct Predecessor Hash)', () => {
    const genesisPreimage = createBasePreimage(41, GENESIS_RECEIPT_DIGEST);
    const genesisReceipt = buildReceipt(genesisPreimage);

    const continuationPreimage = createBasePreimage(42, genesisReceipt.receipt_digest);
    continuationPreimage.previous_live_sha256 = genesisReceipt.resulting_live_sha256;
    const continuationReceipt = buildReceipt(continuationPreimage);

    const verification = verifyReceipt(continuationReceipt);
    expect(verification.valid).toBe(true);

    const chainResult = verifyReceiptChain([genesisReceipt, continuationReceipt]);
    expect(chainResult.valid).toBe(true);
    expect(chainResult.tipEpoch).toBe(42);
    expect(chainResult.tipReceiptDigest).toBe(continuationReceipt.receipt_digest);
    expect(chainResult.chainLength).toBe(2);
  });

  it('Case V-03: Multi-Receipt Chain Integrity Check', () => {
    const receipts: PublicationReceipt[] = [];
    let prevDigest = GENESIS_RECEIPT_DIGEST;

    for (let epoch = 41; epoch <= 50; epoch++) {
      const preimage = createBasePreimage(epoch, prevDigest);
      const receipt = buildReceipt(preimage);
      receipts.push(receipt);
      prevDigest = receipt.receipt_digest;
    }

    const chainResult = verifyReceiptChain(receipts);
    expect(chainResult.valid).toBe(true);
    expect(chainResult.chainLength).toBe(10);
    expect(chainResult.tipEpoch).toBe(50);
  });
});
