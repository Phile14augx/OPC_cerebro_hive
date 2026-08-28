import { VectorUpsertItemDto } from '../dto/vector-upsert.dto';
import { VectorRepository } from '../ports/vector-repository.port';

function clone(items: VectorUpsertItemDto[]): VectorUpsertItemDto[] {
  return structuredClone(items);
}

export class InMemoryVectorRepository implements VectorRepository {
  private readonly namespaces = new Map<string, VectorUpsertItemDto[]>();

  async readNamespace(namespace: string): Promise<VectorUpsertItemDto[]> {
    return clone(this.namespaces.get(namespace) ?? []);
  }

  async replaceNamespace(namespace: string, vectors: VectorUpsertItemDto[]): Promise<void> {
    this.namespaces.set(namespace, clone(vectors));
  }
}
