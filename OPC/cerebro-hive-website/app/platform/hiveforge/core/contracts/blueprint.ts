/**
 * Blueprint Contracts
 */

export interface BlueprintIdentity {
  id: string;
  version: string;
  name: string;
  description: string;
}

export interface BlueprintValidationResult {
  step: "Schema Validation" | "Dependency Resolution" | "Policy Validation" | "Permission Validation" | "Quota Validation" | "Provider Compatibility" | "Cost Estimation" | "Security Checks";
  passed: boolean;
  details?: string;
}

export interface ExecutionPlan {
  blueprintId: string;
  providerId: string;
  estimatedCost: number;
  currency: string;
  resourcesToCreate: string[];
  validations: BlueprintValidationResult[];
  isDeployable: boolean;
}

export interface BlueprintContract {
  identity: BlueprintIdentity;
  requiredCapabilities: string[]; // hierarchical dot notation e.g., 'databases.backups.pitr'
  dependencies: { blueprintId: string; version: string }[];
  schema: unknown; // JSON schema for the blueprint spec
  execute(plan: ExecutionPlan): Promise<string>; // returns resource ID
}
