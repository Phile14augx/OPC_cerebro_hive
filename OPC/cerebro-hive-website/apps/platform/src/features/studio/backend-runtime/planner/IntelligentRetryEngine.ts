
export type FailureClassification = 'Transient' | 'Permanent';

export class IntelligentRetryEngine {
  static classifyFailure(error: any): FailureClassification {
    // E.g., HTTP 429 Rate Limit -> Transient
    // HTTP 400 Bad Request -> Permanent (Fail Fast)
    // LLM Context Window Exceeded -> Permanent
    
    if (error.status === 429 || error.status >= 500) return 'Transient';
    return 'Permanent';
  }
}
