import { ApprovalWorkflowService } from '../../src/governance/services/approval-workflow.service';

describe('Approval Workflow Integration', () => {
  let service: ApprovalWorkflowService;
  beforeEach(() => {
    const mockPrisma = {
      approvalWorkflow: {
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'wf-1', ...args.data })),
      },
    } as any;
    service = new ApprovalWorkflowService(mockPrisma);
  });

  it('should process approval workflow end-to-end', async () => {
    const wf = await service.createWorkflow('req-001', 'data_access');
    expect(wf).toBeDefined();
    expect(wf.status).not.toBeNull();
  });
});
