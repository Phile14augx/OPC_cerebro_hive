export interface GraphStorageInterface {
  executeQuery(query: string, parameters?: Record<string, any>): Promise<any>;
  mergeNodes(sourceNodeId: string, targetNodeId: string, strategy: string): Promise<any>;
}
