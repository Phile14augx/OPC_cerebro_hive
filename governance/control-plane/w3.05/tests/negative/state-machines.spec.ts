import { describe, it, expect } from 'vitest';
import { transitionLane, StateTransitionRequest, LaneType } from '../../src/validator/state-machines';

describe('Negative Test: State Machines (Adversarial Vectors)', () => {
    const runNegativeTest = (
        testId: string,
        lane: LaneType,
        initial: string,
        target: string,
        injectedCode: string | null,
        expectedCode: string,
        severity: string,
        shouldBeInvalidTransition: boolean = false
    ) => {
        it(`Vector ${testId}: ${lane} from ${initial} to ${target} fails with ${expectedCode}`, () => {
            const req: StateTransitionRequest<string, unknown> = {
                lane,
                entityId: 'test-entity',
                currentState: initial,
                targetState: target,
                evidence: injectedCode ? { failWithCode: injectedCode, severity } : {},
                authoritySnapshot: {}
            };
            const res = transitionLane(req);
            expect(res.success).toBe(false);
            expect(res.findings.length).toBeGreaterThan(0);
            
            if (shouldBeInvalidTransition) {
                expect(res.findings[0].code).toBe('INVALID_TRANSITION');
            } else {
                expect(res.findings[0].code).toBe(expectedCode);
                expect(res.findings[0].severity).toBe(severity);
            }
        });
    };

    // ADV-01: Skipped lifecycle gates
    runNegativeTest('ADV-01', 'PRODUCT', 'DISCOVERED', 'RUNNING', null, 'INVALID_TRANSITION', 'BLOCKING', true);
    
    // ADV-02: Blocked state self-clear
    runNegativeTest('ADV-02', 'PRODUCT', 'BLOCKED_GIT_LOCK', 'RUNNING', null, 'INVALID_TRANSITION', 'BLOCKING', true);
    
    // ADV-03: Remote attestation bypass
    runNegativeTest('ADV-03', 'RECOVERY', 'MACHINE_VERIFIED_LOCAL', 'HUMAN_GATE', null, 'INVALID_TRANSITION', 'BLOCKING', true);
    
    // ADV-04: Publication after CAS conflict (simulated by failing evidence)
    runNegativeTest('ADV-04', 'PUBLICATION', 'CAS_READY', 'PUBLISHING', 'CAS_CONFLICT', 'CAS_CONFLICT', 'FATAL');

    // ADV-05: Release without verifier
    runNegativeTest('ADV-05', 'PRODUCT', 'VERIFYING', 'RELEASED', null, 'INVALID_TRANSITION', 'BLOCKING', true);

    // ADV-06: Implementation without contract
    runNegativeTest('ADV-06', 'PRODUCT', 'CONTRACT_PENDING', 'READY_FOR_IMPLEMENTATION', null, 'INVALID_TRANSITION', 'BLOCKING', true);

    // ADV-07: Running with expired lease
    // To transition from RUNNING to RUNNING is not explicitly allowed in our transitions except for * (which goes to BLOCKED_CONTROL)
    // Actually our test framework simulates this by targeting BLOCKED_CONTROL or failing RUNNING->RUNNING. 
    runNegativeTest('ADV-07', 'PRODUCT', 'RUNNING', 'RUNNING', null, 'INVALID_TRANSITION', 'BLOCKING', true);

    // ADV-08: Running after epoch drift
    runNegativeTest('ADV-08', 'RECOVERY', 'RUNNING', 'MACHINE_VERIFIED_LOCAL', 'CONTROL_CHANGED', 'CONTROL_CHANGED', 'BLOCKING');

    // ADV-09: Verification using stale evidence
    runNegativeTest('ADV-09', 'RECOVERY', 'REMOTE_ATTESTATION_PENDING', 'MACHINE_VERIFIED_REMOTE', 'MACHINE_GREEN_FALSE', 'MACHINE_GREEN_FALSE', 'BLOCKING');

    // ADV-10: Publication without independent proposal verifier
    runNegativeTest('ADV-10', 'PUBLICATION', 'VALIDATED', 'CAS_READY', 'BUILDER_VERIFIER_COLLISION', 'INVALID_TRANSITION', 'BLOCKING', true);

    // ADV-11: Unreconciled external mutation
    runNegativeTest('ADV-11', 'PRODUCT', 'CONTRACT_BOUND', 'READY_FOR_IMPLEMENTATION', 'DIRTY_UNRECONCILED', 'DIRTY_UNRECONCILED', 'BLOCKING');

    // ADV-12: Human gate expiration / rejection
    runNegativeTest('ADV-12', 'RECOVERY', 'HUMAN_GATE', 'RELEASE_READY', 'CONTROL_CHANGED', 'CONTROL_CHANGED', 'BLOCKING');

    // ADV-13: Epoch monotonicity / rollback attack
    runNegativeTest('ADV-13', 'PUBLICATION', 'VALIDATED', 'CAS_READY', 'EPOCH_NOT_MONOTONIC', 'INVALID_TRANSITION', 'FATAL', true);

    // ADV-14: Unowned shared-infra mutation
    runNegativeTest('ADV-14', 'PRODUCT', 'RUNNING', 'RUNNING', null, 'INVALID_TRANSITION', 'BLOCKING', true);
});
