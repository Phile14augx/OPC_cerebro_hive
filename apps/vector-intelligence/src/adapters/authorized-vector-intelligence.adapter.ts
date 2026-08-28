import { VectorUpsertDto, VectorUpsertItemDto } from '../dto/vector-upsert.dto';
import { AccessContext, AuthorizationPort, DependencyTimeoutError } from '../ports/authorization.port';
import { VectorStoreService } from '../services/vector-store.service';

export class AuthorizedVectorIntelligenceAdapter {
  constructor(
    private readonly vectors: VectorStoreService,
    private readonly authorization: AuthorizationPort,
    private readonly timeoutMs = 5000,
  ) {}

  private async authorize(context: AccessContext, action: 'read' | 'write', namespace: string): Promise<void> {
    let timer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        this.authorization.authorize(context, { action, namespace }),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new DependencyTimeoutError('authorization dependency')), this.timeoutMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async upsert(context: AccessContext, dto: VectorUpsertDto): Promise<{ upserted_count: number }> {
    await this.authorize(context, 'write', dto.namespace);
    return this.vectors.upsert(dto);
  }

  async query(context: AccessContext, namespace: string, vector: number[], topK: number, filter?: Record<string, unknown>) {
    await this.authorize(context, 'read', namespace);
    const results = await this.vectors.query(namespace, vector, topK, filter);
    return results.filter((result) => {
      const groups = result.metadata?.acl_groups;
      return !Array.isArray(groups) || groups.some((group: unknown) => typeof group === 'string' && context.aclGroups.includes(group));
    });
  }

  async delete(context: AccessContext, namespace: string, ids: string[]) {
    await this.authorize(context, 'write', namespace);
    return this.vectors.delete(namespace, ids);
  }

  async getAll(context: AccessContext, namespace: string): Promise<VectorUpsertItemDto[]> {
    await this.authorize(context, 'read', namespace);
    const items = await this.vectors.getAll(namespace);
    return items.filter((item) => {
      const groups = item.metadata?.acl_groups;
      return !Array.isArray(groups) || groups.some((group: unknown) => typeof group === 'string' && context.aclGroups.includes(group));
    });
  }
}
