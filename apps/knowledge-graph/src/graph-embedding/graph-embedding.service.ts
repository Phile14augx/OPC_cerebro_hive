import { Injectable } from '@nestjs/common';
import { GraphStorageService } from '../graph-storage/graph-storage.service';

@Injectable()
export class GraphEmbeddingService {
  constructor(private readonly graphStorage: GraphStorageService) {}

  async generateAndStoreNodeEmbedding(nodeId: string): Promise<any> {
    const node = await this.graphStorage.getNode(nodeId);
    if (!node) throw new Error('Node not found');
    const vectorData = {
      namespace: "knowledge-graph",
      vectors: [
        {
          id: nodeId,
          values: [0.1, 0.2, 0.3],
          metadata: { source_id: nodeId }
        }
      ]
    };
    return vectorData;
  }
}