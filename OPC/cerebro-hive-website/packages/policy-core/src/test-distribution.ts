import { PolicyCompiler } from './distribution/Compiler';
import { BundleSigner } from './distribution/Signer';
import { InMemoryPolicyCache } from './distribution/PolicyCache';
import { MockKeyProvider } from '@cerebro/secrets-core';
import { PolicyRule } from './models/PolicyRule';
import { PolicyBundle } from './models/PolicyBundle';
import { PolicyEngine } from './engine/PolicyEngine';
import { HumanPrincipal, IdentityContext } from '@cerebro/identity-core';

async function runDistributionTest() {
  console.log('--- Starting Policy Distribution Runtime Verification ---');

  // 1. Setup Providers
  const keyProvider = new MockKeyProvider('master-key-1');
  const signer = new BundleSigner(keyProvider);
  const compiler = new PolicyCompiler();
  const cache = new InMemoryPolicyCache(signer);
  const engine = new PolicyEngine();

  // 2. Define Mock Governance Policies
  const activePolicies: PolicyRule[] = [
    {
      id: 'pol-dist-permit',
      name: 'Permit Workflows',
      description: 'Test rule for distribution',
      version: '1.0.0',
      lifecycleState: 'Active',
      effect: 'Permit',
      priority: 50,
      enabled: true,
      actions: ['workflows:execute'],
      resources: ['workflow'],
      conditions: [{ field: 'identity.claims.department', operator: 'eq', value: 'Engineering' }],
      createdBy: 'admin'
    }
  ];

  const sourceBundle: PolicyBundle = {
    id: 'bundle-test-1',
    version: '1.0.0',
    manifest: { name: 'Test Bundle', description: '', policies: [] },
    signature: '',
    compiledAt: new Date(),
    compiledBy: 'system'
  };

  // 3. Compile the Governance Policies into an Optimized Bundle
  console.log('\n[Governance Service] Compiling policies...');
  const optimizedBundle = compiler.compile(sourceBundle, activePolicies);
  console.log(`Action Index Size: ${Object.keys(optimizedBundle.actionIndex).length}`);
  console.log(`Resource Index Size: ${Object.keys(optimizedBundle.resourceIndex).length}`);

  // 4. Sign the Bundle
  console.log('\n[Governance Service] Signing compiled bundle...');
  const signedBundle = await signer.sign(optimizedBundle);
  console.log(`Bundle Hash: ${signedBundle.bundleHash}`);
  console.log(`Signature: ${signedBundle.signature}`);
  console.log(`Key ID: ${signedBundle.keyId}`);

  // 5. Distribute & Load into Regional Cache
  console.log('\n[Regional Node] Loading bundle into cache...');
  try {
    await cache.loadBundle(signedBundle);
    console.log('Load successful! Signature verified atomically.');
  } catch (err) {
    console.error('Failed to load bundle', err);
  }

  // 6. Test Tamper Detection
  console.log('\n[Attacker] Attempting to load tampered bundle...');
  const tamperedBundle = { ...signedBundle };
  tamperedBundle.compiledRules['pol-dist-permit'].effect = 'Deny'; // Tamper
  try {
    await cache.loadBundle(tamperedBundle);
  } catch (err) {
    console.log(`Expected Error Caught: ${(err as Error).message}`);
  }

  // 7. Execute Runtime Evaluation from Cache
  console.log('\n[Application] Evaluating via cache...');
  const activeLoadedBundle = cache.getActiveBundle();
  
  if (activeLoadedBundle) {
    const principal: HumanPrincipal = {
      id: 'user-1',
      type: 'Human',
      status: 'Active',
      trustLevel: 90,
      displayName: 'Eng',
      email: 'eng@cerebrohive.com',
      // issuer: 'sso',
      // authenticationSource: 'sso',
      metadata: {}
    };

    const ctx: IdentityContext = {
      currentPrincipal: principal,
      originalPrincipal: principal,
      delegationChain: [],
      tenancy: { organizationId: 'org-1' },
      claims: { department: 'Engineering' },
      // authenticationMethod: 'sso',
      correlationId: 'req-1'
    };

    const decision = engine.evaluate(activeLoadedBundle, ctx, 'workflows:execute', {
      id: 'w-1',
      type: 'workflow',
      classification: 'Internal',
      tags: [],
      visibility: 'Private',
      riskLevel: 10
    });

    console.log(`Decision: ${decision.decision}`);
    console.log(`Reason: ${decision.reason}`);
    console.log(`Evaluated using Bundle Version: ${decision.bundleVersion}`);
  }
}

runDistributionTest().catch(console.error);
