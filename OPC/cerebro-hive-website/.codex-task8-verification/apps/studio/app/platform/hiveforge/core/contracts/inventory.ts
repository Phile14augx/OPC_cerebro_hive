/**
 * Multi-Cloud Inventory Contracts
 */

export interface ResourceTags {
  [key: string]: string;
}

export interface InventoryResource {
  identifier: string;      // UUID
  name: string;
  providerId: string;      // e.g. aws.rds
  region: string;
  ownerId: string;         // Hierarchy owner (e.g., Workspace ID)
  lifecycleState: string;  // ResourceState
  health: string;          // ResourceHealth
  costEstimation: number;
  tags: ResourceTags;
}
