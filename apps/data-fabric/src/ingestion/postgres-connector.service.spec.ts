import { Test, TestingModule } from '@nestjs/testing';
import { PostgresConnector } from './postgres-connector.service';

describe('PostgresConnector', () => {
  let service: PostgresConnector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostgresConnector],
    }).compile();

    service = module.get<PostgresConnector>(PostgresConnector);
    
    // Mock global fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return name and source type', () => {
    expect(service.getName()).toBe('PostgresConnector');
    expect(service.getSourceType()).toBe('POSTGRES');
  });

  it('should connect and disconnect', async () => {
    const connected = await service.connect({ host: 'localhost' });
    expect(connected).toBe(true);
    await expect(service.disconnect()).resolves.toBeUndefined();
  });

  it('should throw error when ingesting without connection', async () => {
    await expect(service.ingestData('ds-1', {})).rejects.toThrow('Not connected');
  });

  it('should successfully ingest data and call contracts', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true }) // P41
      .mockResolvedValueOnce({ ok: true }); // P46

    await service.connect({});
    await expect(service.ingestData('ds-1', { records: [1, 2] })).resolves.toBeUndefined();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(1, 'http://p41-governance:3000/api/v1/governance/policies/evaluate', expect.any(Object));
    expect(global.fetch).toHaveBeenNthCalledWith(2, 'http://p46-mlops:3000/v1/pipelines/trigger', expect.any(Object));
  });

  it('should throw error if P41 policy evaluation fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    await service.connect({});
    await expect(service.ingestData('ds-1', {})).rejects.toThrow('Policy evaluation failed');
  });

  it('should throw error if P46 pipeline trigger fails', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });

    await service.connect({});
    await expect(service.ingestData('ds-1', {})).rejects.toThrow('Pipeline trigger failed');
  });
});
