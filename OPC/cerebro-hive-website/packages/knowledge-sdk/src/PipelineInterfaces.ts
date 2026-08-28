
export interface Document { id: string; rawContent: string; metadata: Record<string, unknown>; }
export interface Chunk { id: string; docId: string; content: string; embedding?: number[]; entities: string[]; }

export interface DocumentParser { parse(buffer: Buffer): Promise<Document>; }
export interface DocumentNormalizer { normalize(doc: Document): Document; }
export interface ChunkStrategy { chunk(doc: Document): Chunk[]; }
export interface MetadataExtractor { extract(chunk: Chunk): Record<string, unknown>; }
export interface EntityExtractor { extractEntities(chunk: Chunk): string[]; }
export interface EmbeddingProvider { embed(text: string): Promise<number[]>; }
export interface VectorStore { upsert(chunks: Chunk[]): Promise<void>; search(vector: number[], topK: number): Promise<Chunk[]>; }
export interface Retriever { retrieve(query: string): Promise<Chunk[]>; }
export interface ReRanker { rerank(query: string, chunks: Chunk[]): Promise<Chunk[]>; }
export interface CitationService { generateCitation(chunk: Chunk): string; }
