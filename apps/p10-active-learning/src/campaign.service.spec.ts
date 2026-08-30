import { Test, TestingModule } from '@nestjs/testing';
import { CampaignService } from './campaign.service';
import { PrismaService } from './prisma.service';
import { TenantContext } from './tenant-context';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';

describe('CampaignService', () => {
  let service: CampaignService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignService,
        {
          provide: PrismaService,
          useValue: {
            createCampaign: jest.fn(),
            findCampaignById: jest.fn(),
            listCampaigns: jest.fn(),
            updateCampaign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CampaignService>(CampaignService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCampaign', () => {
    it('creates a campaign in draft status', async () => {
      const ctx = new TenantContext('t1');
      const mockCampaign = { id: 'c1', name: 'Test', description: null, status: 'draft', tenantId: 't1' };
      (prisma.createCampaign as jest.Mock).mockResolvedValue(mockCampaign);

      const result = await service.createCampaign(ctx, { name: 'Test' });
      expect(result).toEqual(mockCampaign);
      expect(prisma.createCampaign).toHaveBeenCalledWith(ctx, {
        name: 'Test',
        description: null,
        status: 'draft',
      });
    });

    it('throws if name is empty', async () => {
      const ctx = new TenantContext('t1');
      await expect(service.createCampaign(ctx, { name: '  ' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('transitionStatus', () => {
    it('activates a draft campaign', async () => {
      const ctx = new TenantContext('t1');
      const mockCampaign = { id: 'c1', name: 'Test', status: 'draft', tenantId: 't1' };
      const activeCampaign = { ...mockCampaign, status: 'active' };
      
      (prisma.findCampaignById as jest.Mock).mockResolvedValue(mockCampaign);
      (prisma.updateCampaign as jest.Mock).mockResolvedValue(activeCampaign);

      const result = await service.activateCampaign(ctx, 'c1');
      expect(result.status).toBe('active');
    });

    it('throws if transitioning completed to active', async () => {
      const ctx = new TenantContext('t1');
      const mockCampaign = { id: 'c1', name: 'Test', status: 'completed', tenantId: 't1' };
      (prisma.findCampaignById as jest.Mock).mockResolvedValue(mockCampaign);

      await expect(service.activateCampaign(ctx, 'c1')).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException if campaign was modified concurrently', async () => {
      const ctx = new TenantContext('t1');
      const mockCampaign = { id: 'c1', name: 'Test', status: 'draft', tenantId: 't1' };
      
      (prisma.findCampaignById as jest.Mock).mockResolvedValue(mockCampaign);
      (prisma.updateCampaign as jest.Mock).mockResolvedValue(null);

      await expect(service.activateCampaign(ctx, 'c1')).rejects.toThrow(ConflictException);
    });
  });
});
