/**
 * Resource State Machine & Health Model Contracts
 */

export type ResourceState = 
  | "Draft"
  | "Provisioning"
  | "Deploying"
  | "Running"
  | "Scaling"
  | "Updating"
  | "Suspended"
  | "Failed"
  | "Recovering"
  | "Deleting"
  | "Archived";

export type ResourceHealth = 
  | "Healthy"
  | "Warning"
  | "Critical"
  | "Unknown";

export interface ResourceStateTransition {
  from: ResourceState;
  to: ResourceState;
  timestamp: string;
  reason?: string;
  actorId?: string;
}

export interface ManagedResource {
  id: string;
  blueprintId: string;
  providerId: string;
  state: ResourceState;
  health: ResourceHealth;
  transitions: ResourceStateTransition[];
  spec: unknown;
  status: unknown;
}
