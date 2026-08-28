import { VectorUpsertItemDto } from '../dto/vector-upsert.dto';

export const VECTOR_REPOSITORY = 'P03_VECTOR_REPOSITORY';

export interface VectorRepository {
  readNamespace(namespace: string): Promise<VectorUpsertItemDto[]>;
  replaceNamespace(namespace: string, vectors: VectorUpsertItemDto[]): Promise<void>;
}
