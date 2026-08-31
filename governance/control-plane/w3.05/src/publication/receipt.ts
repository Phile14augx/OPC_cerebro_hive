import { sha256Canonical } from '../canonical/json.js';
import { SchemaRegistry } from '../schemas/registry.js';
import type { Finding, ValidationResult, PublicationReceipt } from '../types.js';

export const GENESIS_RECEIPT_DIGEST = '0'.repeat(64);

export interface PublicationReceiptPreimage {
  schema_version: string;
  control_plane_version: string;
  previous_epoch: number;
  previous_live_sha256: string;
  proposed_epoch: number;
  proposal_sha256: string;
  published_epoch: number;
  resulting_live_sha256: string;
  publisher_id: string;
  publication_fencing_token: number;
  validation_manifest_digest: string;
  independent_verifier_verdict_digest: string;
  publication_result: string;
  post_publication_verification_result: string;
  previous_receipt_digest: string;
}

export interface ReceiptVerificationOptions {
  expectedPublisherId?: string;
  expectedFencingToken?: number;
  expectedLiveControlSha256?: string;
  expectedProposalSha256?: string;
  expectedVerifierVerdictDigest?: string;
}

export interface ReceiptChainVerificationResult {
  valid: boolean;
  tipEpoch: number;
  tipReceiptDigest: string;
  chainLength: number;
  findings: Finding[];
}

const registry = new SchemaRegistry();

export function buildReceipt(preimage: PublicationReceiptPreimage): PublicationReceipt {
  const receiptDigest = sha256Canonical(preimage);
  return { ...preimage, receipt_digest: receiptDigest };
}

export function verifyReceipt(
  receipt: unknown,
  options?: ReceiptVerificationOptions
): ValidationResult<PublicationReceipt> {
  const validation = registry.validate<PublicationReceipt>('publication-receipt', receipt);
  if (!validation.valid) {
    return { valid: false, findings: validation.findings };
  }

  const typedReceipt = validation.value!;
  const findings: Finding[] = [];

  const { receipt_digest, ...preimage } = typedReceipt;
  const expectedDigest = sha256Canonical(preimage);
  if (expectedDigest !== receipt_digest) {
    findings.push({
      code: 'NONDETERMINISTIC_OUTPUT',
      severity: 'FATAL',
      message: 'Receipt digest does not match canonical preimage',
      evidenceRefs: []
    });
  }

  if (typedReceipt.post_publication_verification_result !== 'SUCCESS') {
    findings.push({
      code: 'CONTROL_CHANGED',
      severity: 'FATAL',
      message: 'Post-publication verification failed or was omitted',
      evidenceRefs: []
    });
  }

  if (typedReceipt.proposed_epoch !== typedReceipt.published_epoch) {
    findings.push({
      code: 'EPOCH_NOT_MONOTONIC',
      severity: 'FATAL',
      message: 'Proposed epoch does not match published epoch',
      evidenceRefs: []
    });
  }

  if (typedReceipt.published_epoch !== typedReceipt.previous_epoch + 1) {
    findings.push({
      code: 'EPOCH_NOT_MONOTONIC',
      severity: 'FATAL',
      message: 'Published epoch is not monotonically increasing by 1',
      evidenceRefs: []
    });
  }

  if (options) {
    if (options.expectedProposalSha256 && options.expectedProposalSha256 !== typedReceipt.proposal_sha256) {
      findings.push({
        code: 'CAS_CONFLICT',
        severity: 'BLOCKING',
        message: 'Proposal digest mismatch',
        evidenceRefs: []
      });
    }
    if (options.expectedLiveControlSha256 && (options.expectedLiveControlSha256 !== typedReceipt.previous_live_sha256 && options.expectedLiveControlSha256 !== typedReceipt.resulting_live_sha256)) {
      findings.push({
        code: 'CONTROL_CHANGED',
        severity: 'FATAL',
        message: 'Live control hash mismatch',
        evidenceRefs: []
      });
    }
    if (options.expectedFencingToken !== undefined && options.expectedFencingToken > typedReceipt.publication_fencing_token) {
      findings.push({
        code: 'FENCING_TOKEN_STALE',
        severity: 'FATAL',
        message: 'Stale fencing token',
        evidenceRefs: []
      });
    }
    if (options.expectedVerifierVerdictDigest && options.expectedVerifierVerdictDigest !== typedReceipt.independent_verifier_verdict_digest) {
      findings.push({
        code: 'BUILDER_VERIFIER_COLLISION',
        severity: 'FATAL',
        message: 'Verifier verdict digest mismatch',
        evidenceRefs: []
      });
    }
  }

  return { 
    valid: findings.length === 0, 
    value: findings.length === 0 ? typedReceipt : undefined, 
    findings 
  };
}

export function verifyReceiptChain(
  receipts: PublicationReceipt[]
): ReceiptChainVerificationResult {
  const findings: Finding[] = [];
  
  if (!receipts || receipts.length === 0) {
    return { valid: false, tipEpoch: 0, tipReceiptDigest: '', chainLength: 0, findings: [{code: 'CONTROL_SCHEMA_INVALID', severity: 'FATAL', message: 'Empty chain', evidenceRefs: []}] };
  }

  let prevReceipt: PublicationReceipt | null = null;
  
  for (let i = 0; i < receipts.length; i++) {
    const r = receipts[i];
    const res = verifyReceipt(r);
    if (!res.valid) {
      findings.push(...res.findings);
    }
    
    if (i === 0) {
      if (r.previous_receipt_digest !== GENESIS_RECEIPT_DIGEST) {
        findings.push({
          code: 'RECEIPT_PREDECESSOR_MISMATCH',
          severity: 'FATAL',
          message: 'Genesis receipt must have sentinel predecessor',
          evidenceRefs: []
        });
      }
    } else {
      if (r.previous_receipt_digest !== prevReceipt!.receipt_digest) {
        findings.push({
          code: 'RECEIPT_PREDECESSOR_MISMATCH',
          severity: 'FATAL',
          message: 'Predecessor digest mismatch',
          evidenceRefs: []
        });
      }
      if (r.previous_epoch !== prevReceipt!.published_epoch) {
        findings.push({
          code: 'EPOCH_NOT_MONOTONIC',
          severity: 'FATAL',
          message: 'Epoch gap or mismatch between receipts',
          evidenceRefs: []
        });
      }
      if (r.published_epoch <= prevReceipt!.published_epoch) {
        findings.push({
          code: 'EPOCH_NOT_MONOTONIC',
          severity: 'BLOCKING',
          message: 'Epoch rollback or duplicate sequence',
          evidenceRefs: []
        });
      }
    }
    prevReceipt = r;
  }
  
  if (findings.length > 0) {
    return { valid: false, tipEpoch: 0, tipReceiptDigest: '', chainLength: 0, findings };
  }

  const tip = receipts[receipts.length - 1];
  return {
    valid: true,
    tipEpoch: tip.published_epoch,
    tipReceiptDigest: tip.receipt_digest,
    chainLength: receipts.length,
    findings: []
  };
}
