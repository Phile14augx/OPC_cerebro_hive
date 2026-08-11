import { ChangeService } from './services/ChangeService';
import { RiskEvaluator } from './services/RiskEvaluator';
import { ApprovalEngine } from './services/ApprovalEngine';
import { MockAssetProvider } from './integrations/AssetProvider';
import { MockPolicyProvider } from './integrations/PolicyProvider';
import { MockResilienceProvider } from './integrations/ResilienceProvider';
import { ChangeRequest } from './domain/ChangeRequest';
import { ChangeState, ChangeCategory, ChangePriority } from './domain/ChangeState';

async function runTest() {
  console.log('--- Starting Enterprise Change Orchestration Test ---');

  // Initialize Providers (Ports & Adapters)
  const assetProvider = new MockAssetProvider();
  const policyProvider = new MockPolicyProvider();
  const resilienceProvider = new MockResilienceProvider();

  // Initialize Services
  const riskEvaluator = new RiskEvaluator(assetProvider);
  const approvalEngine = new ApprovalEngine(policyProvider);
  const changeService = new ChangeService(riskEvaluator, approvalEngine, resilienceProvider);

  // 1. Create a Normal Change Request
  const change: ChangeRequest = {
    id: 'CHG-2026-0801',
    title: 'Migrate Orders DB to new cluster',
    description: 'Upgrading the primary orders database for scale.',
    category: ChangeCategory.Normal,
    priority: ChangePriority.High,
    state: ChangeState.Draft,
    businessJustification: 'Capacity limits reached.',
    requesterId: 'usr-123',
    affectedBusinessCapabilities: ['cap-checkout'],
    affectedConfigurationItems: ['ci-orders-db'], // Mock provider treats this as MissionCritical
    implementationPlan: '...',
    rollbackPlan: '...',
    verificationPlan: '...',
    approvals: [],
    linkedIncidents: [],
    linkedProblems: [],
    auditReferences: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  console.log(`\n[1] Submitting Change Request: ${change.id}`);
  await changeService.submitChange(change);

  console.log(`\n[2] Assessing Impact & Risk`);
  await changeService.assessImpactAndRisk(change);
  console.log(`    Calculated Risk Score: ${change.calculatedRiskScore}`);

  console.log(`\n[3] Requesting Approvals`);
  await changeService.requestApprovals(change);
  console.log(`    Change State: ${change.state}`);
  change.approvals.forEach(a => console.log(`    Required Approval: ${a.approvalType} (${a.status})`));

  // Simulate CAB Approval manually for the test
  if (change.state === ChangeState.AwaitingApproval) {
    console.log(`\n[4] Simulating CAB Approval...`);
    change.approvals.forEach(a => a.status = 'Approved' as any);
    // Since we mutated it manually, just force state to Approved for test flow
    change.state = ChangeState.Approved;
  }

  console.log(`\n[5] Scheduling & Executing`);
  await changeService.scheduleDeployment(change);
  await changeService.startDeployment(change);
  
  console.log(`\n[6] Deployment Succeeded, verifying...`);
  await changeService.completeDeployment(change, true);
  await changeService.closeChange(change);

  console.log(`\n--- Test Completed Successfully. Final State: ${change.state} ---`);
}

runTest().catch(console.error);
