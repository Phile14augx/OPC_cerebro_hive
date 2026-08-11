import { CredentialPolicy, CredentialType } from '../models/Credential';

export interface IssueResult {
  value: string;
  expiresAt: Date;
}

export interface CredentialProvider {
  getType(): CredentialType;
  issue(policy: CredentialPolicy): Promise<IssueResult>;
  revoke(value: string): Promise<void>;
}

export class ApiKeyProvider implements CredentialProvider {
  getType(): CredentialType {
    return 'ApiKey';
  }

  async issue(policy: CredentialPolicy): Promise<IssueResult> {
    // Generate high-entropy API key
    const prefix = 'chv_'; // cerebro-hive vault
    const randomBuffer = crypto.getRandomValues(new Uint8Array(24));
    const randomHex = Array.from(randomBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const value = `${prefix}${randomHex}`;
    const expiresAt = new Date(Date.now() + policy.maxTtlSeconds * 1000);
    
    return { value, expiresAt };
  }

  async revoke(value: string): Promise<void> {
    // For API keys, revocation might just involve deleting from Vault (handled by Manager)
    // Or if integrated with a gateway, pushing a blocklist event.
  }
}
