import { Injectable } from '@nestjs/common';
import { VectorUpsertDto, VectorUpsertItemDto } from '../dto/vector-upsert.dto';

export interface IVectorStoreService {
  upsert(dto: VectorUpsertDto): Promise<{ upserted_count: number }>;
  query(namespace: string, vector: number[], topK: number, filter?: any): Promise<any[]>;
  delete(namespace: string, ids: string[]): Promise<{ deleted_count: number }>;
  getAll(namespace: string): Promise<VectorUpsertItemDto[]>;
}

@Injectable()
export class VectorStoreService implements IVectorStoreService {
  private store = new Map<string, Map<string, VectorUpsertItemDto>>();

  private getNamespaceStore(namespace: string): Map<string, VectorUpsertItemDto> {
    if (!this.store.has(namespace)) {
      this.store.set(namespace, new Map());
    }
    return this.store.get(namespace)!;
  }

  async upsert(dto: VectorUpsertDto): Promise<{ upserted_count: number }> {
    const nsStore = this.getNamespaceStore(dto.namespace);
    for (const vector of dto.vectors) {
      nsStore.set(vector.id, vector);
    }
    return { upserted_count: dto.vectors.length };
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async query(namespace: string, vector: number[], topK: number, filter?: any): Promise<any[]> {
    const nsStore = this.getNamespaceStore(namespace);
    const results: any[] = [];
    
    for (const item of nsStore.values()) {
      if (filter) {
        let match = true;
        for (const key of Object.keys(filter)) {
          if (!item.metadata || item.metadata[key] !== filter[key]) {
            match = false;
            break;
          }
        }
        if (!match) continue;
      }
      
      const score = this.cosineSimilarity(vector, item.values);
      results.push({
        id: item.id,
        score,
        metadata: item.metadata
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  async delete(namespace: string, ids: string[]): Promise<{ deleted_count: number }> {
    const nsStore = this.getNamespaceStore(namespace);
    let deleted_count = 0;
    for (const id of ids) {
      if (nsStore.delete(id)) {
        deleted_count++;
      }
    }
    return { deleted_count };
  }

  async getAll(namespace: string): Promise<VectorUpsertItemDto[]> {
    const nsStore = this.getNamespaceStore(namespace);
    return Array.from(nsStore.values());
  }
}
