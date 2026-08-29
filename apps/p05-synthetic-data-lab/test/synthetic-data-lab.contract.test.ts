import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { GenerationService } from '../src/generation/generation.service';
import { GenerationController } from '../src/generation/generation.controller';
import { PrivacyValidator } from '../src/privacy/privacy.validator';

test('generation service creates synthetic dataset from baseline schema', async () => {
  const service = new GenerationService();
  const inputSchema = { columns: ['id', 'age', 'salary'] };
  
  const job = await service.triggerGeneration({
    id: 'gen-1',
    type: 'tabular',
    schema: inputSchema,
    targetRows: 100
  });

  assert.equal(job.id, 'gen-1');
  assert.equal(job.status, 'completed');
  assert.equal(job.result.rows, 100);
  assert.deepEqual(job.result.schema, inputSchema);
});

test('privacy validator enforces k-anonymity checks on generated output', () => {
  const validator = new PrivacyValidator();
  
  const passingDataset = [
    { age: '20-30', zip: '123**', condition: 'A' },
    { age: '20-30', zip: '123**', condition: 'B' },
    { age: '20-30', zip: '123**', condition: 'C' }
  ];
  const resultPass = validator.evaluate(passingDataset, { k: 3, quasiIdentifiers: ['age', 'zip'] });
  assert.equal(resultPass.compliant, true);

  const failingDataset = [
    { age: '40-50', zip: '99999', condition: 'Rare' }
  ];
  const resultFail = validator.evaluate(failingDataset, { k: 3, quasiIdentifiers: ['age', 'zip'] });
  assert.equal(resultFail.compliant, false);
});

test('controller performs runtime request validation', () => {
  const controller = new GenerationController(new GenerationService());
  assert.throws(() => controller.triggerGeneration(null as any), BadRequestException);
  assert.throws(() => controller.triggerGeneration({ id: 'gen-bad' } as any), BadRequestException);
});
