export interface Entitlement {
  id: string;
  name: string; // e.g., "Finance Administrator"
  description: string;
  
  // What this entitlement grants
  roles: string[];
  policyBundles: string[];
  credentialPolicies: string[];
  
  // Governance controls
  requiresApproval: boolean;
  maxDurationSeconds?: number; // If set, this is a JIT/Temporary entitlement
  allowedPrincipals: string[]; // e.g., 'department:finance'
  
  // Risk and Compliance
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  owners: string[];
}
