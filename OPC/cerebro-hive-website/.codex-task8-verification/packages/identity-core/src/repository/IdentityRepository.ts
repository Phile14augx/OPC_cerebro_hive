import { Principal, FederatedIdentity } from '../principals/Principal';
import { IdentityClaims } from '../context/IdentityContext';

export interface IdentityRepository {
  findPrincipalById(id: string): Promise<Principal | undefined>;
  findPrincipalByFederatedIdentity(issuer: string, subject: string): Promise<Principal | undefined>;
  
  createPrincipal(principal: Omit<Principal, 'id'>): Promise<Principal>;
  updatePrincipalClaims(principalId: string, claims: Partial<IdentityClaims>): Promise<void>;
  updatePrincipalTrust(principalId: string, trustLevel: number): Promise<void>;
  
  linkFederatedIdentity(principalId: string, identity: FederatedIdentity): Promise<void>;
  deactivatePrincipal(principalId: string): Promise<void>;
}
