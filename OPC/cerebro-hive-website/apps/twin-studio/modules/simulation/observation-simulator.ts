import type { Provenance, TwinDefinition } from '@cerebro/twin-contracts';

export type SimulatedObservation = {
  entityKey: string;
  state: Record<string, unknown>;
  provenance: Provenance;
  alert?: { reason: string };
};

function numberFrom(state: Record<string, unknown> | undefined, key: string, fallback: number) {
  const value = state?.[key];
  return typeof value === 'number' ? value : fallback;
}

function observationForVariable(
  key: string,
  tick: number,
  current?: Record<string, unknown>,
): unknown {
  switch (key) {
    case 'temperature':
      return 62 + tick * 1.5;
    case 'vibration':
      return 4 + tick * 0.8;
    case 'production-rate':
      return tick >= 4 ? 82 : 94;
    case 'occupancy':
      return tick % 3 !== 0;
    case 'turnover-minutes':
    case 'turnaround-minutes':
      return tick * 8;
    case 'oxygen-flow':
      return 3.5 + tick * 0.2;
    case 'cash-level':
      return Math.max(5_000, 42_000 - tick * 4_000);
    case 'queue-length':
      return tick * 2;
    case 'dwell-hours':
      return 4 + tick * 3;
    case 'fill-rate':
      return Math.max(40, 96 - tick * 4);
    case 'load-mw':
      return 11 + tick * 1.2;
    case 'inlet-temperature':
      return 21 + tick * 1.1;
    default:
      return numberFrom(current, key, 1) + tick;
  }
}

export function simulateEntityObservation(input: {
  entityKey: string;
  variables: TwinDefinition['variables'];
  current?: Record<string, unknown>;
  tick: number;
  at?: Date;
}): SimulatedObservation {
  const at = input.at ?? new Date();
  const state: Record<string, unknown> = { ...(input.current ?? {}) };
  for (const variable of input.variables) {
    const camel = variable.key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
    const value = observationForVariable(variable.key, input.tick, input.current);
    state[variable.key] = value;
    state[camel] = value;
  }
  const vibration = Number(state['vibration'] ?? 0);
  const turnover = Number(state['turnover-minutes'] ?? state['turnoverMinutes'] ?? 0);
  const turnaround = Number(state['turnaround-minutes'] ?? state['turnaroundMinutes'] ?? 0);
  const dwell = Number(state['dwell-hours'] ?? state['dwellHours'] ?? 0);
  const alert =
    vibration >= 7
      ? { reason: 'Increasing vibration and temperature indicate bearing-failure risk.' }
      : turnover > 45
        ? { reason: 'Bed turnover has exceeded the configured delay threshold.' }
        : turnaround > 55
          ? { reason: 'Aircraft turnaround has exceeded the configured delay threshold.' }
          : dwell > 18
            ? { reason: 'Shipment dwell time has exceeded the configured breach threshold.' }
            : undefined;
  if (alert) state['alert'] = alert;
  else state['alert'] = null;
  return {
    entityKey: input.entityKey,
    state,
    provenance: {
      source: 'twin-observation-simulator',
      classification: 'SIMULATED',
      observedAt: at,
      effectiveAt: at,
      ingestedAt: at,
      evidenceIds: [`${input.entityKey}:tick:${input.tick}`],
      confidence: alert ? 0.82 : 1,
      quality: 1,
    },
    ...(alert ? { alert } : {}),
  };
}

export function simulateFactoryTick(tick: number, at = new Date()) {
  const observation = simulateEntityObservation({
    entityKey: 'motor-07',
    variables: [
      { key: 'temperature', unit: '°C' },
      { key: 'vibration', unit: 'mm/s' },
    ],
    tick,
    at,
  });
  return {
    temperature: Number(observation.state['temperature']),
    vibration: Number(observation.state['vibration']),
    alert: observation.alert
      ? {
          entityId: 'motor-07',
          reason: observation.alert.reason,
          provenance: observation.provenance,
        }
      : undefined,
  };
}
