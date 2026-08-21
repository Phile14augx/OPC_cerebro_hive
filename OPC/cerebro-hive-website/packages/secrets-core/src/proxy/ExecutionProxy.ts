import { CredentialReference } from '../models/Credential';
import { VaultEngine } from '../vault/VaultEngine';

export interface ExecutionProxyConfig {
  targetUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
}

export class ExecutionProxy {
  constructor(private vault: VaultEngine) {}

  /**
   * Executes a network request by dynamically injecting the secret from the Vault
   * based on the provided CredentialReference.
   * The caller NEVER sees the secret value.
   */
  async execute(credentialRef: CredentialReference, config: ExecutionProxyConfig): Promise<unknown> {
    // 1. Audit check
    // Ensure the lease is still valid
    if (new Date() > credentialRef.expiresAt) {
      throw new Error(`Credential lease ${credentialRef.leaseId} has expired.`);
    }

    // 2. Fetch Secret from Vault (internal process, not returned to caller)
    const secretValue = await this.vault.retrieveSecret(credentialRef.vaultReference);
    
    if (!secretValue) {
      throw new Error(`Vault secret not found for reference: ${credentialRef.vaultReference}`);
    }

    // 3. Inject Secret (Example: Bearer token format)
    const injectedHeaders = {
      ...config.headers,
      'Authorization': `Bearer ${secretValue}`
    };

    console.log(`[ExecutionProxy] Proxying ${config.method} request to ${config.targetUrl}`);
    console.log(`[ExecutionProxy] Injected secret from vault reference: ${credentialRef.vaultReference}`);
    
    // Simulate HTTP Request
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          status: 200,
          data: { success: true, message: 'Authenticated successfully with injected secret' }
        });
      }, 50);
    });
  }
}
