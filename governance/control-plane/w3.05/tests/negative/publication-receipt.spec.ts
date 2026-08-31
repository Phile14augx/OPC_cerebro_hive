import { describe, it, expect } from 'vitest';
import { buildReceipt, verifyReceipt, verifyReceiptChain, GENESIS_RECEIPT_DIGEST, PublicationReceiptPreimage } from '../../src/publication/receipt.js';
import type { PublicationReceipt } from '../../src/types.js';

describe('Negative: Publication Receipt Chain', () => {
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

  const getChain = (len: number) => {
    const receipts: PublicationReceipt[] = [];
    let prevDigest = GENESIS_RECEIPT_DIGEST;
    for (let epoch = 41; epoch < 41 + len; epoch++) {
      const receipt = buildReceipt(createBasePreimage(epoch, prevDigest));
      receipts.push(receipt);
      prevDigest = receipt.receipt_digest;
    }
    return receipts;
  };

  it('Case A-01: Deletion of Middle Receipt (Breaks Chain Linkage)', () => {
    const [R1, , R3] = getChain(3);
    const chainResult = verifyReceiptChain([R1, R3]);
    expect(chainResult.valid).toBe(false);
    expect(chainResult.findings).toContainEqual(expect.objectContaining({ code: 'RECEIPT_PREDECESSOR_MISMATCH' }));
  });

  it('Case A-02: Reordering Receipts (Temporal Permutation Attack)', () => {
    const [R1, R2, R3] = getChain(3);
    const chainResult = verifyReceiptChain([R1, R3, R2]);
    expect(chainResult.valid).toBe(false);
    expect(chainResult.findings).toContainEqual(expect.objectContaining({ code: 'RECEIPT_PREDECESSOR_MISMATCH' }));
  });

  it('Case A-03: Substitution (Replace Receipt Body, Keep Sequence Number)', () => {
    const [R1, R2, R3] = getChain(3);
    
    // Subcase A: Unrecomputed hash
    const tamperedR2A = { ...R2, publisher_id: 'HACKER' };
    expect(verifyReceipt(tamperedR2A).valid).toBe(false);
    expect(verifyReceipt(tamperedR2A).findings).toContainEqual(expect.objectContaining({ code: 'NONDETERMINISTIC_OUTPUT' }));

    // Subcase B: Recomputed hash
    const preimageR2B = { ...R2, publisher_id: 'HACKER' };
    // @ts-expect-error test logic
    delete preimageR2B.receipt_digest;
    const tamperedR2B = buildReceipt(preimageR2B as PublicationReceiptPreimage);
    
    // Self check passes
    expect(verifyReceipt(tamperedR2B).valid).toBe(true);
    
    // Downstream verification fails
    const chainResult = verifyReceiptChain([R1, tamperedR2B, R3]);
    expect(chainResult.valid).toBe(false);
    expect(chainResult.findings).toContainEqual(expect.objectContaining({ code: 'RECEIPT_PREDECESSOR_MISMATCH' }));
  });

  it('Case A-04: Duplicate Sequence Number (Epoch Forking)', () => {
    const [R1, R2] = getChain(2);
    const R2B = buildReceipt({ ...createBasePreimage(42, R1.receipt_digest), publisher_id: 'OTHER' });
    
    const chainResult = verifyReceiptChain([R1, R2, R2B]);
    expect(chainResult.valid).toBe(false);
    expect(chainResult.findings).toContainEqual(expect.objectContaining({ code: 'EPOCH_NOT_MONOTONIC' }));
  });

  it('Case A-05: Wrong Predecessor Hash (Forged Merkle Pointer)', () => {
    const [R1] = getChain(1);
    const R2Forge = buildReceipt({ ...createBasePreimage(42, 'f'.repeat(64)) });
    const chainResult = verifyReceiptChain([R1, R2Forge]);
    expect(chainResult.valid).toBe(false);
    expect(chainResult.findings).toContainEqual(expect.objectContaining({ code: 'RECEIPT_PREDECESSOR_MISMATCH' }));
  });

  it('Case A-06: Proposal Digest Mutation (Receipt References Wrong Proposal)', () => {
    const [R1] = getChain(1);
    const result = verifyReceipt(R1, { expectedProposalSha256: 'f'.repeat(64) });
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'CAS_CONFLICT' }));
  });

  it('Case A-07: Verifier Verdict Digest Mutation', () => {
    const [R1] = getChain(1);
    const result = verifyReceipt(R1, { expectedVerifierVerdictDigest: 'f'.repeat(64) });
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'BUILDER_VERIFIER_COLLISION' }));
  });

  it('Case A-08: Wrong Live Hash Binding', () => {
    const [R1] = getChain(1);
    const result = verifyReceipt(R1, { expectedLiveControlSha256: 'f'.repeat(64) });
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'CONTROL_CHANGED' }));
  });

  it('Case A-09: Stale Fencing Token', () => {
    const [R1] = getChain(1);
    const result = verifyReceipt(R1, { expectedFencingToken: R1.publication_fencing_token + 1 });
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'FENCING_TOKEN_STALE' }));
  });

  it('Case A-10: Missing Post-Publication Verification', () => {
    const [R1] = getChain(1);
    const preimage = { ...R1, post_publication_verification_result: 'FAILED' };
    // @ts-expect-error test logic
    delete preimage.receipt_digest;
    const failedReceipt = buildReceipt(preimage as PublicationReceiptPreimage);

    const result = verifyReceipt(failedReceipt);
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'CONTROL_CHANGED' }));
  });
});
