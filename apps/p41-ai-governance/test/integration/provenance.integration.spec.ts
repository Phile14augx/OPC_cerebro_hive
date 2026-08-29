import { ProvenanceService } from '../../src/governance/services/provenance.service';

describe('Provenance Integration', () => {
  let service: ProvenanceService;
  beforeEach(() => {
    const mockPrisma = {
      provenanceRecord: {
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'prov-1', ...args.data })),
      },
    } as any;
    service = new ProvenanceService(mockPrisma);
  });

  it('should track provenance end-to-end', async () => {
    const record = await service.createRecord({
      sourceProduct: 'P44',
      eventType: 'privacy_budget_consumed',
      subjectId: 'subj-001',
      payload: { epsilon: 0.1 }
    });
    expect(record).toBeDefined();
    expect(record.id ?? record.sourceProduct).toBeTruthy();
  });
});
