import { AuditLedger } from './ledger/AuditLedger';
import { ComplianceFramework } from './frameworks/Framework';
import { EvidenceCollector } from './evidence/EvidenceCollector';
import { ContinuousMonitor } from './monitoring/ContinuousMonitor';

async function runComplianceTest() {
  console.log('--- Starting Enterprise Compliance & Audit Test ---');

  // 1. Setup Architecture
  const ledger = new AuditLedger();
  const evidenceCollector = new EvidenceCollector();

  // 2. Define SOC 2 Logical Access Control Framework (Mocked)
  const soc2Framework: ComplianceFramework = {
    id: 'SOC2-2022',
    name: 'SOC 2 Type II',
    version: '2022',
    families: [
      {
        id: 'LogicalAccess',
        name: 'Logical Access',
        objectives: [
          {
            id: 'CC6.3',
            family: 'Logical Access',
            description: 'Access provisioning is governed by approvals.',
            status: 'Unknown',
            requirements: [
              {
                id: 'req-1',
                description: 'All provisioned access must have a preceding approval.',
                evidenceRequirements: [
                  { id: 'evr-1', description: 'Approval Record', sourceEventTypes: ['AccessApproved'] },
                  { id: 'evr-2', description: 'Provision Record', sourceEventTypes: ['AccessProvisioned'] }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  const monitor = new ContinuousMonitor(ledger, evidenceCollector, soc2Framework.families[0].objectives);

  // 3. Happy Path: Governance Approval -> Provisioning
  console.log('\n[EventBus] Simulating Happy Path (Approval then Provision)...');
  await monitor.consumeEvent('AccessApproved', { requestId: 'req-400', approverId: 'manager-1' });
  await monitor.consumeEvent('AccessProvisioned', { requestId: 'req-400', principalId: 'user-2' });

  // 4. Deficient Path: Missing Evidence (Provisioning WITHOUT Approval)
  console.log('\n[EventBus] Simulating Compliance Violation (Provision WITHOUT Approval)...');
  await monitor.consumeEvent('AccessProvisioned', { requestId: 'req-500', principalId: 'user-3' });

  // 5. Audit Ledger Cryptographic Verification
  console.log('\n[AuditLedger] Cryptographic Verification...');
  const isValid = ledger.verifyChain();
  console.log(`   Ledger Chain Valid: ${isValid}`);
  console.log(`   Total Immutable Entries: ${ledger.getEntries().length}`);
  
  // 6. Review Deficiencies
  console.log('\n[Compliance Status] Active Deficiencies:');
  const deficiencies = monitor.getDeficiencies();
  deficiencies.forEach(d => {
    console.log(` - [${d.severity}] Control ${d.controlObjectiveId}: ${d.description}`);
  });

  // 7. Verify Tampering Fails
  console.log('\n[AuditLedger] Simulating Database Tampering...');
  ledger.getEntries()[0].payload = { requestId: 'req-999', tampered: true };
  const isTamperedValid = ledger.verifyChain();
  console.log(`   Ledger Chain Valid after tampering: ${isTamperedValid}`); // Should be false
}

runComplianceTest().catch(console.error);
