import assert from 'node:assert/strict';
import { generateIndustryModel } from '../modules/industry/deterministic-industry-provider';
import { IndustryModelProposalSchema } from '../../../packages/twin-contracts/src/industry-model';
import { GENERATION_STAGES } from '../features/industry-generator';

const airport = IndustryModelProposalSchema.parse(generateIndustryModel({ domain: 'Airport', description: 'International airport with terminals, gates, runways, aircraft, passengers, baggage, staff, vehicles, flights and weather.' }));
const bank = IndustryModelProposalSchema.parse(generateIndustryModel({ domain: 'Commercial Bank', description: 'Retail and commercial bank with customers, accounts, branches, loans, transactions, employees and risk controls.' }));

assert.notDeepEqual(airport.definition.entityTypes.map(item => item.key), bank.definition.entityTypes.map(item => item.key));
assert.ok(airport.definition.entityTypes.some(item => item.key === 'runway'));
assert.ok(bank.definition.entityTypes.some(item => item.key === 'account'));
assert.equal(airport.provenance.classification, 'INFERRED');
assert.equal(bank.status, 'PREVIEW');

assert.deepEqual(GENERATION_STAGES, ['Understanding domain','Generating ontology','Mapping relationships','Defining telemetry','Configuring rules','Twin ready']);

console.log('Industry framework verification passed: distinct, valid, preview-only domain models.');
