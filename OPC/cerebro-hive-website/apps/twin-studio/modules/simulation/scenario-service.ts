import { simulateFactoryTick } from '../simulation/observation-simulator';
import { evaluateScenario } from './scenario-engine';

export function runMotorFailureScenario(tick: number) {
  const live = simulateFactoryTick(tick);
  const snapshot = [
    {
      entityId: 'motor-07',
      entityKey: 'motor-07',
      state: {
        temperature: live.temperature,
        vibration: live.vibration,
        alert: live.alert ?? null,
      },
    },
  ];
  const evaluation = evaluateScenario(
    'ENTITY_OUTAGE',
    { entityId: 'motor-07', throughputChangePercent: -23, downtimeHours: 4.5 },
    snapshot,
  );
  return {
    runId: crypto.randomUUID(),
    classification: 'SIMULATED' as const,
    isolation: evaluation.isolation,
    snapshot: evaluation.snapshot,
    result: evaluation.result,
  };
}
