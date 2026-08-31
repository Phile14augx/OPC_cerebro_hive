/* eslint-disable @typescript-eslint/no-explicit-any */


export class ProposalGenerationError extends Error {
    constructor(public code: string, message?: string) {
        super(message || code);
        this.name = 'ProposalGenerationError';
    }
}

export interface ProposalInput {
    live_epoch: number;
    live_control_sha256?: string;
    proposal: any;
    diagnostics?: any;
    findings?: any[];
    lanes?: any[];
    shared_infra?: any[];
    worktrees?: any[];
}

export function sortSetLikeArray(arr: string[]): string[] {
    if (!arr) return [];
    return [...arr].sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    });
}

const severityRank: Record<string, number> = {
    'CRITICAL': 1,
    'BLOCKING': 2,
    'WARNING': 3,
    'INFO': 4
};

export function generateProposal(input: ProposalInput): any {
    const { live_epoch, live_control_sha256, proposal, findings, lanes, shared_infra, worktrees } = input;

    // Reject conditions
    if (proposal.proposed_epoch < live_epoch + 1 || proposal.proposed_epoch === live_epoch) {
        throw new ProposalGenerationError('EPOCH_ROLLBACK_ATTEMPT');
    }
    if (proposal.proposed_epoch !== live_epoch + 1) {
        throw new ProposalGenerationError('EPOCH_NOT_MONOTONIC');
    }
    if (proposal.supersedes_epoch !== live_epoch) {
        throw new ProposalGenerationError('EPOCH_SUPERSESSION_MISMATCH');
    }
    if (live_control_sha256 && proposal.previous_control_sha256 !== live_control_sha256) {
        throw new ProposalGenerationError('EPOCH_SUPERSESSION_MISMATCH');
    }

    if (proposal.builder_id && proposal.verifier_ids && proposal.verifier_ids.includes(proposal.builder_id)) {
        throw new ProposalGenerationError('BUILDER_VERIFIER_COLLISION');
    }
    if (proposal.verifier_ids && proposal.verifier_ids.length === 0) {
        throw new ProposalGenerationError('BUILDER_VERIFIER_COLLISION');
    }

    if (lanes) {
        for (const lane of lanes) {
            if (lane.lifecycle === 'CONTRACT_PENDING' || lane.lifecycle === 'UNRESOLVED') {
                throw new ProposalGenerationError('CONTROL_SCHEMA_INVALID');
            }
        }
    }

    if (worktrees) {
        for (const wt of worktrees) {
            if (wt.untracked && Object.values(wt.untracked).includes('UNRECONCILED_ENTRY')) {
                throw new ProposalGenerationError('DIRTY_UNRECONCILED');
            }
            if (wt.lock_state && (wt.lock_state.active || !wt.lock_state.verifiable)) {
                throw new ProposalGenerationError('GIT_LOCK_ACTIVE');
            }
        }
    }

    if (shared_infra) {
        for (const infra of shared_infra) {
            if (infra.claimants && infra.claimants.length > 1) {
                throw new ProposalGenerationError('SHARED_INFRA_UNOWNED');
            }
        }
    }

    const result = { ...proposal };

    // Sort set-like arrays
    const setLikeFields = [
        'product_contract_ids',
        'recovery_contract_ids',
        'verifier_ids',
        'allow_scopes',
        'deny_scopes'
    ];

    for (const field of setLikeFields) {
        if (Array.isArray(result[field])) {
            result[field] = sortSetLikeArray(result[field]);
        }
    }

    // Sort findings
    if (findings && findings.length > 0) {
        result.findings = [...findings].sort((a, b) => {
            const rankA = severityRank[a.severity] || 99;
            const rankB = severityRank[b.severity] || 99;
            if (rankA !== rankB) return rankA - rankB;
            
            if (a.code < b.code) return -1;
            if (a.code > b.code) return 1;

            const evA = (a.evidenceRefs || []).join(',');
            const evB = (b.evidenceRefs || []).join(',');
            if (evA < evB) return -1;
            if (evA > evB) return 1;

            return 0;
        });
    }

    return result;
}

