export interface EvaluationRequest {
  promptId: string;
  modelId: string;
  input: string;
  output: string;
}

export interface EvaluationResult {
  evaluatorId: string;
  score: number;
  passed: boolean;
  reason: string;
}

export interface IEvaluator {
  id: string;
  evaluate(request: EvaluationRequest): Promise<EvaluationResult>;
}

export class EvaluationFramework {
  private evaluators: IEvaluator[] = [];

  registerEvaluator(evaluator: IEvaluator) {
    this.evaluators.push(evaluator);
  }

  async evaluateResponse(request: EvaluationRequest): Promise<{ passed: boolean; results: EvaluationResult[] }> {
    const results = await Promise.all(this.evaluators.map(e => e.evaluate(request)));
    const passed = results.every(r => r.passed);
    
    // In a real system, persist these results via an EvaluationService
    return { passed, results };
  }
}

// Example Evaluators

export class SafetyEvaluator implements IEvaluator {
  id = 'core.safety';
  
  async evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
    // Scaffold: Call a safety classification model
    const passed = !request.output.toLowerCase().includes('illegal');
    return {
      evaluatorId: this.id,
      score: passed ? 1.0 : 0.0,
      passed,
      reason: passed ? 'Safe' : 'Failed safety policy check.'
    };
  }
}

export class HallucinationEvaluator implements IEvaluator {
  id = 'core.hallucination';
  
  async evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
    // Scaffold: Check grounding against knowledge base context
    return {
      evaluatorId: this.id,
      score: 0.95,
      passed: true,
      reason: 'Response appears grounded in context.'
    };
  }
}
