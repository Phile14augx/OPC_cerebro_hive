import { describe, expect, it } from 'vitest';
import { generateProposal, ProposalGenerationError } from '../../src/proposal/generator.js';

describe('Task 11: Negative Proposal Generator', () => {
    it('Fixture 1: Lower Epoch Proposal (Rollback Attempt)', () => {
        expect(() => {
            generateProposal({
                live_epoch: 40,
                proposal: {
                    proposed_epoch: 39,
                    supersedes_epoch: 38
                }
            });
        }).toThrowError(new ProposalGenerationError('EPOCH_ROLLBACK_ATTEMPT'));
    });

    it('Fixture 2: Duplicate Epoch Proposal', () => {
        expect(() => {
            generateProposal({
                live_epoch: 40,
                proposal: {
                    proposed_epoch: 40,
                    supersedes_epoch: 39
                }
            });
        }).toThrowError(new ProposalGenerationError('EPOCH_ROLLBACK_ATTEMPT'));
    });

    it('Fixture 3: Skipped Epoch Proposal', () => {
        expect(() => {
            generateProposal({
                live_epoch: 40,
                proposal: {
                    proposed_epoch: 42,
                    supersedes_epoch: 40
                }
            });
        }).toThrowError(new ProposalGenerationError('EPOCH_NOT_MONOTONIC'));
    });

    it('Fixture 4: Wrong supersedes_epoch', () => {
        expect(() => {
            generateProposal({
                live_epoch: 40,
                proposal: {
                    proposed_epoch: 41,
                    supersedes_epoch: 39
                }
            });
        }).toThrowError(new ProposalGenerationError('EPOCH_SUPERSESSION_MISMATCH'));
    });

    it('Fixture 5: Wrong previous_control_sha256', () => {
        expect(() => {
            generateProposal({
                live_epoch: 40,
                live_control_sha256: '4040404040404040404040404040404040404040404040404040404040404040',
                proposal: {
                    proposed_epoch: 41,
                    supersedes_epoch: 40,
                    previous_control_sha256: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
                }
            });
        }).toThrowError(new ProposalGenerationError('EPOCH_SUPERSESSION_MISMATCH'));
    });

    it('Fixture 6: Unresolved Lane (Product in Non-Terminal Non-Authorized State)', () => {
        expect(() => {
            generateProposal({
                live_epoch: 40,
                proposal: {
                    proposed_epoch: 41,
                    supersedes_epoch: 40
                },
                lanes: [
                    {
                        product_id: 'P10',
                        lifecycle: 'CONTRACT_PENDING'
                    }
                ]
            });
        }).toThrowError(new ProposalGenerationError('CONTROL_SCHEMA_INVALID'));
    });

    it('Fixture 7: Missing Verifier Verdict / Colliding Verifier', () => {
        expect(() => {
            generateProposal({
                live_epoch: 40,
                proposal: {
                    proposed_epoch: 41,
                    supersedes_epoch: 40,
                    builder_id: 'agent-codex-01',
                    verifier_ids: ['agent-codex-01']
                }
            });
        }).toThrowError(new ProposalGenerationError('BUILDER_VERIFIER_COLLISION'));
        
        expect(() => {
            generateProposal({
                live_epoch: 40,
                proposal: {
                    proposed_epoch: 41,
                    supersedes_epoch: 40,
                    builder_id: 'agent-codex-01',
                    verifier_ids: []
                }
            });
        }).toThrowError(new ProposalGenerationError('BUILDER_VERIFIER_COLLISION'));
    });

    it('Fixture 8: Dirty-State Blocker (Unreconciled Worktree Entries)', () => {
        expect(() => {
            generateProposal({
                live_epoch: 40,
                proposal: {
                    proposed_epoch: 41,
                    supersedes_epoch: 40
                },
                worktrees: [
                    {
                        untracked: {
                            'src/temp_patch.ts': 'UNRECONCILED_ENTRY'
                        }
                    }
                ]
            });
        }).toThrowError(new ProposalGenerationError('DIRTY_UNRECONCILED'));
    });

    it('Fixture 9: Lock Blocker (Active or Unverifiable Git Lock)', () => {
        expect(() => {
            generateProposal({
                live_epoch: 40,
                proposal: {
                    proposed_epoch: 41,
                    supersedes_epoch: 40
                },
                worktrees: [
                    {
                        lock_state: {
                            path: '.git/index.lock',
                            active: true,
                            verifiable: false
                        }
                    }
                ]
            });
        }).toThrowError(new ProposalGenerationError('GIT_LOCK_ACTIVE'));
    });

    it('Fixture 10: Shared-Infrastructure Owner Conflict', () => {
        expect(() => {
            generateProposal({
                live_epoch: 40,
                proposal: {
                    proposed_epoch: 41,
                    supersedes_epoch: 40
                },
                shared_infra: [
                    {
                        claimants: ['agent-p10-builder', 'agent-p11-builder']
                    }
                ]
            });
        }).toThrowError(new ProposalGenerationError('SHARED_INFRA_UNOWNED'));
    });
});
