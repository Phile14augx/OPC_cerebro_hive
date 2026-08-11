import { Principal } from '../principals/Principal';
import { TenancyScope, ExecutionLocation } from '../tenancy/Tenancy';
import { Session } from '../sessions/Session';

export interface IdentityClaims {
  department?: string;
  costCenter?: string;
  country?: string;
  legalEntity?: string;
  complianceZone?: string;
  businessUnit?: string;
  employmentStatus?: string;
  dataResidency?: string;
}

export interface DelegationEntry {
  principalId: string;
  principalType: string;
  delegationReason: string;
  issuedAt: Date;
  expiresAt: Date;
  signature: string;
  trustLevel: number;
}

export interface FederationContext {
  issuer: string;
  subject: string;
  sessionId: string;
  authenticationMethod: string;
  authenticationTime: Date;
  tokenId: string;
  issuerMetadata?: Record<string, any>;
  assuranceLevel: 'Low' | 'Medium' | 'High';
}

export interface IdentityContext {
  currentPrincipal: Principal;
  originalPrincipal: Principal;
  delegationChain: DelegationEntry[];
  
  session?: Session;
  tenancy: TenancyScope;
  location?: ExecutionLocation;
  federation?: FederationContext;
  
  claims: IdentityClaims;
  correlationId: string;
}
