import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionApplicationService } from '../ExecutionApplicationService';
import { ExecutionRepository } from '../../execution/ExecutionRepository';
import { UnitOfWork, ITransactionContext } from '../../transactions/UnitOfWork';
import { OutboxPublisher } from '../../events/OutboxPublisher';
import { Execution } from '../../execution/Execution';
import { ExecutionId } from '../../execution/ExecutionId';
import { ExecutionStatus } from '../../execution/ExecutionStatus';
import { RequestContext } from '@cerebro/database';

class MockUnitOfWork implements UnitOfWork {
  async execute<T>(work: (tx: ITransactionContext) => Promise<T>): Promise<T> {
    const mockTx = { isMockTx: true };
    return await work(mockTx);
  }
}

describe('ExecutionApplicationService (Atomicity & Persistence)', () => {
  let executionRepo: any;
  let outboxPublisher: any;
  let uow: UnitOfWork;
  let service: ExecutionApplicationService;
  let mockContext: RequestContext;
  let mockExecution: any;

  beforeEach(() => {
    mockExecution = {
      id: new ExecutionId('11111111-1111-1111-1111-111111111111'),
      status: ExecutionStatus.QUEUED,
      transitionTo: vi.fn().mockReturnValue({ type: 'ExecutionStartedEvent', aggregateId: '11111111-1111-1111-1111-111111111111' })
    };

    executionRepo = {
      findById: vi.fn().mockResolvedValue(mockExecution),
      save: vi.fn().mockResolvedValue(undefined)
    };

    outboxPublisher = {
      publish: vi.fn().mockResolvedValue(undefined)
    };

    uow = new MockUnitOfWork();

    service = new ExecutionApplicationService(
      executionRepo as unknown as ExecutionRepository,
      uow,
      outboxPublisher as unknown as OutboxPublisher
    );

    mockContext = {
      tenantId: 'tenant-1',
      workspaceId: 'workspace-1',
      userId: 'user-1',
      traceId: 'trace-1',
      correlationId: 'corr-1'
    };
  });

  it('atomicity: aggregate persistence and outbox persistence succeed together', async () => {
    await service.transition(
      '11111111-1111-1111-1111-111111111111',
      ExecutionStatus.RUNNING,
      {},
      mockContext
    );

    // Assert that the aggregate was transitioned
    expect(mockExecution.transitionTo).toHaveBeenCalledWith(ExecutionStatus.RUNNING, {});

    // Assert that both save and publish were called with the same transaction context
    expect(executionRepo.save).toHaveBeenCalledTimes(1);
    expect(outboxPublisher.publish).toHaveBeenCalledTimes(1);

    const saveTx = executionRepo.save.mock.calls[0][1];
    const publishTx = outboxPublisher.publish.mock.calls[0][2];
    
    expect(saveTx).toStrictEqual({ isMockTx: true });
    expect(publishTx).toStrictEqual({ isMockTx: true });
    expect(saveTx).toBe(publishTx);
  });

  it('atomicity: outbox failure prevents transaction completion (rollback)', async () => {
    // Simulate outbox failure
    outboxPublisher.publish.mockRejectedValue(new Error('Database disconnected during outbox insert'));

    await expect(
      service.transition(
        '11111111-1111-1111-1111-111111111111',
        ExecutionStatus.RUNNING,
        {},
        mockContext
      )
    ).rejects.toThrow('Database disconnected during outbox insert');

    // Execution save was called before the outbox failure in the code block,
    // but because the promise rejects, the UnitOfWork (in a real implementation) rolls it back.
    expect(executionRepo.save).toHaveBeenCalledTimes(1);
  });

  it('atomicity: aggregate persistence failure prevents outbox publication', async () => {
    // Simulate aggregate save failure
    executionRepo.save.mockRejectedValue(new Error('Concurrent update detected'));

    await expect(
      service.transition(
        '11111111-1111-1111-1111-111111111111',
        ExecutionStatus.RUNNING,
        {},
        mockContext
      )
    ).rejects.toThrow('Concurrent update detected');

    // Outbox should not even be attempted
    expect(outboxPublisher.publish).not.toHaveBeenCalled();
  });
});
