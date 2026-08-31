import { describe, it, expect } from 'vitest';
import { transitionLane, StateTransitionRequest } from '../../src/validator/state-machines';

describe('Positive Test: State Machines', () => {
    it('allows valid product transition DISCOVERED -> FORENSICS_COMPLETE', () => {
        const req: StateTransitionRequest<string, unknown> = {
            lane: 'PRODUCT',
            entityId: 'prod-1',
            currentState: 'DISCOVERED',
            targetState: 'FORENSICS_COMPLETE',
            evidence: {},
            authoritySnapshot: {}
        };
        const res = transitionLane(req);
        expect(res.success).toBe(true);
        expect(res.findings.length).toBe(0);
        expect(res.toState).toBe('FORENSICS_COMPLETE');
    });

    it('allows valid recovery transition RUNNING -> MACHINE_VERIFIED_LOCAL', () => {
        const req: StateTransitionRequest<string, unknown> = {
            lane: 'RECOVERY',
            entityId: 'rec-1',
            currentState: 'RUNNING',
            targetState: 'MACHINE_VERIFIED_LOCAL',
            evidence: {},
            authoritySnapshot: {}
        };
        const res = transitionLane(req);
        expect(res.success).toBe(true);
        expect(res.findings.length).toBe(0);
        expect(res.toState).toBe('MACHINE_VERIFIED_LOCAL');
    });

    it('allows valid publication transition CAS_READY -> PUBLISHING', () => {
        const req: StateTransitionRequest<string, unknown> = {
            lane: 'PUBLICATION',
            entityId: 'pub-1',
            currentState: 'CAS_READY',
            targetState: 'PUBLISHING',
            evidence: {},
            authoritySnapshot: {}
        };
        const res = transitionLane(req);
        expect(res.success).toBe(true);
        expect(res.findings.length).toBe(0);
        expect(res.toState).toBe('PUBLISHING');
    });
});
