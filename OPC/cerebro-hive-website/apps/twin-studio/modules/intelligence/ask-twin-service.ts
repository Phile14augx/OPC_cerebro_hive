import { simulateFactoryTick } from '../simulation/observation-simulator';

type DurableState = {
  entityId: string;
  entityName: string;
  state: Record<string, unknown>;
  provenance: Record<string, unknown>;
};

export function askTwinFromStates(states: DurableState[], prompt: string) {
  const generatedAt = new Date();
  if (states.length === 0) {
    return {
      answer: 'No operational state has been recorded for this twin yet.',
      recommendation: 'Record or simulate state before asking operational questions.',
      evidence: [],
      provider: 'deterministic-local',
      sourceKind: 'STORED_TWIN_STATE',
      prompt,
      generatedAt,
    };
  }
  const alert = states.find((item) => {
    const value = item.state['alert'];
    return Boolean(value) && value !== null;
  });
  return {
    answer: alert
      ? `${alert.entityName} currently carries an alert in durable state. Review the evidence before taking action.`
      : `The latest durable projection contains ${states.length} entity state record${states.length === 1 ? '' : 's'}. Review the evidence below before taking action.`,
    recommendation: 'Use the current state and history panels to validate any operational decision.',
    evidence: states,
    confidence: 1,
    provider: 'deterministic-local',
    sourceKind: 'STORED_TWIN_STATE',
    prompt,
    generatedAt,
  };
}

export function askTwin(tick: number, prompt: string) {
  const state = simulateFactoryTick(tick);
  const generatedAt = new Date();
  if (!state.alert) {
    return {
      answer: 'No active anomaly. Motor-07 remains inside the configured operating envelope.',
      recommendation: 'Continue monitoring.',
      evidence: [],
      provider: 'deterministic-local',
      generatedAt,
    };
  }
  return {
    answer: `Motor-07 vibration is ${state.vibration.toFixed(1)} mm/s and temperature is ${state.temperature.toFixed(1)}°C. Their joint rise matches the configured bearing-failure risk rule.`,
    recommendation: 'Inspect Motor-07 bearings within 72 hours.',
    evidence: [
      { ...state.alert.provenance, metric: 'vibration', value: state.vibration, unit: 'mm/s' },
      { ...state.alert.provenance, metric: 'temperature', value: state.temperature, unit: '°C' },
    ],
    confidence: 0.82,
    provider: 'deterministic-local',
    prompt,
    generatedAt,
  };
}
