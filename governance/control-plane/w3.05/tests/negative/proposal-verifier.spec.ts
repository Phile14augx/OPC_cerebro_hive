import { describe, expect, it } from 'vitest';
import { sha256Canonical } from '../../src/canonical/json.js';
import { verifyProposal, ProposalVerificationError } from '../../src/proposal/verifier.js';

describe('Task 12: Negative Proposal Verifier', () => {
        const preimage = { schema_version: '1.0', control_plane_version: '1.0', type: 'NON_AUTHORITATIVE_PROPOSAL', proposed_epoch: 41, supersedes_epoch: 40, previous_control_sha256: '0000000000000000000000000000000000000000000000000000000000000000', candidate_control_sha256: '0000000000000000000000000000000000000000000000000000000000000000', builder_id: 'builder-01', verifier_ids: ['verifier-01'] };
    const validProposal = { ...preimage, proposal_sha256: sha256Canonical(preimage) };
    
    const baseCapture = {
        live_epoch: 40,
        live_control_sha256: '0000000000000000000000000000000000000000000000000000000000000000'
    };

    it('Fixture 1: Same Identity', () => {
        expect(() => {
            verifyProposal({
                proposal: validProposal,
                verifier_id: 'builder-01',
                verifier_lease: { active: true, type: 'PRODUCT_VERIFIER' },
                fresh_capture: baseCapture,
                independent_evaluation: {}
            });
        }).toThrowError(new ProposalVerificationError('BUILDER_VERIFIER_COLLISION'));
    });

    it('Fixture 2: No Verification Lease', () => {
        expect(() => {
            verifyProposal({
                proposal: validProposal,
                verifier_id: 'verifier-01',
                verifier_lease: { active: false, type: 'PRODUCT_VERIFIER' },
                fresh_capture: baseCapture,
                independent_evaluation: {}
            });
        }).toThrowError(new ProposalVerificationError('LEASE_MISSING'));
    });

    it('Fixture 3: Write-Lease Collision', () => {
        expect(() => {
            verifyProposal({
                proposal: validProposal,
                verifier_id: 'verifier-01',
                verifier_lease: { active: true, type: 'PRODUCT_BUILDER' },
                fresh_capture: baseCapture,
                independent_evaluation: {}
            });
        }).toThrowError(new ProposalVerificationError('MULTIPLE_WRITERS'));
    });

    it('Fixture 4: Invalid Identity Format', () => {
        expect(() => {
            verifyProposal({
                proposal: validProposal,
                verifier_id: '',
                verifier_lease: { active: true, type: 'PRODUCT_VERIFIER' },
                fresh_capture: baseCapture,
                independent_evaluation: {}
            });
        }).toThrowError(new ProposalVerificationError('OWNER_MISSING'));
    });

    it('Fixture 5: Stale Epoch / Hash', () => {
        expect(() => {
            verifyProposal({
                proposal: validProposal,
                verifier_id: 'verifier-01',
                verifier_lease: { active: true, type: 'PRODUCT_VERIFIER' },
                fresh_capture: { ...baseCapture, live_epoch: 41 },
                independent_evaluation: {}
            });
        }).toThrowError(new ProposalVerificationError('CONTROL_CHANGED'));
        
        expect(() => {
            verifyProposal({
                proposal: validProposal,
                verifier_id: 'verifier-01',
                verifier_lease: { active: true, type: 'PRODUCT_VERIFIER' },
                fresh_capture: { ...baseCapture, live_control_sha256: 'hash99' },
                independent_evaluation: {}
            });
        }).toThrowError(new ProposalVerificationError('EPOCH_SUPERSESSION_MISMATCH'));
    });

    it('Fixture 6: Branch / HEAD Movement', () => {
        expect(() => {
            verifyProposal({
                proposal: { ...validProposal, branch_head: 'head1', proposal_sha256: sha256Canonical({ ...preimage, branch_head: 'head1' }) },
                verifier_id: 'verifier-01',
                verifier_lease: { active: true, type: 'PRODUCT_VERIFIER' },
                fresh_capture: { ...baseCapture, branch_head: 'head2' },
                independent_evaluation: {}
            });
        }).toThrowError(new ProposalVerificationError('HEAD_CHANGED'));
    });

    it('Fixture 7: Dirty Fingerprint Mismatch', () => {
        expect(() => {
            verifyProposal({
                proposal: { ...validProposal, dirty_fingerprint: 'fp1', proposal_sha256: sha256Canonical({ ...preimage, dirty_fingerprint: 'fp1' }) },
                verifier_id: 'verifier-01',
                verifier_lease: { active: true, type: 'PRODUCT_VERIFIER' },
                fresh_capture: { ...baseCapture, worktrees: [{ dirty_fingerprint: 'fp2' }] },
                independent_evaluation: {}
            });
        }).toThrowError(new ProposalVerificationError('EXTERNAL_MUTATION_DETECTED'));
    });

    it('Fixture 8: Git Lock Emergence', () => {
        expect(() => {
            verifyProposal({
                proposal: validProposal,
                verifier_id: 'verifier-01',
                verifier_lease: { active: true, type: 'PRODUCT_VERIFIER' },
                fresh_capture: { ...baseCapture, worktrees: [{ lock_state: { active: true, verifiable: false } }] },
                independent_evaluation: {}
            });
        }).toThrowError(new ProposalVerificationError('GIT_LOCK_ACTIVE'));
    });

    it('Fixture 9: Handoff State Change', () => {
        expect(() => {
            verifyProposal({
                proposal: validProposal,
                verifier_id: 'verifier-01',
                verifier_lease: { active: true, type: 'PRODUCT_VERIFIER' },
                fresh_capture: { ...baseCapture, handoff_state: { status: 'PENDING' } },
                independent_evaluation: {}
            });
        }).toThrowError(new ProposalVerificationError('HANDOFF_PENDING'));
    });

    it('Fixture 10: Mocked Capture Adapter', () => {
        expect(() => {
            verifyProposal({
                proposal: validProposal,
                verifier_id: 'verifier-01',
                verifier_lease: { active: true, type: 'PRODUCT_VERIFIER' },
                fresh_capture: baseCapture,
                independent_evaluation: { adapter_type: 'MOCKED' }
            });
        }).toThrowError(new ProposalVerificationError('NONDETERMINISTIC_OUTPUT'));
    });

    it('Fixture 11: Adapter Write-Capability', () => {
        expect(() => {
            verifyProposal({
                proposal: validProposal,
                verifier_id: 'verifier-01',
                verifier_lease: { active: true, type: 'PRODUCT_VERIFIER' },
                fresh_capture: baseCapture,
                independent_evaluation: { adapter_type: 'FRESH', adapter_write_capability: true }
            });
        }).toThrowError(new ProposalVerificationError('NONDETERMINISTIC_OUTPUT'));
    });

    it('Fixture 12: Digest Mismatch', () => {
        expect(() => {
            verifyProposal({
                proposal: validProposal,
                verifier_id: 'verifier-01',
                verifier_lease: { active: true, type: 'PRODUCT_VERIFIER' },
                fresh_capture: baseCapture,
                independent_evaluation: { adapter_type: 'FRESH', canonical_digest: 'digest456' }
            });
        }).toThrowError(new ProposalVerificationError('NONDETERMINISTIC_OUTPUT'));
    });

    it('Fixture 13: Stale Fencing Token', () => {
        expect(() => {
            verifyProposal({
                proposal: validProposal,
                verifier_id: 'verifier-01',
                verifier_lease: { active: true, type: 'PRODUCT_VERIFIER' },
                fresh_capture: baseCapture,
                independent_evaluation: { adapter_type: 'FRESH', fencing_token_stale: true }
            });
        }).toThrowError(new ProposalVerificationError('FENCING_TOKEN_STALE'));
    });

});







