import { FederationContext, IdentityClaims } from '@cerebro/identity-core';

export class TrustCalculator {
  /**
   * Calculates a Trust Score (1-100) based on authentication metadata, external claims, and mapping.
   */
  calculateTrust(
    federationContext: FederationContext,
    mappedClaims: IdentityClaims,
    externalClaims: Record<string, unknown>
  ): number {
    let score = 50; // Baseline

    // 1. Assurance Level
    if (federationContext.assuranceLevel === 'High') {
      score += 20; // e.g. MFA was used
    } else if (federationContext.assuranceLevel === 'Low') {
      score -= 20;
    }

    // 2. Auth Method
    if (federationContext.authenticationMethod === 'mTLS') {
      score += 10;
    }

    // 3. Optional: Organization specific external claims mapping
    // E.g. If they are in the 'Domain Admins' group externally, they are heavily trusted.
    if (Array.isArray(externalClaims.groups) && externalClaims.groups.includes('Domain Admins')) {
      score += 15;
    }

    // Cap at 100
    return Math.min(Math.max(score, 1), 100);
  }
}
