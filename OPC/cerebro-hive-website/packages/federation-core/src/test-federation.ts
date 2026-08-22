import { JITProvisioner } from './provisioning/JITProvisioner';
import { IdentityResolver } from './provisioning/IdentityResolver';
import { ClaimsMapper, MappingProfile } from './mapping/ClaimsMapper';
import { TrustCalculator } from './mapping/TrustCalculator';
import { MockOidcProvider } from './providers/FederationProvider';
import { IdentityRepository, Principal, FederatedIdentity, IdentityClaims } from '@cerebro/identity-core';

class MockIdentityRepo implements IdentityRepository {
  private principals = new Map<string, Principal>();

  async findPrincipalById(id: string): Promise<Principal | undefined> {
    return this.principals.get(id);
  }

  async findPrincipalByFederatedIdentity(issuer: string, subject: string): Promise<Principal | undefined> {
    for (const p of this.principals.values()) {
      if (p.federatedIdentities) {
        for (const f of p.federatedIdentities) {
          if (f.issuer === issuer && f.subject === subject) {
            return p;
          }
        }
      }
    }
    return undefined;
  }

  async createPrincipal(principal: Omit<Principal, 'id'>): Promise<Principal> {
    const id = `user-${Date.now()}`;
    const newPrincipal: Principal = { ...principal, id };
    this.principals.set(id, newPrincipal);
    return newPrincipal;
  }

  async updatePrincipalClaims(principalId: string, claims: Partial<IdentityClaims>): Promise<void> {
    const p = this.principals.get(principalId);
    if (p) {
      p.metadata = { ...p.metadata, claims }; // In reality claims might be a dedicated property or part of metadata
    }
  }

  async updatePrincipalTrust(principalId: string, trustLevel: number): Promise<void> {
    const p = this.principals.get(principalId);
    if (p) {
      p.trustLevel = trustLevel;
    }
  }

  async linkFederatedIdentity(_principalId: string, _identity: FederatedIdentity): Promise<void> {}
  async deactivatePrincipal(_principalId: string): Promise<void> {}
}

async function runFederationTest() {
  console.log('--- Starting Enterprise Federation Pipeline ---');

  // 1. Setup
  const repo = new MockIdentityRepo();
  const provider = new MockOidcProvider('azure-ad', 'https://sts.windows.net/azure-ad/');
  const mapper = new ClaimsMapper();
  const trustCalculator = new TrustCalculator();
  const resolver = new IdentityResolver(repo);
  
  const provisioner = new JITProvisioner(
    provider,
    mapper,
    trustCalculator,
    resolver,
    repo
  );

  // 2. Define Mapping Profile
  const profile: MappingProfile = {
    id: 'profile-azure-1',
    issuer: 'azure-ad',
    rules: [
      { sourceClaim: 'given_name', operation: 'copy', targetClaim: 'displayName' },
      { sourceClaim: 'email', operation: 'copy', targetClaim: 'email' },
      { 
        sourceClaim: 'groups', 
        operation: 'map', 
        targetClaim: 'department', 
        valueMap: { 'azure-group-eng': 'Engineering', 'azure-group-hr': 'HR' }
      }
    ]
  };

  // 3. Mock OIDC Token from Azure AD
  const mockAzureToken = JSON.stringify({
    sub: 'azure-user-789',
    email: 'alice@enterprise.com',
    given_name: 'Alice',
    groups: ['azure-group-eng', 'azure-group-all-hands'],
    acr: 'mfa' // High assurance
  });

  console.log('\n[IdP] User authenticates via Azure AD');
  
  // 4. Run Pipeline (Login 1: JIT Creation)
  console.log('\n[Federation] Processing first login (JIT Provisioning)...');
  const ctx1 = await provisioner.authenticate(mockAzureToken, profile);
  
  console.log(`Resolved Principal ID: ${ctx1.currentPrincipal.id}`);
  console.log(`Display Name: ${ctx1.currentPrincipal.displayName}`);
  console.log(`Computed Trust Level: ${ctx1.currentPrincipal.trustLevel}`);
  console.log(`Mapped Claims:`, ctx1.claims);
  console.log(`Federation Context Issuer: ${ctx1.federation?.issuer}`);

  // 5. Run Pipeline (Login 2: Resolving Existing)
  console.log('\n[Federation] Processing second login (Resolution)...');
  const ctx2 = await provisioner.authenticate(mockAzureToken, profile);
  console.log(`Resolved Principal ID: ${ctx2.currentPrincipal.id} (Should match above)`);
  console.log(`Federated Identities count: ${ctx2.currentPrincipal.federatedIdentities?.length}`);
}

runFederationTest().catch(console.error);
