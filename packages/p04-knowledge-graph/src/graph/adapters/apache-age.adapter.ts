import { Injectable } from '@nestjs/common';
import { GraphStorageInterface } from '../interfaces/graph-storage.interface';

@Injectable()
export class ApacheAgeAdapter implements GraphStorageInterface {
  async executeQuery(query: string, parameters?: Record<string, any>): Promise<any> {
    console.log(query, parameters);
    return { results: [], metrics: { executionTimeMs: 0, nodesScanned: 0 } };
  }

  async mergeNodes(sourceNodeId: string, targetNodeId: string, strategy: string): Promise<any> {
    console.log(sourceNodeId, targetNodeId, strategy);
    return { success: true };
  }
}
