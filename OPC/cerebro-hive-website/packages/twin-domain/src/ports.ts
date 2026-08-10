import type { EntityStateUpdated, Provenance, Scope } from '@cerebro/twin-contracts';

export interface TelemetryStore { append(scope: Scope, observation: { entityId: string; variableKey: string; value: number; provenance: Provenance }): Promise<void>; }
export interface EventBus { publish(event: EntityStateUpdated): Promise<void>; }
export interface SimulationEngine { run(input: { snapshotId: string; scenarioId: string }): Promise<{ runId: string }>; }
export interface AIProvider { propose(input: { prompt: string; scope: Scope }): Promise<{ proposal: unknown; source: string }>; }
export interface KnowledgeStore { find(scope: Scope, query: string): Promise<unknown[]>; }
export interface ObjectStore { put(key: string, body: Uint8Array): Promise<void>; }
