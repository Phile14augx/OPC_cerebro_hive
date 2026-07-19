import { IAIEvaluatorProvider, EvaluatorContext, EvaluatedCapability } from './interfaces';

export class MockEvaluatorProvider implements IAIEvaluatorProvider {
  async evaluate(context: EvaluatorContext): Promise<{ evaluatorVersion: string; capabilities: EvaluatedCapability[] }> {
    const { executionArtifacts } = context;
    
    // Deterministic Mock Logic mapping raw execution data to Skill Scores
    
    // Base score based on whether the code compiled/ran successfully
    const success = executionArtifacts?.exitCode === 0;
    const baseScore = success ? 75 : 30;
    
    // Time efficiency signal
    const timeMs = executionArtifacts?.executionTimeMs || 1000;
    const timeBonus = timeMs < 500 ? 10 : 0;
    
    // Memory efficiency signal
    const memory = executionArtifacts?.memoryUsedBytes || 0;
    const memoryBonus = memory < 1024 * 1024 * 15 ? 10 : 0;

    const finalScore = Math.min(100, baseScore + timeBonus + memoryBonus);

    const problemSolvingReasoning = success 
      ? `Execution completed successfully in ${timeMs}ms with optimized memory (${Math.round(memory/1024/1024)}MB).` 
      : `Execution failed with exit code ${executionArtifacts?.exitCode}.`;

    return {
      evaluatorVersion: 'MockEvaluator_v1.0.0',
      capabilities: [
        {
          capabilityId: 'cap_algorithm_design', // These would dynamically map to DB IDs in reality
          score: finalScore,
          confidence: 0.94,
          reasoning: problemSolvingReasoning
        },
        {
          capabilityId: 'cap_code_quality',
          score: success ? 85 : 40,
          confidence: 0.88,
          reasoning: success ? 'Telemetry indicates minimal thrashing; code structure is sound.' : 'Multiple runtime errors.'
        }
      ]
    };
  }
}
