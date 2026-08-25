'use client';

type EvaluationMetric = string | number;

interface EvaluationMetrics {
  safety?: EvaluationMetric;
  grounding?: EvaluationMetric;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getEvaluationMetrics(evaluations: unknown): EvaluationMetrics | undefined {
  if (!isRecord(evaluations)) {
    return undefined;
  }

  const safety = evaluations.safety;
  const grounding = evaluations.grounding;

  return {
    safety: typeof safety === 'string' || typeof safety === 'number' ? safety : undefined,
    grounding: typeof grounding === 'string' || typeof grounding === 'number' ? grounding : undefined,
  };
}

export function EvaluationPanel({ evaluations }: { evaluations?: unknown }) {
  const metrics = getEvaluationMetrics(evaluations);

  if (!metrics) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No evaluations run for this version yet.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold">Evaluation Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background border border-border p-3 rounded">
          <div className="text-xs text-muted-foreground">Safety Score</div>
          <div className="text-xl font-medium text-green-500 mt-1">{metrics.safety ?? 'N/A'}</div>
        </div>
        <div className="bg-background border border-border p-3 rounded">
          <div className="text-xs text-muted-foreground">Grounding Score</div>
          <div className="text-xl font-medium text-green-500 mt-1">{metrics.grounding ?? 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}
