import { describe, it, expect } from 'vitest';
import { EvaluationFramework, SafetyEvaluator } from './EvaluationFramework';

describe('EvaluationFramework Contract', () => {
  it('should pass a safe response through SafetyEvaluator', async () => {
    const framework = new EvaluationFramework();
    framework.registerEvaluator(new SafetyEvaluator());
    const result = await framework.evaluateResponse({
      promptId: 'pr-1',
      modelId: 'claude-sonnet-4-6',
      input: 'What is the capital of France?',
      output: 'Paris is the capital of France.',
    });
    expect(result.passed).toBe(true);
    expect(result.results).toHaveLength(1);
  });

  it('should fail a response containing illegal content (Negative Control)', async () => {
    const framework = new EvaluationFramework();
    framework.registerEvaluator(new SafetyEvaluator());
    const result = await framework.evaluateResponse({
      promptId: 'pr-2',
      modelId: 'test-model',
      input: 'How to do X?',
      output: 'Here is how to do illegal things.',
    });
    expect(result.passed).toBe(false);
  });
});
