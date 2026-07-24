import { Credential, CredentialReference, CredentialType, CredentialPolicy } from '../models/Credential';
import { VaultEngine } from '../vault/VaultEngine';
import { CredentialProvider } from '../providers/CredentialProvider';

export class SecretsManager {
  private providers = new Map<CredentialType, CredentialProvider>();
  private activeCredentials = new Map<string, Credential>();

  constructor(private vault: VaultEngine) {}

  registerProvider(provider: CredentialProvider) {
    this.providers.set(provider.getType(), provider);
  }

  async issueCredential(
    type: CredentialType,
    ownerId: string,
    issuer: string,
    scopes: string[],
    policy: CredentialPolicy
  ): Promise<CredentialReference> {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`No credential provider registered for type: ${type}`);
    }

    // 1. Issue Material
    const { value, expiresAt } = await provider.issue(policy);
    
    const credId = `cred-${Date.now()}`;
    const vaultRef = `vault://cerebro/${ownerId}/${credId}`;
    const version = 1;

    // 2. Store Material in Vault securely
    await this.vault.storeSecret(vaultRef, value, version);

    // 3. Create Metadata record
    const credential: Credential = {
      id: credId,
      type,
      status: 'Active',
      ownerId,
      issuer,
      policy,
      scopes,
      createdAt: new Date(),
      expiresAt,
      rotationVersion: version,
      vaultReference: vaultRef
    };

    this.activeCredentials.set(credId, credential);

    // 4. Return Reference (NO SECRET VALUE)
    const leaseId = `lease-${Date.now()}`;
    return {
      id: credId,
      leaseId,
      type,
      scopes,
      vaultReference: vaultRef,
      expiresAt
    };
  }

  async rotateCredential(credentialId: string): Promise<CredentialReference> {
    const credential = this.activeCredentials.get(credentialId);
    if (!credential) throw new Error('Credential not found');

    const provider = this.providers.get(credential.type);
    if (!provider) throw new Error('Provider not found');

    // Issue new version
    const { value, expiresAt } = await provider.issue(credential.policy);
    
    // Increment version
    credential.rotationVersion += 1;
    credential.lastRotated = new Date();
    credential.expiresAt = expiresAt;

    // Store new version in Vault
    await this.vault.storeSecret(credential.vaultReference, value, credential.rotationVersion);

    // In a real implementation with overlapping validity, we wouldn't immediately destroy v1.
    // We would schedule a background job to revoke v1 after a grace period.

    const leaseId = `lease-${Date.now()}`;
    return {
      id: credential.id,
      leaseId,
      type: credential.type,
      scopes: credential.scopes,
      vaultReference: credential.vaultReference,
      expiresAt
    };
  }
}
