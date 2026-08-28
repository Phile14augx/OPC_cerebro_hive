import { AuthorizedVectorIntelligenceAdapter } from './authorized-vector-intelligence.adapter';
import { AccessContext, AuthorizationError } from '../ports/authorization.port';
import { InputValidationError, validateId, validateNamespace, validateVector } from '../validation';

export interface P02EmbeddingBatch {
  producer: 'P02';
  namespace: string;
  embedding_model: string;
  dimensions: number;
  vectors: Array<{ id: string; embedding: number[]; payload?: Record<string, unknown> }>;
}

export class P02EmbeddingIngestionAdapter {
  constructor(private readonly vectorIntelligence: AuthorizedVectorIntelligenceAdapter) {}

  async ingest(context: AccessContext, batch: P02EmbeddingBatch): Promise<{ upserted_count: number }> {
    if (batch.producer !== 'P02') throw new AuthorizationError('Only the declared P02 producer may use this ingestion port');
    validateNamespace(batch.namespace);
    if (!batch.embedding_model?.trim()) throw new InputValidationError('embedding_model is required');
    if (!Number.isInteger(batch.dimensions) || batch.dimensions < 1) throw new InputValidationError('dimensions must be a positive integer');
    if (!Array.isArray(batch.vectors) || batch.vectors.length === 0) throw new InputValidationError('vectors must be non-empty');
    batch.vectors.forEach((vector) => {
      validateId(vector.id);
      validateVector(vector.embedding, 'P02 embedding');
      if (vector.embedding.length !== batch.dimensions) throw new InputValidationError('P02 embedding dimension does not match declared dimensions');
    });
    return this.vectorIntelligence.upsert(context, {
      namespace: batch.namespace,
      vectors: batch.vectors.map((vector) => ({ id: vector.id, values: vector.embedding, metadata: vector.payload })),
    });
  }
}
