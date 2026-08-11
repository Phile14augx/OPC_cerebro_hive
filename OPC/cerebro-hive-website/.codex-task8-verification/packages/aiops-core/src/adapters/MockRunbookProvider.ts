import { RunbookProviderPort, ExecutionResult } from '../ports/RunbookProviderPort';
import { Runbook } from '../domain/Runbook';

export class MockRunbookProvider implements RunbookProviderPort {
  supports(providerName: string): boolean {
    return providerName === 'Mock';
  }

  async execute(runbook: Runbook, targetNodeId: string): Promise<ExecutionResult> {
    console.log(`[Adapter:Mock] Executing Runbook '${runbook.name}' on Target '${targetNodeId}'...`);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`[Adapter:Mock] Execution completed successfully.`);
    return {
      success: true,
      logs: ['Initialized mock connection', 'Applied payload template', 'Verified state'],
      durationMs: 500
    };
  }
}
