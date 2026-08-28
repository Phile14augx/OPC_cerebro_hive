import { CommandBus } from './commands/CommandBus';
import { EvidenceLocker } from './evidence/EvidenceLocker';
import { CaseManager } from './cases/CaseManager';
import { PlaybookEngine, Playbook } from './playbooks/PlaybookEngine';

// Dummy interfaces from intelligence-core to keep this standalone
interface ThreatAlert {
  id: string;
  principalId: string;
  threatType: 'BruteForce' | 'ImpossibleTravel' | 'PrivilegeEscalation';
  severity: 'Medium' | 'High' | 'Critical';
  description: string;
  timestamp: Date;
}

async function runSecOpsTest() {
  console.log('--- Starting SecOps & Incident Response Test ---');

  // 1. Setup Architecture
  const commandBus = new CommandBus();
  const evidenceLocker = new EvidenceLocker();
  const caseManager = new CaseManager(evidenceLocker);
  const playbookEngine = new PlaybookEngine(commandBus);

  // 2. Register Mock Enforcement Handlers on Command Bus
  commandBus.registerHandler('DisablePrincipal', async (cmd) => {
    console.log(`   [Action] 🛡️ Disabled Principal: ${cmd.targetId}`);
  });
  
  commandBus.registerHandler('RevokeLease', async (cmd) => {
    console.log(`   [Action] 🛡️ Revoked Active Credential Leases for: ${cmd.targetId}`);
  });

  commandBus.registerHandler('CollectEvidence', async (cmd) => {
    console.log(`   [Action] 🛡️ Collecting evidence snapshot for Case: ${cmd.targetId}`);
    await evidenceLocker.storeEvidence(cmd.targetId, 'IntelligenceCore', 'TimelineSnapshot', { 
      events: ['Login (US-East)', 'PolicyDeny (system:root)'], 
      note: 'Snapshot collected automatically by Playbook' 
    });
  });

  // 3. Register Declarative Playbook
  const bruteForceContainment: Playbook = {
    id: 'pb-contain-bruteforce',
    name: 'Brute Force Auto-Containment',
    description: 'Automatically disables principal and revokes leases on confirmed Critical BruteForce.',
    autoExecute: true,
    conditions: {
      severityMatches: ['Emergency', 'Critical'],
      threatTypes: ['BruteForce']
    },
    actions: [
      {
        commandType: 'CollectEvidence',
        targetExtractor: (_c) => _c.id,
        contextExtractor: (_c) => ({})
      },
      {
        commandType: 'RevokeLease',
        targetExtractor: (_c) => _c.principals[0],
        contextExtractor: (_c) => ({ reason: 'Auto-Containment' })
      },
      {
        commandType: 'DisablePrincipal',
        targetExtractor: (_c) => _c.principals[0],
        contextExtractor: (_c) => ({ reason: 'Auto-Containment' })
      }
    ]
  };

  playbookEngine.registerPlaybook(bruteForceContainment);

  // 4. Simulate Threat Detected
  console.log('\n[ThreatDetection] Receiving Threat Alert from Intelligence Core...');
  const alert: ThreatAlert = {
    id: 'alert-101',
    principalId: 'user-hacker-42',
    threatType: 'BruteForce',
    severity: 'Critical',
    description: '10 failed policy evaluations followed by MFA failure.',
    timestamp: new Date()
  };

  // 5. Case Lifecycle
  const incidentCase = await caseManager.handleAlert(alert);
  
  // 6. Execute Playbooks
  await playbookEngine.evaluateCase(incidentCase);

  // 7. Verify State & Evidence
  console.log(`\n[Post-Incident Review]`);
  console.log(`Case ${incidentCase.id} is in state: ${incidentCase.state}`);
  
  const evidence = await evidenceLocker.getEvidenceForCase(incidentCase.id);
  console.log(`Evidence artifacts collected: ${evidence.length}`);
  
  for (const ev of evidence) {
    const isIntact = evidenceLocker.verifyIntegrity(ev.id);
    console.log(` - ${ev.type} (Checksum Valid: ${isIntact}) -> Checksum: ${ev.checksum.substring(0, 10)}...`);
  }

  // 8. Close Case
  await caseManager.transitionState(incidentCase.id, 'Investigating', 'Analyst Jane', 'Reviewing automated containment');
  await caseManager.transitionState(incidentCase.id, 'Contained', 'Analyst Jane', 'Threat mitigated');
  await caseManager.transitionState(incidentCase.id, 'Resolved', 'Analyst Jane', 'Account restored');
  await caseManager.transitionState(incidentCase.id, 'Closed', 'Analyst Jane', 'Incident closed');
}

runSecOpsTest().catch(console.error);
