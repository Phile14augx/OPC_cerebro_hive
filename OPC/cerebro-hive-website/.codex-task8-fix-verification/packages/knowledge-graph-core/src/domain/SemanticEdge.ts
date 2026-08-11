import { Provenance } from './Provenance';

export interface SemanticEdge {
  id: string; // Typically sourceId_type_targetId
  sourceId: string;
  targetId: string;
  
  relationshipType: string; // The primary Ontology relationship e.g., 'DEPENDS_ON', 'GOVERNS'
  
  weight: number; // 0.0 to 1.0, useful for shortest path or criticality calculations
  
  // Temporal Validity
  validFrom: Date;
  validUntil?: Date; // If undefined, currently active
  
  provenance: Provenance;
}
