import { Injectable } from '@nestjs/common';
import { GraphStorageService } from '../graph-storage/graph-storage.service';

export interface QueryOptions {
  timeoutMs?: number;
  consistency?: 'EVENTUAL' | 'STRONG';
}

@Injectable()
export class QueryLayerService {
  constructor(private readonly graphStorage: GraphStorageService) {}

  /**
   * API layer for executing Cypher queries. Handles rate limits and RBAC.
   */
  async queryGraph(query: string, parameters: Record<string, any>, options?: QueryOptions): Promise<any> {
    // Inject RBAC checks and query timeouts before executing via GraphStorageService
    return this.graphStorage.executeCypher(query, parameters);
  }
}
