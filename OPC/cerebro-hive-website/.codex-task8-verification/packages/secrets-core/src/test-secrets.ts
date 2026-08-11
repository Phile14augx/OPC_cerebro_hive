import { SecretsManager } from './manager/SecretsManager';
import { InMemoryVaultEngine } from './vault/VaultEngine';
import { ApiKeyProvider } from './providers/CredentialProvider';
import { ExecutionProxy } from './proxy/ExecutionProxy';
import { CredentialPolicy } from './models/Credential';

async function runSecretsTest() {
  console.log('--- Starting Secrets & Credential Runtime Verification ---');

  // 1. Setup Vault, Manager, and Providers
  const vault = new InMemoryVaultEngine();
  const manager = new SecretsManager(vault);
  const proxy = new ExecutionProxy(vault);

  manager.registerProvider(new ApiKeyProvider());

  // 2. Define Credential Policy (e.g. valid for 1 hour)
  const policy: CredentialPolicy = {
    maxTtlSeconds: 3600,
    renewable: true,
    allowedWorkspaces: ['ws-1'],
    allowedEnvironments: ['production'],
    rotationStrategy: 'Overlap'
  };

  // 3. Issue Credential
  // Important: Returns a Reference, NOT the raw secret
  console.log('\n[Workload] Requesting API Key...');
  const credentialRef = await manager.issueCredential(
    'ApiKey',
    'system-agent-1',
    'cerebro-internal',
    ['workflows:execute'],
    policy
  );

  console.log(`[SecretsManager] Issued Credential Lease: ${credentialRef.leaseId}`);
  console.log(`[SecretsManager] Vault Reference: ${credentialRef.vaultReference}`);
  // Note: We cannot print credentialRef.secretValue because it doesn't exist!

  // 4. Secure Execution
  // Workload wants to call an external API. It passes the Reference to the Proxy.
  console.log('\n[Workload] Executing API call via Proxy...');
  try {
    const response = await proxy.execute(credentialRef, {
      targetUrl: 'https://api.external.com/v1/data',
      method: 'GET'
    });
    console.log(`[External API] Response:`, response);
  } catch (err) {
    console.error('Execution Failed:', err);
  }

  // 5. Rotation
  console.log('\n[SecretsManager] Rotating credential (e.g. scheduled rotation)...');
  const newRef = await manager.rotateCredential(credentialRef.id);
  console.log(`[SecretsManager] New Lease Issued: ${newRef.leaseId}`);
  
  // 6. Secure Execution with Rotated Key
  console.log('\n[Workload] Executing API call with rotated Reference...');
  try {
    const rotatedResponse = await proxy.execute(newRef, {
      targetUrl: 'https://api.external.com/v1/data',
      method: 'GET'
    });
    console.log(`[External API] Response:`, rotatedResponse);
  } catch (err) {
    console.error('Execution Failed:', err);
  }
}

runSecretsTest().catch(console.error);
