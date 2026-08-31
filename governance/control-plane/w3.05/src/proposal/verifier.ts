/* eslint-disable @typescript-eslint/no-explicit-any */
import { sha256Canonical } from '../canonical/json.js';
import { SchemaRegistry } from '../schemas/registry.js';

export class ProposalVerificationError extends Error {
    constructor(public code: string, message?: string) {
        super(message || code);
        this.name = 'ProposalVerificationError';
    }
}

export interface VerificationInput {
    proposal: any;
    verifier_id: string;
    verifier_lease: any;
    fresh_capture: any;
    independent_evaluation: any;
}

export function verifyProposal(input: VerificationInput): any {
    const { proposal, verifier_id, verifier_lease, fresh_capture, independent_evaluation } = input;

    // Validate schema
    const registry = new SchemaRegistry();
    const validation = registry.validate('proposal', proposal);
    if (!validation.valid) {
        throw new ProposalVerificationError('CONTROL_SCHEMA_INVALID');
    }

    // Independent recompute
    const preimage = { ...proposal };
    delete preimage.proposal_sha256;
    const expectedDigest = sha256Canonical(preimage);
    if (proposal.proposal_sha256 !== expectedDigest) {
        throw new ProposalVerificationError('NONDETERMINISTIC_OUTPUT');
    }

    // 1. Identity Separation
    if (!verifier_id || verifier_id === '' || verifier_id === 'unknown') {
        throw new ProposalVerificationError('OWNER_MISSING');
    }
    if (proposal.builder_id === verifier_id) {
        throw new ProposalVerificationError('BUILDER_VERIFIER_COLLISION');
    }
    if (!verifier_lease || verifier_lease.active !== true || verifier_lease.type !== 'PRODUCT_VERIFIER') {
        if (verifier_lease && verifier_lease.type === 'PRODUCT_BUILDER') {
            throw new ProposalVerificationError('MULTIPLE_WRITERS');
        }
        throw new ProposalVerificationError('LEASE_MISSING');
    }

    // 2. Fresh-State Mismatch Tests
    if (fresh_capture.live_epoch !== proposal.supersedes_epoch) {
        throw new ProposalVerificationError('CONTROL_CHANGED');
    }
    if (fresh_capture.live_control_sha256 !== proposal.previous_control_sha256) {
        throw new ProposalVerificationError('EPOCH_SUPERSESSION_MISMATCH');
    }
    if (fresh_capture.branch_head && proposal.branch_head && fresh_capture.branch_head !== proposal.branch_head) {
        throw new ProposalVerificationError('HEAD_CHANGED');
    }
    if (fresh_capture.worktrees) {
        for (const wt of fresh_capture.worktrees) {
            if (wt.untracked && Object.values(wt.untracked).includes('UNRECONCILED_ENTRY')) {
                throw new ProposalVerificationError('DIRTY_UNRECONCILED');
            }
            if (wt.dirty_fingerprint && proposal.dirty_fingerprint && wt.dirty_fingerprint !== proposal.dirty_fingerprint) {
                throw new ProposalVerificationError('EXTERNAL_MUTATION_DETECTED');
            }
            if (wt.lock_state && (wt.lock_state.active || !wt.lock_state.verifiable)) {
                throw new ProposalVerificationError('GIT_LOCK_ACTIVE');
            }
        }
    }
    if (fresh_capture.handoff_state) {
        if (fresh_capture.handoff_state.status === 'PENDING') throw new ProposalVerificationError('HANDOFF_PENDING');
        if (fresh_capture.handoff_state.status === 'EXPIRED') throw new ProposalVerificationError('HANDOFF_EXPIRED');
    }
    if (fresh_capture.scopes && proposal.scopes) {
        if (fresh_capture.scopes.join(',') !== proposal.scopes.join(',')) {
            throw new ProposalVerificationError('SCOPE_OVERLAP');
        }
    }
    if (fresh_capture.shared_infra && proposal.shared_infra) {
        if (fresh_capture.shared_infra.owner !== proposal.shared_infra.owner) {
            throw new ProposalVerificationError('SHARED_INFRA_UNOWNED');
        }
    }
    if (fresh_capture.ci_attestation) {
        if (fresh_capture.ci_attestation.expired) throw new ProposalVerificationError('REMOTE_ATTESTATION_STALE');
        if (fresh_capture.ci_attestation.tampered) throw new ProposalVerificationError('MACHINE_GREEN_FALSE');
        if (fresh_capture.ci_attestation.policy_valid === false) throw new ProposalVerificationError('REQUIRED_CHECK_POLICY_MISSING');
    }

    // 3. Re-capture and Canonical Digest Tests
    if (independent_evaluation) {
        if (independent_evaluation.adapter_type === 'MOCKED' || independent_evaluation.adapter_type === 'BUILDER_CACHE') {
            throw new ProposalVerificationError('NONDETERMINISTIC_OUTPUT');
        }
        if (independent_evaluation.adapter_write_capability === true) {
            throw new ProposalVerificationError('NONDETERMINISTIC_OUTPUT');
        }
        if (independent_evaluation.canonical_digest !== proposal.canonical_digest) {
            throw new ProposalVerificationError('NONDETERMINISTIC_OUTPUT');
        }
        if (independent_evaluation.missing_invariants && independent_evaluation.missing_invariants.length > 0) {
            throw new ProposalVerificationError('CONTROL_SCHEMA_INVALID');
        }
        if (independent_evaluation.fencing_token_stale) {
            throw new ProposalVerificationError('FENCING_TOKEN_STALE');
        }
    }

    return {
        verdict: 'EPOCH_' + proposal.proposed_epoch + '_PROPOSAL_VALID',
        proposed_epoch: proposal.proposed_epoch,
        verifier_id: verifier_id
    };
}


