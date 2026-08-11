export type CredentialType = 'ApiKey' | 'OAuth' | 'Certificate' | 'JwtSigningKey' | 'CloudCredential';
export type CredentialStatus = 'Active' | 'Revoked' | 'Expired' | 'Rotating';

export interface CredentialPolicy {
  maxTtlSeconds: number;
  renewable: boolean;
  allowedWorkspaces: string[];
  allowedEnvironments: string[];
  rotationStrategy: 'Overlap' | 'Immediate';
}

export interface Credential {
  id: string;
  type: CredentialType;
  status: CredentialStatus;
  ownerId: string;
  issuer: string;
  policy: CredentialPolicy;
  scopes: string[];
  
  createdAt: Date;
  expiresAt: Date;
  lastRotated?: Date;
  rotationVersion: number;
  
  vaultReference: string; // The pointer to the secret value in the VaultEngine
}

export interface CredentialReference {
  id: string;
  leaseId: string;
  type: CredentialType;
  scopes: string[];
  vaultReference: string;
  expiresAt: Date;
}
