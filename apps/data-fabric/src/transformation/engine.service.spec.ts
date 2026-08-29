import { Test, TestingModule } from '@nestjs/testing';
import { TransformationEngineService } from './engine.service';

describe('TransformationEngineService', () => {
  let service: TransformationEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformationEngineService],
    }).compile();

    service = module.get<TransformationEngineService>(TransformationEngineService);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('applyTransformations', () => {
    it('should correctly apply cast and drop rules', () => {
      const data = [{ id: 1, age: '25', sensitive: 'secret' }];
      const rules = [
        { type: 'cast', field: 'id', targetType: 'string' },
        { type: 'cast', field: 'age', targetType: 'number' },
        { type: 'drop', field: 'sensitive' }
      ];
      const result = service.applyTransformations(data, rules);
      expect(result).toEqual([{ id: '1', age: 25 }]);
    });

    it('should return empty array if no data', () => {
      expect(service.applyTransformations(null as any, [])).toEqual([]);
    });
  });

  describe('triggerJob', () => {
    it('should successfully run job and call APIs', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [{ id: '1', age: 25 }] }) }) // P44
        .mockResolvedValueOnce({ ok: true }) // P48
        .mockResolvedValueOnce({ ok: true }); // P47

      const jobId = await service.triggerJob('job-1', {
        data: [{ id: 1, age: '25', sensitive: 'secret' }],
        rules: [{ type: 'drop', field: 'sensitive' }]
      });

      expect(jobId).toMatch(/^job-\d+$/);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw and send failed telemetry if anonymization fails', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false }) // P44 fails
        .mockResolvedValueOnce({ ok: true }); // P47 (telemetry for failure)

      await expect(service.triggerJob('job-2', { data: [], rules: [] }))
        .rejects.toThrow('Anonymization failed');

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(2, 'http://p47-observability:3000/v1/telemetry/traces', expect.objectContaining({
        body: expect.stringContaining('FAILED')
      }));
    });

    it('should throw if Eval Lab fails', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) }) // P44
        .mockResolvedValueOnce({ ok: false }) // P48 fails
        .mockResolvedValueOnce({ ok: true }); // P47 (telemetry for failure)

      await expect(service.triggerJob('job-3', { data: [], rules: [] }))
        .rejects.toThrow('Evaluation Lab dataset creation failed');
    });
  });

  describe('getJobStatus', () => {
    it('should return SUCCESS', async () => {
      await expect(service.getJobStatus('job-123')).resolves.toBe('SUCCESS');
    });
  });
});
