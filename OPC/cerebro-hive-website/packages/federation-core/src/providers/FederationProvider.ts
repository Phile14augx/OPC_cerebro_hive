import { FederationContext } from '@cerebro/identity-core';

export interface TokenValidationResult {
  isValid: boolean;
  claims: Record<string, unknown>;
  federationContext: FederationContext;
}

export interface FederationProvider {
  /**
   * The unique identifier for this provider (e.g., 'azure-ad-main')
   */
  providerId(): string;
  
  /**
   * Type of provider (oidc, saml, etc.)
   */
  providerType(): string;

  /**
   * Validates an external token (JWT, SAML Assertion) and extracts its claims
   */
  validateToken(token: string): Promise<TokenValidationResult>;
}

/**
 * Mock OIDC Provider for Phase 9.5
 */
export class MockOidcProvider implements FederationProvider {
  constructor(private id: string, private issuerUrl: string) {}

  providerId(): string {
    return this.id;
  }

  providerType(): string {
    return 'oidc';
  }

  async validateToken(token: string): Promise<TokenValidationResult> {
    // In reality, this would fetch JWKS and verify the JWT signature.
    // For this mock, we assume the token is a JSON string of claims.
    const claims = JSON.parse(token);

    if (!claims.sub) {
      throw new Error('Invalid token: missing subject (sub)');
    }

    return {
      isValid: true,
      claims,
      federationContext: {
        issuer: this.issuerUrl,
        subject: claims.sub,
        sessionId: `sess-${Date.now()}`,
        authenticationMethod: 'oidc',
        authenticationTime: new Date(),
        tokenId: `tok-${Date.now()}`,
        assuranceLevel: claims.acr === 'mfa' ? 'High' : 'Medium'
      }
    };
  }
}
