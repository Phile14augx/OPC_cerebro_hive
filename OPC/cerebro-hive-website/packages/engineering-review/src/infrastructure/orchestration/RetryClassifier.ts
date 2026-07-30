import { RetryClassifierContext, RetryDecision } from './models';

export class RetryClassifier {
  classify(context: RetryClassifierContext): RetryDecision {
    if (context.attemptCount >= 3) {
      return { decision: 'DoNotRetry', reason: 'Max attempts reached' };
    }

    switch (context.failureReason) {
      case 'Timeout':
        return { decision: 'RetryWithBackoff', backoffMs: 5000, reason: 'Transient timeout' };
      case 'AnalyzerUnavailable':
        return { decision: 'RetryWithBackoff', backoffMs: 10000, reason: 'Registry/Analyzer currently unavailable' };
      case 'SandboxFailure':
      case 'UnsupportedArtifact':
      case 'PolicyViolation':
      case 'NormalizationFailure':
        return { decision: 'DoNotRetry', reason: 'Terminal failure type' };
      default:
        return { decision: 'DoNotRetry', reason: 'Unknown failure type' };
    }
  }
}
