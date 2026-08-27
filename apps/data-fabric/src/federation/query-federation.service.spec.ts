import { Test, TestingModule } from '@nestjs/testing';
import { QueryFederationService } from './query-federation.service';

describe('QueryFederationService', () => {
  let service: QueryFederationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryFederationService],
    }).compile();

    service = module.get<QueryFederationService>(QueryFederationService);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('resolveConnector', () => {
    it('should resolve postgres', () => {
      expect(service.resolveConnector('pg-users')).toBe('POSTGRES');
    });
    it('should resolve csv', () => {
      expect(service.resolveConnector('csv-data')).toBe('CSV');
    });
    it('should resolve mongo', () => {
      expect(service.resolveConnector('mongo-logs')).toBe('MONGODB');
    });
    it('should return null for unknown', () => {
      expect(service.resolveConnector('unknown-123')).toBeNull();
      expect(service.resolveConnector('')).toBeNull();
    });
  });

  describe('executeQuery', () => {
    it('should execute query successfully after policy check', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      const result = await service.executeQuery('SELECT * FROM users', 'pg-users');
      expect(result).toEqual([
        { id: 1, source: 'pg-users', connector: 'POSTGRES', queried: true }
      ]);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw if connector cannot be resolved', async () => {
      await expect(service.executeQuery('SELECT *', 'unknown-db'))
        .rejects.toThrow('No connector found for source unknown-db');
    });

    it('should throw if policy evaluation fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

      await expect(service.executeQuery('SELECT *', 'pg-secret'))
        .rejects.toThrow('Policy evaluation failed: Access Denied');
    });
  });
});
