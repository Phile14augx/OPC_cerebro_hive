import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalWorkflowService } from './approval-workflow.service';
import { PrismaService } from '../../prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('ApprovalWorkflowService', () => {
  let service: ApprovalWorkflowService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrisma = {
      approvalWorkflow: {
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'work-1', ...args.data })),
        findUnique: jest.fn().mockImplementation((args) => {
          if (args.where.id === 'work-1') {
            return Promise.resolve({ id: 'work-1', status: 'pending_review' });
          }
          if (args.where.id === 'work-2') {
            return Promise.resolve({ id: 'work-2', status: 'approved' });
          }
          return Promise.resolve(null);
        }),
        update: jest.fn().mockImplementation((args) => Promise.resolve({ id: args.where.id, ...args.data })),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalWorkflowService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ApprovalWorkflowService>(ApprovalWorkflowService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should create a workflow', async () => {
    const result = await service.createWorkflow('res-1', 'human');
    expect(result).toBeDefined();
    expect(result.id).toBe('work-1');
    expect(result.status).toBe('pending_review');
  });

  it('should transition state from pending_review to approved', async () => {
    const result = await service.transitionState('work-1', 'approved', 'Looks good');
    expect(result.status).toBe('approved');
    expect(result.justification).toBe('Looks good');
  });

  it('should throw if workflow not found', async () => {
    await expect(service.transitionState('not-found', 'approved')).rejects.toThrow(BadRequestException);
  });

  it('should throw if workflow is not pending_review', async () => {
    await expect(service.transitionState('work-2', 'rejected')).rejects.toThrow(BadRequestException);
  });
});
