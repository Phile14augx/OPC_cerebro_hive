import { Injectable } from '@nestjs/common';
import { GraphStorageService } from '../graph-storage/graph-storage.service';

export interface QueryOptions {
  timeoutMs?: number;
  consistency?: 'EVENTUAL' | 'STRONG';
}

@Injectable()
export class QueryLayerService {
  constructor(private readonly graphStorage: GraphStorageService) {}

  async queryGraph(query: string, parameters: Record<string, any>, options?: QueryOptions): Promise<any> {
    const timeout = options?.timeoutMs || 1000;
    return this.graphStorage.executeCypher(query, parameters);
  }
}