import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { HyperparameterService } from '../src/domain/hyperparameter-service';
import { HyperparameterConfig } from '../src/contracts';

describe('HyperparameterService', () => {
  test('should validate valid config', () => {
    const config: HyperparameterConfig = { optimizer: 'adam', batchSize: 32, epochs: 10, learningRate: 0.01 };
    assert.doesNotThrow(() => {
      HyperparameterService.validate(config);
    });
  });

  test('should throw on invalid learning rate', () => {
    const config: HyperparameterConfig = { optimizer: 'adam', batchSize: 32, epochs: 10, learningRate: -0.01 };
    assert.throws(() => {
      HyperparameterService.validate(config);
    }, RangeError);
  });

  test('should throw on invalid batch size', () => {
    const config: HyperparameterConfig = { optimizer: 'adam', batchSize: -1, epochs: 10, learningRate: 0.01 };
    assert.throws(() => {
      HyperparameterService.validate(config);
    }, RangeError);
  });

  test('should apply defaults', () => {
    const config: HyperparameterConfig = { optimizer: 'adam', batchSize: 32, epochs: 10, learningRate: 0.01 };
    const defaulted = HyperparameterService.applyDefaults(config);
    assert.strictEqual(defaulted.dropout, 0);
    assert.strictEqual(defaulted.weightDecay, 0);
  });

  test('should merge configs and validate', () => {
    const base: HyperparameterConfig = { optimizer: 'adam', batchSize: 32, epochs: 10, learningRate: 0.01 };
    const merged = HyperparameterService.merge(base, { batchSize: 64 });
    assert.strictEqual(merged.batchSize, 64);
    assert.strictEqual(merged.epochs, 10);
  });

  test('should throw on invalid merge', () => {
    const base: HyperparameterConfig = { optimizer: 'adam', batchSize: 32, epochs: 10, learningRate: 0.01 };
    assert.throws(() => {
      HyperparameterService.merge(base, { batchSize: -1 });
    }, RangeError);
  });
});
