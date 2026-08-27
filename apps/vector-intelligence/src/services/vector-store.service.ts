import { Injectable } from '@nestjs/common';
import { VectorUpsertDto } from '../dto/vector-upsert.dto';

export interface IVectorStoreService {
  upsert(dto: VectorUpsertDto): Promise<{ upserted_count: number }>;
  query(namespace: string, vector: number[], topK: number, filter?: any): Promise<any[]>;
  delete(namespace: string, ids: string[]): Promise<{ deleted_count: number }>;
}

@Injectable()
export class VectorStoreService implements IVectorStoreService {
  async upsert(dto: VectorUpsertDto): Promise<{ upserted_count: number }> {
    // Stub implementation compatible with pgvector
    return { upserted_count: dto.vectors.length };
  }

  async query(namespace: string, vector: number[], topK: number, filter?: any): Promise<any[]> {
    // Stub implementation
    return [];
  }

  async delete(namespace: string, ids: string[]): Promise<{ deleted_count: number }> {
    // Stub implementation
    return { deleted_count: ids.length };
  }
}
