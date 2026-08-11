import { ExecutionRecord, ExecutionStatus } from '../domain/ExecutionRecord';
import { ConfidenceVector } from '../domain/ConfidenceVector';

export class FastLearningEngine {
  // Real-time Exponential Moving Average updates
  public updateConfidence(record: ExecutionRecord, currentVector: ConfidenceVector): ConfidenceVector {
    const alpha = 0.1; // Weight of the newest execution

    // Success = 1.0, Failure = 0.0, Partial = 0.5
    let successVal = 0.0;
    if (record.status === ExecutionStatus.SUCCESS) successVal = 1.0;
    if (record.status === ExecutionStatus.PARTIAL_SUCCESS) successVal = 0.5;

    const newReliability = (alpha * successVal) + ((1 - alpha) * currentVector.reliability);
    
    // Simplistic speed normalize (assuming 5000ms is standard)
    const speedVal = record.durationMs <= 5000 ? 1.0 : (5000 / record.durationMs);
    const newSpeed = (alpha * speedVal) + ((1 - alpha) * currentVector.speed);

    const updated: ConfidenceVector = {
      ...currentVector,
      reliability: newReliability,
      speed: newSpeed,
      // Recalculate composite
      compositeScore: (newReliability * 0.5) + (newSpeed * 0.2) + (currentVector.safety * 0.3)
    };

    return updated;
  }
}
