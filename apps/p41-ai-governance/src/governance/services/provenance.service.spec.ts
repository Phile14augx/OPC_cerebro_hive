import { Test, TestingModule } from '@nestjs/testing';
import { ProvenanceService } from './provenance.service';
import { PrismaService } from '../../prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('ProvenanceService', () => {
  let service: ProvenanceService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrisma = {
      provenanceRecord: {
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'prov-1', ...args.data })),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvenanceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProvenanceService>(ProvenanceService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should create a provenance record with valid payload', async () => {
    const payload = {
      sourceProduct: 'P41',
      eventType: 'policy_evaluated',
      subjectId: 'sub-1',
      payload: { test: true },
      verdict: 'allow'
    };

    const result = await service.createRecord(payload);
    expect(result).toBeDefined();
    expect(result.id).toBe('prov-1');
    expect(result.sourceProduct).toBe('P41');
    expect(prismaService.provenanceRecord.create).toHaveBeenCalled();
  });

  it('should throw BadRequestException for invalid payload', async () => {
    const payload = {
      sourceProduct: 'P41',
      // missing eventType and subjectId
    };

    await expect(service.createRecord(payload)).rejects.toThrow(BadRequestException);
  });
});
