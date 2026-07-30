import { IAnalyzerAdapter } from '../../../ports/IAnalyzerAdapter';
import { AnalyzerExecutionRequest, AnalyzerResult } from '../models';

export class SemgrepAdapter implements IAnalyzerAdapter {
  readonly analyzerId = 'semgrep';

  async execute(request: AnalyzerExecutionRequest): Promise<AnalyzerResult> {
    // Stub implementation for M26.6 contract verification.
    // In a real scenario, this would:
    // 1. Await ArtifactProvider mounting of request.targetArtifacts
    // 2. Invoke the semgrep CLI within sandbox constraints (request.limits)
    // 3. Parse output using INormalizationEngine<SarifOutput>
    // 4. Return canonical findings

    return {
      executionId: request.executionId,
      analyzerId: this.analyzerId,
      version: '1.40.0', // negotiated version
      status: 'succeeded',
      durationMs: 1500,
      findings: [
        {
          id: 'semgrep-finding-1',
          severity: 'high',
          confidence: 'high',
          category: 'security',
          message: 'Mock semgrep static analysis finding',
          filePath: 'src/main.ts',
          lineNumber: 42,
          rawVendorFindingId: 'javascript.express.security.audit.xss.express-xss',
        },
      ],
    };
  }
}
