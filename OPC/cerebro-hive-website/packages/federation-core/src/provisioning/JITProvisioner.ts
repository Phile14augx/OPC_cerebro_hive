import {
  FederatedIdentity,
  HumanPrincipal,
  IdentityContext,
  IdentityRepository,
  Principal,
} from "@cerebro/identity-core";
import { ClaimsMapper, MappingProfile } from "../mapping/ClaimsMapper";
import { TrustCalculator } from "../mapping/TrustCalculator";
import { FederationProvider } from "../providers/FederationProvider";
import { IdentityResolver } from "./IdentityResolver";

export class JITProvisioner {
  constructor(
    private provider: FederationProvider,
    private mapper: ClaimsMapper,
    private trustCalculator: TrustCalculator,
    private resolver: IdentityResolver,
    private repo: IdentityRepository,
  ) {}

  /**
   * The complete Enterprise Federation pipeline.
   * Token -> Validation -> Extraction -> Mapping -> Resolution -> Provisioning -> Context
   */
  async authenticate(token: string, mappingProfile: MappingProfile): Promise<IdentityContext> {
    // 1. Token Validation
    const validationResult = await this.provider.validateToken(token);
    if (!validationResult.isValid) {
      throw new Error("Federation token validation failed.");
    }

    // 2. Claims Mapping
    const mappedClaims = this.mapper.map(validationResult.claims, mappingProfile);

    // 3. Trust Calculation
    const computedTrust = this.trustCalculator.calculateTrust(
      validationResult.federationContext,
      mappedClaims,
      validationResult.claims,
    );

    const fedIdentity: FederatedIdentity = {
      issuer: validationResult.federationContext.issuer,
      subject: validationResult.federationContext.subject,
      linkedAt: new Date(),
      lastAuthenticatedAt: validationResult.federationContext.authenticationTime,
      externalClaims: validationResult.claims,
    };

    // 4. Identity Resolution
    let principal = await this.resolver.resolve(fedIdentity);

    // 5. Provisioning (JIT)
    if (!principal) {
      // Create new principal
      const newPrincipalData: Omit<HumanPrincipal, "id"> = {
        type: "Human",
        status: "Active",
        displayName:
          (validationResult.claims.name as string) || (validationResult.claims.email as string) || "Unknown User",
        trustLevel: computedTrust,
        metadata: {
          authenticationSource: this.provider.providerType(),
          issuer: this.provider.providerId(),
        },
        federatedIdentities: [fedIdentity],
        email: validationResult.claims.email as string,
      };

      principal = await this.repo.createPrincipal(newPrincipalData);
    } else {
      // Update existing principal with new trust level and claims if necessary
      await this.repo.updatePrincipalTrust(principal.id, computedTrust);
      await this.repo.updatePrincipalClaims(principal.id, mappedClaims);
      // Fetch the updated principal
      principal = (await this.repo.findPrincipalById(principal.id)) as Principal;
    }

    // 6. Identity Context Assembly
    return {
      currentPrincipal: principal,
      originalPrincipal: principal,
      delegationChain: [],
      tenancy: { organizationId: "default" }, // Would also be mapped in reality
      federation: validationResult.federationContext,
      claims: mappedClaims,
      correlationId: `txn-${Date.now()}`,
    };
  }
}
