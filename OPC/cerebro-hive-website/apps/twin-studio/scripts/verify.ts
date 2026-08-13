import assert from 'node:assert/strict';
import { ProvenanceSchema, TwinDefinitionSchema } from '../../../packages/twin-contracts/src/index';
import { simulateFactoryTick } from '../modules/demo-factory/factory-simulator';
import { askTwin } from '../modules/intelligence/ask-twin-service';
import { runMotorFailureScenario } from '../modules/simulation/scenario-service';

assert.throws(() => ProvenanceSchema.parse({ source: 'factory-simulator' }));
assert.throws(() => TwinDefinitionSchema.parse({ entityTypes: [{ key: 'motor', name: 'Motor' }], relationshipTypes: [{ key: 'installed-on', from: 'motor', to: 'line' }], variables: [], rules: [] }));

const normal = simulateFactoryTick(0, new Date('2026-08-11T00:00:00Z'));
const anomaly = simulateFactoryTick(4, new Date('2026-08-11T00:04:00Z'));
assert.equal(normal.alert, undefined);
assert.equal(anomaly.alert?.entityId, 'motor-07');
assert.equal(anomaly.alert?.provenance.classification, 'SIMULATED');

const before = structuredClone(anomaly);
const scenario = runMotorFailureScenario(4);
assert.equal(scenario.isolation, 'SNAPSHOT_FORK');
assert.equal(scenario.result.throughputChangePercent, -23);
assert.deepEqual(anomaly, before, 'scenario must not mutate live state');

const answer = askTwin(4, 'Explain what is happening.');
assert.equal(answer.provider, 'deterministic-local');
assert.equal(answer.confidence, 0.82);
assert.equal(answer.evidence.length, 2);
assert.ok(answer.evidence.every(item => item.classification === 'SIMULATED'));

console.log('Twin Studio verification passed: contracts, anomaly, scenario isolation, and provenance.');
