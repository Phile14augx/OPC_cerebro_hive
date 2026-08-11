import { PolicyEngine } from './engine/PolicyEngine';
import { PolicyRule } from './models/PolicyRule';
import { IdentityContext, HumanPrincipal } from '@cerebro/identity-core';
import { PolicySimulator, HistoricalRequest } from './simulation/PolicySimulator';

async function runPolicyTest() {
  console.log('--- Starting Policy Engine Verification ---');
  
  const engine = new PolicyEngine();
  const simulator = new PolicySimulator();

  // Active Policies
  const activePolicies: PolicyRule[] = [
    {
      id: 'pol-permit-eng',
      name: 'Permit Engineering',
      description: 'Allows engineers to run workflows',
      version: '1.0.0',
      lifecycleState: 'Active',
      effect: 'Permit',
      priority: 50,
      enabled: true,
      actions: ['workflows:execute'],
      resources: ['*'],
      conditions: [{ field: 'identity.claims.department', operator: 'eq', value: 'Engineering' }],
      createdBy: 'admin'
    }
  ];

  // Candidate Policies (Adding a Deny for Low Trust in Prod, with obligations)
  const candidatePolicies: PolicyRule[] = [
    ...activePolicies,
    {
      id: 'pol-deny-low-trust-prod',
      name: 'Deny Low Trust Prod',
      description: 'Prevents low trust principals from executing workflows in production',
      version: '1.0.0',
      lifecycleState: 'Simulation',
      effect: 'Deny',
      priority: 100,
      enabled: true,
      actions: ['workflows:execute'],
      resources: ['*'],
      conditions: [
        { field: 'identity.currentPrincipal.trustLevel', operator: 'lt', value: 80 },
        { field: 'resource.environment', operator: 'eq', value: 'production' }
      ],
      obligations: [
        { id: 'obl-notify-soc', stage: 'AfterAction', action: 'NotifySOC' }
      ],
      advice: [
        { id: 'adv-mfa', category: 'Security', message: 'Recommend MFA for production deployments.' }
      ],
      createdBy: 'admin'
    }
  ];

  const principal: HumanPrincipal = {
    id: 'user-junior-1',
    type: 'Human',
    status: 'Active',
    trustLevel: 60,
    displayName: 'Junior Dev',
    // issuer: 'cerebro-auth',
    // authenticationSource: 'sso',
    email: 'junior@cerebrohive.com',
    metadata: {}
  };

  const context: IdentityContext = {
    currentPrincipal: principal,
    originalPrincipal: principal,
    delegationChain: [],
    tenancy: { organizationId: 'org-1' },
    claims: { department: 'Engineering' },
    // authenticationMethod: 'sso',
    correlationId: 'test-123'
  };

  const prodResource = {
    id: 'wf-test-prod',
    type: 'workflow',
    classification: 'Restricted' as const,
    tags: [],
    visibility: 'Private' as const,
    environment: 'production',
    riskLevel: 90
  };

  // 1. Enforce Mode with Candidate Policies
  console.log('\n--- Scenario 1: Execute Workflow in Prod (Enforce) ---');
  const prodDecision = engine.evaluate(candidatePolicies, context, 'workflows:execute', prodResource, 'Enforce');
  console.log(`Decision: ${prodDecision.decision}`);
  console.log(`Obligations:`, prodDecision.obligations);
  console.log(`Advice:`, prodDecision.advice);

  // 2. Shadow Mode with Candidate Policies
  console.log('\n--- Scenario 2: Execute Workflow in Prod (Shadow Mode) ---');
  const shadowDecision = engine.evaluate(candidatePolicies, context, 'workflows:execute', prodResource, 'Shadow');
  console.log(`Decision: ${shadowDecision.decision}`);
  console.log(`Reason: ${shadowDecision.reason}`);

  // 3. Simulator
  console.log('\n--- Scenario 3: Policy Simulator ---');
  const historicalRequests: HistoricalRequest[] = [
    {
      id: 'req-hist-1',
      identityContext: context,
      action: 'workflows:execute',
      resourceContext: prodResource,
      originalDecision: 'Permit' // Historically permitted because Deny policy wasn't active
    }
  ];

  const report = simulator.simulateSync(candidatePolicies, historicalRequests);
  console.log(`Total Evaluated: ${report.totalEvaluated}`);
  console.log(`Diff Count: ${report.diffCount}`);
  console.log(`New Denies: ${report.newDenies}`);
  console.log(`Results:`, JSON.stringify(report.results, null, 2));
}

runPolicyTest().catch(console.error);
