import { IdentityRepository, Principal, FederatedIdentity } from '@cerebro/identity-core';

export class IdentityResolver {
  constructor(private repo: IdentityRepository) {}

  /**
   * Resolves an incoming federated identity to a Principal.
   * If a principal does not exist, it signals that one needs to be created.
   * Also handles linking new federated identities to existing principals if an email/subject matches (simplified).
   */
  async resolve(federatedIdentity: FederatedIdentity): Promise<Principal | undefined> {
    // 1. Try to find an exact linked identity
    const existing = await this.repo.findPrincipalByFederatedIdentity(
      federatedIdentity.issuer,
      federatedIdentity.subject
    );

    if (existing) {
      // Identity is already known and linked.
      return existing;
    }

    // 2. Account Linking (e.g., matching by email in claims if this was a known trusted issuer)
    // Simplified for POC. In a real system, you'd have an account linking policy.
    
    return undefined; // Signals that a new Principal should be provisioned
  }
}
