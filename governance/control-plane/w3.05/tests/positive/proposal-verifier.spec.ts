import { describe, expect, it } from 'vitest';
import { verifyProposal } from '../../src/proposal/verifier.js';

describe('Task 12: Positive Proposal Verifier', () => {
    it('Should successfully verify a valid proposal', () => {
        const result = verifyProposal({
            proposal: {
                proposed_epoch: 41,
                supersedes_epoch: 40,
                previous_control_sha256: '4040404040404040404040404040404040404040404040404040404040404040',
                builder_id: 'agent-codex-01',
                canonical_digest: 'deadbeef'
            },
            verifier_id: 'verifier-01',
            verifier_lease: {
                active: true,
                type: 'PRODUCT_VERIFIER'
            },
            fresh_capture: {
                live_epoch: 40,
                live_control_sha256: '4040404040404040404040404040404040404040404040404040404040404040'
            },
            independent_evaluation: {
                adapter_type: 'FRESH',
                adapter_write_capability: false,
                canonical_digest: 'deadbeef'
            }
        });

        expect(result).toBeDefined();
        expect(result.verdict).toBe('EPOCH_41_PROPOSAL_VALID');
    });
});
