import { IAnalyzerAdapter } from '../../../ports/IAnalyzerAdapter';
import { AnalyzerExecutionRequest, AnalyzerResult } from '../models';

export class TrivyAdapter implements IAnalyzerAdapter {
  readonly analyzerId = 'trivy';

  async execute(request: AnalyzerExecutionRequest): Promise<AnalyzerResult> {
    return {
      executionId: request.executionId,
      analyzerId: this.analyzerId,
      version: '0.48.0',
      status: 'skipped',
      durationMs: 0,
      findings: [],
      failureReason: 'AnalyzerUnavailable',
      failureMessage: 'Trivy is not installed in this runtime. Configure a real scanner before treating results as security evidence.',
    };
  }
}
