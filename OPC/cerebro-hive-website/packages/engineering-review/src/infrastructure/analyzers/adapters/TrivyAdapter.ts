import { IAnalyzerAdapter } from '../../../ports/IAnalyzerAdapter';
import { AnalyzerExecutionRequest, AnalyzerResult } from '../models';

export class TrivyAdapter implements IAnalyzerAdapter {
  readonly analyzerId = 'trivy';

  async execute(request: AnalyzerExecutionRequest): Promise<AnalyzerResult> {
    // Stub implementation for M26.6 contract verification.
    return {
      executionId: request.executionId,
      analyzerId: this.analyzerId,
      version: '0.48.0', 
      status: 'succeeded',
      durationMs: 2200,
      findings: [
        {
          id: 'trivy-finding-1',
          severity: 'critical',
          confidence: 'high',
          category: 'vulnerability',
          message: 'CVE-2023-XXXX found in alpine:3.14',
          rawVendorFindingId: 'CVE-2023-XXXX',
        },
      ],
    };
  }
}
