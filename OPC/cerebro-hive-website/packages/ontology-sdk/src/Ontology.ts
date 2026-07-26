
export type EntityDomain = 'ORGANIZATION' | 'TECHNOLOGY' | 'BUSINESS';

export interface GraphMetadata {
  confidence: number;
  provenance: string;
  sourceType: 'DOCUMENT' | 'EPISODE' | 'WORKFLOW' | 'MARKETPLACE' | 'HUMAN';
  validFrom: string;
  validUntil?: string;
  version: number;
}

export interface GraphNode {
  id: string; // Globally unique resolved ID
  domain: EntityDomain;
  type: string; // e.g. 'Person', 'Agent', 'Project'
  properties: Record<string, any>;
  metadata: GraphMetadata;
}

export type RelationshipType = 
  | 'BELONGS_TO' 
  | 'OWNS' 
  | 'USES' 
  | 'DEPENDS_ON' 
  | 'GENERATES' 
  | 'APPROVED_BY';

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  metadata: GraphMetadata;
}
