export interface VectorRecord {
  id: string;
  values: number[];
  sparse_values?: { indices: number[]; values: number[] };
  metadata?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface SearchOptions {
  query_vector: number[];
  query_text?: string;
  top_k: number;
  filter?: Record<string, any>;
  fusion_strategy?: 'RRF' | string;
  include_metadata?: boolean;
}

export interface AnnIndex {
  upsert(namespace: string, vectors: VectorRecord[]): Promise<number>;
  search(namespace: string, options: SearchOptions): Promise<SearchResult[]>;
}

export interface VectorStore {
  getIndex(name: string): AnnIndex;
}
