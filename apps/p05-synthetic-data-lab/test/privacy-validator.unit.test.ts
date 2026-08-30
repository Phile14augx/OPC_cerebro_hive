/**
 * L3 Unit tests – PrivacyValidator (TDD)
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { PrivacyValidator } from '../src/privacy/privacy.validator';

test('PrivacyValidator compliant when every equivalence class >= k', () => {
  const validator = new PrivacyValidator();
  const dataset = [
    { age: '20-30', zip: '123**' },
    { age: '20-30', zip: '123**' },
    { age: '20-30', zip: '123**' },
  ];
  const result = validator.evaluate(dataset, { k: 3, quasiIdentifiers: ['age', 'zip'] });
  assert.equal(result.compliant, true);
});

test('PrivacyValidator non-compliant when any equivalence class < k', () => {
  const validator = new PrivacyValidator();
  const dataset = [
    { age: '40-50', zip: '99999' }, // singleton group
  ];
  const result = validator.evaluate(dataset, { k: 2, quasiIdentifiers: ['age', 'zip'] });
  assert.equal(result.compliant, false);
});

test('PrivacyValidator uses all columns as QIs when quasiIdentifiers omitted', () => {
  const validator = new PrivacyValidator();
  const dataset = [
    { a: 'x', b: 'y' },
    { a: 'x', b: 'y' },
  ];
  const result = validator.evaluate(dataset, { k: 2 });
  assert.equal(result.compliant, true);
});

test('PrivacyValidator on empty dataset is compliant (vacuous truth)', () => {
  const validator = new PrivacyValidator();
  const result = validator.evaluate([], { k: 3, quasiIdentifiers: ['age'] });
  assert.equal(result.compliant, true);
});

test('PrivacyValidator with k=1 always compliant for non-empty dataset', () => {
  const validator = new PrivacyValidator();
  const dataset = [{ age: '90+', zip: '00001' }];
  const result = validator.evaluate(dataset, { k: 1, quasiIdentifiers: ['age', 'zip'] });
  assert.equal(result.compliant, true);
});
