import { describe, expect, it } from 'vitest';
import { AuditLedger } from './ledger/AuditLedger';
import { EvidenceCollector } from './evidence/EvidenceCollector';
import { ContinuousMonitor } from './monitoring/ContinuousMonitor';
import type { ControlObjective } from './frameworks/Framework';

function createAccessControl(): ControlObjective {
  return {
    id: 'CC6.3',
    family: 'Logical Access',
    description: 'Access provisioning requires approval evidence.',
    status: 'Unknown',
    requirements: [{
      id: 'req-1',
      description: 'Retain approval and provisioning evidence.',
      evidenceRequirements: [{
        id: 'evr-1',
        description: 'Access lifecycle evidence.',
        sourceEventTypes: ['AccessApproved', 'AccessProvisioned'],
      }],
    }],
  };
}

describe('compliance audit contracts', () => {
  it('maintains a valid hash chain for untampered ledger entries', async () => {
    const ledger = new AuditLedger();
    const approval = await ledger.append('reviewer', 'AccessApproved', { requestId: 'req-400' });
    const provisioning = await ledger.append('provisioner', 'AccessProvisioned', { requestId: 'req-400' });

    expect(ledger.verifyChain()).toBe(true);
    expect(provisioning.previousHash).toBe(approval.entryHash);
    expect(ledger.getEntries()).toHaveLength(2);
  });

  it('detects payload tampering in an existing ledger entry', async () => {
    const ledger = new AuditLedger();
    await ledger.append('reviewer', 'AccessApproved', { requestId: 'req-400' });
    const [entry] = ledger.getEntries();

    entry.payload.requestId = 'req-tampered';

    expect(ledger.verifyChain()).toBe(false);
  });

  it('creates a deficiency when access is provisioned without approval evidence', async () => {
    const ledger = new AuditLedger();
    const evidence = new EvidenceCollector();
    const control = createAccessControl();
    const monitor = new ContinuousMonitor(ledger, evidence, [control]);

    await monitor.consumeEvent('AccessProvisioned', { requestId: 'req-500', principalId: 'user-3' });

    expect(monitor.getDeficiencies()).toHaveLength(1);
    expect(monitor.getDeficiencies()[0]).toMatchObject({
      controlObjectiveId: 'CC6.3',
      severity: 'High',
      status: 'Open',
    });
    expect(control.status).toBe('PartiallySatisfied');
  });

  it('does not treat evidence without request IDs as matching approval evidence', async () => {
    const ledger = new AuditLedger();
    const evidence = new EvidenceCollector();
    const control = createAccessControl();
    const monitor = new ContinuousMonitor(ledger, evidence, [control]);

    await monitor.consumeEvent('AccessApproved', { principalId: 'user-3' });
    await monitor.consumeEvent('AccessProvisioned', { principalId: 'user-3' });

    expect(monitor.getDeficiencies()).toHaveLength(1);
    expect(control.status).toBe('PartiallySatisfied');
  });
});
