import { PrismaClient } from '../generated/client';
import { ExecutionOutbox, OutboxMessage } from '@cerebro/runtime-core/src/execution/ExecutionOutbox';

export class PrismaExecutionOutbox implements ExecutionOutbox {
  constructor(private readonly prisma: PrismaClient) {}

  async publish(executionId: string, type: string, payload: Record<string, unknown>): Promise<void> {
    await this.prisma.agentExecutionOutbox.create({
      data: {
        executionId,
        type,
        payload: payload as any,
        status: 'PENDING'
      }
    });
  }

  async fetchPending(limit: number = 50): Promise<OutboxMessage[]> {
    const pending = await this.prisma.agentExecutionOutbox.findMany({
      where: {
        status: 'PENDING',
        OR: [
          { nextRetryAt: null },
          { nextRetryAt: { lte: new Date() } }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'asc' }
    });

    return pending.map(p => ({
      id: p.id,
      executionId: p.executionId,
      type: p.type,
      payload: p.payload as Record<string, unknown>,
      status: p.status as any,
      retries: p.retries,
      nextRetryAt: p.nextRetryAt ?? undefined
    }));
  }

  async markSent(messageId: string): Promise<void> {
    await this.prisma.agentExecutionOutbox.update({
      where: { id: messageId },
      data: { status: 'SENT' }
    });
  }

  async markFailed(messageId: string, error: string, scheduleRetryAt?: Date): Promise<void> {
    const item = await this.prisma.agentExecutionOutbox.findUnique({ where: { id: messageId } });
    if (!item) return;

    const retries = item.retries + 1;
    const nextRetryAt = scheduleRetryAt || new Date(Date.now() + Math.min(Math.pow(2, retries) * 1000, 60000));

    await this.prisma.agentExecutionOutbox.update({
      where: { id: messageId },
      data: {
        status: retries >= 5 ? 'FAILED' : 'PENDING',
        retries,
        nextRetryAt
      }
    });
  }
}
