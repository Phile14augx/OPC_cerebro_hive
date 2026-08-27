import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { IPolicyEvaluatedEvent } from '../interfaces/event-contracts.interface';

@Injectable()
export class ProvenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async createRecord(payload: any) {
    if (!payload.sourceProduct || !payload.eventType || !payload.subjectId) {
      throw new BadRequestException('Missing required fields: sourceProduct, eventType, subjectId');
    }

    const record = await this.prisma.provenanceRecord.create({
      data: {
        sourceProduct: payload.sourceProduct,
        eventType: payload.eventType,
        subjectId: payload.subjectId,
        payload: payload.payload || {},
        lawfulBasis: payload.lawfulBasis,
        epsilon: payload.epsilon,
        delta: payload.delta,
        policyRef: payload.policyRef,
        verdict: payload.verdict,
      },
    });

    this.emitEvent(record);

    return record;
  }

  private emitEvent(record: any) {
    // Emulate emitting event
    const event: IPolicyEvaluatedEvent = {
      eventId: record.id,
      timestamp: new Date().toISOString(),
      action: record.eventType,
      resourceId: record.subjectId,
      allowed: record.verdict === 'allow',
      violations: []
    };
  }
}
