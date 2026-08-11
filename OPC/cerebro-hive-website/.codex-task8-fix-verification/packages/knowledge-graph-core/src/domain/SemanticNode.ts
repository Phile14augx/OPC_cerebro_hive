import { Provenance } from './Provenance';

export interface SemanticNode {
  id: string; // Globally unique immutable identifier
  kind: string; // The primary Ontology type e.g., 'ConfigurationItem', 'AIModel'
  
  labels: string[]; // Secondary tags e.g., ['MissionCritical', 'Regulated']
  
  properties: Record<string, any>; // Versioned properties
  
  version: number;
  
  provenance: Provenance;
}
