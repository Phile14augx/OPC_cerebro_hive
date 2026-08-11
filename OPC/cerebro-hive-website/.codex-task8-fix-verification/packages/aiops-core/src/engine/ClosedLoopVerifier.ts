import { Runbook } from '../domain/Runbook';
import { ExecutionResult } from '../ports/RunbookProviderPort';

export class ClosedLoopVerifier {
  async verifyExecution(runbook: Runbook, result: ExecutionResult): Promise<void> {
    console.log(`[ClosedLoopVerifier] Verifying execution outcome for runbook '${runbook.name}'...`);
    
    // In a real system, this would poll observability metrics to ensure the incident actually resolved.
    // Here, we simulate the learning mechanism based on the ExecutionResult success.

    const previousScore = runbook.confidenceScore;
    const historyCount = runbook.executionHistoryCount;

    if (result.success) {
      // Increase confidence slightly, asymptote at 0.99
      runbook.confidenceScore = previousScore + ((0.99 - previousScore) * 0.1);
    } else {
      // Decrease confidence significantly on failure
      runbook.confidenceScore = Math.max(0.1, previousScore - 0.2);
    }

    runbook.executionHistoryCount += 1;

    console.log(`[ClosedLoopVerifier] Confidence updated: ${previousScore.toFixed(2)} -> ${runbook.confidenceScore.toFixed(2)}`);
  }
}
