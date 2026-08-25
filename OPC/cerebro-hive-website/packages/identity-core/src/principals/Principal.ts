export type PrincipalType = 'Human' | 'Service' | 'Robot' | 'ApiKey' | 'OAuthClient' | 'ExternalIdentity' | 'Anonymous' | 'Guest' | 'Federated' | 'System';
export type PrincipalStatus = 'Active' | 'Disabled' | 'Suspended' | 'Deleted' | 'Expired' | 'Rotated';

export interface Principal {
  id: string;
  type: PrincipalType;
  status: PrincipalStatus;
  trustLevel: number; // 1-100
  displayName: string;
  metadata: Record<string, unknown>;
  federatedIdentities?: FederatedIdentity[];
}

export interface FederatedIdentity {
  issuer: string;
  subject: string;
  linkedAt: Date;
  lastAuthenticatedAt: Date;
  externalClaims: Record<string, unknown>;
}

export interface HumanPrincipal extends Principal {
  type: 'Human';
  email: string;
}

export interface ServicePrincipal extends Principal {
  type: 'Service';
  serviceName: string;
}

export interface RobotPrincipal extends Principal {
  type: 'Robot';
  agentId: string;
}

export interface ApiKeyPrincipal extends Principal {
  type: 'ApiKey';
  keyPrefix: string;
}
