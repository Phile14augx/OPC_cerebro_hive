import { IdempotencyRecord } from '@prisma/client';
import { BaseRepository, IRepositoryOptions } from './BaseRepository';

export interface CreateIdempotencyRecordInput {
  operation: string;
  requestHash: string;
}

export class IdempotencyRepository extends BaseRepository {
  async findRecord(requestHash: string, options: IRepositoryOptions): Promise<IdempotencyRecord | null> {
    const db = this.getClient(options);
    const { tenantId } = this.tenantFilter(options.context);

    return db.idempotencyRecord.findUnique({
      where: {
        tenantId_requestHash: {
          tenantId,
          requestHash,
        }
      }
    });
  }

  async createRecord(input: CreateIdempotencyRecordInput, options: IRepositoryOptions): Promise<IdempotencyRecord> {
    const db = this.getClient(options);
    const { tenantId } = this.tenantFilter(options.context);
    const workspaceId = options.context.workspaceId;

    return db.idempotencyRecord.create({
      data: {
        tenantId,
        workspaceId,
        operation: input.operation,
        requestHash: input.requestHash,
      }
    });
  }
}
