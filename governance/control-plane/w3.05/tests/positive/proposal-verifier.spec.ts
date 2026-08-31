import { describe, expect, it } from 'vitest';
import { sha256Canonical } from '../../src/canonical/json.js';
import { verifyProposal } from '../../src/proposal/verifier.js';

describe('Task 12: Positive Proposal Verifier', () => {
    it('Should successfully verify a valid proposal', () => {
        const preimage = {
            schema_version: '1.0',
            control_plane_version: '1.0',
            type: 'NON_AUTHORITATIVE_PROPOSAL',
            proposed_epoch: 41,
            supersedes_epoch: 40,
            previous_control_sha256: '4040404040404040404040404040404040404040404040404040404040404040',
            candidate_control_sha256: '4040404040404040404040404040404040404040404040404040404040404040',
            builder_id: 'agent-codex-01',
            verifier_ids: ['verifier-01']
        };
        const validProposal = { ...preimage, proposal_sha256: sha256Canonical(preimage) };

        const result = verifyProposal({
            proposal: validProposal,
            verifier_id: 'verifier-01',
            verifier_lease: {
                active: true,
                type: 'PRODUCT_VERIFIER'
            },
            fresh_capture: {
                live_epoch: 40,
                live_control_sha256: '4040404040404040404040404040404040404040404040404040404040404040'
            },
            independent_evaluation: undefined
        });

        expect(result).toBeDefined();
        expect(result.verdict).toBe('EPOCH_41_PROPOSAL_VALID');
    });
});

