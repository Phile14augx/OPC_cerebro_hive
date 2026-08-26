export type EvaluationScores = Record<string, number>;

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
  cost: number;
}

export interface CompletionMetadata {
  evaluations: EvaluationScores;
  tokens: TokenUsage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isEvaluationScores(value: unknown): value is EvaluationScores {
  return isRecord(value) && Object.values(value).every(isFiniteNumber);
}

function isTokenUsage(value: unknown): value is TokenUsage {
  return (
    isRecord(value) &&
    isFiniteNumber(value.prompt) &&
    isFiniteNumber(value.completion) &&
    isFiniteNumber(value.total)
  );
}

export function parseCompletionMetadata(value: unknown): CompletionMetadata | undefined {
  if (
    !isRecord(value) ||
    !isEvaluationScores(value.evaluations) ||
    !isTokenUsage(value.tokens) ||
    !isFiniteNumber(value.cost)
  ) {
    return undefined;
  }

  return { evaluations: value.evaluations, tokens: { ...value.tokens, cost: value.cost } };
}
