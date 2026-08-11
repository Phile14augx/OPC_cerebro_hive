import { ConsentRegistry } from './consent/ConsentRegistry';
import { ProcessingRegistry, ProcessingActivity } from './processing/ProcessingRegistry';
import { DsrManager } from './dsr/DsrManager';
import { PrivacyPolicyEngine, GovernanceDatasetClassification } from './enforcement/PrivacyPolicyEngine';

async function runPrivacyTest() {
  console.log('--- Starting Privacy & Consent Management Test ---');

  // 1. Setup Architecture
  const consentRegistry = new ConsentRegistry();
  const processingRegistry = new ProcessingRegistry();
  const dsrManager = new DsrManager();
  
  // Mock Data Governance Catalog (Phase 10.2 integration)
  const mockedCatalog = new Map<string, GovernanceDatasetClassification>();
  mockedCatalog.set('ds-eu-customers', {
    id: 'ds-eu-customers',
    residency: {
      originRegion: 'EU',
      allowedStorageRegions: ['EU-West-1', 'EU-Central-1'],
      allowedProcessingRegions: ['EU'],
      transferRestricted: true
    }
  });

  const privacyEngine = new PrivacyPolicyEngine(consentRegistry, processingRegistry, mockedCatalog);

  // 2. Register Processing Activity
  const marketingActivity: ProcessingActivity = {
    id: 'pa-marketing-campaigns',
    name: 'Targeted Marketing Campaigns',
    purpose: 'Marketing',
    legalBasis: 'Consent',
    datasetIds: ['ds-eu-customers'],
    controllerId: 'dept-marketing',
    processorIds: ['vendor-mailchimp'],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  processingRegistry.registerActivity(marketingActivity);

  // 3. User Consent Lifecycle
  console.log('\n[Consent] Recording user consent...');
  consentRegistry.recordConsent({
    id: 'cr-100',
    principalId: 'user-alice',
    purpose: 'Marketing',
    legalBasis: 'Consent',
    status: 'Granted',
    collectionMethod: 'Web Signup Form v2',
    policyVersion: 'v2026.1',
    noticeVersion: 'v2026.1',
    grantedAt: new Date()
  });

  // 4. Privacy Policy Evaluation (Happy Path)
  console.log('\n[Privacy Engine] Evaluating Marketing activity in EU region...');
  const resultEU = privacyEngine.evaluate({
    principalId: 'user-alice',
    processingActivityId: 'pa-marketing-campaigns',
    targetProcessingRegion: 'EU'
  });
  console.log(`   Allowed: ${resultEU.allowed} (${resultEU.reason})`);

  // 5. Privacy Policy Evaluation (Residency Violation)
  console.log('\n[Privacy Engine] Evaluating Marketing activity in US region...');
  const resultUS = privacyEngine.evaluate({
    principalId: 'user-alice',
    processingActivityId: 'pa-marketing-campaigns',
    targetProcessingRegion: 'US'
  });
  console.log(`   Allowed: ${resultUS.allowed} (${resultUS.reason})`);

  // 6. Data Subject Rights (DSR) Erasure Request
  console.log('\n[DSR Workflow] Simulating Right to Erasure Request for user-alice...');
  const dsr = dsrManager.submitRequest('user-alice', 'Erasure', 'Delete my account and marketing history', ['db-users', 'service-marketing', 'vendor-mailchimp']);
  
  dsrManager.transitionState(dsr.id, 'IdentityVerification');
  dsrManager.transitionState(dsr.id, 'Accepted');
  dsrManager.transitionState(dsr.id, 'Processing'); // This emits 'WaitingOnSystems' and the EventBus broadcast

  console.log(`\n[EventBus] Downstream systems fulfilling deletion...`);
  dsrManager.acknowledgeSystemCompletion(dsr.id, 'db-users');
  console.log(`   State: ${dsrManager.getRequest(dsr.id)?.state}`);
  
  dsrManager.acknowledgeSystemCompletion(dsr.id, 'service-marketing');
  console.log(`   State: ${dsrManager.getRequest(dsr.id)?.state}`);
  
  dsrManager.acknowledgeSystemCompletion(dsr.id, 'vendor-mailchimp');
  console.log(`   Final State: ${dsrManager.getRequest(dsr.id)?.state}`); // Should automatically complete
}

runPrivacyTest().catch(console.error);
