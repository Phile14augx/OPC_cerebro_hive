import { Entitlement } from './entitlements/Entitlement';
import { SoDValidator } from './requests/SoDValidator';
import { ApprovalEngine } from './requests/ApprovalEngine';
import { JITProvisioner } from './entitlements/JITProvisioner';
import { RiskEngine } from './risk/RiskEngine';

async function runGovernanceTest() {
  console.log('--- Starting Identity Governance & Zero Trust Test ---');

  // 1. Setup SoD Validator
  const sodValidator = new SoDValidator();
  sodValidator.addRule({
    id: 'sod-1',
    name: 'Toxic Combination: Auditor + Admin',
    description: 'Cannot hold both Auditor and System Administrator entitlements.',
    conflictingEntitlements: ['ent-auditor', 'ent-sysadmin']
  });

  // 2. Setup Approval Engine & JIT Provisioner
  const approvalEngine = new ApprovalEngine(sodValidator);
  const jitProvisioner = new JITProvisioner(approvalEngine);

  // 3. Setup Entitlements
  const sysAdminEntitlement: Entitlement = {
    id: 'ent-sysadmin',
    name: 'System Administrator',
    description: 'Full system access',
    roles: ['role:admin'],
    policyBundles: ['pb-core'],
    credentialPolicies: ['cp-admin'],
    requiresApproval: true,
    maxDurationSeconds: 3600, // 1 hour JIT
    allowedPrincipals: ['dept:it'],
    riskLevel: 'Critical',
    owners: ['user-ciso']
  };

  // 4. Test SoD Violation (User already has 'ent-auditor')
  console.log('\n[Governance] Attempting SoD Violation...');
  try {
    await approvalEngine.submitRequest(
      'user-123',
      sysAdminEntitlement,
      ['ent-auditor'], // User currently has Auditor
      'Need admin access for emergency fix'
    );
  } catch (err: any) {
    console.error(`[Governance] Blocked by SoD: ${err.message}`);
  }

  // 5. Test Successful JIT Request
  console.log('\n[Governance] Requesting JIT Access...');
  const req = await approvalEngine.submitRequest(
    'user-456',
    sysAdminEntitlement,
    [], // No conflicting entitlements
    'Need admin access for emergency fix'
  );
  console.log(`[Governance] Request ${req.id} submitted. Status: ${req.status}`);

  console.log('[Governance] Approving request...');
  await approvalEngine.approveRequest(req.id, 'manager-789', 'Approved for 1 hour');
  console.log(`[Governance] Request ${req.id} status: ${req.status}`);

  console.log('[Governance] Provisioning JIT Entitlement...');
  await jitProvisioner.provision(req.id);
  const provReq = approvalEngine.getRequest(req.id);
  console.log(`[Governance] Provisioned! Expires At: ${provReq?.expiresAt?.toISOString()}`);

  // 6. Test Risk Engine (Zero Trust)
  console.log('\n[Zero Trust] Simulating anomalies...');
  const riskEngine = new RiskEngine();

  // Baseline
  riskEngine.processEvent({ type: 'Login', principalId: 'user-456', payload: {} });
  console.log(`[Zero Trust] Current Risk Score:`, riskEngine.getScore('user-456')?.overallRisk);

  // Spike 1: Policy Deny
  riskEngine.processEvent({ type: 'PolicyDeny', principalId: 'user-456', payload: {} });
  console.log(`[Zero Trust] Policy Deny! Risk Score:`, riskEngine.getScore('user-456')?.overallRisk);

  // Spike 2: Impossible Travel (Triggers Revocation)
  riskEngine.processEvent({ type: 'ImpossibleTravel', principalId: 'user-456', payload: {} });
  console.log(`[Zero Trust] Impossible Travel! Risk Score:`, riskEngine.getScore('user-456')?.overallRisk);
}

runGovernanceTest().catch(console.error);
