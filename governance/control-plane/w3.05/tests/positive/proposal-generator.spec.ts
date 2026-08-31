import { describe, expect, it } from 'vitest';
import { generateProposal } from '../../src/proposal/generator.js';

describe('Task 11: Positive Proposal Generator', () => {
    it('Should successfully generate a valid proposal', () => {
        const result = generateProposal({
            live_epoch: 40,
            live_control_sha256: '4040404040404040404040404040404040404040404040404040404040404040',
            proposal: {
                schema_version: '1.0.0',
                control_plane_version: 'W3.05',
                proposed_epoch: 41,
                supersedes_epoch: 40,
                previous_control_sha256: '4040404040404040404040404040404040404040404040404040404040404040',
                product_contract_ids: ['product-p11', 'product-p10'],
                verifier_ids: ['verifier-01'], builder_id: 'builder-01', type: 'NON_AUTHORITATIVE_PROPOSAL', candidate_control_sha256: '4040404040404040404040404040404040404040404040404040404040404040'
            },
            lanes: [
                {
                    product_id: 'P10',
                    lifecycle: 'WRITE_AUTHORIZED'
                }
            ],
            worktrees: [
                {
                    untracked: {},
                    lock_state: {
                        active: false,
                        verifiable: true
                    }
                }
            ],
            shared_infra: [
                {
                    claimants: ['agent-p10-builder']
                }
            ]
        });

        expect(result).toBeDefined();
        expect(result.product_contract_ids).toEqual(['product-p10', 'product-p11']);
    });
});

