export enum ServiceHierarchyLevel {
  Enterprise = 'Enterprise',
  BusinessDomain = 'BusinessDomain',
  BusinessCapability = 'BusinessCapability',
  BusinessProcess = 'BusinessProcess',
  BusinessService = 'BusinessService',
  TechnicalService = 'TechnicalService'
}

export interface ServiceCatalogEntry {
  catalogId: string;
  ciId: string; // Link back to the core ConfigurationItem
  hierarchyLevel: ServiceHierarchyLevel;
  parentCatalogId?: string; // Defines the tree structure
}
