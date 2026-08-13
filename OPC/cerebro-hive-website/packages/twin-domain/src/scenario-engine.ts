export type ScenarioSnapshot = {
  entityId: string;
  entityKey?: string;
  entityName?: string;
  state: Record<string, unknown>;
};

export type ScenarioEvaluation = {
  isolation: 'SNAPSHOT_FORK';
  snapshot: ScenarioSnapshot[];
  result: Record<string, unknown>;
};

export function evaluateScenario(
  kind: 'ENTITY_OUTAGE' | 'CAPACITY_CHANGE',
  inputs: Record<string, unknown>,
  liveSnapshot: ScenarioSnapshot[],
): ScenarioEvaluation {
  const snapshot = structuredClone(liveSnapshot);
  if (kind === 'ENTITY_OUTAGE') {
    const entityId = String(inputs['entityId'] ?? '');
    const target = snapshot.find((item) => item.entityId === entityId);
    if (!target) throw new Error('ENTITY_NOT_FOUND');
    const throughputChangePercent = Number(inputs['throughputChangePercent'] ?? -23);
    const downtimeHours = Number(inputs['downtimeHours'] ?? 4.5);
    target.state = {
      ...target.state,
      available: false,
      throughputChangePercent,
      downtimeHours,
    };
    return {
      isolation: 'SNAPSHOT_FORK',
      snapshot,
      result: {
        affectedEntityId: entityId,
        throughputChangePercent,
        downtimeHours,
        recommendedAction: 'Inspect the isolated entity against current evidence before acting.',
      },
    };
  }

  const capacityChangePercent = Number(inputs['capacityChangePercent'] ?? 0);
  const projectedUtilizationPercent = Number(inputs['projectedUtilizationPercent'] ?? 0);
  return {
    isolation: 'SNAPSHOT_FORK',
    snapshot,
    result: {
      capacityChangePercent,
      projectedUtilizationPercent,
      recommendedAction:
        'Compare projected utilization with the isolated snapshot before changing live capacity.',
    },
  };
}
