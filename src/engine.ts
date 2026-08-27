import { Injectable, Inject } from '@nestjs/common';
import { AnnIndex, SearchOptions, SearchResult, VectorRecord, VectorStore } from './interfaces';

@Injectable()
export class HybridRetrievalEngine {
  constructor(@Inject('VectorStore') private readonly vectorStore: VectorStore) {}

  async search(namespace: string, options: SearchOptions): Promise<SearchResult[]> {
    const index = this.vectorStore.getIndex(namespace);
    return await index.search(namespace, options);
  }

  async upsert(namespace: string, vectors: VectorRecord[]): Promise<number> {
    const index = this.vectorStore.getIndex(namespace);
    return await index.upsert(namespace, vectors);
  }
}
