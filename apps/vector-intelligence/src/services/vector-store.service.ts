import { Inject, Injectable, Optional } from '@nestjs/common';
import { VectorUpsertDto, VectorUpsertItemDto } from '../dto/vector-upsert.dto';
import { InputValidationError, validateId, validateLimit, validateNamespace, validateVector } from '../validation';
import { InMemoryVectorRepository } from '../adapters/in-memory-vector.repository';
import { VECTOR_REPOSITORY, VectorRepository } from '../ports/vector-repository.port';

export interface IVectorStoreService {
  upsert(dto: VectorUpsertDto): Promise<{ upserted_count: number }>;
  query(namespace: string, vector: number[], topK: number, filter?: any): Promise<any[]>;
  delete(namespace: string, ids: string[]): Promise<{ deleted_count: number }>;
  getAll(namespace: string): Promise<VectorUpsertItemDto[]>;
}

@Injectable()
export class VectorStoreService implements IVectorStoreService {
  private readonly repository: VectorRepository;

  constructor(@Optional() @Inject(VECTOR_REPOSITORY) repository?: VectorRepository) {
    this.repository = repository ?? new InMemoryVectorRepository();
  }

  async upsert(dto: VectorUpsertDto): Promise<{ upserted_count: number }> {
    validateNamespace(dto.namespace);
    if (!Array.isArray(dto.vectors) || dto.vectors.length === 0) {
      throw new InputValidationError('vectors must be a non-empty array');
    }
    const dimension = dto.vectors[0]?.values.length;
    for (const vector of dto.vectors) {
      validateId(vector.id);
      validateVector(vector.values);
      if (vector.values.length !== dimension) {
        throw new InputValidationError('all vectors must have the same dimension');
      }
    }
    const persisted = await this.repository.readNamespace(dto.namespace);
    const existing = persisted[0];
    if (existing && existing.values.length !== dimension) {
      throw new InputValidationError('vector dimension does not match the namespace dimension');
    }
    const next = new Map(persisted.map((vector) => [vector.id, vector]));
    dto.vectors.forEach((vector) => next.set(vector.id, structuredClone(vector)));
    await this.repository.replaceNamespace(dto.namespace, Array.from(next.values()));
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
    validateNamespace(namespace);
    validateVector(vector, 'query vector');
    validateLimit(topK, 'topK');
    const persisted = await this.repository.readNamespace(namespace);
    const results: any[] = [];
    
    for (const item of persisted) {
      if (item.values.length !== vector.length) {
        throw new InputValidationError('query vector dimension does not match persisted vectors');
      }
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

    results.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    return results.slice(0, topK);
  }

  async delete(namespace: string, ids: string[]): Promise<{ deleted_count: number }> {
    validateNamespace(namespace);
    if (!Array.isArray(ids) || ids.length === 0) throw new InputValidationError('ids must be a non-empty array');
    ids.forEach((id) => validateId(id));
    const persisted = await this.repository.readNamespace(namespace);
    const idsToDelete = new Set(ids);
    let deleted_count = 0;
    persisted.forEach((item) => { if (idsToDelete.has(item.id)) deleted_count++; });
    await this.repository.replaceNamespace(namespace, persisted.filter((item) => !idsToDelete.has(item.id)));
    return { deleted_count };
  }

  async getAll(namespace: string): Promise<VectorUpsertItemDto[]> {
    validateNamespace(namespace);
    return this.repository.readNamespace(namespace);
  }
}
