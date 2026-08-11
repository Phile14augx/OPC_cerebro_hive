'use client';

export function EvaluationPanel({ evaluations }: { evaluations?: any }) {
  if (!evaluations) {
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
          <div className="text-xl font-medium text-green-500 mt-1">{evaluations.safety ?? 'N/A'}</div>
        </div>
        <div className="bg-background border border-border p-3 rounded">
          <div className="text-xs text-muted-foreground">Grounding Score</div>
          <div className="text-xl font-medium text-green-500 mt-1">{evaluations.grounding ?? 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}
