import { Test, TestingModule } from '@nestjs/testing';
import { AnnotationTaskService } from './annotation-task.service';
import { PrismaService } from './prisma.service';
import { TenantContext } from './tenant-context';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';

describe('AnnotationTaskService', () => {
  let service: AnnotationTaskService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnotationTaskService,
        {
          provide: PrismaService,
          useValue: {
            createTask: jest.fn(),
            listTasksByCampaign: jest.fn(),
            updateTask: jest.fn(),
            findTaskById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnnotationTaskService>(AnnotationTaskService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignNextTask', () => {
    it('returns null if no pending tasks', async () => {
      const ctx = new TenantContext('t1');
      (prisma.listTasksByCampaign as jest.Mock).mockResolvedValue([]);

      const result = await service.assignNextTask(ctx, 'c1', 'a1');
      expect(result).toBeNull();
    });

    it('assigns the task with highest uncertainty score', async () => {
      const ctx = new TenantContext('t1');
      const tasks = [
        { id: 't1', uncertaintyScore: 0.2 },
        { id: 't2', uncertaintyScore: 0.9 },
        { id: 't3', uncertaintyScore: 0.5 },
      ];
      (prisma.listTasksByCampaign as jest.Mock).mockResolvedValue(tasks);
      (prisma.updateTask as jest.Mock).mockResolvedValue({ id: 't2', assignedTo: 'a1' });

      const result = await service.assignNextTask(ctx, 'c1', 'a1');
      
      expect(prisma.updateTask).toHaveBeenCalledWith(
        ctx,
        't2',
        { assignedTo: 'a1' },
        { assignedTo: null, status: 'pending' },
      );
      expect(result).not.toBeNull();
      expect(result!.task.id).toBe('t2');
      expect(result!.strategy).toBe('uncertainty-sampling');
    });

    it('throws ConflictException if task was modified concurrently', async () => {
      const ctx = new TenantContext('t1');
      const tasks = [{ id: 't1', uncertaintyScore: 0.8 }];
      (prisma.listTasksByCampaign as jest.Mock).mockResolvedValue(tasks);
      (prisma.updateTask as jest.Mock).mockResolvedValue(null);

      await expect(service.assignNextTask(ctx, 'c1', 'a1')).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
