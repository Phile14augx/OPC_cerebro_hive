export enum ScenarioType {
  NodeFailure = 'NodeFailure',
  EdgeSeverance = 'EdgeSeverance',
  ChangeInjection = 'ChangeInjection'
}

export interface SimulationEvent {
  type: ScenarioType;
  targetId: string;
  payload?: unknown;
}

export interface SimulationScenario {
  scenarioId: string;
  name: string;
  author: string;
  events: SimulationEvent[]; // Supports composite scenarios
  baselineTimestamp: Date;
}
