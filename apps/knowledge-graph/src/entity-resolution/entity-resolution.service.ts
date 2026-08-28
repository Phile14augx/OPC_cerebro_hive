import { Injectable } from '@nestjs/common';
import { GraphStorageService } from '../graph-storage/graph-storage.service';

export type MergeStrategy = 'PRESERVE_TARGET_PROPERTIES' | 'MERGE_PROPERTIES';

@Injectable()
export class EntityResolutionService {
  constructor(private readonly graphStorage: GraphStorageService) {}

  async mergeEntities(sourceNodeId: string, targetNodeId: string, strategy: MergeStrategy): Promise<boolean> {
    const sourceNode = await this.graphStorage.getNode(sourceNodeId);
    const targetNode = await this.graphStorage.getNode(targetNodeId);
    if (!sourceNode || !targetNode) return false;
    
    if (strategy === 'MERGE_PROPERTIES') {
      targetNode.properties = { ...sourceNode.properties, ...targetNode.properties };
      await this.graphStorage.insertNode(targetNode);
    }
    return true;
  }
}