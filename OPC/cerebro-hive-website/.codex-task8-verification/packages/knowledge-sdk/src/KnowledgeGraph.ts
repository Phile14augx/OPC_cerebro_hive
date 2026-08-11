
export interface GraphEntity { id: string; label: string; properties: Record<string, any>; }
export interface GraphRelationship { source: string; target: string; type: string; weight: number; }

export interface KnowledgeGraph {
  addEntity(entity: GraphEntity): Promise<void>;
  addRelationship(rel: GraphRelationship): Promise<void>;
  traverse(startId: string, depth: number): Promise<{ entities: GraphEntity[], edges: GraphRelationship[] }>;
}
