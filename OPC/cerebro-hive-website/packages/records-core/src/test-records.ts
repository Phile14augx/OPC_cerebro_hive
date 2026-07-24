import { RecordLifecycleEngine, RetentionSchedule, ManagedRecord } from './retention/RetentionEngine';
import { LegalHoldRegistry, LegalHold } from './hold/LegalHoldRegistry';
import { DispositionManager } from './disposition/DispositionManager';

async function runRecordsTest() {
  console.log('--- Starting Records Management & Legal Hold Test ---');

  // 1. Setup Architecture
  const lifecycleEngine = new RecordLifecycleEngine();
  const holdRegistry = new LegalHoldRegistry();
  const dispositionManager = new DispositionManager(lifecycleEngine);

  // 2. Define Reusable Retention Schedule (Policy Object)
  const financialSchedule: RetentionSchedule = {
    id: 'sched-financial-7y',
    name: 'Financial Records - 7 Years',
    description: 'Retain for 7 years after creation. Requires single approval for disposition.',
    durationYears: 7,
    triggerEvent: 'CreationDate',
    dispositionPolicy: 'SingleApproval' // Configurable review
  };
  lifecycleEngine.registerSchedule(financialSchedule);

  // 3. Register a Managed Record
  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - 7); // Exactly 7 years ago

  const record: ManagedRecord = {
    id: 'rec-tax-2019',
    datasetId: 'ds-tax-filings',
    scheduleId: financialSchedule.id,
    state: 'Active',
    createdAt: pastDate,
    retentionEndDate: new Date(), // Today
    activeHolds: []
  };
  lifecycleEngine.registerRecord(record);

  console.log('\n[Lifecycle] Simulating daily lifecycle evaluation...');
  lifecycleEngine.evaluateLifecycle(record.id); 
  console.log(`   Record State: ${lifecycleEngine.getRecord(record.id)?.state}`); // Should be EligibleForDisposition

  // 4. Multiple Concurrent Holds
  console.log('\n[Legal Hold] Applying multiple holds before disposition can occur...');
  
  const secHold: LegalHold = {
    holdId: 'hold-sec-2026',
    name: 'SEC Investigation',
    reason: 'Subpoena received',
    authority: 'Legal Dept',
    scope: { datasets: ['ds-tax-filings'] },
    start: new Date(),
    status: 'Draft',
    affectedAssets: [record.id]
  };
  holdRegistry.registerHold(secHold, ['system-db', 'system-s3', 'system-search']);
  
  // Simulate partial propagation
  holdRegistry.acknowledgePropagation(secHold.holdId, 'system-db', true);
  holdRegistry.acknowledgePropagation(secHold.holdId, 'system-s3', true);
  holdRegistry.acknowledgePropagation(secHold.holdId, 'system-search', false); // Failed
  console.log(`   SEC Hold Status: ${holdRegistry.getHold(secHold.holdId)?.status}`); // Should be PartiallyApplied

  lifecycleEngine.applyHold(record.id, secHold.holdId);

  const taxHold: LegalHold = {
    holdId: 'hold-tax-audit',
    name: 'Internal Tax Audit',
    reason: 'Routine audit',
    authority: 'Finance Dept',
    scope: { datasets: ['ds-tax-filings'] },
    start: new Date(),
    status: 'Draft',
    affectedAssets: [record.id]
  };
  holdRegistry.registerHold(taxHold, ['system-db']);
  holdRegistry.acknowledgePropagation(taxHold.holdId, 'system-db', true);
  lifecycleEngine.applyHold(record.id, taxHold.holdId);

  console.log(`   Record active holds: ${lifecycleEngine.getRecord(record.id)?.activeHolds.join(', ')}`);

  // Attempt to request disposition while on hold
  dispositionManager.requestDisposition(record.id);
  console.log(`   Attempted Disposition. Record State: ${lifecycleEngine.getRecord(record.id)?.state}`); // Should remain EligibleForDisposition

  // 5. Release Holds
  console.log('\n[Legal Hold] Releasing holds...');
  holdRegistry.releaseHold(secHold.holdId);
  lifecycleEngine.releaseHold(record.id, secHold.holdId);
  
  // Notice disposition doesn't resume yet because taxHold is still active
  console.log(`   Attempted Disposition. Record State: ${lifecycleEngine.getRecord(record.id)?.state}`);

  holdRegistry.releaseHold(taxHold.holdId);
  lifecycleEngine.releaseHold(record.id, taxHold.holdId);

  // 6. Disposition Workflow & Certificate
  console.log('\n[Disposition] Resuming disposition workflow...');
  dispositionManager.requestDisposition(record.id); // Moves to DispositionReview
  
  console.log(`   Record State: ${lifecycleEngine.getRecord(record.id)?.state}`);
  
  dispositionManager.approveDisposition(record.id, 'steward-bob'); // Executes disposition (SingleApproval met)
  
  console.log(`   Final Record State: ${lifecycleEngine.getRecord(record.id)?.state}`);
  
  const cert = dispositionManager.getCertificateForRecord(record.id);
  console.log(`   Certificate Generated: ${cert?.certificateId} (Approver: ${cert?.approvers.join(', ')})`);
}

runRecordsTest().catch(console.error);
