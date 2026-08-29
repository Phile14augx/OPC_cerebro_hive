import { Injectable } from '@nestjs/common';
import { AnnIndex, SearchOptions, SearchResult, VectorRecord, VectorStore } from './interfaces';

@Injectable()
export class MockAnnIndex implements AnnIndex {
  async upsert(namespace: string, vectors: VectorRecord[]): Promise<number> {
    return vectors.length;
  }
  async search(namespace: string, options: SearchOptions): Promise<SearchResult[]> {
    return [];
  }
}

@Injectable()
export class PrismaVectorStore implements VectorStore {
  constructor(private readonly mockIndex: MockAnnIndex) {}
  getIndex(name: string): AnnIndex {
    return this.mockIndex;
  }
}
